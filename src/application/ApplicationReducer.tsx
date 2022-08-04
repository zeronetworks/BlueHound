/**
 * Reducers define changes to the application state when a given action
 */

import {
    CLEAR_DESKTOP_CONNECTION_PROPERTIES,
    CLEAR_NOTIFICATION,
    CREATE_NOTIFICATION,
    RESET_SHARE_DETAILS,
    SET_COLLECTION_MODAL_OPEN,
    SET_ABOUT_MODAL_OPEN,
    SET_CONNECTED,
    SET_CONNECTION_MODAL_OPEN,
    SET_CONNECTION_PROPERTIES,
    SET_DASHBOARD_TO_LOAD_AFTER_CONNECTING,
    SET_DESKTOP_CONNECTION_PROPERTIES,
    SET_OLD_DASHBOARD,
    SET_SHARE_DETAILS_FROM_URL,
    SET_STANDALONE_MODE,
    SET_WELCOME_SCREEN_OPEN,
    SET_QUALYS_REPORT_PATH,
    SET_VULNERABILITY_REPORT_LOADING,
    SET_NMAP_REPORT_PATH,
    SET_NESSUS_REPORT_PATH,
    SET_OPENVAS_REPORT_PATH,
    SET_VULNERABILITY_REPORTS_DATA,
    SET_TOOLS_PARAMETERS,
    SET_TOOLS_RUNNING,
    SET_TOOLS_OUTPUT,
    SET_TOOLS_PARALLEL,
    SET_SHARPHOUND_UPLOAD_RESULTS,
    SET_SHARPHOUND_CLEAR_RESULTS,
    SET_FILTER_MODAL_OPEN,
    SET_QUERY_MODAL_OPEN, SET_PARALLEL_QUERIES, SET_DB_VERSION, SET_CACHED_QUERIES
} from "./ApplicationActions";

const update = (state, mutations) =>
    Object.assign({}, state, mutations)

const initialState =
{
    notificationTitle: null,
    notificationMessage: null,
    connectionModalOpen: false,
    welcomeScreenOpen: true,
    vulnerabilityReportLoading: false,
    collectionModalOpen: false,
    filterModalOpen: false,
    queryModalOpen: false,
    aboutModalOpen: false,
    connection: {
        protocol: "bolt",
        url: "localhost",
        port: "7687",
        database: "",
        username: "neo4j",
        password: ""
    },
    shareDetails: undefined,
    desktopConnection: null,
    connected: false,
    dashboardToLoadAfterConnecting: null,
    standalone: false,
    toolsParallel: false,
    parallelQueries: 5,
    sharphoundUploadResults: true,
    sharphoundClearResults: true,
    cachedQueries: {}
}

export const applicationReducer = (state = initialState, action: { type: any; payload: any; }) => {
    const { type, payload } = action;

    if (!action.type.startsWith('APPLICATION/')) {
        return state;
    }

    // Application state updates are handled here.
    switch (type) {
        case CREATE_NOTIFICATION: {
            const { title, message } = payload;
            state = update(state, { notificationTitle: title, notificationMessage: message })
            return state;
        }
        case CLEAR_NOTIFICATION: {
            state = update(state, { notificationTitle: null, notificationMessage: null })
            return state;
        }
        case SET_CONNECTED: {
            const { connected } = payload;
            state = update(state, { connected: connected })
            return state;
        }
        case SET_DB_VERSION: {
            const { version } = payload;
            state = update(state, { dbVersion: version })
            return state;
        }
        case SET_CONNECTION_MODAL_OPEN: {
            const { open } = payload;
            state = update(state, { connectionModalOpen: open })
            return state;
        }
        case SET_COLLECTION_MODAL_OPEN: {
            const { open } = payload;
            state = update(state, { collectionModalOpen: open })
            return state;
        }
        case SET_FILTER_MODAL_OPEN: {
            const { open } = payload;
            state = update(state, { filterModalOpen: open })
            return state;
        }
        case SET_ABOUT_MODAL_OPEN: {
            const { open } = payload;
            state = update(state, { aboutModalOpen: open })
            return state;
        }
        case SET_QUERY_MODAL_OPEN: {
            const { open } = payload;
            state = update(state, { queryModalOpen: open })
            return state;
        }
        case SET_CACHED_QUERIES: {
            const { data } = payload;
            state = update(state, { cachedQueries: data })
            return state;
        }
        case SET_WELCOME_SCREEN_OPEN: {
            const { open } = payload;
            state = update(state, { welcomeScreenOpen: open })
            return state;
        }
        case SET_VULNERABILITY_REPORTS_DATA: {
            const { data } = payload;
            state = update(state, { vulnerabilityReportsData: data })
            return state
        }
        case SET_VULNERABILITY_REPORT_LOADING: {
            const { status } = payload;
            state = update(state, { vulnerabilityReportLoading: status })
            return state
        }
        case SET_TOOLS_PARALLEL: {
            const { status } = payload;
            state = update(state, { toolsParallel: status })
            return state
        }
        case SET_PARALLEL_QUERIES: {
            const { amount } = payload;
            state = update(state, { parallelQueries: amount })
            return state
        }
        case SET_SHARPHOUND_UPLOAD_RESULTS: {
            const { status } = payload;
            state = update(state, { sharphoundUploadResults: status })
            return state
        }
        case SET_SHARPHOUND_CLEAR_RESULTS: {
            const { status } = payload;
            state = update(state, { sharphoundClearResults: status })
            return state
        }
        case SET_TOOLS_PARAMETERS: {
            const { data } = payload;
            state = update(state, { toolsParameters: data })
            return state
        }
        case SET_TOOLS_RUNNING: {
            const { data } = payload;
            state = update(state, { toolsRunning: data })
            return state
        }
        case SET_TOOLS_OUTPUT: {
            const { data } = payload;
            state = update(state, { toolsOutput: data })
            return state
        }
        case SET_NESSUS_REPORT_PATH: {
            const { path } = payload;
            state = update(state, { nessusReportPath: path })
            return state
        }
        case SET_QUALYS_REPORT_PATH: {
            const { path } = payload;
            state = update(state, { qualysReportPath: path })
            return state
        }
        case SET_NMAP_REPORT_PATH: {
            const { path } = payload;
            state = update(state, { nmapReportPath: path })
            return state
        }
        case SET_OPENVAS_REPORT_PATH: {
            const { path } = payload;
            state = update(state, { openvasReportPath: path })
            return state
        }
        case SET_STANDALONE_MODE: {
            const { standalone } = payload;
            state = update(state, { standalone: standalone })
            return state;
        }
        case SET_OLD_DASHBOARD: {
            const { text } = payload;
            state = update(state, { oldDashboard: text })
            return state;
        }
        case SET_DASHBOARD_TO_LOAD_AFTER_CONNECTING: {
            const { id } = payload;
            state = update(state, { dashboardToLoadAfterConnecting: id })
            return state;
        }
        case SET_CONNECTION_PROPERTIES: {
            const { protocol, url, port, database, username, password, successful } = payload;
            state = update(state, {
                connection: {
                    protocol: protocol, url: url, port: port,
                    database: database, username: username, password: password,
                    successful: successful
                }
            })
            return state;
        }
        case CLEAR_DESKTOP_CONNECTION_PROPERTIES: {
            state = update(state, { desktopConnection: null })
            return state;
        }
        case SET_DESKTOP_CONNECTION_PROPERTIES: {
            const { protocol, url, port, database, username, password } = payload;
            state = update(state, {
                desktopConnection: {
                    protocol: protocol, url: url, port: port,
                    database: database, username: username, password: password
                }
            })
            return state;
        }
        case RESET_SHARE_DETAILS: {
            state = update(state, { shareDetails: undefined });
            return state;
        }
        case SET_SHARE_DETAILS_FROM_URL: {
            const { type, id, standalone, protocol, url, port, database, username, password } = payload;
            state = update(state, {
                shareDetails: {
                    type: type,
                    id: id,
                    standalone: standalone,
                    protocol: protocol,
                    url: url,
                    port: port,
                    database: database,
                    username: username,
                    password: password
                }
            })
            return state;
        }
        default: {
            return state;
        }
    }
}