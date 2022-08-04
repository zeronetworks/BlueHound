import { createSelector } from "reselect";
export const getReports = (state: any) => {
    const pagenumber = state.dashboard.settings.pagenumber;
    return state.dashboard.pages[pagenumber].reports;
}
export const getReportsLoading = (state: any) => state.dashboard.isLoading;

export const getCurrentReports = createSelector(
    getReports,
    (reports) => reports.filter((report) => true),

);

