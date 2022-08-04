import {
    CLEAR_SELECTION,
    HARD_RESET_CARD_SETTINGS,
    TOGGLE_CARD_INFO,
    TOGGLE_REPORT_SETTINGS,
    UPDATE_ALL_SELECTIONS,
    UPDATE_CYPHER_PARAMETERS,
    UPDATE_FIELDS, UPDATE_INFO_URL, UPDATE_QUERY_INFO,
    UPDATE_REPORT_QUERY,
    UPDATE_REPORT_REFRESH_RATE,
    UPDATE_REPORT_SETTING,
    UPDATE_REPORT_SIZE,
    UPDATE_REPORT_TITLE,
    UPDATE_REPORT_TYPE,
    UPDATE_SELECTION
} from "./CardActions";
import { TOGGLE_CARD_SETTINGS } from "./CardActions";

const update = (state, mutations) =>
    Object.assign({}, state, mutations)

/**
 * State reducers for a single card instance as part of a report.
 */
export const CARD_INITIAL_STATE = {
    title: "",
    query: '\n\n\n',
    settingsOpen: false,
    advancedSettingsOpen: false,
    width: 3,
    type: "table",
    height: 3,
    fields: [],
    selection: {},
    settings: {},
    collapseTimeout: "auto"
};


export const cardReducer = (state = CARD_INITIAL_STATE, action: { type: any; payload: any; }) => {
    const { type, payload } = action;


    if (!action.type.startsWith('PAGE/CARD/')) {
        return state;
    }

    switch (type) {
        case UPDATE_REPORT_TITLE: {
            const { pagenumber, index, title } = payload;
            state = update(state, { title: title })
            return state;
        }
        case UPDATE_REPORT_SIZE: {
            const { pagenumber, index, width, height } = payload;
            state = update(state, { width: width, height: height })
            return state;
        }
        case UPDATE_REPORT_QUERY: {
            const { pagenumber, index, query } = payload;
            state = update(state, { query: query })
            return state;
        }
        case UPDATE_REPORT_REFRESH_RATE: {
            const { pagenumber, index, rate } = payload;

            state = update(state, { refreshRate: rate })
            return state;
        }
        case UPDATE_CYPHER_PARAMETERS: {
            const { pagenumber, index, parameters } = payload;
            state = update(state, { parameters: parameters })
            return state;
        }
        case UPDATE_QUERY_INFO: {
            console.log('asdasdasdasd')
            const { pagenumber, index, queryInfo } = payload;
            state = update(state, { queryInfo: queryInfo })
            return state;
        }
        case UPDATE_INFO_URL: {
            const { pagenumber, index, infoURL } = payload;
            state = update(state, { infoURL: infoURL })
            return state;
        }
        case UPDATE_FIELDS: {
            const { pagenumber, index, fields } = payload;
            state = update(state, { fields: fields })
            return state;
        }
        case UPDATE_REPORT_TYPE: {
            const { pagenumber, index, type } = payload;
            state = update(state, { type: type })
            return state;
        }
        case CLEAR_SELECTION: {
            const { pagenumber, index } = payload;
            state = update(state, { selection: {} })
            return state;
        }
        case UPDATE_SELECTION: {
            const { pagenumber, index, selectable, field } = payload;
            const selection = (state.selection) ? (state.selection) : {};

            const entry = {}
            entry[selectable] = field;
            state = update(state, { selection: update(selection, entry) })
            return state;
        }
        case UPDATE_ALL_SELECTIONS: {
            const { pagenumber, index, selections } = payload;
            state = update(state, { selection: selections })
            return state;
        }
        case UPDATE_REPORT_SETTING: {
            const { pagenumber, index, setting, value } = payload;
            const settings = (state.settings) ? (state.settings) : {};

            // Javascript is amazing, so "" == 0. Instead we check if the string length is zero...
            if (value == undefined || value.toString().length == 0) {
                delete settings[setting];
                update(state, { settings: settings });
                return state;
            }

            const entry = {}
            entry[setting] = value;
            state = update(state, { settings: update(settings, entry) })
            return state;
        }
        case TOGGLE_CARD_SETTINGS: {
            const { pagenumber, index, open } = payload;
            state = update(state, { settingsOpen: open, collapseTimeout: "auto" })
            return state;
        }
        case TOGGLE_CARD_INFO: {
            const { pagenumber, index, open } = payload;
            state = update(state, { infoOpen: open, collapseTimeout: "auto" })
            return state;
        }
        case HARD_RESET_CARD_SETTINGS: {
            const { pagenumber, index } = payload;
            state = update(state, { settingsOpen: false, collapseTimeout: 0 })
            return state;
        }
        case TOGGLE_REPORT_SETTINGS: {
            const { index } = payload;
            state = update(state, { advancedSettingsOpen: !state.advancedSettingsOpen })
            return state;
        }
        default: {
            return state;
        }
    }
}

export default cardReducer;