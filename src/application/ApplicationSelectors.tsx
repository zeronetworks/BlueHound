import { initialState } from "../dashboard/DashboardReducer";
import _ from 'lodash';

export const applicationHasNotification = (state: any) => {
    return state.application.notificationMessage != null;
}

export const getNotification = (state: any) => {
    return state.application.notificationMessage;
}

export const getNotificationTitle = (state: any) => {
    return state.application.notificationTitle;
}

export const applicationHasSnackbar = (state: any) => {
    return state.application.snackbarMessage != null;
}

export const applicationIsConnected = (state: any) => {
    return state.application.connected;
}

export const applicationGetConnection = (state: any) => {
    return state.application.connection;
}

export const applicationGetDBVersion = (state: any) => {
    return state.application.dbVersion;
}

export const applicationGetShareDetails = (state: any) => {
    return state.application.shareDetails;
}

export const applicationIsStandalone = (state: any) => {
    return state.application.standalone;
}

export const applicationHasNeo4jDesktopConnection = (state: any) => {
    return state.application.desktopConnection != null;
}

export const applicationHasConnectionModalOpen = (state: any) => {
    return state.application.connectionModalOpen;
}

export const applicationGetOldDashboard = (state: any) => {
    return state.application.oldDashboard;
}

export const applicationHasCollectionModalOpen = (state: any) => {
    return state.application.collectionModalOpen;
}

export const applicationHasFilterModalOpen = (state: any) => {
    return state.application.filterModalOpen;
}

export const applicationHasAboutModalOpen = (state: any) => {
    return state.application.aboutModalOpen;
}

export const applicationHasQueryModalOpen = (state: any) => {
    return state.application.queryModalOpen;
}

export const cachedQueries = (state: any) => {
    return state.application.cachedQueries;
}

export const applicationHasWelcomeScreenOpen = (state: any) => {
    return state.application.welcomeScreenOpen;
}

export const applicationHasCachedDashboard = (state: any) => {
    // Avoid this expensive check when the application is connected, as it's only for the welcome screen.
    if (state.application.connected) {
        return false;
    }
    return !_.isEqual(state.dashboard, initialState);
}

/**
 * Deep-copy the current state, and remove the password.
 */
export const applicationGetDebugState = (state: any) => {
    const copy = JSON.parse(JSON.stringify(state));
    copy.application.connection.password = "************";
    if(copy.application.desktopConnection){
        copy.application.desktopConnection.password = "************";
    }
    return copy;
}

export const getVulnerabilityReportsData = (state: any) => {
    return state.application.vulnerabilityReportsData;
}

export const getVulnerabilityReportLoading = (state: any) => {
    return state.application.vulnerabilityReportLoading;
}

export const getToolsParameters = (state: any) => {
    return state.application.toolsParameters;
}

export const getToolsRunning = (state: any) => {
    return state.application.toolsRunning;
}

export const getToolsOutput = (state: any) => {
    return state.application.toolsOutput;
}

export const getToolsParallel = (state: any) => {
    return state.application.toolsParallel;
}

export const getParallelQueries = (state: any) => {
    return state.application.parallelQueries;
}

export const getSharpHoundUploadResults = (state: any) => {
    return state.application.sharphoundUploadResults;
}

export const getSharpHoundClearResults = (state: any) => {
    return state.application.sharphoundClearResults;
}