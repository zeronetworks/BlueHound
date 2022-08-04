/**
 * Reducers define changes to the application state when a given action
 */

import {
    pageReducer,
    PAGE_INITIAL_STATE,
    DASHBOARD_PAGES_INITIAL_STATE
} from '../page/PageReducer';
import { settingsReducer, SETTINGS_INITIAL_STATE } from '../settings/SettingsReducer';
import { CREATE_PAGE, REMOVE_PAGE, SET_DASHBOARD_TITLE, RESET_DASHBOARD_STATE, SET_DASHBOARD } from './DashboardActions';
import {IMPORT_TOOLS_INITIAL_STATE} from "../modal/CollectionModal";

export const BLUEHOUND_VERSION = "1.0";

export const initialState = {
    title: "BlueHound",
    version: BLUEHOUND_VERSION,
    settings: SETTINGS_INITIAL_STATE,
    pages: DASHBOARD_PAGES_INITIAL_STATE,
    importTools: IMPORT_TOOLS_INITIAL_STATE
}


const update = (state, mutations) =>
    Object.assign({}, state, mutations)



export const dashboardReducer = (state = initialState, action: { type: any; payload: any; }) => {
    const { type, payload } = action;



    // Page-specific updates are deferred to the page reducer.
    if (action.type.startsWith('PAGE/')) {
        const { pagenumber = state.settings.pagenumber } = payload;
        return {
            ...state,
            pages: [
                ...state.pages.slice(0, pagenumber),
                pageReducer(state.pages[pagenumber], action),
                ...state.pages.slice(pagenumber + 1)
            ]
        }
    }

    // Settings-specific updates are deferred to the page reducer.
    if (action.type.startsWith('SETTINGS/')) {
        const enrichedPayload = update(payload, { dashboard: state });
        const enrichedAction = { type, payload: enrichedPayload };
        return {
            ...state,
            settings: settingsReducer(state, enrichedAction)
        }
    }

    // Global dashboard updates are handled here.
    switch (type) {
        case RESET_DASHBOARD_STATE: {
            return { ...initialState }
        }
        case SET_DASHBOARD: {
            const { dashboard } = payload;
            return { ...dashboard }
        }
        case SET_DASHBOARD_TITLE: {
            const { title } = payload;
            return { ...state, title: title }
        }
        case CREATE_PAGE: {
            return { ...state, pages: [...state.pages, PAGE_INITIAL_STATE] }
        }
        case REMOVE_PAGE: {
            // Removes the card at a given index on a selected page number. 
            const { number } = payload;
            const pagesInFront = state.pages.slice(0, number);
            const pagesBehind = state.pages.slice(number + 1);

            return {
                ...state,
                pages: pagesInFront.concat(pagesBehind)
            }
        }

        default: {
            return state;
        }
    }
}

function dispatch(arg0: { type: string; payload: { number: any; }; }) {
    throw new Error('Function not implemented.');
}
