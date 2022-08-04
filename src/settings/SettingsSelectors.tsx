
export const getPageNumber = (state: any) => state.dashboard.settings.pagenumber;

export const getDashboardIsEditable = (state: any) => state.dashboard.settings.editable && !state.application.standalone;

export const getGlobalParameters = (state: any) => state.dashboard.settings.parameters;

export const getDatabase = (state: any) => state.application.connection.database;
