import { extractNodePropertiesFromRecords, mapRecords } from "./RecordProcessing";
import _ from 'lodash';
import {addToCache} from "../component/QueriesCache";
import {EDGES_CATEGORIES} from "../modal/FilterModal";

export enum QueryStatus {
    NO_QUERY, // No query specified
    NO_DATA, // No data was returned, therefore we can't draw it.
    NO_DRAWABLE_DATA, // There is data returned, but we can't draw it
    RUNNING, // The report query is running.
    TIMED_OUT, // Query has reached the time limit.
    COMPLETE, // There is data returned, and we can visualize it all.
    COMPLETE_TRUNCATED, // There is data returned, but it's too much so we truncate it.
    ERROR, // Something broke, likely the cypher query is invalid.
    WAITING // Query waiting to be run.
}

function allEdgeFiltersChecked(parameters) {
    return (parameters["edgeFiltersAllCount"] == parameters["edgeFilters"].length)
}

function anyCustomEdgeFilters(parameters) {
    if (!parameters["customEdgeFilters"] || parameters["customEdgeFilters"].length == 0) {
        return false;
    } else {
        return  true;
    }
}

export function expandFilteredEdges(query, parameters) {
    if (query.includes(":FILTERED_EDGES")) {
        if (allEdgeFiltersChecked(parameters) && !anyCustomEdgeFilters(parameters)) {
            query = query.replace(":FILTERED_EDGES", "");
        } else {
            const allEdgeFilters = parameters["customEdgeFilters"] ? Array.from(new Set(parameters["edgeFilters"].concat(parameters["customEdgeFilters"]))) : parameters["edgeFilters"]
            const filteredEdges = ":" + allEdgeFilters.join('|');
            query = query.replace(":FILTERED_EDGES", filteredEdges);
        }
    }

    for (let edgeFilter of EDGES_CATEGORIES) {
        if (!parameters || !parameters[edgeFilter] || parameters[edgeFilter].length == 0) {
            continue
        };

        const filteredEdges = ":" + parameters[edgeFilter].join('|');
        query = query.replace(edgeFilter, filteredEdges);
    }

    if (query.includes(":CUSTOMEDGES")) {
        let customFilteredEdges = "";
        if (parameters && parameters["customEdgeFilters"]) {
            customFilteredEdges = ":" + parameters["customEdgeFilters"].join('|');
        }
        query = query.replace(":CUSTOMEDGES", customFilteredEdges);
    }

    return query
}


/**
 * Runs a Cypher query using the specified driver.
 * @param driver - an instance of a Neo4j driver.
 * @param database - optionally, the Neo4j database to run the query against.
 * @param query - the cypher query to run.
 * @param parameters - an optional set of query parameters.
 * @param selection - optionally, a dynamic set of properties to be mapped.
 * @param fields - optionally, the set of fields returned (previously) by the query.
 * @param rowLimit - optionally, the maximum number of rows to retrieve.
 * @param setStatus - callback to retrieve query status.
 * @param setRecords  - callback to retrieve query records.
 * @param setFields - callback to set list of returned query fields.
 * @param queryTimeLimit - maximum query time in seconds.
 * @returns 
 */
export async function runCypherQuery(driver,
    database = undefined,
    query = "",
    parameters = {},
    selection = {},
    fields = [],
    rowLimit = 1000,
    setStatus = (status) => { },
    setRecords = (records) => { },
    setFields = (fields) => { },
    useHardRowLimit = false,
    useRecordMapper = false,
    useNodePropsAsFields = false,
    numericFields = [],
    numericOrDatetimeFields = [],
    textFields = [],
    optionalFields = [],
    defaultKeyField = "",
    queryTimeLimit = 120,
    shouldCacheResults = true,
    setComplete = (queryId, semaphoreId) => { },
    queryId = null,
    semaphoreId = null,
) {
    const originalQuery = query;
    query = expandFilteredEdges(query, parameters);

    // If no query specified, we don't do anything.
    if (query.trim() == "") {
        setFields([]);
        setStatus([originalQuery, QueryStatus.NO_QUERY]);
        if (shouldCacheResults) {addToCache(query, [QueryStatus.NO_QUERY, {}])};
        return;
    }

    const session = (database) ? driver.session({ database: database }) : driver.session();
    const transaction = session.beginTransaction({ timeout: queryTimeLimit * 1000, connectionTimeout: 2000 })

    // For usuability reasons, we can set a hard cap on the query result size by wrapping it a subquery (Neo4j 4.0 and later).
    // This unfortunately does not preserve ordering on the return fields.
    // If we are on Neo4j 4.0 or later, we can use subqueries to smartly limit the result set size based on report type.
    if (useHardRowLimit && Object.values(driver._connectionProvider._openConnections).length > 0) {
        // @ts-ignore
        const dbVersion = Object.values(driver._connectionProvider._openConnections)[0]._server.version;
        if (!dbVersion.startsWith("Neo4j/3.")) {
            query = "CALL { " + query + "} RETURN * LIMIT " + (rowLimit + 1)
        }
    }

    transaction.run(query, parameters)
        .then(res => {
            // @ts-ignore
            var { records, summary } = res;

            // TODO - check query summary to ensure that no writes are made in safe-mode.
            if (records.length == 0) {
                setStatus([originalQuery, QueryStatus.NO_DATA])
                setComplete(queryId, semaphoreId);
                if (shouldCacheResults) {addToCache(originalQuery, [QueryStatus.NO_DATA, records])};
                // console.log("TODO remove this - QUERY RETURNED NO DATA!")
                transaction.commit();
                return
            }
            if (useRecordMapper == true) {
                // Send a deep copy of the returned record keys as the set of fields.
                const newFields = (records && records[0] && records[0].keys) ? records[0].keys.slice() : [];
                if (!_.isEqual(newFields, fields)) {
                    setFields(newFields);
                    // TODO - only do this for reports that care about selections.
                    // console.log("TODO remove this - QUERY WAS ROLLED BACK!")
                    //transaction.commit();
                    //return
                }
            }else if (useNodePropsAsFields){
                // If we don't use dynamic field mapping, but we do have a selection, use the discovered node properties as fields.
                const nodePropsAsFields = extractNodePropertiesFromRecords(records);
                setFields(nodePropsAsFields);
            }
            // Set the records for the visualization, if an explicit field name mapping is provided.
            if (useRecordMapper) {
                records = mapRecords(records, selection, textFields, numericFields, numericOrDatetimeFields, optionalFields, defaultKeyField)
            }
            if (records == null) {
                setStatus([originalQuery, QueryStatus.NO_DRAWABLE_DATA])
                setComplete(queryId, semaphoreId);
                if (shouldCacheResults) {addToCache(originalQuery, [QueryStatus.NO_DRAWABLE_DATA, records])};
                // console.log("TODO remove this - QUERY RETURNED NO DRAWABLE DATA!")
                transaction.commit();
                return
            } else if (records.length > rowLimit) {
                setRecords(records.slice(0, rowLimit));
                setStatus([originalQuery, QueryStatus.COMPLETE_TRUNCATED]);
                setComplete(queryId, semaphoreId);
                if (shouldCacheResults) {addToCache(originalQuery, [QueryStatus.COMPLETE_TRUNCATED, records.slice(0, rowLimit)])};
                // console.log("TODO remove this - QUERY RETURNED WAS TRUNCTURED!")
                transaction.commit();
                return
            } else {
                setStatus([originalQuery, QueryStatus.COMPLETE]);
                setRecords(records);
                setComplete(queryId, semaphoreId);
                if (shouldCacheResults) {addToCache(originalQuery, [QueryStatus.COMPLETE, records])};
                // console.log("TODO remove this - QUERY WAS EXECUTED SUCCESFULLY!")
            }

            transaction.commit();
        })
        .catch(e => {
            // setFields([]);

            // Process timeout errors.
            if (e.message.startsWith("The transaction has been terminated. " +
                "Retry your operation in a new transaction, and you should see a successful result. " +
                "The transaction has not completed within the specified timeout (dbms.transaction.timeout).")) {
                setRecords([{ "error": e.message }]);
                transaction.rollback();
                setStatus([originalQuery, QueryStatus.TIMED_OUT]);
                setComplete(queryId, semaphoreId);
                if (shouldCacheResults) {addToCache(originalQuery, [QueryStatus.TIMED_OUT, { "error": e.message }])};
                return e.message
            }

            // Process other errors.
            setRecords([{ "error": e.message }]);
            transaction.rollback();
            setStatus([originalQuery, QueryStatus.ERROR]);
            setComplete(queryId, semaphoreId);
            if (shouldCacheResults) {addToCache(originalQuery, [QueryStatus.ERROR, { "error": e.message }])};
            return e.message;
        })
}