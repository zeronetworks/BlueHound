import {store} from "../index";
import {cachedQueries} from "../application/ApplicationSelectors";
import {setCachedQueries} from "../application/ApplicationActions";
import { cloneDeep } from 'lodash';
import {QueryStatus} from "../report/CypherQueryRunner";

export function addToCache(query, results) {
    let newData = cloneDeep(cachedQueries(store.getState()));
    newData[query] = results;
    store.dispatch(setCachedQueries(newData));
}

export function deleteFromCache(query) {
    let newData = cloneDeep(cachedQueries(store.getState()));
    delete newData[query];
    store.dispatch(setCachedQueries(newData));
}

export function getCachedResults(query) {
    const allCachedQueries = cachedQueries(store.getState())
    return allCachedQueries[query]
}

export function deleteOldCachedResults() {
    const allCachedQueries = cachedQueries(store.getState())
    Object.entries(allCachedQueries).forEach(([query, cachedData]) => {
        if (cachedData[0] == QueryStatus.RUNNING ||
            cachedData[0] == QueryStatus.WAITING ||
            cachedData[0] == QueryStatus.TIMED_OUT
        ) {
            deleteFromCache(query)
        }
    })
}