import React, {useCallback, useEffect} from 'react';
import Dialog from '@material-ui/core/Dialog';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import LanguageIcon from '@material-ui/icons/Language'
import Badge from '@material-ui/core/Badge';
import TextField from '@material-ui/core/TextField'
import {
    setSharpHoundClearResults,
    setSharpHoundUploadResults,
    setToolsOutput, setToolsParallel, setToolsParameters, setToolsRunning,
    setVulnerabilityReportLoading, setVulnerabilityReportsData
} from '../application/ApplicationActions';
import {
    applicationGetConnection, getSharpHoundClearResults, getSharpHoundUploadResults,
    getToolsOutput, getToolsParallel, getToolsParameters, getToolsRunning,
    getVulnerabilityReportLoading,
    getVulnerabilityReportsData
} from '../application/ApplicationSelectors';
import { createNotification } from "../application/ApplicationActions";
import {connect} from "react-redux";
import { store } from "../index"
import {
    Accordion, AccordionDetails,
    AccordionSummary, DialogActions, DialogContentText, Fab, Typography
} from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import {getDashboardJson} from "./ModalSelectors";
import {setDashboard} from "../dashboard/DashboardActions";
import PlayArrow from "@material-ui/icons/PlayArrow";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import SaveIcon from "@material-ui/icons/Save";
import {Cancel, Stop} from "@material-ui/icons";
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core"
import { cloneDeep } from 'lodash';
import { makeStyles } from "@material-ui/core/styles";
import {Autocomplete, Checkbox, FormControlLabel, FormGroup, Input, Stack, Switch} from "@mui/material";
import { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AlarmIcon from '@mui/icons-material/Alarm';
import { alpha, styled } from '@mui/material/styles';
import { green } from '@mui/material/colors';
import {handleRefreshClick} from "./RefreshModal";
import {ee} from "../report/Report";
import debounce from 'lodash/debounce';
export const RUN_COLLECTION_EVENT = 'runCollection'
import {Mutex} from 'async-mutex';

const mutex = new Mutex();

export enum ToolType {
    Binary,
    Python,
    Uploader,
    SharpHound
}

export const IMPORT_TOOLS_INITIAL_STATE = [
    {"name": "SharpHound", "toolType": ToolType.SharpHound, "path": "", "args": [], "url": "https://github.com/BloodHoundAD/BloodHound/blob/master/Collectors/SharpHound.exe", "editable": true, enabled: true},
    {"name": "ShotHound", "toolType": ToolType.Python, "path": "", "args": [], "url": "https://github.com/zeronetworks/BloodHound-Tools/tree/main/ShotHound", "editable": true, enabled: true},
    {"name": "Vulnerability Scanners Results Upload", "toolType": ToolType.Python, "path": "", "args": [], "url": "https://github.com/zeronetworks/BloodHound-Tools/tree/main/VulnerabilitiesDataImport", "editable": true, enabled: true},
    {"name": "Cartography - AWS", "toolType": ToolType.Python, "path": "", "args": [], "url": "https://github.com/lyft/cartography", "editable": true, enabled: true},
    {"name": "Cartography - GCP", "toolType": ToolType.Python, "path": "", "args": [], "url": "https://github.com/lyft/cartography", "editable": true, enabled: true}
]

const neo4jConnectionParameters = ["url", "port", "username", "password"]

let toolsOutputsRefs = [];

function allToolsFinished(toolsRunning) {
    for (const key in toolsRunning) {
        if (toolsRunning[key] == true) { return false }
    }
    return true;
}

function setToolNotRunning(toolId) {
    const state = store.getState();
    let newData = cloneDeep(getToolsRunning(state));
    newData[toolId] = false;
    store.dispatch(setToolsRunning(newData));

    if (allToolsFinished(newData) && window.electron != undefined) {
        console.log('tools finished running')
        window.electron.toolsFinishedRunning();
    }
}

const toolIdToToolType = ((toolId) => {
    const toolParams = getToolsParameters(store.getState());
    return toolParams[toolId].toolType;
});

if (window.electron != undefined) {
    window.electron.receive("selected-file", (toolId, path) => {
        let newParameters = cloneDeep(getToolsParameters(store.getState()));
        newParameters[toolId]["path"] = path;
        store.dispatch(setToolsParameters(newParameters));
    })

    window.electron.receive("tool-data", (toolId, data) => {
        let toolsOutput = cloneDeep(getToolsOutput(store.getState()));
        if (toolsOutput[toolId]) {
            toolsOutput[toolId] = toolsOutput[toolId] + data;
        } else {
            toolsOutput[toolId] = data;
        }
        store.dispatch(setToolsOutput(toolsOutput));
    })

    window.electron.receive("tool-data-error", (toolId, data) => {

        let toolsOutput = cloneDeep(getToolsOutput(store.getState()));
        if (toolsOutput[toolId]) {
            toolsOutput[toolId] = toolsOutput[toolId] + data;
        } else {
            toolsOutput[toolId] = data;
        }
        store.dispatch(setToolsOutput(toolsOutput));
    })

    window.electron.receive("tool-data-done", (toolId, data, toolDirectory) => {
        const state = store.getState();

        if (toolIdToToolType(toolId) == ToolType.SharpHound
            && getToolsParameters(state)[toolId]["name"] == IMPORT_TOOLS_INITIAL_STATE[0]["name"]
            && getSharpHoundUploadResults(state)
            && data == 0 // exit code == success
        ) {
            uploadSharpHoundResults(toolDirectory);
        } else {
            setToolNotRunning(toolId);
        }
    })

    window.electron.receive("sharphound-upload-done", (toolId, data) => {
        handleRefreshClick();
        //store.dispatch(createNotification("File", data));
        setToolNotRunning(toolId);
    })

    window.electron.receive("tool-killed", (toolId) => {
        setToolNotRunning(toolId);
    });

    window.electron.receive('run-all-collection', (unused) => {
        ee.emit(RUN_COLLECTION_EVENT);
    });

    window.electron.receive('tool-notification', (message) => {
        store.dispatch(createNotification("BlueHound", message));
    });
}

const sharphoundOutputDirectory = (sharphoundDirectory) => {
    const outputDirectoryArgument = "--outputdirectory";
    const state = store.getState();
    const sharphoundParameters = getToolsParameters(state)[0];
    const sharphoundArgs = sharphoundParameters["args"];

    const outputDirectory = sharphoundArgs.find(element => element.startsWith(outputDirectoryArgument));

    if (outputDirectory) {
        return outputDirectory.substring(outputDirectoryArgument.length + 1);
    } else {
        return sharphoundDirectory
    }
};

function uploadSharpHoundResults(toolDirectory, toolId = 0) {
    const state = store.getState();
    const connectionProperties = applicationGetConnection(state);
    const outputDirectory = sharphoundOutputDirectory(toolDirectory);
    const clearResults = getSharpHoundClearResults(state);
    window.electron.uploadSharpHoundResults(toolId, outputDirectory, connectionProperties, clearResults)
}

export const useOutlinedInputStyles = makeStyles({
    root: {
        "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "darkgray",
            borderWidth: 1
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "darkgray",
            borderWidth: 1
        },
        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "darkgray",
            borderWidth: 1
        },
        "& .MuiOutlinedInput-multiline": {
            padding: 6
        }
    }
});

export const SerialParallelSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase': {
        '&.Mui-checked': {
            '& + .MuiSwitch-track': {
                backgroundColor: '#aab4be',
            },
        },
    },
    '.Mui-disabled': {
        '.MuiSwitch-thumb': {
            backgroundColor: 'grey',
        }
    },
    '.MuiSwitch-thumb': {
        backgroundColor: "#1565C0",
    },
    '& .MuiSwitch-track': {
        backgroundColor: '#aab4be',
    },
}));

const OnOffSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: green[600],
        '&:hover': {
            backgroundColor: alpha(green[600], theme.palette.action.hoverOpacity),
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: green[600],
    },
}));

const ArgsAutocomplete = styled(Autocomplete)(({ theme }) => ({
    '.MuiOutlinedInput-root': {
        padding: 4
    }
}));


export const NeoCollectionModal = ({ open, handleClose, dashboard, setDashboard, createNotification,
                                     toolsParameters, setToolsParameters, toolsRunning, setToolsRunning,
                                     toolsOutput, setToolsOutput, toolsParallel, setToolsParallel,
                                     sharphoundUploadResults, setSharpHoundUploadResults, sharphoundClearResults, setSharpHoundClearResults,
                                     connection}) => {

    const fileBrowserTextLimit = 77;
    const [editable, setEditable] = React.useState(-1);
    const [expanded, setExpanded] = React.useState(false);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [dialogToolId, setDialogToolId] = React.useState(null);
    const [checked, setChecked] = React.useState<boolean>(sharphoundUploadResults != undefined ? sharphoundUploadResults : true);
    const [clearChecked, setClearChecked] = React.useState<boolean>(sharphoundClearResults != undefined ? sharphoundClearResults : true);
    const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false);
    const [scheduleFrequency, setScheduleFrequency] = React.useState('WEEKLY');
    const [dayOfWeek, setDayOfWeek] = React.useState('MON');
    const [dayOfMonth, setDayOfMonth] = React.useState(1);
    const [timeValue, setTimeValue] = React.useState<Dayjs | null>('2022-01-01 00:00');

    const daysInMonth = Array.from(Array(31).keys()).map(x => x + 1);

    const handleFrequencyChange = (event) => {
        setScheduleFrequency(event.target.value as string);
    };

    const handleDayOfWeekChange = (event) => {
        setDayOfWeek(event.target.value as string);
    };

    const handleDayOfMonthChange = (event) => {
        setDayOfMonth(event.target.value as string);
    };

    const padTime = (num) => {
        return String(num).padStart(2, '0');
    }

    const createScheduleTask = () => {
        if (window.electron != undefined) { // running in Electron
            let scheduleTime = "00:00";
            if (typeof timeValue != 'string') {
                scheduleTime = padTime(timeValue.hour()) + ":" + padTime(timeValue.minute());
            }
            window.electron.addScheduledTask(scheduleFrequency, dayOfWeek, dayOfMonth, scheduleTime);
        } else {
            alert("Available only in Electron")
        }
    }

    if (toolsOutputsRefs.length == 0) {
        Object.keys(toolsParameters).map((element, index) => {
            toolsOutputsRefs.push(React.createRef())
        });
    }

    const closeModal = () => {
        setEditable(-1);
        handleClose();
    };

    const handleExpand = (panel) => (event, isExpanded) => {
        if (panel != editable) {
            handleCancelClick(panel);
            setExpanded(isExpanded ? panel : false);
            if(!isExpanded) { setEditable(-1); }
        }
    };

    const handleDialogOpen = (toolId) => {
        setDialogToolId(toolId);
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    const handleSerialParallelChange = (event) => {
        setToolsParallel(event.target.checked);
    }

    const handleOnOffChange = (index) => (event) => {
        handleCancelClick(index);
        let updatedDashboard = cloneDeep(dashboard);
        updatedDashboard['importTools'][index].enabled = event.target.checked;
        setDashboard(updatedDashboard);
        setToolsParameters(updatedDashboard['importTools']);
    }

    useEffect(() => {
        Object.keys(toolsOutput).forEach(key => {
            if (toolsOutputsRefs[key].current) {
                toolsOutputsRefs[key].current.children[0].children[0].scrollTop = toolsOutputsRefs[key].current.children[0].children[0].scrollHeight
            }
        })
    }, [toolsOutput])

    const insertNeo4jArgs = (args) => {
        if (!args) return [];

        const updatedArgs = [];
        for (let arg of args) {
            for (let parameter of neo4jConnectionParameters) {
                arg = arg.replace("$" + parameter, connection[parameter])
            }
            updatedArgs.push(arg);
        }
        return updatedArgs
    }

    function handleRunClick(toolId) {
        if (window.electron != undefined) { // running in Electron
            const toolType = toolsParameters[toolId]["toolType"]
            const path = toolsParameters[toolId]["path"]
            const args = insertNeo4jArgs(toolsParameters[toolId]["args"]);

            if (!path) {
                createNotification("Error", "Path is missing")
            } else {
                let updatedToolsOutput = Object.assign({}, toolsOutput);
                updatedToolsOutput[toolId] = "";
                setToolsOutput(updatedToolsOutput);

                let updatedLoadingObject = Object.assign({}, toolsRunning);
                updatedLoadingObject[toolId] = true;
                setToolsRunning(updatedLoadingObject);

                if (toolType == ToolType.Python) {
                    window.electron.runPython(toolId, path, args);
                } else if (toolType == ToolType.Uploader) {
                    uploadSharpHoundResults(path, toolId);
                } else {
                    window.electron.runTool(toolId, path, args);
                }

            }
        } else {
            alert("Available only in Electron")
        }
    }

    function handleRunAllClick() {
        if (window.electron != undefined) { // running in Electron
            mutex.runExclusive(() => {
                if (isAnyReportRunning()) return;

                const enabledTools = [];
                toolsParameters.map((tool, index) => {
                    if (tool.enabled) {
                        tool.toolId = index;
                        enabledTools.push(tool);
                    }
                })

                const toolWithMissingPath = enabledTools.find(tool => !tool["path"])
                if (toolWithMissingPath) {
                    createNotification("Error", "Path is missing for " + toolWithMissingPath["name"]);
                    return
                }

                setToolsOutput({});

                if (!toolsParallel) {
                    window.electron.runToolsInSerial(enabledTools);
                }

                let updatedLoadingObject = {}
                for (let i = 0; i < toolsParameters.length; i++) {
                    if (!toolsParameters[i].enabled) continue;

                    updatedLoadingObject[i] = true;
                    if (toolsParallel) {
                        if (toolsParameters[i]["toolType"] == ToolType.Python) {
                            window.electron.runPython(i, toolsParameters[i]["path"], insertNeo4jArgs(toolsParameters[i]["args"]));
                        } else {
                            window.electron.runTool(i, toolsParameters[i]["path"], insertNeo4jArgs(toolsParameters[i]["args"]));
                        }
                    }
                }
                setToolsRunning(updatedLoadingObject);
                setExpanded(enabledTools[0].toolId);
            });
        } else {
            alert("Available only in Electron")
        }
    }

    function handleStopClick(toolId) {
        if (window.electron != undefined) { // running in Electron
            window.electron.killProcess(toolId);
        } else {
            alert("Available only in Electron")
        }
    }

    function handleEditClick(toolId) {
        if (toolId != editable) {
            handleCancelClick(toolId);
            setEditable(toolId);
            setExpanded(toolId);
        }
    }

    function getToolNameById(toolId) {
        if (toolsParameters[toolId]) {
            return toolsParameters[toolId]["name"]
        }
    }

    function handleDeleteClick() {
        let updatedDashboard = Object.assign({}, dashboard);
        updatedDashboard["importTools"].splice(dialogToolId, 1);
        let updatedToolsOutput = cloneDeep(toolsOutput);
        delete updatedToolsOutput[dialogToolId];

        if (toolsOutputsRefs.length > updatedDashboard["importTools"].length) {
            toolsOutputsRefs.splice(dialogToolId, 1);
        }

        setDashboard(updatedDashboard);
        setToolsOutput(updatedToolsOutput);
        setDialogOpen(false);
        setToolsParameters(cloneDeep(updatedDashboard["importTools"]));
    }

    function handleAddClick() {
        // we first save the current state in case Add was clicked multiple times
        handleSaveClick();

        const updatedToolsParameters = cloneDeep(toolsParameters);
        const newLength = updatedToolsParameters.push({"name": "Data Collection Tool", "toolType": ToolType.Binary, "path": "", "args": "", enabled: true});

        if (toolsOutputsRefs.length < newLength) {
            toolsOutputsRefs.push(React.createRef())
        }

        setToolsParameters(updatedToolsParameters)
        setEditable(newLength - 1);
        setExpanded(newLength - 1);
    }

    function handleCancelClick(toolId) {
        const savedParameters = cloneDeep(dashboard["importTools"]);

        if (toolsOutputsRefs.length > savedParameters.length) {
            toolsOutputsRefs.splice(toolId, 1)
        }

        setChecked(sharphoundUploadResults);
        setClearChecked(sharphoundClearResults);
        setToolsParameters(savedParameters);
        setEditable(-1);
    }

    function handleSaveClick() {
        let updatedDashboard = cloneDeep(dashboard);
        updatedDashboard["importTools"] = toolsParameters;
        setDashboard(updatedDashboard);

        setSharpHoundUploadResults(checked);
        setSharpHoundClearResults(clearChecked);
        setEditable(-1);
    }

    function updateToolParam(type, index, event) {
        let updatedToolsParameters = cloneDeep(toolsParameters);
        updatedToolsParameters[index][type] = event.target.value;
        setToolsParameters(updatedToolsParameters);
    }

    function updateArgument(index, newValue) {
        let updatedToolsParameters = cloneDeep(toolsParameters);
        updatedToolsParameters[index]["args"] = newValue;
        setToolsParameters(updatedToolsParameters);
    }

    function isAnyReportRunning() {
        for (const key in toolsRunning) {
            if (toolsRunning[key] == true) { return true }
        }
        return false;
    }

    function fileBrowseButtonClick(index, browse_folder= false) {
        if (window.electron != undefined) { // running in Electron
            if (browse_folder) {
                window.electron.browseFolder(index);
            } else {
                window.electron.browseFile(index);
            }
        } else {
            alert("Available only in Electron")
        }
    }

    function trimPathLength(path) {
        if (!path) {
            return ""
        }
        else if (path.length > fileBrowserTextLimit) {
            return "..." + path.substring(path.length - fileBrowserTextLimit + 3, path.length)
        } else {
            return path
        }
    }

    const handleUploadResultsCheck = (event) => {
        setChecked(event.target.checked);
    };

    const handleClearResultsCheck = (event) => {
        setClearChecked(event.target.checked);
    };

    const outlinedInputStyles = useOutlinedInputStyles();

    function generateList() {
        return Object.keys(toolsParameters).map((element, index) =>
            <div style={{display: "flex"}} key={"collection_div_" + index}>
                <Accordion expanded={expanded === index} onChange={handleExpand(index)} style={{width: "80%"}}>
                    <AccordionSummary style={{backgroundColor: "inherit"}}
                        expandIcon={<ExpandMoreIcon />}>
                        {((editable != index) || (toolsParameters[element]["editable"] == false)) ? <Typography>{toolsParameters[element]["name"]}</Typography> :
                            <TextField value={toolsParameters[element]["name"]} style={{width: "50%"}}
                                       onChange={(event) => { updateToolParam("name", index, event) }}></TextField>}
                    </AccordionSummary>
                    <AccordionDetails>
                        <FormControl size={"small"}>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={toolsParameters[element]["toolType"]}
                                label={"Type"}
                                onChange={(event) => { updateToolParam("toolType", index, event) }}
                                disabled={toolsParameters[element]["editable"] == false || editable != index}>
                                <MenuItem value={ToolType.Binary}>Binary</MenuItem>
                                <MenuItem value={ToolType.Python}>Python</MenuItem>
                                <MenuItem value={ToolType.Uploader}>BloodHound Upload</MenuItem>
                                <MenuItem value={ToolType.SharpHound}>SharpHound</MenuItem>
                            </Select>
                        </FormControl>
                        {
                            toolsParameters[element]["toolType"] == ToolType.SharpHound ?
                                <div>
                                <FormControlLabel control={<Checkbox checked={checked != undefined ? checked : true}
                                                                     onChange={handleUploadResultsCheck} size="small" />}
                                                  label="Upload results"
                                                  disabled={editable != index} style={{marginLeft: 38, marginTop: 10 }}/>
                                <FormControlLabel control={<Checkbox checked={checked ? (clearChecked != undefined ? clearChecked : true) : false}
                                                                     onChange={handleClearResultsCheck} size="small" />}
                                                  label="Clear previous data"
                                                  disabled={checked ? (editable != index) : true} style={{marginLeft: 20, marginTop: 10 }}/>
                                </div>
                                : toolsParameters[element]["toolType"] == ToolType.Uploader ?
                                <FormControlLabel
                                    control={<Checkbox checked={checked ? (clearChecked != undefined ? clearChecked : true) : false}
                                                       onChange={handleClearResultsCheck} size="small" />}
                                    label="Clear previous data"
                                    disabled={checked ? (editable != index) : true} style={{marginLeft: 20, marginTop: 10 }}/> : <></>
                        }
                    </AccordionDetails>
                    <AccordionDetails style={{display: "flex"}}>
                        <TextField id="outlined-basic"
                                   label={toolsParameters[element]["toolType"] == ToolType.Binary || toolsParameters[element]["toolType"] == ToolType.SharpHound ? "Tool path"
                                       : (toolsParameters[element]["toolType"] == ToolType.Uploader ? "Results path" : "Script path")}
                                   value={trimPathLength(toolsParameters[element]["path"])} disabled variant="outlined" size="small" style={{width: "80%", paddingBottom: 10}}
                                   onChange={(event) => { updateToolParam("path", index, event) }}/>
                        <Button variant="outlined" onClick={() => toolsParameters[element]["toolType"] == ToolType.Uploader ? fileBrowseButtonClick(index, true) : fileBrowseButtonClick(index)} disabled={editable != index} style={{height: 40, marginLeft: 14}}>Browse</Button><br/><br/>
                    </AccordionDetails>
                    { toolsParameters[element]["toolType"] != ToolType.Uploader ?
                        <AccordionDetails>
                        <ArgsAutocomplete multiple freeSolo filterSelectedOptions size="small" clearOnBlur options={[]}
                                          value={toolsParameters[element]["args"]}
                                          onChange={(event, newValue) => {
                                              updateArgument(index, newValue)
                                          }}
                                          disabled={editable != index}
                                          style={{width: "94%", paddingBottom: 14 }}
                                          renderInput={(params) => (
                                              <TextField
                                                  {...params}
                                                  label="Arguments"
                                                  variant="outlined"
                                                  helperText={"Each entry should include a parameter with its value (e.g '-o output.txt'), or a positional argument / flag (e.g '-d')\n" +
                                                      "You can use these keywords to pass Neo4j connection parameters to the tool: $" + neo4jConnectionParameters.join('/$') }
                                              />
                                          )}>
                        </ArgsAutocomplete>
                    </AccordionDetails>  : <></>}
                    { toolsParameters[element]["toolType"] != ToolType.Uploader ?
                        <AccordionDetails style={{display: "inline"}}>
                        <TextField id="outlined-basic" label="URL" value={toolsParameters[element]["url"]}
                                   disabled={toolsParameters[element]["editable"] == false || editable != index}
                                   variant="outlined" size="small" style={{width: "90%", paddingBottom: 20 }}
                                   onChange={(event) => { updateToolParam("url", index, event) }}/>
                    </AccordionDetails> : <></>}
                    <AccordionDetails>
                        {editable != index ?
                    <div><LoadingButton
                        onClick={() => handleRunClick(index)}
                        loading={toolsRunning[index]}
                        loadingPosition="end"
                        endIcon={<PlayArrow />}
                        variant="contained"
                        style={{width: 114}}>
                        Run
                    </LoadingButton>
                        { toolsRunning[index] ? <Button startIcon={<Stop />} variant="outlined" color="error" style={{width: 114, marginLeft: 30}}
                        onClick={() => handleStopClick(index)}>Stop</Button> : <></> }
                    </div>
                            : <div>
                            <Button variant="contained" color="success" endIcon={<SaveIcon />} onClick={handleSaveClick} style={{width: 114}}>Save</Button>
                            <Button variant="outlined" endIcon={<Cancel />} style={{marginLeft: 16}} onClick={() => handleCancelClick(index)}>Cancel</Button>
                            </div>
                        }
                        <br /><br />
                    </AccordionDetails>
                    <AccordionDetails>
                        <div style={{display: "flow", width: "100%", marginTop: -16}}>
                            {toolsOutput[index] ? <div><Typography variant={"body2"}>Output:</Typography><br></br></div>: <></>}
                        <TextField
                            variant="outlined"
                            multiline
                            inputProps={{ readOnly: true, style: {fontSize: 14} }}
                            rows={6}
                            style={toolsOutput[index] ? {width: "100%", marginTop: -18} : {display: "none"}}
                            classes={outlinedInputStyles}
                            value={toolsOutput[index]}
                            ref={toolsOutputsRefs[index]}
                        /></div>
                    </AccordionDetails>
                </Accordion>
                <div style={{paddingLeft: 10, display: "flex"}}>
                    <FormGroup>
                        <Stack direction="row" spacing={1} alignItems="center" style={{marginRight: 4, marginLeft: 4, marginTop: 10}}>
                            <OnOffSwitch size={"small"} color="success" checked={toolsParameters[element].enabled}
                                         onChange={handleOnOffChange(index)}/>
                        </Stack>
                    </FormGroup>
                    <Tooltip title="Edit Import Settings." aria-label="">
                        <IconButton style={{height: 45}} disabled={toolsRunning[index]}
                                    sx={{ "&:hover": { color: "blue" } }}
                                    onClick={() => handleEditClick(index)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Import Settings." aria-label="">
                        <span>
                        {(toolsParameters[element]["editable"] == false || isAnyReportRunning()) ?
                            <IconButton disabled style={{height: 45}} ><DeleteIcon color="disabled" /></IconButton> :
                            <IconButton style={{height: 45}} sx={{"&:hover": {color: "blue"}}}>
                                <DeleteIcon  onClick={() => handleDialogOpen(index) }/>
                            </IconButton>}
                        </span>
                    </Tooltip>
                    <Tooltip title="Get tool." aria-label="" style={{marginRight: -20}}>
                        <span>
                        {toolsParameters[element]["url"] ?
                            <a href={toolsParameters[element]["url"]} target="_blank">
                                <IconButton style={{height: 45}} sx={{"&:hover": {color: "blue"}}}><LanguageIcon/></IconButton>
                            </a>
                        : <IconButton disabled style={{height: 45, marginRight: -20}} sx={{"&:hover": {color: "blue"}}}><LanguageIcon/></IconButton>}
                        </span>
                    </Tooltip>
                </div>
            </div>
        );
    }

    const debouncedHandleRunAllClick = useCallback(
        debounce(handleRunAllClick, 500),
        [],
    );

    ee.addListener(RUN_COLLECTION_EVENT, debouncedHandleRunAllClick);

    return (
        <div>
            <Dialog maxWidth={"lg"} open={open} onClose={closeModal} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    Data Import Tools
                    <IconButton onClick={closeModal} style={{ padding: "3px", float: "right" }}>
                        <Badge badgeContent={""} >
                            <CloseIcon />
                        </Badge>
                    </IconButton>
                </DialogTitle>
                <DialogContent style={{width: 1000, minHeight: 600}} // setting minimum width for the dialog
                >
                    <div style={{ color: "rgba(0, 0, 0, 0.84)" }} class="MuiTypography-root MuiDialogContentText-root MuiTypography-body1 MuiTypography-colorTextSecondary">
                        Increase visibility, accuracy and coverage by importing additional data sources in to Neo4j.<br />
                        These can include network data, vulnerabilities information, authentication events and other collectors.

                        <hr></hr>
                        <div style={{display: "flex"}}>
                        <h3 style={{ marginBottom: "-12px" }}>Tools</h3>
                            <Tooltip title="Run tools in serial or parallel." aria-label="">
                        <FormGroup  style={{marginLeft: "auto", marginRight: 26, marginTop: 24}}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" style={isAnyReportRunning() ? {color: "grey"} : {color: "default"}}>Serial</Typography>
                                <SerialParallelSwitch size="small" checked={toolsParallel != undefined ? toolsParallel : false } onChange={handleSerialParallelChange} disabled={isAnyReportRunning()}/>
                                <Typography  variant="body2" style={isAnyReportRunning() ? {color: "grey"} : {color: "default"}}>Parallel</Typography>
                            </Stack>
                        </FormGroup>
                            </Tooltip>
                        <Button variant="outlined" endIcon={<AlarmIcon />}
                                onClick={() => setScheduleDialogOpen(true)}
                                style={{marginBottom: "-12px", marginRight: 10, height: 34, marginTop: 18, borderRadius: 10}}>
                            Schedule
                        </Button>
                        <LoadingButton
                            onClick={handleRunAllClick}
                            //loading={importToolLoading[index]}
                            loadingPosition="end"
                            endIcon={<PlayArrow />}
                            variant="contained"
                            disabled={isAnyReportRunning()}
                            style={{marginBottom: "-12px", marginRight: -4, height: 34, marginTop: 18, borderRadius: 10}}
                            >
                            Run All
                        </LoadingButton></div>
                        <br />
                        {generateList()}
                        <div style={{display: "flex"}}>
                        <Fab size="small" onClick={handleAddClick} aria-label="add" style={{marginTop: 20, marginBottom: 14, marginLeft: "auto", right: 3, color: "#FFFFFF", backgroundColor: "#1565C0"}}>
                            <AddIcon />
                        </Fab></div>

                        <Dialog
                            open={dialogOpen}
                            onClose={handleDialogClose}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">
                                {"Delete import tool"}
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    Are you sure you want to delete {getToolNameById(dialogToolId)}?
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button color="error" onClick={handleDeleteClick}>Confirm</Button>
                                <Button onClick={handleDialogClose} autoFocus>Cancel</Button>
                            </DialogActions>
                        </Dialog>
                    </div></DialogContent>
            </Dialog>
            <Dialog open={scheduleDialogOpen}>
                <DialogContent>
                    <FormControl size={"small"}>
                        <DialogTitle style={{marginRight: "auto", marginLeft: "auto"}}>Scheduling Options</DialogTitle>
                        <div style={{display: "flex", marginRight: 26, marginTop: 8}}>
                        <Typography variant={"body2"} style={{marginRight: 16, marginTop: 4}} >Frequency:</Typography>
                        <Select style={{width: 200}} value={scheduleFrequency} onChange={handleFrequencyChange}>
                            <MenuItem value={"DAILY"}>Daily</MenuItem>
                            <MenuItem value={"WEEKLY"}>Weekly</MenuItem>
                            <MenuItem value={"MONTHLY"}>Monthly</MenuItem>
                        </Select>
                        </div>
                        {scheduleFrequency == "WEEKLY" ?
                            <div style={{display: "flex", marginRight: 26, marginTop: 24}}>
                                <Typography variant={"body2"} style={{marginRight: 58, marginTop: 4}}>Day:</Typography>
                                <Select style={{width: 200}} value={dayOfWeek} onChange={handleDayOfWeekChange}>
                                    <MenuItem value={"MON"}>Monday</MenuItem>
                                    <MenuItem value={"TUE"}>Tuesday</MenuItem>
                                    <MenuItem value={"WED"}>Wednesday</MenuItem>
                                    <MenuItem value={"THU"}>Thursday</MenuItem>
                                    <MenuItem value={"FRI"}>Friday</MenuItem>
                                    <MenuItem value={"SAT"}>Saturday</MenuItem>
                                    <MenuItem value={"SUN"}>Sunday</MenuItem>
                                </Select>
                            </div>
                         : <></>}
                        {scheduleFrequency == "MONTHLY" ?
                            <div style={{display: "flex", marginRight: 26, marginTop: 24}}>
                                <Typography variant={"body2"} style={{marginRight: 58, marginTop: 4}}>Day:</Typography>
                                <Select style={{width: 200}} value={dayOfMonth} onChange={handleDayOfMonthChange}
                                        MenuProps={{PaperProps: {style: {maxHeight: 150}}}}>
                                    {daysInMonth.map((dayNumber) => (
                                        <MenuItem value={dayNumber}>{dayNumber}</MenuItem>
                                    ))}
                                </Select>
                            </div>
                            : <></>}
                        <div style={{display: "flex", marginRight: 26, marginTop: 24, marginBottom: 8}}>
                            <Typography variant={"body2"} style={{marginRight: 16, marginTop: 4}} >Start Time:</Typography>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <TimePicker
                                    value={timeValue}
                                    onChange={(newValue) => {
                                        setTimeValue(newValue);
                                    }}
                                    renderInput={(params) => <TextField {...params} />}
                                    style={{width: 200}}
                                />
                            </LocalizationProvider>
                        </div>
                    </FormControl>
                </DialogContent>
                <DialogActions style={{marginBottom: 10}}>
                    <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => { createScheduleTask(); setScheduleDialogOpen(false)}}>Save</Button>
                </DialogActions>
            </Dialog>
        </div >
    );
}

const mapStateToProps = state => ({
    dashboard: getDashboardJson(state),
    connection: applicationGetConnection(state),
    vulnerabilityReportsData: getVulnerabilityReportsData(state),
    vulnerabilityReportLoading: getVulnerabilityReportLoading(state),
    toolsParameters: getToolsParameters(state),
    toolsRunning: getToolsRunning(state),
    toolsOutput: getToolsOutput(state),
    toolsParallel: getToolsParallel(state),
    sharphoundUploadResults: getSharpHoundUploadResults(state),
    sharphoundClearResults: getSharpHoundClearResults(state),
    connection: applicationGetConnection(state),
});

const mapDispatchToProps = dispatch => ({
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

export default connect(mapStateToProps, mapDispatchToProps)(NeoCollectionModal);