
export const CLEAR_NOTIFICATION = 'APPLICATION/CLEAR_NOTIFICATION';
export const clearNotification = () => ({
    type: CLEAR_NOTIFICATION,
    payload: {},
});

export const CREATE_NOTIFICATION = 'APPLICATION/CREATE_NOTIFICATION';
export const createNotification = (title: any, message: any) => ({
    type: CREATE_NOTIFICATION,
    payload: { title, message },
});

export const SET_CONNECTED = 'APPLICATION/SET_CONNECTED';
export const setConnected = (connected: boolean) => ({
    type: SET_CONNECTED,
    payload: { connected },
});

export const SET_DB_VERSION = 'APPLICATION/SET_DB_VERSION';
export const setDBVersion = (version: string) => ({
    type: SET_DB_VERSION,
    payload: { version },
});

export const SET_CONNECTION_MODAL_OPEN = 'APPLICATION/SET_CONNECTION_MODAL_OPEN';
export const setConnectionModalOpen = (open: boolean) => ({
    type: SET_CONNECTION_MODAL_OPEN,
    payload: { open },
});

export const SET_COLLECTION_MODAL_OPEN = 'APPLICATION/SET_COLLECTION_MODAL_OPEN';
export const setCollectionModalOpen = (open: boolean) => ({
    type: SET_COLLECTION_MODAL_OPEN,
    payload: { open },
});

export const SET_FILTER_MODAL_OPEN = 'APPLICATION/SET_FILTER_MODAL_OPEN';
export const setFilterModalOpen = (open: boolean) => ({
    type: SET_FILTER_MODAL_OPEN,
    payload: { open },
});

export const SET_ABOUT_MODAL_OPEN = 'APPLICATION/SET_ABOUT_MODAL_OPEN';
export const setAboutModalOpen = (open: boolean) => ({
    type: SET_ABOUT_MODAL_OPEN,
    payload: { open },
});

export const SET_QUERY_MODAL_OPEN = 'APPLICATION/SET_QUERY_MODAL_OPEN';
export const setQueryModalOpen = (open: boolean) => ({
    type: SET_QUERY_MODAL_OPEN,
    payload: { open },
});

export const SET_CACHED_QUERIES = 'APPLICATION/SET_CACHED_QUERIES';
export const setCachedQueries = (data: object) => ({
    type: SET_CACHED_QUERIES,
    payload: { data },
});

export const SET_WELCOME_SCREEN_OPEN = 'APPLICATION/SET_WELCOME_SCREEN_OPEN';
export const setWelcomeScreenOpen = (open: boolean) => ({
    type: SET_WELCOME_SCREEN_OPEN,
    payload: { open },
});

export const SET_NESSUS_REPORT_PATH = 'APPLICATION/SET_NESSUS_REPORT_PATH';
export const setNessusReportPath = (path: string|null) => ({
    type: SET_NESSUS_REPORT_PATH,
    payload: { path },
});

export const SET_QUALYS_REPORT_PATH = 'APPLICATION/SET_QUALYS_REPORT_PATH';
export const setQualysReportPath = (path: string|null) => ({
    type: SET_QUALYS_REPORT_PATH,
    payload: { path },
});

export const SET_NMAP_REPORT_PATH = 'APPLICATION/SET_NMAP_REPORT_PATH';
export const setNmapReportPath = (path: string|null) => ({
    type: SET_NMAP_REPORT_PATH,
    payload: { path },
});

export const SET_OPENVAS_REPORT_PATH = 'APPLICATION/SET_OPENVAS_REPORT_PATH';
export const setOpenVASReportPath = (path: string|null) => ({
    type: SET_OPENVAS_REPORT_PATH,
    payload: { path },
});

export const SET_VULNERABILITY_REPORTS_DATA = 'APPLICATION/SET_VULNERABILITY_REPORTS_DATA';
export const setVulnerabilityReportsData = (data: object) => ({
    type: SET_VULNERABILITY_REPORTS_DATA,
    payload: { data },
});

export const SET_TOOLS_PARAMETERS = 'APPLICATION/SET_TOOLS_PARAMETERS';
export const setToolsParameters = (data: object) => ({
    type: SET_TOOLS_PARAMETERS,
    payload: { data },
});

export const SET_TOOLS_RUNNING = 'APPLICATION/SET_TOOLS_RUNNING';
export const setToolsRunning = (data: object) => ({
    type: SET_TOOLS_RUNNING,
    payload: { data },
});

export const SET_TOOLS_OUTPUT = 'APPLICATION/SET_TOOLS_OUTPUT';
export const setToolsOutput = (data: object) => ({
    type: SET_TOOLS_OUTPUT,
    payload: { data },
});

export const SET_TOOLS_PARALLEL = 'APPLICATION/SET_TOOLS_PARALLEL';
export const setToolsParallel = (status: boolean) => ({
    type: SET_TOOLS_PARALLEL,
    payload: { status },
});

export const SET_PARALLEL_QUERIES = 'APPLICATION/SET_PARALLEL_QUERIES';
export const setParallelQueries = (amount: number) => ({
    type: SET_PARALLEL_QUERIES,
    payload: { amount },
});

export const SET_SHARPHOUND_UPLOAD_RESULTS = 'APPLICATION/SET_SHARPHOUND_UPLOAD_RESULTS';
export const setSharpHoundUploadResults = (status: boolean) => ({
    type: SET_SHARPHOUND_UPLOAD_RESULTS,
    payload: { status },
});

export const SET_SHARPHOUND_CLEAR_RESULTS = 'APPLICATION/SET_SHARPHOUND_CLEAR_RESULTS';
export const setSharpHoundClearResults = (status: boolean) => ({
    type: SET_SHARPHOUND_CLEAR_RESULTS,
    payload: { status },
});

export const SET_VULNERABILITY_REPORT_LOADING = 'APPLICATION/SET_VULNERABILITY_REPORT_LOADING';
export const setVulnerabilityReportLoading = (status: boolean) => ({
    type: SET_VULNERABILITY_REPORT_LOADING,
    payload: { status },
});

export const SET_CONNECTION_PROPERTIES = 'APPLICATION/SET_CONNECTION_PROPERTIES';
export const setConnectionProperties = (protocol: string, url: string, port: string, database: string, username: string, password: string, successful: boolean) => ({
    type: SET_CONNECTION_PROPERTIES,
    payload: { protocol, url, port, database, username, password, successful },
});

export const SET_DESKTOP_CONNECTION_PROPERTIES = 'APPLICATION/SET_DESKTOP_CONNECTION_PROPERTIES';
export const setDesktopConnectionProperties = (protocol: string, url: string, port: string, database: string, username: string, password: string) => ({
    type: SET_DESKTOP_CONNECTION_PROPERTIES,
    payload: { protocol, url, port, database, username, password },
});

export const CLEAR_DESKTOP_CONNECTION_PROPERTIES = 'APPLICATION/CLEAR_DESKTOP_CONNECTION_PROPERTIES';
export const clearDesktopConnectionProperties = () => ({
    type: CLEAR_DESKTOP_CONNECTION_PROPERTIES,
    payload: {},
});

// Legacy pre1-v2 dashboard that can be optionally upgraded.
export const SET_OLD_DASHBOARD = 'APPLICATION/SET_OLD_DASHBOARD';
export const setOldDashboard = (text: string) => ({
    type: SET_OLD_DASHBOARD,
    payload: { text },
});

// Legacy pre1-v2 dashboard that can be optionally upgraded.
export const RESET_SHARE_DETAILS = 'APPLICATION/RESET_SHARE_DETAILS';
export const resetShareDetails = () => ({
    type: RESET_SHARE_DETAILS,
    payload: { },
});

export const SET_SHARE_DETAILS_FROM_URL = 'APPLICATION/SET_SHARE_DETAILS_FROM_URL';
export const setShareDetailsFromUrl = (type: string, id: string, standalone: boolean, protocol: string, url: string, port: string, database: string, username: string, password: string) => ({
    type: SET_SHARE_DETAILS_FROM_URL,
    payload: { type, id, standalone, protocol, url, port, database, username, password },
});

export const SET_STANDALONE_MODE = 'APPLICATION/SET_STANDALONE_MODE';
export const setStandAloneMode = (standalone: boolean) => ({
    type: SET_STANDALONE_MODE,
    payload: { standalone },
});

export const SET_DASHBOARD_TO_LOAD_AFTER_CONNECTING = 'APPLICATION/SET_DASHBOARD_TO_LOAD_AFTER_CONNECTING';
export const setDashboardToLoadAfterConnecting = (id: any) => ({
    type: SET_DASHBOARD_TO_LOAD_AFTER_CONNECTING,
    payload: { id },
});