import { createDriver } from "use-neo4j";
import { loadDashboardFromNeo4jThunk, loadDashboardThunk } from "../dashboard/DashboardThunks";
import { createNotificationThunk } from "../page/PageThunks";
import { QueryStatus, runCypherQuery } from "../report/CypherQueryRunner";
import {
    setConnected,
    setConnectionModalOpen,
    setConnectionProperties,
    setDesktopConnectionProperties,
    resetShareDetails,
    setShareDetailsFromUrl,
    setWelcomeScreenOpen,
    setStandAloneMode,
    setDashboardToLoadAfterConnecting,
    setDBVersion
} from "./ApplicationActions";


export const createConnectionThunk = (protocol, url, port, database, username, password) => (dispatch: any, getState: any) => {
    try {
        const driver = createDriver(protocol, url, port, username, password)
        console.log("Attempting to connect...")
        const validateConnection = (records) => {
            console.log("Confirming connection was established...")
            if (records && records[0] && records[0]["error"]) {
                dispatch(createNotificationThunk("Unable to establish connection", records[0]["error"]));
            } else if (records && records[0] && records[0].keys[0] == "connected") {
                dispatch(setConnectionProperties(protocol, url, port, database, username, password, true));
                dispatch(setConnectionModalOpen(false));
                dispatch(setConnected(true));
                try {
                   const dbVersion = Object.values(driver._connectionProvider._openConnections)[0]._server.version.replace('Neo4j/', '')
                    console.log('Neo4j version: ' + dbVersion)
                    dispatch(setDBVersion(dbVersion));
                } catch (e) {
                    console.log(e.message)
                    dispatch(setDBVersion('0.0'));
                }

                // If we have remembered to load a specific dashboard after connecting to the database, take care of it here.
                const application = getState().application;
                if (application.dashboardToLoadAfterConnecting && application.dashboardToLoadAfterConnecting.startsWith("http")) {     
                    fetch(application.dashboardToLoadAfterConnecting)
                    .then(response => response.text())
                    .then(data =>  dispatch(loadDashboardThunk(data)));
                    dispatch(setDashboardToLoadAfterConnecting(null));
                } else if (application.dashboardToLoadAfterConnecting) {
                    const setDashboardAfterLoadingFromDatabase = (value) => {
                        dispatch(loadDashboardThunk(value));
                    }
                    dispatch(loadDashboardFromNeo4jThunk(driver, application.dashboardToLoadAfterConnecting, setDashboardAfterLoadingFromDatabase));
                    dispatch(setDashboardToLoadAfterConnecting(null));
                }

            } else {
                dispatch(createNotificationThunk("Unknown Connection Error", "Check the browser console."));
            }
        }
        runCypherQuery(driver, database, "RETURN true as connected", {}, {}, ["connected"], 1, () => { return }, (records) => validateConnection(records))
    } catch (e) {
        dispatch(createNotificationThunk("Unable to establish connection", e));
    }
}

export const createConnectionFromDesktopIntegrationThunk = () => (dispatch: any, getState: any) => {
    try {
        const desktopConnectionDetails = getState().application.desktopConnection;
        const protocol = desktopConnectionDetails.protocol;
        const url = desktopConnectionDetails.url;
        const port = desktopConnectionDetails.port;
        const database = desktopConnectionDetails.database;
        const username = desktopConnectionDetails.username;
        const password = desktopConnectionDetails.password;
        dispatch(createConnectionThunk(protocol, url, port, database, username, password));
    } catch (e) {
        dispatch(createNotificationThunk("Unable to establish connection to Neo4j Desktop", e));
    }
}

export const setDatabaseFromNeo4jDesktopIntegrationThunk = () => (dispatch: any, getState: any) => {
    const getActiveDatabase = (context) => {
        for (let pi = 0; pi < context.projects.length; pi++) {
            let prj = context.projects[pi];
            for (let gi = 0; gi < prj.graphs.length; gi++) {
                let grf = prj.graphs[gi];
                if (grf.status == 'ACTIVE') {
                    return grf;
                }
            }
        }
        // No active database found - ask for manual connection details.
        return null;
    }

    let promise = window.neo4jDesktopApi && window.neo4jDesktopApi.getContext();

    if (promise) {
        promise.then(function (context) {
            let neo4j = getActiveDatabase(context);
            if (neo4j) {
                dispatch(setDesktopConnectionProperties(
                    neo4j.connection.configuration.protocols.bolt.url.split("://")[0],
                    neo4j.connection.configuration.protocols.bolt.url.split("://")[1].split(":")[0],
                    neo4j.connection.configuration.protocols.bolt.port,
                    undefined,
                    neo4j.connection.configuration.protocols.bolt.username,
                    neo4j.connection.configuration.protocols.bolt.password));
            }
        });
    }
}

export const handleSharedDashboardsThunk = () => (dispatch: any, getState: any) => {
    try {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        if (urlParams.get("share") !== null) {
            const id = decodeURIComponent(urlParams.get("id"));
            const type = urlParams.get("type");
            const standalone = urlParams.get("standalone") == "yes";
            if (urlParams.get("credentials")) {
                const connection = decodeURIComponent(urlParams.get("credentials"));
                const protocol = connection.split("://")[0];
                const username = connection.split("://")[1].split(":")[0];
                const password = connection.split("://")[1].split(":")[1].split("@")[0];
                const database = connection.split("@")[1].split(":")[0];
                const url = connection.split("@")[1].split(":")[1];
                const port = connection.split("@")[1].split(":")[2];
                dispatch(setShareDetailsFromUrl(type, id, standalone, protocol, url, port, database, username, password));
                window.history.pushState({}, document.title, "/" );
            } else {
                dispatch(setShareDetailsFromUrl(type, id, undefined, undefined, undefined, undefined, undefined, undefined, undefined));
                window.history.pushState({}, document.title, "/" );
            }
        }else{
            // dispatch(resetShareDetails());
        }

    } catch (e) {
        dispatch(createNotificationThunk("Unable to load shared dashboard", "You have specified an invalid/incomplete share URL. Try regenerating the share URL from the sharing window."));
    }
}


export const onConfirmLoadSharedDashboardThunk = () => (dispatch: any, getState: any) => {
    try {
        const state = getState();
        const shareDetails = state.application.shareDetails;
        dispatch(setWelcomeScreenOpen(false));
        dispatch(setDashboardToLoadAfterConnecting(shareDetails.id));
        if (shareDetails.url) {
            dispatch(createConnectionThunk(shareDetails.protocol, shareDetails.url, shareDetails.port, shareDetails.database, shareDetails.username, shareDetails.password));
        } else {
            dispatch(setConnectionModalOpen(true));
        }
        if (shareDetails.standalone == true) {
            dispatch(setStandAloneMode(true));
        }
        dispatch(resetShareDetails());
    } catch (e) {
        dispatch(createNotificationThunk("Unable to load shared dashboard", "The provided connection or dashboard identifiers are invalid. Try regenerating the share URL from the sharing window."));
    }
}