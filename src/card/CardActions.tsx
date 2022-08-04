/**
 * A list of actions to perform on cards.
 */

export const TOGGLE_CARD_SETTINGS = 'PAGE/CARD/TOGGLE_CARD_SETTINGS';
export const toggleCardSettings = (pagenumber: any, index: any, open: any) => ({
    type: TOGGLE_CARD_SETTINGS,
    payload: { pagenumber, index, open },
});

export const TOGGLE_CARD_INFO = 'PAGE/CARD/TOGGLE_CARD_INFO';
export const toggleCardInfo = (pagenumber: any, index: any, open: any) => ({
    type: TOGGLE_CARD_INFO,
    payload: { pagenumber, index, open },
});

export const HARD_RESET_CARD_SETTINGS = 'PAGE/CARD/HARD_RESET_CARD_SETTINGS';
export const hardResetCardSettings = (pagenumber: any, index: any) => ({
    type: HARD_RESET_CARD_SETTINGS,
    payload: { pagenumber, index },
});


export const UPDATE_REPORT_TITLE = 'PAGE/CARD/UPDATE_REPORT_TITLE';
export const updateReportTitle = (pagenumber: number, index: number, title: any) => ({
    type: UPDATE_REPORT_TITLE,
    payload: { pagenumber, index, title },
});

export const UPDATE_REPORT_SIZE = 'PAGE/CARD/UPDATE_REPORT_SIZE';
export const updateReportSize = (pagenumber: number, index: number, width: any, height: any) => ({
    type: UPDATE_REPORT_SIZE,
    payload: { pagenumber, index, width, height },
});

export const UPDATE_REPORT_QUERY = 'PAGE/CARD/UPDATE_REPORT_QUERY';
export const updateReportQuery = (pagenumber: number, index: number, query: any) => ({
    type: UPDATE_REPORT_QUERY,
    payload: { pagenumber, index, query },
});

export const UPDATE_REPORT_REFRESH_RATE = 'PAGE/CARD/UPDATE_REPORT_REFRESH_RATE';
export const updateReportRefreshRate = (pagenumber: number, index: number, rate: any) => ({
    type: UPDATE_REPORT_REFRESH_RATE,
    payload: { pagenumber, index, rate },
});

export const UPDATE_CYPHER_PARAMETERS = 'PAGE/CARD/UPDATE_CYPHER_PARAMETERS';
export const updateCypherParameters = (pagenumber: number, index: number, parameters: any) => ({
    type: UPDATE_CYPHER_PARAMETERS,
    payload: { pagenumber, index, parameters },
});

export const UPDATE_QUERY_INFO = 'PAGE/CARD/UPDATE_QUERY_INFO';
export const updateQueryInfo = (pagenumber: number, index: number, queryInfo: any) => ({
    type: UPDATE_QUERY_INFO,
    payload: { pagenumber, index, queryInfo },
});

export const UPDATE_INFO_URL = 'PAGE/CARD/UPDATE_INFO_URL';
export const updateInfoURL = (pagenumber: number, index: number, infoURL: any) => ({
    type: UPDATE_INFO_URL,
    payload: { pagenumber, index, infoURL },
});

export const UPDATE_REPORT_TYPE = 'PAGE/CARD/UPDATE_REPORT_TYPE';
export const updateReportType = (pagenumber: number, index: number, type: any) => ({
    type: UPDATE_REPORT_TYPE,
    payload: { pagenumber, index, type },
});

export const UPDATE_FIELDS = 'PAGE/CARD/UPDATE_FIELDS';
export const updateFields = (pagenumber: number, index: number, fields: any) => ({
    type: UPDATE_FIELDS,
    payload: { pagenumber, index, fields },
});

export const UPDATE_SELECTION = 'PAGE/CARD/UPDATE_SELECTION';
export const updateSelection = (pagenumber: number, index: number, selectable: any, field: any) => ({
    type: UPDATE_SELECTION,
    payload: { pagenumber, index, selectable, field },
});

export const UPDATE_ALL_SELECTIONS = 'PAGE/CARD/UPDATE_ALL_SELECTIONS';
export const updateAllSelections = (pagenumber: number, index: number, selections: any) => ({
    type: UPDATE_ALL_SELECTIONS,
    payload: { pagenumber, index, selections},
});

export const CLEAR_SELECTION = 'PAGE/CARD/CLEAR_SELECTION';
export const clearSelection = (pagenumber: number, index: number) => ({
    type: CLEAR_SELECTION,
    payload: { pagenumber, index },
});


export const UPDATE_REPORT_SETTING = 'PAGE/CARD/UPDATE_REPORT_SETTING';
export const updateReportSetting = (pagenumber: number, index: number, setting: any, value: any) => ({
    type: UPDATE_REPORT_SETTING,
    payload: { pagenumber, index, setting, value },
});

export const TOGGLE_REPORT_SETTINGS = 'PAGE/CARD/TOGGLE_REPORT_SETTINGS';
export const toggleReportSettings = (index: any) => ({
    type: TOGGLE_REPORT_SETTINGS,
    payload: { index },
});
