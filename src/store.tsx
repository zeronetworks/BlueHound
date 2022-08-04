import { createStore, combineReducers, applyMiddleware } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { pageReducer as pageReducer } from './page/PageReducer';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { dashboardReducer } from './dashboard/DashboardReducer';
import { applicationReducer } from './application/ApplicationReducer';

/**
 * Set up the store (browser cache), as well as the reducers that can update application state.
 */
const persistConfig = {
    key: 'root',
    storage,
    stateReconciler: autoMergeLevel2,
}

const reducers = {
    dashboard: dashboardReducer,
    application: applicationReducer 
};
const rootReducer = combineReducers(reducers);

// @ts-ignore
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const configureStore = () => createStore(persistedReducer,
    composeWithDevTools(
        applyMiddleware(thunk)
    )
);