import {Chip, Tooltip, Typography} from "@material-ui/core";
import React, {useCallback, useContext, useEffect, useState} from 'react';
import WarningIcon from '@material-ui/icons/Warning';
import {QueryStatus, runCypherQuery} from "./CypherQueryRunner";
import debounce from 'lodash/debounce';
import NeoStaticCodeField from "../component/StaticCodeField";
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import {
    DEFAULT_ROW_LIMIT,
    HARD_ROW_LIMITING,
    REPORT_TYPES,
    RUN_QUERY_DELAY_MS,
    SELECTION_TYPES
} from "../config/ReportConfig";
import {MoreVert, Stop} from "@material-ui/icons";
import {Neo4jContext, Neo4jContextState} from "use-neo4j/dist/neo4j.context";
import NeoTableChart from "../chart/TableChart";
import EventEmitter from "eventemitter3";
import {runRansomulatorReport} from "./RansomulatorRunner";
import AutorenewIcon from '@material-ui/icons/Autorenew';
import {RUN_QUERY_EVENT, STOP_QUERY_EVENT} from '../modal/QueryModal'
import LoadingAnimation from "../component/LoadingAnimation";
import {addToCache, deleteFromCache, getCachedResults} from "../component/QueriesCache";

export const ee = new EventEmitter();
export const RELOAD_DATA_EVENT = 'reloadData'
export const RELOAD_REPORT_EVENT = 'reloadReport'

export const NeoReport = ({
    database = "neo4j", // The Neo4j database to run queries onto.
    query = "", // The Cypher query used to populate the report.
    stringParameters = "", // A string, to be parsed as JSON, which contains cypher parameters.
    mapParameters = {}, // A dictionary of parameters to pass into the query.
    disabled = false, // Whether to disable query execution.
    selection = {}, // A selection of return fields to send to the report.
    fields = [], // A list of the return data fields that the query produces.
    settings = {}, // An optional dictionary of customization settings to pass to the report.  
    setFields = (f) => { fields = f }, // The callback to update the set of query fields after query execution. 
    setGlobalParameter = () => { }, // callback to update global (dashboard) parameters.
    getGlobalParameter = (key) => {return ""}, // function to get global (cypher) parameters.
    refreshRate = 0, // Optionally refresh the report every X seconds.
    dimensions = { width: 3, height: 3 }, // Size of the report.
    rowLimit = DEFAULT_ROW_LIMIT, // The maximum number of records to render.
    queryTimeLimit = 120, // Time limit for queries before automatically aborted.
    type = "table", // The type of report as a string.
    expanded = false, // whether the report is visualized in a fullscreen view.
    ChartType = NeoTableChart, // The report component to render with the query results.
    title = "",
}) => {
    const [records, setRecords] = useState(null);
    const [timer, setTimer] = useState(null);
    const [status, setStatus] = useState(QueryStatus.NO_QUERY);
    const [reportRunning, setReportRunning] = useState(false);
    const [reportStopping, setReportStopping] = useState(false);
    const { driver } = useContext<Neo4jContextState>(Neo4jContext);
    if (!driver) throw new Error('`driver` not defined. Have you added it into your app as <Neo4jContext.Provider value={{driver}}> ?')
    const shouldCacheResults = REPORT_TYPES[type].textOnly ? false : true

    const debouncedRunCypherQuery = useCallback(
        debounce(runCypherQuery, RUN_QUERY_DELAY_MS),
        [],
    );

    const debouncedRunQueryEvent = useCallback(
        debounce((report) => ee.emit(RUN_QUERY_EVENT, report), 500),
        [],
    );

    const debouncedStopQueryEvent = useCallback(
        debounce((report) => ee.emit(STOP_QUERY_EVENT, report), 500),
        [],
    );

    const populateReport = (debounced = true) => {
        let cachedResults = getCachedResults(query);
        if (cachedResults && cachedResults[0] != QueryStatus.RUNNING && !cachedResults.is_populated) {
            cachedResults.is_populated = true
            addToCache(query, cachedResults)
        } else {
            return
        }

        //if (records) return;
        // If this is a 'text-only' report, no queries are ran, instead we pass the input directly to the report.
        if (REPORT_TYPES[type].textOnly) {
            setStatus(QueryStatus.COMPLETE);
            setRecords([{ input: query, mapParameters: mapParameters }]);
        } else if (cachedResults) {
            setStatus(cachedResults[0]);
            setRecords(cachedResults[1])
        } else if ((type.startsWith('ransomulator')) && getCachedResults("ransomulator_" + settings.type)) {
            const ransomulatorQuery = "ransomulator_" + settings.type;
            const cachedRansomulatorResults = getCachedResults(ransomulatorQuery);
            setStatus(cachedRansomulatorResults[0]);
            setRecords(cachedRansomulatorResults[1])
        }
    };

    // update report status if query changed / page changed
    useEffect(() => {
        const cachedResults = getCachedResults(query)
        if (!cachedResults || cachedResults[0] != QueryStatus.RUNNING) {
            setReportRunning(false);
            setReportStopping(false);
        }
        if (cachedResults) {
            setStatus(cachedResults[0]);
            setRecords(cachedResults[1]);
        }
    }, [query]);

    // When report parameters are changed, re-run the report.
    useEffect(() => {
        if (timer) {
            // @ts-ignore
            clearInterval(timer);
        }
        if (!disabled) {
            if (query.trim() == "") {
                setStatus(QueryStatus.NO_QUERY);
            }
            populateReport();
            // If a refresh rate was specified, set up an interval for re-running the report. (max 24 hrs)
            if (refreshRate && refreshRate > 0) {
                // @ts-ignore
                setTimer(setInterval(function () {
                    deleteFromCache(query);
                    populateReport(false);
                }, Math.min(refreshRate, 86400) * 1000.0));
            }
        }
    }, REPORT_TYPES[type].useRecordMapper == true ?
        [disabled, query, JSON.stringify(mapParameters), fields ? fields : [], JSON.stringify(selection)] :
        [disabled, query, JSON.stringify(mapParameters), null, null])

    // Define query callback to allow reports to get extra data on interactions.
    const queryCallback = useCallback(
        (query, parameters, setRecords, useRecordMapper) => {
            runCypherQuery(driver, database, query, parameters, selection, fields, rowLimit,
                (status) => { status == QueryStatus.NO_DATA ? setRecords([]) : null },
                (result => setRecords(result)),
                () => { return }, HARD_ROW_LIMITING,
                useRecordMapper != undefined ? useRecordMapper : REPORT_TYPES[type].useRecordMapper == true,
                false,
                [], [], [], [], null, queryTimeLimit,
                shouldCacheResults);
        },
        [],
    );

    const reloadReportListener = (finishedQuery) => {
        if (finishedQuery == query) {
            const cachedResults = getCachedResults(query)
            const status = cachedResults[0];
            const records = cachedResults[1];
            setStatus(status);
            setRecords(records);
            if (status != QueryStatus.RUNNING) {
                setReportRunning(false);
                setReportStopping(false);
            }
        }
    }

    function reloadDataListener() {
        const cachedResults = getCachedResults(query)
        if (cachedResults) {
            const status = cachedResults[0];
            const records = cachedResults[1];
            setStatus(status);
            setRecords(records);
            if (status != QueryStatus.RUNNING) {
                setReportRunning(false);
                setReportStopping(false);
            }
        }
    }

    let isCached = null;
    let cachedRecords = null;

    if ((type.startsWith('ransomulator')) && getCachedResults("ransomulator_" + settings.type)) {
        isCached = true;
        cachedRecords = getCachedResults("ransomulator_" + settings.type);
    } else {
        isCached = !!getCachedResults(query);
        if (isCached) {
            cachedRecords = getCachedResults(query)[1];
        }
    }

    const isRunnableReport = (!REPORT_TYPES[type].textOnly || type.startsWith('ransomulator'));

    ee.addListener(RELOAD_DATA_EVENT, reloadDataListener);
    ee.addListener(RELOAD_REPORT_EVENT, reloadReportListener);

    // Draw the report based on the query status.
    if (disabled) {
        return <div></div>;
    } else if (!query.trim()) {
        return (<div style={{ padding: 15 }}>No query specified. <br /> Use the <Chip size="small" icon={<MoreVert />} label="Report Settings" /> button to get started. </div>);
    } else if (isRunnableReport && !isCached && !reportRunning) {
        return (<div style={{ height: "100%", marginTop: "0px", position: "relative", overflow: REPORT_TYPES[type].allowScrolling ? "auto" : "hidden" }}>
            <p style={{marginLeft: 16}}>Query was not run. <br /> Use the <Chip size="small" icon={<AutorenewIcon />} label="Query Runner" /> button to get started.</p>
            { !reportRunning ?
            <Tooltip title="Run query." aria-label="">
                <AutorenewIcon onClick={(e) => {
                    setReportRunning(true);
                    debouncedRunQueryEvent({query: query, parameters: stringParameters, type: type, fields: fields, selection: selection, settings: settings});
                }} style={{ fontSize: "1.3rem", opacity: 0.6, bottom: dimensions.height >= 3 ? 12 : 46, left: 12, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"></AutorenewIcon>
            </Tooltip> : <></> }
        </div>)
    } else if (isRunnableReport && (isCached && getCachedResults(query)[0] == QueryStatus.RUNNING) || reportRunning) {
        return (<div style={{ height: "100%", marginTop: "0px", position: "relative", overflow: REPORT_TYPES[type].allowScrolling ? "auto" : "hidden" }}>
            <Typography variant="h2" color="textSecondary"
                        style={{paddingTop: dimensions.height >= 3 ? "100px" : "20px", textAlign: "center"}}>
                <LoadingAnimation />
                { !reportStopping ?
                <Tooltip title="Stop query." aria-label="">
                    <Stop onClick={(e) => {
                        setReportStopping(true);
                        debouncedStopQueryEvent({query: query, parameters: stringParameters, type: type, fields: fields, selection: selection, settings: settings})
                    }} style={{ fontSize: "1.3rem", opacity: 0.6, bottom: dimensions.height >= 3 ? 12 : 46, left: 12, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"/>
                </Tooltip> : <></> }
            </Typography>
        </div>);
    } else if (isRunnableReport && (isCached && getCachedResults(query)[0] == QueryStatus.WAITING)) {
        return (<div style={{ padding: 15 }}>Query waiting to run... <TimerOutlinedIcon fontSize="small" style={{verticalAlign:"middle", marginBottom: 4, marginLeft: 2}}/></div>)
    } else if (isRunnableReport && (isCached && getCachedResults(query)[0] == QueryStatus.NO_DATA)) {
        return (<div style={{ height: "100%", marginTop: "0px", position: "relative", overflow: REPORT_TYPES[type].allowScrolling ? "auto" : "hidden" }}>
            <NeoStaticCodeField value={"Query returned no data."} />
            {REPORT_TYPES[type].textOnly && !type.startsWith('ransomulator') ? <></> :
                <Tooltip title="Rerun query." aria-label="">
                    <AutorenewIcon onClick={(e) => {
                        setReportRunning(true);
                        deleteFromCache(query);
                        debouncedRunQueryEvent({query: query, parameters: stringParameters, type: type, fields: fields, selection: selection})
                    }} style={{ fontSize: "1.3rem", opacity: 0.6, bottom: dimensions.height >= 3 ? 12 : 46, left: 12, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"></AutorenewIcon>
                </Tooltip>}
        </div>)
    } else if (isRunnableReport && (isCached && getCachedResults(query)[0] == QueryStatus.NO_DRAWABLE_DATA)) {
        return (<div style={{ height: "100%", marginTop: "0px", position: "relative", overflow: REPORT_TYPES[type].allowScrolling ? "auto" : "hidden" }}>
            <NeoStaticCodeField value={"Data was returned, but it can't be visualized.\n\n" +
                "This could have the following causes:\n" +
                "- a numeric value field was selected, but no numeric values were returned. \n" +
                "- a numeric value field was selected, but only zero's were returned.\n" +
                "- Your visualization expects nodes/relationships, but none were returned."
            } />
            {REPORT_TYPES[type].textOnly && !type.startsWith('ransomulator') ? <></> :
                <Tooltip title="Rerun query." aria-label="">
                    <AutorenewIcon onClick={(e) => {
                        setReportRunning(true);
                        deleteFromCache(query);
                        debouncedRunQueryEvent({query: query, parameters: stringParameters, type: type, fields: fields, selection: selection})
                    }} style={{ fontSize: "1.3rem", opacity: 0.6, bottom: dimensions.height >= 3 ? 12 : 46, left: 12, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"></AutorenewIcon>
                </Tooltip>}
        </div>)
    } else if (!isRunnableReport || (isCached && getCachedResults(query)[0] == QueryStatus.COMPLETE)) {
        if ((records == null || records.length == 0) && !(cachedRecords) && !(REPORT_TYPES[type].textOnly)) {
            return <div>Loading...</div>
        }
        {/* @ts-ignore */ }
        return (<div style={{ height: "100%", marginTop: "0px", position: "relative", overflow: REPORT_TYPES[type].allowScrolling ? "auto" : "hidden" }}>
            <ChartType records={isRunnableReport ? getCachedResults(query)[1] : [{ input: query, mapParameters: mapParameters }]}
                selection={selection}
                settings={settings}
                title={title}
                fullscreen={expanded}
                dimensions={dimensions}
                queryCallback={queryCallback}
                setGlobalParameter={setGlobalParameter}
                getGlobalParameter={getGlobalParameter}
                randomSeed={Math.random().toString(36).slice(2)}
            />
            {REPORT_TYPES[type].textOnly && !type.startsWith('ransomulator') ? <></> :
            <Tooltip title="Rerun query." aria-label="">
            <AutorenewIcon onClick={(e) => {
                setReportRunning(true);
                deleteFromCache(query);
                debouncedRunQueryEvent({query: query, parameters: stringParameters, type: type, fields: fields, selection: selection})
            }} style={{ fontSize: "1.3rem", opacity: 0.6, bottom: dimensions.height >= 3 ? 12 : 46, left: 12, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"></AutorenewIcon>
            </Tooltip>}
        </div>);
    } else if (getCachedResults(query)[0] == QueryStatus.COMPLETE_TRUNCATED) {
        if (records == null || records.length == 0) {
            return <div>Loading...</div>
        }
        {/* Results have been truncated */ }
        return (<div style={{ height: "100%", marginTop: "0px", position: "relative", overflow: REPORT_TYPES[type].allowScrolling ? "auto" : "hidden" }}>
            <div style={{ marginBottom: "-31px" }}>
                <div style={{ display: "flex" }} >
                    <Tooltip title={"Over " + rowLimit + " row(s) were returned, results have been truncated."} placement="left" aria-label="host">
                        <WarningIcon style={{ zIndex: 999, marginTop: "2px", marginRight: "20px", marginLeft: "auto", color: "orange" }} />
                    </Tooltip>
                </div>
            </div>
            <ChartType
                records={cachedRecords ? cachedRecords : records}
                selection={selection}
                settings={settings}
                title={title}
                fullscreen={expanded}
                dimensions={dimensions}
                queryCallback={queryCallback}
                setGlobalParameter={setGlobalParameter}
                getGlobalParameter={getGlobalParameter} />
            {REPORT_TYPES[type].textOnly && !type.startsWith('ransomulator') ? <></> :
                <Tooltip title="Rerun query." aria-label="">
                    <AutorenewIcon onClick={(e) => {
                        setReportRunning(true);
                        deleteFromCache(query);
                        debouncedRunQueryEvent({query: query, parameters: stringParameters, type: type, fields: fields, selection: selection})
                    }} style={{ fontSize: "1.3rem", opacity: 0.6, bottom: dimensions.height >= 3 ? 12 : 46, left: 12, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"></AutorenewIcon>
                </Tooltip>}
        </div>);
    } else if (getCachedResults(query)[0] == QueryStatus.TIMED_OUT) {
        return (<div style={{ height: "100%", marginTop: "0px", position: "relative", overflow: REPORT_TYPES[type].allowScrolling ? "auto" : "hidden" }}>
            <NeoStaticCodeField value={"Query was aborted. \n"
                + "Consider limiting your returned query rows, or increase the maximum query time."} />
            {REPORT_TYPES[type].textOnly && !type.startsWith('ransomulator') ? <></> :
                <Tooltip title="Rerun query." aria-label="">
                    <AutorenewIcon onClick={(e) => {
                        deleteFromCache(query);
                        debouncedRunQueryEvent({query: query, parameters: stringParameters, type: type, fields: fields, selection: selection})
                    }} style={{ fontSize: "1.3rem", opacity: 0.6, bottom: dimensions.height >= 3 ? 12 : 46, left: 12, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"></AutorenewIcon>
                </Tooltip>}
        </div>)
    }

    return (<div style={{ height: "100%", marginTop: "0px", position: "relative", overflow: REPORT_TYPES[type].allowScrolling ? "auto" : "hidden" }}>
        {/* @ts-ignore */ }
    <NeoStaticCodeField value={getCachedResults(query)[1] ? getCachedResults(query)[1].error : records && records[0] && records[0].error && records[0].error}
        placeholder={"Unknown query error, check the browser console."} />
        {REPORT_TYPES[type].textOnly && !type.startsWith('ransomulator') ? <></> :
            <Tooltip title="Rerun query." aria-label="">
                <AutorenewIcon onClick={(e) => {
                    setReportRunning(true);
                    deleteFromCache(query);
                    debouncedRunQueryEvent({query: query, parameters: stringParameters, type: type, fields: fields, selection: selection, settings: settings})
                }} style={{ fontSize: "1.3rem", opacity: 0.6, bottom: dimensions.height >= 3 ? 12 : 46, left: 12, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"></AutorenewIcon>
            </Tooltip>}
    </div>)
}

export default NeoReport;