import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Badge from '@material-ui/core/Badge';
import { Button } from '@material-ui/core';
import BugReportIcon from '@material-ui/icons/BugReport';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import {ErrorOutline, PlayCircleOutline, SettingsBackupRestore} from "@material-ui/icons";
import {DialogActions, DialogContentText} from "@mui/material";
import { styled } from '@mui/material/styles';
import { store } from "../index"
import {applicationGetDebugState} from "../application/ApplicationSelectors";
import JSZip from 'jszip';
import FileSaver from 'file-saver';

const version = "1.1.1";

if (window.electron != undefined) {
    window.electron.receive("console-messages", (consoleData) => {
        const state = applicationGetDebugState(store.getState());
        state["version"] = version;
        const debugState = JSON.stringify(state, null, 2);

        const zip = new JSZip();
        zip.file('bluehound-debug-state.json', debugState).file('bluehound-debug.log', consoleData)
        zip.generateAsync({ type: 'blob' }).then(function (content) {
            FileSaver.saveAs(content, 'bluehound-debug.zip');
        });
    });
}

const RestoreYesButton = styled(Button)(({ theme }) => ({
    '.MuiButton-label': {
        color: "red",
        fontWeight: "bold"
    }
}));

export const NeoAboutModal = ({ open, handleClose, getDebugState }) => {
    const app = "BlueHound";
    const email = "support@zeronetworks.com";

    const [restoreDialogOpen, setRestoreDialogOpen] = React.useState(false);

    const downloadDebugFile = () => {
        if (window.electron != undefined) {
            window.electron.getConsoleMessages();
        } else {
            const element = document.createElement("a");
            const state = getDebugState();
            state["version"] = version;
            const file = new Blob([JSON.stringify(state, null, 2)], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = "bluehound-debug-state.json";
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
        }
    }

    const deleteLocalStorage = () => {
        window.localStorage.clear();
        window.location.reload();
    }
    
    const restoreDefaultDialog = <Dialog open={restoreDialogOpen}>
        <DialogTitle>Restore Default Settings</DialogTitle>
        <DialogContent>
            <div style={{display: "flex"}}>
            <ErrorOutline style={{marginRight: 10}}/>
            <DialogContentText>Are you sure you want to restore the default settings?<br/>This will delete all custom queries and settings.</DialogContentText>
            </div>
        </DialogContent>
        <DialogActions>
            <RestoreYesButton onClick={deleteLocalStorage}>Yes</RestoreYesButton>
            <Button onClick={() => setRestoreDialogOpen(false)} autoFocus>Cancel</Button>
        </DialogActions>
    </Dialog>

    return (
        <div>
            {restoreDefaultDialog}
            <Dialog maxWidth={"lg"} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    About {app}
                    <IconButton onClick={handleClose} style={{ padding: "3px", float: "right" }}>
                        <Badge badgeContent={""} >
                            <CloseIcon />
                        </Badge>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <div style={{ color: "rgba(0, 0, 0, 0.84)" }} class="MuiTypography-root MuiDialogContentText-root MuiTypography-body1 MuiTypography-colorTextSecondary">
                        {app} is a dashboard that makes <a target="_blank" href="https://bloodhound.readthedocs.io/en/latest/">BloodHound</a> more accessible to the blue team.<br />
                        You can import, share & write queries, and explore the data in various views.
                        <hr></hr>
                        {/*<h3 style={{ marginBottom: "5px" }}>Core Features</h3>
                        <ul>
                            <li>An editor to write and execute <a target="_blank" href="https://neo4j.com/developer/cypher/">Cypher</a> queries.</li>
                            <li>Use results of your Cypher queries to create tables, bar charts, graph visualizations, and more.</li>
                            <li>Style your reports, group them together in pages, and add interactivity between reports.</li>
                            <li>Save and share your dashboards with your friends.</li>
                        </ul>
                        No connectors or data pre-processing needed, it works directly with Neo4j!
                        <hr></hr>*/}
                        <h3 style={{ marginBottom: "5px" }}>Getting Started</h3>
                        <ol>
                            <li>Connect to your <a target="_blank" href="https://neo4j.com/download-center/#community">Neo4j</a> server</li>
                            <li>
                                Download <a target="_blank" href="https://github.com/BloodHoundAD/BloodHound/blob/master/Collectors/SharpHound.exe">SharpHound</a>,<span>&nbsp;</span>
                                <a target="_blank" href="https://github.com/zeronetworks/BloodHound-Tools/tree/main/ShotHound">ShotHound</a> and the<span>&nbsp;</span>
                                <a target="_blank" href="">Vulnerability Scanner report parser</a>
                            </li>
                            <li>Use the <strong>(<PlayCircleOutline fontSize="small" style={{verticalAlign:"middle"}} /> Data Import)</strong> section to collect & import data into your Neo4j database.</li>
                            <li>Once you have data loaded, you can use the <strong>Configurations</strong> tab to set up the basic information <br/>
                                that is used by the queries (e.g. Domain Admins group, crown jewels servers).</li>
                            <li>Finally, the <strong>(<AutorenewIcon fontSize="small" style={{verticalAlign:"middle"}} /> Queries)</strong> section can be used to prepare the reports.</li>
                        </ol>
                        <hr></hr>
                        <h3 style={{ marginBottom: "5px" }}>Technical Info</h3>
                        {app} is a fork of <a target="_blank" href="https://github.com/nielsdejong/neodash/">NeoDash</a>, built with React and <a target="_blank" href="https://github.com/adam-cowley/use-neo4j">use-neo4j</a>.<br/>
                        It uses <a target="_blank" href="https://github.com/neo4j-labs/charts">charts</a> to power some of the visualizations, and openstreetmap for the map view.<br />
                        You can also extend NeoDash with your own visualizations. Check out the developer guide in the <a target="_blank" href="https://github.com/nielsdejong/neodash/"> project repository</a>.
                        <hr></hr>
                        <h3 style={{ marginBottom: "5px" }}>Shoutouts 📣</h3>
                        <ul>
                            <li><a target="_blank" href="https://www.twitter.com/_wald0">@_wald0</a>
                                , <a target="_blank" href="https://twitter.com/CptJesus">@CptJesus</a>
                                , and <a target="_blank" href="https://twitter.com/harmj0y">@harmj0y</a><span>&nbsp;</span>
                                (the <a target="_blank" href="https://github.com/BloodHoundAD/BloodHound">BloodHound</a> team)</li>
                            <li><a target="_blank" href="https://www.nielsdejong.nl/">Niels de Jong</a><span>&nbsp;</span>
                            (<a target="_blank" href="https://github.com/nielsdejong/neodash">NeoDash</a>)</li>
                            <li><a target="_blank" href="https://twitter.com/SadProcessor">@SadProcessor</a><span>&nbsp;</span>
                            (<a target="_blank" href="https://github.com/SadProcessor/WatchDog">WatchDog</a>)</li>
                            <li>...and all the creators of the packages used throughout the project</li>
                        </ul>
                        <hr></hr>
                        <h3 style={{ marginBottom: "5px" }}>Be in Touch</h3>
                        We are always open to ideas, comments, and suggestions regarding future versions of {app},<br/>
                        so if you have ideas, don’t hesitate to reach out to us at <a href={"mailto:" + email}>{email}</a> or via the Github repository.
                        <br />
                        <hr></hr>
                        <div style={{display: "flex"}}>
                            <Button
                                component="label"
                                onClick={downloadDebugFile}
                                style={{ backgroundColor: "white" }}
                                color="default"
                                variant="contained"
                                size="small"
                                endIcon={<BugReportIcon />}>
                                Debug Report
                            </Button>
                            <Button
                                component="label"
                                onClick={() => setRestoreDialogOpen(true) }
                                style={{ backgroundColor: "white", marginLeft: 24 }}
                                color="default"
                                variant="contained"
                                size="small"
                                endIcon={<SettingsBackupRestore />}>
                                Restore Default
                            </Button>
                            <i style={{fontSize: "11px", marginLeft: "auto", marginRight: 16, marginTop: "auto", marginBottom: "auto"}}>v{version}</i>
                            <a href={"https://zeronetworks.com/"} style={{marginRight: 0, height: 24, marginTop: "auto", marginBottom: "auto"}}>
                                <img src={'./zero-networks-logo.svg'} style={{marginRight: 0, height: 24, marginTop: "auto", marginBottom: "auto"}}/>
                            </a>
                        </div>
                    </div></DialogContent>
            </Dialog>
        </div >
    );
}

export default (NeoAboutModal);

