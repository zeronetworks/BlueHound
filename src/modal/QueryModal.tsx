import React, {useCallback, useEffect} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Badge from '@material-ui/core/Badge';
import {Typography, Accordion, AccordionSummary, AccordionDetails} from '@material-ui/core';
import {Cancel, Check, Stop} from "@material-ui/icons";
import {CircularProgress, Input} from "@mui/material";
import Tooltip from "@material-ui/core/Tooltip";
import LoadingButton from "@mui/lab/LoadingButton";
import PlayArrow from "@material-ui/icons/PlayArrow";
import {useOutlinedInputStyles} from "./CollectionModal";
import TextField from '@material-ui/core/TextField'
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {expandFilteredEdges, QueryStatus, runCypherQuery} from "../report/CypherQueryRunner";
import {HARD_ROW_LIMITING, REPORT_TYPES, SELECTION_TYPES} from "../config/ReportConfig";
import {createDriver} from "use-neo4j";
import {runRansomulatorReport} from "../report/RansomulatorRunner";
import {terminateQuery} from "../report/TerminateQuery";
import {Mutex, Semaphore} from 'async-mutex';
import {ee, RELOAD_REPORT_EVENT} from "../report/Report";
import debounce from 'lodash/debounce';
import {getParallelQueries} from "../application/ApplicationSelectors";
import {connect} from "react-redux";
import {getDashboardSettings, getPages} from "../dashboard/DashboardSelectors";
import { store } from "../index"
import {setParallelQueries} from "../application/ApplicationActions";
import {ransomulatorQueriesToTerminate} from '../report/RansomulatorRunner'
import {createUUID} from "../dashboard/DashboardThunks";
import {addToCache, getCachedResults} from "../component/QueriesCache";
import AutorenewIcon from "@material-ui/icons/Autorenew";

let intervalId;
const runningMutex = new Mutex();
let semaphore = null;
const semaphoreReleases = {};
const queryMapping = {};
const runningTasks = {};
const waitingTasks = {};
const MINIMUM_SUPPORTED_DB_VERSION = '4.2';
export const RUN_QUERY_EVENT = 'runQuery'
export const STOP_QUERY_EVENT = 'stopQuery'
export const RUN_TAB_EVENT = 'runTab'
let driver;

const getFilteredPages = (pages) => {
    const filteredPages = [];
    for (let page of pages) {
        const newPage = {title: page.title, reports: []};
        for (let report of page.reports) {
            if (REPORT_TYPES[report.type].textOnly && !report.type.startsWith('ransomulator')) continue;
            if (report.type.startsWith('ransomulator')) report.query = report.settings.type != undefined ? 'ransomulator_' + report.settings.type : 'ransomulator_Logical';
            if (report.fields == undefined) report.fields = [];
            newPage.reports.push(report);
        }
        filteredPages.push(newPage)
    }
    return filteredPages
}

const isDBVersionSupported = (dbVersion) => {
    if (dbVersion) {
        const versionCompare = dbVersion.localeCompare(MINIMUM_SUPPORTED_DB_VERSION, undefined, { numeric: true, sensitivity: 'base' })
        if (versionCompare >= 0) {
            return true;
        }
    }
    return false;
}

export const NeoQueryModal = ({ open, handleClose, pages,
                                  parallelQueries, setParallelQueries, createNotification }) => {

    const [timeRunning, setTimeRunning] = React.useState({});
    const [runningAll, setRunningAll] = React.useState(false);
    let filteredPages = getFilteredPages(pages);

    if ((!semaphore)) {
        semaphore = new Semaphore(parallelQueries);
    }

    function padTo2Digits(num: number) {
        return num.toString().padStart(2, '0');
    }

    function convertMsToTime(milliseconds: number) {
        if (milliseconds == undefined) return "00:00:00";

        let seconds = Math.floor(milliseconds / 1000);
        let minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        seconds = seconds % 60;
        minutes = minutes % 60;

        return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
            seconds,
        )}`;
    }

    useEffect(() => {
        if (open) {
            intervalId = setInterval(() => {
                const timeSinceInMs = {}
                for (let key in runningTasks) {
                    if (runningTasks[key].running == true) {
                        timeSinceInMs[key] = new Date() - runningTasks[key].startTime;
                    }
                }
                setTimeRunning(timeSinceInMs)
            }, 500);
            return () => clearInterval(intervalId);
        }
    }, [open])

    const outlinedInputStyles = useOutlinedInputStyles();

    const isAnyQueryRunning = () => {
        for (let queryId in runningTasks) {
            if ( runningTasks[queryId].running == true) {
                return true;
            }
        }
        return false;
    }

    const clearRunningTasks = () => {
        for (let key in runningTasks) delete runningTasks[key];
    }

    const setStatus = (results) => {
        const query = results[0];
        if (!getCachedResults(query)) {
            addToCache(query, [results[1]]);
        } else {
            let cachedResults = getCachedResults(query);
            cachedResults[0] = results[1];
            addToCache(query, cachedResults)
        }
    }

    const setComplete = (queryId, semaphoreId) => {
        runningMutex.runExclusive(() => {
            releaseSemaphore(semaphoreId);
            ee.emit(RELOAD_REPORT_EVENT, queryMapping[queryId]);

            // only set running to false if the query has finished (i.e wasn't stopped manually)
            if (runningTasks[queryId].running == true) runningTasks[queryId].running = false;

            if (!isAnyQueryRunning()) {
                clearRunningTasks();
                setRunningAll(false);
            }
        })
    }

    const queryToQueryId =  (query) => {
        return Object.keys(queryMapping).find(key => queryMapping[key] === query);
    }

    const releaseSemaphore = (semaphoreId) => {
        semaphoreReleases[semaphoreId]();
        delete semaphoreReleases[semaphoreId];
    }

    const addRunning = (queryId, query, semaphoreId) => {
        return new Promise((resolve, reject) => {
            runningMutex.runExclusive(function () {
                if (!isQueryRunning(query)) {
                    runningTasks[queryId] = {query: query, startTime: new Date(), running: true};
                    return true;
                } else {
                    releaseSemaphore(semaphoreId);
                    return false;
                }
            }).then((result) => {
                if (result) resolve("Query added to running");
            })
        })
    }

    const runQuery = (report, queryId, semaphoreId) => {
        const state = store.getState();
        const connection = state.application.connection;
        const globalParameters = state.dashboard.settings.parameters;

        if (!driver && connection.successful) {
            driver = createDriver(connection.protocol, connection.url, connection.port,
                connection.username, connection.password);
        } else if (!connection.successful)
        {
            addToCache(report.query, [QueryStatus.ERROR, { "error": "Connection to Neo4j is unsuccessful" }]);
            ee.emit(RELOAD_REPORT_EVENT, report.query);
            return
        }

        setStatus([report.query, QueryStatus.RUNNING])
        ee.emit(RELOAD_REPORT_EVENT, report.query);

        const stringParameters = report.parameters ? report.parameters : "";
        const mapParameters = globalParameters;

        var parsedParameters = {};
        try {
            parsedParameters = JSON.parse(stringParameters != "" ? stringParameters : "{}")
        } catch (e) {
            const message = "Unable to parse Cypher parameters: \""
                + stringParameters + "\"\n" + e.message + '.\n\n' +
                "Ensure you specify parameters in a valid JSON format."
            // @ts-ignore
            //setRecords([{ "error": message }]);
            //setStatus(QueryStatus.ERROR)
            return
        }

        // Determine the set of fields from the configurations.
        var numericFields = (REPORT_TYPES[report.type].selection && report.fields) ? Object.keys(REPORT_TYPES[report.type].selection).filter(field => REPORT_TYPES[report.type].selection[field].type == SELECTION_TYPES.NUMBER && !REPORT_TYPES[report.type].selection[field].multiple) : [];
        var numericOrDatetimeFields = (REPORT_TYPES[report.type].selection && report.fields) ? Object.keys(REPORT_TYPES[report.type].selection).filter(field => REPORT_TYPES[report.type].selection[field].type == SELECTION_TYPES.NUMBER_OR_DATETIME && !REPORT_TYPES[report.type].selection[field].multiple) : [];
        var textFields = (REPORT_TYPES[report.type].selection && report.fields) ? Object.keys(REPORT_TYPES[report.type].selection).filter(field => REPORT_TYPES[report.type].selection[field].type == SELECTION_TYPES.TEXT && !REPORT_TYPES[report.type].selection[field].multiple) : [];
        var optionalFields = (REPORT_TYPES[report.type].selection && report.fields) ? Object.keys(REPORT_TYPES[report.type].selection).filter(field => REPORT_TYPES[report.type].selection[field].optional == true) : [];

        // Take care of multi select fields, they need to be added to the numeric fields too.
        if (REPORT_TYPES[report.type].selection) {
            Object.keys(REPORT_TYPES[report.type].selection).forEach((field, i) => {
                if (REPORT_TYPES[report.type].selection[field].multiple && report.selection[field]) {
                    report.selection[field].forEach((f, i) => numericFields.push(field + "(" + f + ")"))
                }
            });
        }

        const parameters = Object.assign({}, parsedParameters, mapParameters);
        const rowLimit = state.dashboard.settings.queryRowLimit ? state.dashboard.settings.queryRowLimit : REPORT_TYPES[report.type].maxRecords
        const defaultKeyField = (REPORT_TYPES[report.type].selection) ? Object.keys(REPORT_TYPES[report.type].selection).find(field => REPORT_TYPES[report.type].selection[field].key == true) : undefined;
        const useRecordMapper = REPORT_TYPES[report.type].useRecordMapper == true;
        const useNodePropsAsFields = REPORT_TYPES[report.type].useNodePropsAsFields == true;
        const queryTimeLimit = state.dashboard.settings.queryTimeLimit ? state.dashboard.settings.queryTimeLimit : 120
        const shouldCacheResults = true;

        if (report.type.startsWith('ransomulator')) {
            const ransomulatorQuery = report.settings.type != undefined ? 'ransomulator_' + report.settings.type : 'ransomulator_Logical';
            addRunning(queryId, ransomulatorQuery, semaphoreId).then(() => {
                runRansomulatorReport(runCypherQuery, driver, connection.database, report.query, report.settings, report.selection, report.fields,
                    rowLimit, setStatus, () => {}, () => {}, HARD_ROW_LIMITING, queryTimeLimit, shouldCacheResults, setComplete, queryId, semaphoreId);
            });
        } else {
            addRunning(queryId, report.query, semaphoreId).then(() => {
                runCypherQuery(driver, connection.database, report.query, parameters, report.selection, report.fields,
                    rowLimit, setStatus, () => {}, () => {}, HARD_ROW_LIMITING, useRecordMapper, useNodePropsAsFields,
                    numericFields, numericOrDatetimeFields, textFields, optionalFields, defaultKeyField, queryTimeLimit,
                    shouldCacheResults, setComplete, queryId, semaphoreId);
            });
        }
    }

    const updateQueryMapping = () => {
        filteredPages = getFilteredPages(getPages(store.getState()));
        let queryId = 0;
        for (let page of filteredPages) {
            for (let report of page.reports) {
                if (report.type.startsWith('ransomulator')) {
                    queryMapping[queryId] = report.settings.type != undefined ? 'ransomulator_' + report.settings.type : 'ransomulator_Logical';
                } else {
                    queryMapping[queryId] = report.query;
                }
                queryId += 1;
            }
        }
    }

    const handleRunClick = (report) => {
        if (!isAnyQueryRunning()) {
            updateQueryMapping();
            // update semaphore in case max parallel queries changed
            semaphore = new Semaphore(parallelQueries);
        }

        let queryId = queryToQueryId(report.query);
        if (report.type.startsWith('ransomulator')) {
            const ransomulatorQuery = report.settings.type != undefined ? 'ransomulator_' + report.settings.type : 'ransomulator_Logical';
            queryId = queryToQueryId(ransomulatorQuery)
        }
        waitingTasks[queryId] = true;
        setStatus([report.query, QueryStatus.WAITING])

        semaphore.acquire().then(function([value, release]) {
            const semaphoreId = createUUID();
            semaphoreReleases[semaphoreId] = release;
            delete waitingTasks[queryId];
            runQuery(report, queryId, semaphoreId);
        });
    }

    const handleRunTab = (tabName) => {
        updateQueryMapping();
        const pageData = filteredPages.find(page => { return page.title == tabName });
        for (let report of pageData.reports) {
            handleRunClick(report);
        }
    }

    const handleStopClick = (report) => {
        const dbVersion = store.getState().application.dbVersion;
        const dbVersionSupported = isDBVersionSupported(dbVersion);

        if (!dbVersionSupported) {
            createNotification("Error terminating query",
                "Your Neo4j version " + dbVersion + " is not supported (<" + MINIMUM_SUPPORTED_DB_VERSION + ")")
            return
        }

        if (report.type.startsWith('ransomulator')) {
            const ransomulatorQuery = report.settings.type != undefined ? 'ransomulator_' + report.settings.type : 'ransomulator_Logical';
            ransomulatorQueriesToTerminate.push(ransomulatorQuery);
            const queryId = queryToQueryId(ransomulatorQuuery);
            if (runningTasks[queryId]) runningTasks[queryId].running = "stopped";
        }

        const state = store.getState();
        const connection = state.application.connection;
        const globalParameters = state.dashboard.settings.parameters;

        const expandedQuery = expandFilteredEdges(report.query, globalParameters)

        terminateQuery(driver, connection.database, expandedQuery).then(success => {
            const queryId = queryToQueryId(report.query);
            if (success && runningTasks[queryId]) runningTasks[queryId].running = "stopped";
        })
    }

    const handleRunAllClick = () => {
        setRunningAll(true);
        // update semaphore in case max parallel queries changed
        semaphore = new Semaphore(parallelQueries);
        let queryId = 0;
        for (let page of filteredPages) {
            for (let report of page.reports) {
                waitingTasks[queryId] = true;
                setStatus([report.query, QueryStatus.WAITING])

                semaphore.acquire().then(function([value, release]) {
                    const semaphoreId = createUUID();
                    semaphoreReleases[semaphoreId] = release;
                    delete waitingTasks[queryId];
                    runQuery(report, queryId, semaphoreId);
                    queryMapping[queryId] = report.query;
                    queryId += 1;
                });
            }
        }
    }

    const handleParallelChange = (event) => {
        setParallelQueries(event.target.value === '' ? '' : Number(event.target.value));
    };

    const handleParallelBlur = () => {
        if (typeof parallelQueries != 'number' || parallelQueries < 1 || parallelQueries > 20) {
            setParallelQueries(5);
        }
    };

    const isQueryRunning = (query) => {
        return runningTasks[queryToQueryId(query)] && runningTasks[queryToQueryId(query)].running == true
    }

    const isQueryFinished = (query) => {
        return runningTasks[queryToQueryId(query)] && runningTasks[queryToQueryId(query)].running == false
    }

    const isQueryStopped = (query) => {
        return runningTasks[queryToQueryId(query)] && runningTasks[queryToQueryId(query)].running == "stopped"
    }

    const debouncedhandleRunClick = useCallback(
        debounce(handleRunClick, 500),
        [],
    );

    const debouncedhandleStopClick = useCallback(
        debounce(handleStopClick, 500),
        [],
    );

    const debouncedhandleRunTab = useCallback(
        debounce(handleRunTab, 500),
        [],
    );

    ee.addListener(RUN_QUERY_EVENT, debouncedhandleRunClick);
    ee.addListener(STOP_QUERY_EVENT, debouncedhandleStopClick);
    ee.addListener(RUN_TAB_EVENT, debouncedhandleRunTab);

    const generateList = () => {
        return filteredPages.map((page, page_index) =>
            <div key={"query_div_" + page_index}>
                <div style={{display: "flex", alignItems: "center"}}>
                    <h4 style={{marginTop: 10, marginBottom: 10}}>{page.title}</h4>
                    <Tooltip title="Run all queries in tab." aria-label="">
                        <IconButton size="medium" style={{ padding: "5px", color: "white" }} aria-label="move left" onClick={() => {
                            debouncedhandleRunTab(page.title)
                        }}>
                            <AutorenewIcon color="disabled" />
                        </IconButton>
                    </Tooltip>
                </div>
                {page.reports.map((report, index) =>
                    <div style={{display: "flex"}} key={"query_div_div_" + page_index + "_"  + index}>
                        <Accordion style={{width: "90%"}}>
                            <AccordionSummary style={{backgroundColor: "inherit"}} expandIcon={<ExpandMoreIcon />}>
                                <Typography>{report.title}</Typography>
                                { isQueryRunning(report.query) ?
                                    <div style={{marginLeft: "auto"}}>
                                        <span style={{color: "#757575"}}>{convertMsToTime(timeRunning[queryToQueryId(report.query)])}</span>
                                    </div>
                                    : <></>}
                            </AccordionSummary>
                                <AccordionDetails>
                                    {report.query.trim() ?
                                    <TextField
                                        variant="outlined"
                                        multiline
                                        inputProps={{ readOnly: true, style: {fontSize: 14} }}
                                        rows={6}
                                        style={{width: "100%", marginTop: -18}}
                                        classes={outlinedInputStyles}
                                        value={report.query}
                                    /> : <Typography variant={"body2"} style={{marginTop: -10, marginLeft: 10}}>No query.</Typography>}
                                </AccordionDetails>

                        </Accordion>
                        <div style={{display: "inline-flex", alignItems: "center"}}>
                            <Tooltip title="Stop query." aria-label="">
                                <span>
                                <IconButton disabled={!(isQueryRunning(report.query)) || isQueryStopped(report.query)}
                                            style={{height: 45, marginLeft: 10}} sx={{ "&:hover": { color: "blue" } }}
                                            onClick={() => handleStopClick(report)}>
                                    <Stop />
                                </IconButton>
                            </span>
                            </Tooltip>
                            {isQueryFinished(report.query) && runningAll ?
                                <IconButton style={{height: 45, color: "green"}} sx={{"&:hover": {color: "blue"}}} disabled><Check/></IconButton>
                                : isQueryStopped(report.query) && runningAll ?
                                <IconButton style={{height: 45, color: "red"}} sx={{"&:hover": {color: "blue"}}} disabled><Cancel/></IconButton>
                                : !(isQueryRunning(report.query)) ?
                                <Tooltip title="Run query." aria-label="">
                                    <IconButton style={{height: 45}} sx={{"&:hover": {color: "blue"}}}
                                                disabled={runningAll || waitingTasks[queryToQueryId(report.query)]}
                                                onClick={() => handleRunClick(report)}>
                                        <PlayArrow />
                                    </IconButton>
                                </Tooltip>
                                :
                                <CircularProgress size={14} color={"inherit"} style={{marginRight: 16, marginLeft: 18}}/>
                            }
                        </div>
                    </div>
                )}
                <br/>
            </div>
        )
    }

    return (
        <div>
            <Dialog maxWidth={"lg"} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    Query Runner
                    <IconButton onClick={handleClose} style={{padding: "3px", float: "right"}}>
                        <Badge badgeContent={""}>
                            <CloseIcon/>
                        </Badge>
                    </IconButton>
                </DialogTitle>
                <DialogContent style={{width: 1000, minHeight: 600}} // setting minimum width for the dialog
                >
                    <div style={{color: "rgba(0, 0, 0, 0.84)"}}
                         className="MuiTypography-root MuiDialogContentText-root MuiTypography-body1 MuiTypography-colorTextSecondary">
                        Run queries.

                        <hr></hr>
                        <div style={{display: "flex"}}>
                            <h3 style={{marginBottom: "-12px"}}>Queries</h3>
                                { isAnyQueryRunning() ?
                                    <div style={{display: "flex", marginLeft: "auto", marginRight: 26, marginTop: 24}}>
                                    <Typography variant={"body2"} style={{marginRight: 16, marginTop: 4, color: "#BDBDBD"}} >Max parallel queries:</Typography>
                                <Tooltip title="Number of parallel queries to run. (1-20)" aria-label="">
                                    <Input value={parallelQueries} style={{width: 38}} disabled/></Tooltip></div>
                                    :
                                    <div style={{display: "flex", marginLeft: "auto", marginRight: 26, marginTop: 24}}>
                                    <Typography variant={"body2"} style={{marginRight: 16, marginTop: 4}} >Max parallel queries:</Typography>
                                <Tooltip title="Number of parallel queries to run. (1-20)" aria-label="">
                                    <Input
                                        value={parallelQueries}
                                        size="small"
                                        disabled={isAnyQueryRunning()}
                                        onChange={handleParallelChange}
                                        onBlur={handleParallelBlur}
                                        inputProps={{
                                            step: 1,
                                            min: 1,
                                            max: 20,
                                            type: 'number',
                                            'aria-labelledby': 'input-slider',
                                        }}
                                    />
                                </Tooltip></div> }
                            <LoadingButton
                                onClick={handleRunAllClick}
                                //loading={importToolLoading[index]}
                                loadingPosition="end"
                                endIcon={<PlayArrow/>}
                                variant="contained"
                                disabled={isAnyQueryRunning()}
                                style={{
                                    marginBottom: "-12px",
                                    marginRight: 14,
                                    height: 34,
                                    marginTop: 18,
                                    borderRadius: 10
                                }}
                            >
                                Run All
                            </LoadingButton></div>
                        {generateList()}
                    </div>
                    </DialogContent>
            </Dialog>
        </div>
    );
}

const mapStateToProps = state => ({
    pages: getPages(state),
    dashboardSettings: getDashboardSettings(state),
    parallelQueries: getParallelQueries(state),
});

const mapDispatchToProps = dispatch => ({
    setParallelQueries: amount => dispatch(setParallelQueries(amount))
});

export default connect(mapStateToProps, mapDispatchToProps)(NeoQueryModal);

