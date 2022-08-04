import React, {useEffect} from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import {InfoOutlined} from "@material-ui/icons";
import Badge from '@material-ui/core/Badge';
import {
    setSharpHoundClearResults,
    setSharpHoundUploadResults,
    setToolsOutput, setToolsParallel, setToolsParameters, setToolsRunning,
    setVulnerabilityReportLoading, setVulnerabilityReportsData
} from '../application/ApplicationActions';
import {
    applicationGetConnection, applicationHasFilterModalOpen, getSharpHoundClearResults, getSharpHoundUploadResults,
    getToolsOutput, getToolsParallel, getToolsParameters, getToolsRunning,
    getVulnerabilityReportLoading,
    getVulnerabilityReportsData
} from '../application/ApplicationSelectors';
import { createNotification } from "../application/ApplicationActions";
import {connect} from "react-redux";
import {getDashboardJson} from "./ModalSelectors";
import {setDashboard} from "../dashboard/DashboardActions";
import {Autocomplete, Checkbox, FormControlLabel, FormGroup, TextField} from "@mui/material";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import {updateGlobalParameterThunk} from "../settings/SettingsThunks";
import {getGlobalParameters} from "../settings/SettingsSelectors";
import {handleRefreshClick} from "./RefreshModal";
import Tooltip from "@material-ui/core/Tooltip";

const NUMBER_OF_COLUMNS = 3

export const EDGES = [
    [{"title": "Default Edges", "edges": ['MemberOf', 'HasSession', 'AdminTo']}, {"title": "Containers", "edges": ['Contains', 'GpLink']}, {"title": "Special", "edges": ['CanRDP', 'CanPSRemote', 'ExecuteDCOM', 'AllowedToDelegate', 'AddAllowedToAct', 'AllowedToAct', 'SQLAdmin', 'HasSIDHistory']}],
    [{"title": "ACL Edges", "edges": ['AllExtendedRights', 'AddMember', 'ForceChangePassword', 'GenericAll', 'GenericWrite', 'Owns', 'WriteDacl', 'WriteOwner', 'ReadLAPSPassword', 'ReadGMSAPassword', 'AddKeyCredentialLink', 'WriteSPN', 'AddSelf']}],
    [{"title": "Azure Edges", "edges": ['AZAddMembers', 'AZContains', 'AZContributor', 'AZGetCertificates', 'AZGetKeys', 'AZGetSecrets', 'AZGlobalAdmin', 'AZOwns', 'AZPrivilegedRoleAdmin', 'AZResetPassword', 'AZUserAccessAdministrator', 'AZAppAdmin', 'AZCloudAppAdmin', 'AZRunsAs', 'AZKeyVaultContributor']}]
]

const EdgeFilterDialogTitle = styled(DialogTitle)(({ theme }) => ({
    '&.MuiDialogTitle-root&': {
        padding: "8px 24px",
    }
}));

export const filterTitleToEdgeName = (title) => {
    return ":" + title.replace(" ", "").toUpperCase();
}

export const EDGES_CATEGORIES = [];

if (EDGES_CATEGORIES.length == 0) {
    for (let edgeCategoryData of EDGES) {
        for (let edgeData of edgeCategoryData) {
            EDGES_CATEGORIES.push(filterTitleToEdgeName(edgeData.title))
        }
    }
}

let beforeChanges = null;

export const NeoFilterModal = ({ open, handleClose, setGlobalParameter, globalParameters }) => {

    const [initialized, setInitialized] = React.useState(false);

    const initializeEdgeFiltering = () => {
        if (initialized) return;
        if (globalParameters != undefined && globalParameters["edgeFilters"] != undefined) return;

        const edgeFilters: string[] = [];
        for (let edgesInColumn of EDGES) {
            for (let edgesGroup of edgesInColumn) {
                for (let edge of edgesGroup.edges) {
                        edgeFilters.push(edge);
                }
            }
        }

        setInitialized(true);
        setGlobalParameter("edgeFilters", edgeFilters);
        setGlobalParameter("edgeFiltersAllCount", edgeFilters.length);
    }
    initializeEdgeFiltering();

    useEffect( () => {
        if (open) {
            beforeChanges = Object.assign([], globalParameters["edgeFilters"]);
        }
    }, [open])

    const closeModal = () => {
        if (globalParameters["edgeFilters"].length != beforeChanges.length) {
            handleRefreshClick();
        }
        handleClose();
    };

    const handleCheck = (event, edge, edgeFilter) => {
        const edgeFilters = globalParameters["edgeFilters"];
        const edgeGroups = globalParameters[edgeFilter]
        if (event.target.checked) {
            edgeFilters.push(edge);
            edgeGroups.push(edge);
        } else {
            const index = edgeFilters.indexOf(edge, 0);
            if (index > -1) { edgeFilters.splice(index, 1); }
            const groupIndex = edgeGroups.indexOf(edge, 0);
            if (groupIndex > -1) { edgeGroups.splice(groupIndex, 1); }
        }
        setGlobalParameter("edgeFilters", edgeFilters)
        setGlobalParameter(edgeFilter, edgeGroups)
    };

    const isChecked = (edge) => {
        if (globalParameters == undefined || globalParameters["edgeFilters"] == undefined) return true;
        const edgeFilters = globalParameters["edgeFilters"];
        return edgeFilters.includes(edge);
    }

    const edgeGrids = () => {
        return EDGES.map( (edgesInColumn, edgesIndex) =>
            <Grid item xs={12 / NUMBER_OF_COLUMNS} key={"filter_grid_" + edgesIndex}>
                {edgesInColumn.map( (edgeGroup, index) =>
                    <div key={"filter_div_" + edgesIndex + "_" + index}>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <h4 style={{marginTop: 0, marginBottom: 0, color: "darkblue", marginRight: 4}}>{edgeGroup.title}</h4>
                            <Tooltip title={"Use " + filterTitleToEdgeName(edgeGroup.title) + " in queries to use this filter"}>
                                <InfoOutlined fontSize={"inherit"} color={"action"}/>
                            </Tooltip>
                        </div>
                        <FormGroup>
                        {edgeGroup.edges.map( (edge) => <FormControlLabel checked={isChecked(edge)}
                                                                          control={<Checkbox size="small" onChange={(event) => handleCheck(event, edge, filterTitleToEdgeName(edgeGroup.title))} />}
                                                                          label={edge}
                                                                          key={"filter_formcontrollabel_" + edgesIndex + "_" + index}
                        />)}
                        </FormGroup>
                        <br />
                    </div>
                )}
            </Grid>
        );
    }

    const updateCustomEdgeFilters = (newValue) => {
        setGlobalParameter("customEdgeFilters", newValue)
    }

    return (
        <div>
            <Dialog maxWidth={"lg"} open={open} onClose={closeModal} aria-labelledby="form-dialog-title">
                <EdgeFilterDialogTitle id="form-dialog-title">
                    <div style={{display: "flex", alignItems: "center"}}>
                        Edge Filtering
                        <Tooltip title={"Use :FILTERED_EDGES in queries to use all checked edges"}>
                            <InfoOutlined color={"action"} style={{marginLeft: 4, fontSize: 18}}/>
                        </Tooltip>
                    </div>

                    <IconButton onClick={closeModal} style={{ padding: "3px", float: "right" }}>
                        <Badge badgeContent={""} >
                            <CloseIcon />
                        </Badge>
                    </IconButton>
                </EdgeFilterDialogTitle>
                <DialogContent style={{width: 780, minHeight: 600}} // setting minimum width for the dialog
                >
                    <div style={{ color: "rgba(0, 0, 0, 0.84)" }} class="MuiTypography-root MuiDialogContentText-root MuiTypography-body1 MuiTypography-colorTextSecondary">
                        <div style={{display: "flex"}}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Grid container spacing={2}>
                                    {edgeGrids()}
                                </Grid>
                            </Box>
                        </div>
                        <div style={{display: "flex", alignItems: "center"}}>
                            <h4 style={{marginTop: 0, marginBottom: 0, color: "darkblue", marginRight: 4}}>Custom Edges</h4>
                            <Tooltip title={"Use :CUSTOMEDGES in queries to use this filter"}>
                                <InfoOutlined fontSize={"inherit"} color={"action"}/>
                            </Tooltip>
                        </div>
                        <Autocomplete
                            multiple
                            freeSolo
                            clearOnBlur
                            size="small"
                            style={{marginTop: 10, marginBottom: 14}}
                            value={globalParameters != undefined && globalParameters["customEdgeFilters"] != undefined ? globalParameters["customEdgeFilters"] : []}
                            onChange={(event, newValue) => { updateCustomEdgeFilters(newValue) }}
                            options={[]}
                            //getOptionLabel={(option) => option.title}
                            //defaultValue={[top100Films[13]]}
                            filterSelectedOptions
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Additional relationship types"
                                />
                            )}
                        />
                    </div></DialogContent>
            </Dialog>
        </div >
    );
}

const mapStateToProps = state => ({
    globalParameters: getGlobalParameters(state),
    dashboard: getDashboardJson(state),
    connection: applicationGetConnection(state),
    vulnerabilityReportsData: getVulnerabilityReportsData(state),
    vulnerabilityReportLoading: getVulnerabilityReportLoading(state),
    toolsParameters: getToolsParameters(state),
    toolsRunning: getToolsRunning(state),
    toolsOutput: getToolsOutput(state),
    toolsParallel: getToolsParallel(state),
    sharphoundUploadResults: getSharpHoundUploadResults(state),
    sharphoundClearResults: getSharpHoundClearResults(state)
});

const mapDispatchToProps = dispatch => ({
    setGlobalParameter: (key, value) => { dispatch(updateGlobalParameterThunk(key, value)); } ,
    setDashboard: (dashboard) => { dispatch(setDashboard(dashboard)); },
    createNotification: (title, message) => { dispatch(createNotification(title, message)); },
    setVulnerabilityReportsData: (data) => { dispatch(setVulnerabilityReportsData(data)) },
    setVulnerabilityReportLoading: (status) => { dispatch(setVulnerabilityReportLoading(status)); },
    setToolsParameters: (data) => { dispatch(setToolsParameters(data)); },
    setToolsRunning: (data) => { dispatch(setToolsRunning(data)); },
    setToolsOutput: (data) => { dispatch(setToolsOutput(data)); },
    setToolsParallel: (toolsParallel) => { dispatch(setToolsParallel(toolsParallel)); },
    setSharpHoundUploadResults: (uploadResults) => { dispatch(setSharpHoundUploadResults(uploadResults)); },
    setSharpHoundClearResults: (clearResults) => { dispatch(setSharpHoundClearResults(clearResults)); },
});

export default connect(mapStateToProps, mapDispatchToProps)(NeoFilterModal);