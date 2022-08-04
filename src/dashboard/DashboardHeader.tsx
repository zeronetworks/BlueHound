import { AppBar, Toolbar, IconButton, Typography, Badge, TextField, InputBase, Tooltip } from "@material-ui/core";
import React, {useCallback, useContext, useEffect} from "react";
import NeoPageButton from "./DashboardHeaderPageButton";
import NeoPageAddButton from "./DashboardHeaderPageAddButton";
import MenuIcon from '@material-ui/icons/Menu';
import ConnectionModal from '../modal/ConnectionModal';
import { withStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { setDashboardTitle, addPage, removePage } from "./DashboardActions";
import { getDashboardTitle, getPages } from "./DashboardSelectors";
import debounce from 'lodash/debounce';
import { setPageTitle } from "../page/PageActions";
import {addPageThunk, removePageThunk, hasNetworkDataThunk} from "./DashboardThunks";
import { setConnectionModalOpen } from "../application/ApplicationActions";
import { setPageNumberThunk } from "../settings/SettingsThunks";
import { getDashboardIsEditable, getGlobalParameters, getPageNumber } from "../settings/SettingsSelectors";
import { applicationIsStandalone } from "../application/ApplicationSelectors";
import { createNotificationThunk } from "../page/PageThunks";
import {Neo4jContext, Neo4jContextState} from "use-neo4j/dist/neo4j.context";
import AutorenewIcon from "@material-ui/icons/Autorenew";
import {deleteFromCache} from "../component/QueriesCache";

const drawerWidth = 240;

const styles = {
    root: {
        background: "transparent",
        marginLeft: "30px",
        marginRight: "30px",

    },
    input: {
        color: "white",
        fontSize: 20
    }
};


export const NeoDashboardHeader = ({ classes, open, standalone, pagenumber, pages, dashboardTitle, globalParameters,
    handleDrawerOpen, setDashboardTitle, editable, connection,
    addPage, removePage, selectPage, setPageTitle, onConnectionModalOpen, hasNetworkData, createNotification }) => {

    const [dashboardTitleText, setDashboardTitleText] = React.useState(dashboardTitle);
    const debouncedDashboardTitleUpdate = useCallback(
        debounce(setDashboardTitle, 250),
        [],
    );
    const debouncedSetPageTitle = useCallback(
        debounce(setPageTitle, 250),
        [],
    );

    useEffect(() => {
        // Reset text to the dashboard state when the page gets reorganized.
        if (dashboardTitle !== dashboardTitleText) {
            setDashboardTitleText(dashboardTitle);
        }
    }, [dashboardTitle])

    const { driver } = useContext<Neo4jContextState>(Neo4jContext);

    function notificationMessage(pagenumber: number) {
        if (pages[pagenumber]['title'] == "Network-Enabled Paths") {
            hasNetworkData(driver, (result) => {
                if (result == 0) {
                    createNotification("Missing network data", "Network data was not found in the Neo4j database. " +
                        "Run ShotHound to calculate practical paths.");
                }
            })
        }
    }


    const content = (
        <AppBar position="absolute" style={
            (open) ? {
                zIndex: "auto",
                boxShadow: "none",
                marginLeft: drawerWidth,
                width: `calc(100% - ${drawerWidth}px)`,
                transition: "width 125ms cubic-bezier(0.4, 0, 0.6, 1) 0ms"
            } : {
                zIndex: "auto",
                boxShadow: "none",
                transition: "width 125ms cubic-bezier(0.4, 0, 0.6, 1) 0ms"
            }
        }>
            <Toolbar key={1} style={{ paddingRight: 24, minHeight: "64px", background: '#000331', zIndex: 1201 }}>
                {!standalone ? <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    style={
                        (open) ? {
                            display: 'none',
                        } : {
                            marginRight: 36,
                            marginLeft: -19,
                        }
                    }
                >
                    <MenuIcon />
                </IconButton> : <></>}
                <img src={'./top_logo.png'} style={{marginLeft: "auto", marginRight: "auto"}}/>
            </Toolbar>
            <Toolbar key={2} style={{ zIndex: 1001, minHeight: "50px", paddingLeft: "0px", paddingRight: "0px", background: "white" }}>
                {!standalone ? <div style={{ width: open ? "0px" : "57px", zIndex: open ? 999 : 999, transition: "width 125ms cubic-bezier(0.4, 0, 0.6, 1) 0ms", height: "0px", background: "white" }}> </div> : <></>}

                <div style={{
                    width: '100%', zIndex: -112, height: "48px", overflowX: "auto", overflowY: "hidden", background: "rgba(240,240,240)", whiteSpace: "nowrap",
                    boxShadow: "2px 1px 10px 0px rgb(0 0 0 / 12%)",
                    borderBottom: "1px solid lightgrey"
                }}>
                    {pages.map((page, i) =>
                        <NeoPageButton key={"dashboard_header_pagebutton_" + i} index={i} title={page.title} selected={pagenumber == i}
                            disabled={page['disabled'] != undefined ? page['disabled'] : !editable}
                            onSelect={() => selectPage(i, notificationMessage(i))}
                            onRemove={() => removePage(i)}
                            onTitleUpdate={(e) => debouncedSetPageTitle(i, e.target.value)
                            }
                        />)
                    }
                    <NeoPageAddButton onClick={addPage}></NeoPageAddButton>
                </div>
            </Toolbar>
        </AppBar>
    );
    return content;
}

const mapStateToProps = state => ({
    dashboardTitle: getDashboardTitle(state),
    standalone: applicationIsStandalone(state),
    pages: getPages(state),
    editable: getDashboardIsEditable(state),
    pagenumber: getPageNumber(state),
    globalParameters: getGlobalParameters(state)
});

const mapDispatchToProps = dispatch => ({
    setDashboardTitle: (title: any) => {
        dispatch(setDashboardTitle(title));
    },
    selectPage: (number: any, message: any) => {
        dispatch(setPageNumberThunk(number));
    },
    setPageTitle: (number: any, title: any) => {
        dispatch(setPageTitle(number, title));
    },
    addPage: () => {
        dispatch(addPageThunk());
    },
    removePage: (index: any) => {
        dispatch(removePageThunk(index));
    },
    onConnectionModalOpen: () => {
        dispatch(setConnectionModalOpen(true));
    },
    hasNetworkData: (driver, callback) => dispatch(hasNetworkDataThunk(driver, callback)),
    createNotification: (title, message) => dispatch(createNotificationThunk(title, message))
});

//  
export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(NeoDashboardHeader));


