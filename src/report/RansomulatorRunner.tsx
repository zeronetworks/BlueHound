import {QueryStatus} from "./CypherQueryRunner";
import {addToCache, getCachedResults} from "../component/QueriesCache";

export enum RansomulatorType {
    Practical = 'Practical',
    Logical = 'Logical',
    NetOnly = 'Network Only'
}

const DEFAULT_MAX_WAVES = 3;
const terminateMessage = "The transaction has been terminated. Retry your operation in a new transaction, and you should see a successful result. Explicitly terminated by the user.";

class TerminateRansomulator extends Error {
    constructor(msg: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, TerminateRansomulator.prototype);
    }
}

export const ransomulatorQueriesToTerminate = [];

export const runRansomulatorReport = async (debouncedRunCypherQuery, driver, database, query, settings, selection, fields,
                                      rowLimit, setStatus, setRecords, setFields, HARD_ROW_LIMITING, queryTimeLimit, shouldCacheResults,
                                            setComplete = (queryId, semaphoreId) => { }, queryId = 0, semaphoreId = 0) => {

    const session = (database) ? driver.session({ database: database }) : driver.session();
    const type = settings.type ? settings.type : RansomulatorType.Logical;

    const maxWaves = type == RansomulatorType.Logical ? 1 : (settings.maxWaves ? settings.maxWaves : DEFAULT_MAX_WAVES);
    const allComputersQuery = "MATCH (c:Computer) RETURN DISTINCT c.name AS computer_name";

    const runQuery = async (query, parameters={}) => {
        const terminateIndex = ransomulatorQueriesToTerminate.indexOf("ransomulator_" + type, 0);
        if (terminateIndex > -1) {
            ransomulatorQueriesToTerminate.splice(terminateIndex, 1);
            throw new TerminateRansomulator("Ransomulator terminated");
        }

        try {
            const results = await session.run(query, parameters, {timeout: queryTimeLimit * 1000})
            return results;
        } catch (e) {
            console.log(e)
            if (e.message.startsWith("The transaction has been terminated. " +
                "Retry your operation in a new transaction, and you should see a successful result. " +
                "The transaction has not completed within the specified timeout (dbms.transaction.timeout).")) {
                setRecords([{ "error": e.message }]);
                setStatus(QueryStatus.TIMED_OUT);
                return e.message
            }

            // Process other errors.
            setRecords([{ "error": e.message }]);
            setStatus(QueryStatus.ERROR);
            return e.message;
        }
    }

    const getAllComputers = async () => {
        const results = await runQuery(allComputersQuery);
        const computers = results.records.map(computer => { return computer.get("computer_name")})
        return computers;
    }

    const generateWaveQueryString = () => {
        switch (type) {
            case RansomulatorType.Logical: {
                return 'MATCH shortestPath((src:Computer)-[: HasSession | MemberOf | AdminTo * 1..]->(dest:Computer)) WHERE src <> dest AND src.name IN $last_wave AND NOT dest IN $last_wave RETURN COLLECT(DISTINCT(dest.name)) AS next_wave'
            }
            case RansomulatorType.NetOnly: {
                return 'MATCH (src:Computer)-[:Open]->(dest:Computer) WHERE src.name IN $last_wave AND NOT dest.name IN $last_wave RETURN COLLECT(DISTINCT(dest.name)) AS next_wave'
            }
            case RansomulatorType.Practical: {
                return 'MATCH (src:Computer)-[:Open]->(dest:Computer) WHERE src.name IN $last_wave AND NOT dest.name IN $last_wave WITH src,dest MATCH (src)-[:HasSession]->(u:User) WITH dest,u MATCH shortestPath((u)-[:MemberOf|AdminTo*1..]->(dest)) RETURN COLLECT(DISTINCT(dest.name)) AS next_wave'
            }
        }
    }

    const waveQueryString = generateWaveQueryString();

    const simulateWaveForComputer = async (computer) => {
        let lastWave = [computer];
        const computerWaves = lastWave;
        let total = 0;
        const waves = [];

        for (let wave = 0; wave < maxWaves; wave++) {
            const results = await runQuery(waveQueryString, {last_wave: lastWave})
            results.records.forEach((record) => {
                const nextWave = record.get('next_wave');
                const waveSize = nextWave.length;
                total += waveSize;
                waves.push(waveSize);
                lastWave = lastWave.concat(nextWave)
                if (waveSize.length == 0) {
                    return [total, waves]
                }
            })
            computerWaves.push(Object.assign([], lastWave));
        }
        return [total, waves]
    }

    const simulate = async () => {
        const wavesObject = {};
        let totalComputers = 0;
        let maxWaveLength = 0;
        let averageWaveLength = 0;
        let maxTotal = 0;
        const allComputers = await getAllComputers();

        for (let computer of allComputers) {
            const [total, waves] = await simulateWaveForComputer(computer);
            if (total > 0) {
                totalComputers += 1;
                if (waves.length > maxWaveLength) maxWaveLength = waves.length;
                if (total > maxTotal) maxTotal = total;
                averageWaveLength += waves.length;

                wavesObject[computer] = {total: total, waves: waves};
            } else {
                wavesObject[computer] = {total: 0, waves: ['0']};
            }
        }

        const sortedWaves = Object.entries(wavesObject).sort(([,a], [,b]) => b.total - a.total)
        return [sortedWaves, maxWaveLength]
    }

    try {
        const [sortedWaves, maxWaveLength] = await simulate();
        const ransomulatorResults = {waves: sortedWaves, maxWaveLength: maxWaveLength};
        setStatus(["ransomulator_" + type, QueryStatus.COMPLETE])
        setRecords(ransomulatorResults);
        if (shouldCacheResults) addToCache("ransomulator_" + type, [QueryStatus.COMPLETE, ransomulatorResults]);
    } catch (e: TerminateRansomulator) {
        setStatus(["ransomulator_" + type, QueryStatus.ERROR])
        setRecords([{ "error": terminateMessage }]);
        if (shouldCacheResults) addToCache("ransomulator_" + type, [QueryStatus.ERROR, { "error":  terminateMessage}]);
    } finally {
        setComplete(queryId, semaphoreId);
        session.close();
    }
}