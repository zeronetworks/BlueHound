import { Drawer, ListItem, IconButton, Divider, ListItemIcon, ListItemText, List, Button } from "@material-ui/core";
import React from "react";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import NeoSaveModal from "../modal/SaveModal";
import NeoLoadModal from "../modal/LoadModal";
import {
    applicationGetConnection,
    applicationHasCollectionModalOpen,
    applicationHasAboutModalOpen,
    applicationIsStandalone,
    applicationHasFilterModalOpen, applicationHasQueryModalOpen
} from '../application/ApplicationSelectors';
import { connect } from 'react-redux';
import {
    setCollectionModalOpen,
    setAboutModalOpen,
    setConnected,
    setWelcomeScreenOpen,
    setFilterModalOpen, setQueryModalOpen
} from '../application/ApplicationActions';
import { getDashboardSettings } from "./DashboardSelectors";
import { updateDashboardSetting } from "../settings/SettingsActions";
import {PlayCircleOutline} from "@material-ui/icons";
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Tooltip from "@material-ui/core/Tooltip";
import NeoSettingsModal from "../settings/SettingsModal";
import FilterAltIcon from '@mui/icons-material/FilterAlt';

export const NeoDrawer = ({ open, hidden, connection, dashboardSettings, updateDashboardSetting,
    handleDrawerClose, aboutModalOpen, onShareModalOpen, onCollectionModalOpen, onFilterModalOpen, onAboutModalOpen, onQueryModalOpen, resetApplication }) => {

    // Override to hide the drawer when the application is in standalone mode.
    if (hidden) {
        return <></>;
    }

    const content = (
        <Drawer
            variant="permanent"
            style={
                (open) ? {
                    position: 'relative',
                    overflowX: 'hidden',
                    width: '240px',
                    transition: "width 125ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
                    boxShadow: "2px 1px 10px 0px rgb(0 0 0 / 12%)",

                } : {
                    position: 'relative',
                    overflowX: 'hidden',
                    boxShadow: " 2px 1px 10px 0px rgb(0 0 0 / 12%)",

                    transition: "width 125ms cubic-bezier(0.4, 0, 0.6, 1) 0ms",
                    width: "56px"
                }
            }
            open={open}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                overflowX: 'hidden',
                justifyContent: 'flex-end',
                padding: '0 8px',
                minHeight: '64px',

            }}>
                <ListItem>
                <Button
                        component="label"
                        onClick={resetApplication}
                        style={{ backgroundColor: "white", marginLeft: "-8px" }}
                        color="default"
                        variant="outlined"
                        size="small"
                        startIcon={<ExitToAppIcon />}>Logout
                    </Button>
                </ListItem>


                <IconButton onClick={handleDrawerClose}>
                    <ChevronLeftIcon />
                </IconButton>
            </div>
            <Divider />
            <div >
                <ListItem style={{ background: "white", height: "47px" }} >
                    <ListItemIcon>
                    </ListItemIcon>
                    <ListItemText primary="" />
                </ListItem>
            </div>
            <Divider />
           <List>
               <ListItem button onClick={onQueryModalOpen} style={{height: 55}}>
                   <ListItemIcon>
                       <Tooltip title="Run queries">
                           <AutorenewIcon />
                       </Tooltip>
                   </ListItemIcon>
                   <ListItemText primary="Query Runner" hidden={!open}/>
               </ListItem>
               <ListItem button onClick={onFilterModalOpen} style={{height: 55}}>
                   <ListItemIcon>
                       <Tooltip title="Filter queries by edge type">
                           <FilterAltIcon />
                       </Tooltip>
                   </ListItemIcon>
                   <ListItemText primary="Edge Filtering"  hidden={!open}/>
               </ListItem>
               <ListItem button onClick={onCollectionModalOpen} style={{height: 55}}>
                   <ListItemIcon>
                       <Tooltip title="Data import tools">
                           <PlayCircleOutline />
                       </Tooltip>
                   </ListItemIcon>
                   <ListItemText primary="Data Import"  hidden={!open}/>
               </ListItem>
                <div>
                    <NeoSaveModal open={open}></NeoSaveModal>
                    <NeoLoadModal open={open}></NeoLoadModal>
                    {<NeoSettingsModal dashboardOpen={open} dashboardSettings={dashboardSettings} updateDashboardSetting={updateDashboardSetting}></NeoSettingsModal>}
                    {/*<NeoShareModal></NeoShareModal>*/}
                </div>
               <ListItem button onClick={onAboutModalOpen} style={{height: 55}}>
                   <ListItemIcon>
                       <Tooltip title="About">
                           <InfoOutlinedIcon />
                       </Tooltip>
                   </ListItemIcon>
                   <ListItemText primary="About" hidden={!open}/>
               </ListItem>
            </List>
            <Divider />
        </Drawer>

    );
    return content;
}

const mapStateToProps = state => ({
    dashboardSettings: getDashboardSettings(state),
    hidden: applicationIsStandalone(state),
    collectionModalOpen: applicationHasCollectionModalOpen(state),
    filterModalOpen: applicationHasFilterModalOpen(state),
    aboutModalOpen: applicationHasAboutModalOpen(state),
    queryModalOpen: applicationHasQueryModalOpen(state),
    connection: applicationGetConnection(state)
});

const mapDispatchToProps = dispatch => ({
    onCollectionModalOpen: _ => dispatch(setCollectionModalOpen(true)),
    onFilterModalOpen: _ => dispatch(setFilterModalOpen(true)),
    onAboutModalOpen: _ => dispatch(setAboutModalOpen(true)),
    onQueryModalOpen: _ => dispatch(setQueryModalOpen(true)),
    updateDashboardSetting: (setting, value) => {
        dispatch(updateDashboardSetting(setting, value));
    },
    resetApplication: _ => {
        dispatch(setWelcomeScreenOpen(true));
        dispatch(setConnected(false));
    }
});


export default connect(mapStateToProps, mapDispatchToProps)(NeoDrawer);
