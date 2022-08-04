import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import { ListItem, ListItemIcon, ListItemText, Tooltip } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import { getDashboardJson } from './ModalSelectors';
import { applicationGetConnection } from '../application/ApplicationSelectors';
import { saveDashboardToNeo4jThunk } from '../dashboard/DashboardThunks';
import {RELOAD_DATA_EVENT, ee } from "../report/Report"

/**
 * A modal to save a dashboard as a JSON text string.
 * The button to open the modal is intended to use in a drawer at the side of the page.
 */

const styles = {

};

export const handleRefreshClick = () => {
    ee.emit(RELOAD_DATA_EVENT);
}

export const NeoRefreshModal = ({ dashboard, connection, saveDashboardToNeo4j }) => {

    return (
        <div>
            <ListItem button onClick={handleRefreshClick}>
                <ListItemIcon>
                    <Tooltip title="Refresh all charts">
                        <IconButton style={{ padding: "0px" }} >
                            <AutorenewIcon />
                        </IconButton>
                    </Tooltip>
                </ListItemIcon>
                <ListItemText primary="Refresh" />
            </ListItem>
        </div>
    );
}

const mapStateToProps = state => ({
    dashboard: getDashboardJson(state),
    connection: applicationGetConnection(state)
});

const mapDispatchToProps = dispatch => ({
    saveDashboardToNeo4j: (driver: any, dashboard: any, date: any, user: any) => {
        dispatch(saveDashboardToNeo4jThunk(driver, dashboard, date, user))
    },
});

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(NeoRefreshModal));



