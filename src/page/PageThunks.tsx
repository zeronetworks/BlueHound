import { createNotification } from "../application/ApplicationActions";
import { toggleReportSettings } from "../card/CardActions";
import { CARD_INITIAL_STATE } from "../card/CardReducer";
import { updateReportSizeThunk } from "../card/CardThunks";
import {
    createReport, removeReport, shiftReportLeft, shiftReportRight
} from "./PageActions";



export const createNotificationThunk = (title:any, message: any) => (dispatch: any) => {
    dispatch(createNotification(title, message));
};

export const addReportRequest = (text: any) => (dispatch: any, getState: any) => {
    try {
        const report = CARD_INITIAL_STATE;
        const state = getState();
        const pagenumber = state.dashboard.settings.pagenumber;
        dispatch(createReport(pagenumber, report));
    } catch (e) {
        dispatch(createNotificationThunk("Cannot create report", e));
    }
}

export const removeReportRequest = (index: number) => (dispatch: any, getState: any) => {
    try {
        const state = getState();
        const pagenumber = state.dashboard.settings.pagenumber;
        dispatch(removeReport(pagenumber, index));
    } catch (e) {
        dispatch(createNotificationThunk("Cannot remove report", e));
    }
}

export const shiftReportLeftRequest = (index: number) => (dispatch: any, getState: any) => {
    try {
        const state = getState();
        const pagenumber = state.dashboard.settings.pagenumber;
        const reports = state.dashboard.pages[pagenumber].reports;

        if (index == 0){
            return
        }
        const selectedCard = reports[index];
        const otherCard = reports[index-1];

        dispatch(shiftReportLeft(pagenumber, index));
        // We ensure the size of the cards is updated right away, to avoid rendering issues.
        dispatch(updateReportSizeThunk(index, otherCard.width, otherCard.height))
        dispatch(updateReportSizeThunk(index-1, selectedCard.width, selectedCard.height))
        if(selectedCard.advancedSettingsOpen == true){
            dispatch(toggleReportSettings(index))
        }
        if(otherCard.advancedSettingsOpen == true){
            dispatch(toggleReportSettings(index-1))
        }
    } catch (e) {
        dispatch(createNotificationThunk("Error", e));
    }
}


export const shiftReportRightRequest = (index: number) => (dispatch: any, getState: any) => {
    try {
        const state = getState();
        const pagenumber = state.dashboard.settings.pagenumber;
        const reports = state.dashboard.pages[pagenumber].reports;

        if (index >= reports.length - 1){
            return
        }
        const selectedCard = reports[index];
        const otherCard = reports[index+1];

        dispatch(shiftReportRight(pagenumber, index));
        // We ensure the size of the cards is updated right away, to avoid rendering issues.
        dispatch(updateReportSizeThunk(index, otherCard.width, otherCard.height))
        dispatch(updateReportSizeThunk(index+1, selectedCard.width, selectedCard.height))
        if(selectedCard.advancedSettingsOpen == true){
            dispatch(toggleReportSettings(index))
        }
        if(otherCard.advancedSettingsOpen == true){
            dispatch(toggleReportSettings(index+1))
        }
    } catch (e) {
        dispatch(createNotificationThunk("Error", e));
    }
}