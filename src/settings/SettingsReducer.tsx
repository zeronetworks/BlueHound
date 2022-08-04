import { UPDATE_DASHBOARD_SETTING } from './SettingsActions';

const update = (state, mutations) =>
    Object.assign({}, state, mutations)


export const SETTINGS_INITIAL_STATE = {
    pagenumber: 4,
    editable: true,
    fullscreenEnabled: true,
}


/**
 * Reducers define changes to the application state when a given action.
 * This reducer handles updates to a single page of the dashboard.
 * TODO - pagenumbers can be cut from here with new reducer architecture.
 */
export const settingsReducer = (state = SETTINGS_INITIAL_STATE, action: { type: any; payload: any; }) => {
    const { type, payload } = action;

    if (!action.type.startsWith('SETTINGS/')) {
        return state.settings;
    }

    // Else, deal with page-level operations.
    switch (type) {
        case UPDATE_DASHBOARD_SETTING: {
            const { dashboard, setting, value } = payload;
            const settings = (state.settings) ? (state.settings) : {};

            // Javascript is amazing, so "" == 0. Instead we check if the string length is zero...
            if (value.toString().length == 0) {
                const entry = {}
                entry[setting] = undefined;
                return update(settings, entry);
            }

            const entry = {}
            entry[setting] = value;
            return update(settings, entry);
        }
        default: {
            return state;
        }
    }
}