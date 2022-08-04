import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import NeoAddCard from '../card/CardAddButton';
import NeoCard from '../card/Card';
import { getReports } from './PageSelectors';
import { removeReportRequest, shiftReportLeftRequest, shiftReportRightRequest } from './PageThunks';
import Grid from '@material-ui/core/Grid';
import { getDashboardIsEditable } from '../settings/SettingsSelectors';
import { getDashboardSettings } from '../dashboard/DashboardSelectors';


/**
 * A component responsible for rendering the page, a collection of reports.
 */
export const NeoPage = (
    {
        editable = true, // Whether the page is editable.
        dashboardSettings, // global settings for the entire dashboard.
        reports = [], // list of reports as defined in the dashboard state.
        onRemovePressed = (index) => { }, // action to take when a report gets removed.
        onShiftLeftPressed = (index) => { }, // action to take when a report gets shifted left.
        onShiftRightPressed = (index) => { }, // action to take when a report gets shifted right.
        isLoaded = true
    }) => {

    const loadingMessage = <div>Loading card...</div>;
    const content = (
        <div style={{ flexGrow: 1, paddingTop: "52px" }}>
            <Grid container spacing={2}>
                {reports.map((report, index) => {
                    // @ts-ignore
                    const width = report.width;
                    // @ts-ignore
                    return <Grid style={{ paddingTop: "16px", paddingBottom: "0px" }}
                        key={index} item xs={Math.min(width * 4, 12)} sm={Math.min(width * 2, 12)} md={Math.min(width * 2, 12)} lg={Math.min(width, 12)} xl={Math.min(width, 12)}>
                        <NeoCard index={index}
                            dashboardSettings={dashboardSettings}
                            onShiftLeftPressed={onShiftLeftPressed}
                            onShiftRightPressed={onShiftRightPressed}
                            onRemovePressed={onRemovePressed} />
                    </Grid>
                })}
                {editable ? <Grid  style={{ paddingTop: "16px", paddingBottom: "0px" }}
                    key={reports.length + 1} item xs={12} sm={6} md={6} lg={3} xl={3}>
                    <NeoAddCard />
                </Grid> : <></>}
            </Grid>
        </div>
    );
    return !isLoaded ? loadingMessage : content;
}

const mapStateToProps = state => ({
    isLoaded: true,
    editable: getDashboardIsEditable(state),
    dashboardSettings: getDashboardSettings(state),
    reports: getReports(state),
});

const mapDispatchToProps = dispatch => ({
    onRemovePressed: index => dispatch(removeReportRequest(index)),
    onShiftLeftPressed: index => dispatch(shiftReportLeftRequest(index)),
    onShiftRightPressed: index => {
        dispatch(shiftReportRightRequest(index));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(NeoPage);