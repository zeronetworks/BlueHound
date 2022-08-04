import React, { useContext } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import PlayArrow from '@material-ui/icons/PlayArrow';
import { ListItem, ListItemIcon, ListItemText, TextareaAutosize } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import PostAddIcon from '@material-ui/icons/PostAdd';
import StorageIcon from '@material-ui/icons/Storage';
import { loadDashboardFromNeo4jThunk, loadDashboardListFromNeo4jThunk, loadDashboardThunk } from '../dashboard/DashboardThunks';
import { DataGrid } from '@mui/x-data-grid';
import { Neo4jContext, Neo4jContextState } from "use-neo4j/dist/neo4j.context";
import Tooltip from "@material-ui/core/Tooltip";

/**
 * A modal to save a dashboard as a JSON text string.
 * The button to open the modal is intended to use in a drawer at the side of the page.
 */

const styles = {

};

export const NeoLoadModal = ({ open, loadDashboard, loadDashboardFromNeo4j, loadDashboardListFromNeo4j }) => {
    const [loadModalOpen, setLoadModalOpen] = React.useState(false);
    const [loadFromNeo4jModalOpen, setLoadFromNeo4jModalOpen] = React.useState(false);
    const [text, setText] = React.useState("");
    const [rows, setRows] = React.useState([]);
    const { driver } = useContext<Neo4jContextState>(Neo4jContext);

    const handleClickOpen = () => {
        setLoadModalOpen(true);
    };

    const handleClose = () => {
        setLoadModalOpen(false);
    };


    const handleCloseAndLoad = () => {
        setLoadModalOpen(false);
        loadDashboard(text);
        setText("");
    };

    function handleDashboardLoadedFromNeo4j(result) {
        setText(result);
        setLoadFromNeo4jModalOpen(false);
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        setText(e.target.result);
    };

    const uploadDashboard = async (e) => {
        e.preventDefault();
        reader.readAsText(e.target.files[0]);
    }

    const columns = [
        { field: 'id', hide: true, headerName: 'ID', width: 150 },
        { field: 'date', headerName: 'Date', width: 200 },
        { field: 'title', headerName: 'Title', width: 270 },
        { field: 'author', headerName: 'Author', width: 160 },
        {
            field: 'load', headerName: ' ', renderCell: (c) => {
                return <Button onClick={(e) => { loadDashboardFromNeo4j(driver, c.id, handleDashboardLoadedFromNeo4j) }} style={{ float: "right", backgroundColor: "white"}} variant="contained" size="medium" endIcon={<PlayArrow />}>Select</Button>
            }, width: 120
        },
    ]


    return (
        <div>
            <ListItem button onClick={handleClickOpen} style={{height: 55}}>
                <ListItemIcon>
                    <Tooltip title="Load dashboard">
                        <IconButton style={{ padding: "0px" }} >
                            <SystemUpdateAltIcon />
                        </IconButton>
                    </Tooltip>
                </ListItemIcon>
                <ListItemText primary="Import Config"  hidden={!open}/>
            </ListItem>

            <Dialog maxWidth={"lg"} open={loadModalOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    <SystemUpdateAltIcon style={{
                        height: "30px",
                        paddingTop: "4px",
                        marginBottom: "-8px",
                        marginRight: "5px",
                        paddingBottom: "5px"
                    }} />   Load Dashboard
                    <IconButton onClick={handleClose} style={{ padding: "3px", float: "right" }}>
                        <Badge badgeContent={""} >
                            <CloseIcon />
                        </Badge>
                    </IconButton>

                </DialogTitle>
                <DialogContent style={{ width: "1000px" }}>
                    <div>
                    <Button
                            component="label"
                            onClick={(e) => {
                                loadDashboardListFromNeo4j(driver, (result) => {setRows(result)});
                                setLoadFromNeo4jModalOpen(true);
                            }}
                            style={{marginBottom: "10px", backgroundColor: "white" }}
                            color="default"
                            variant="contained"
                            size="medium"
                            endIcon={<StorageIcon />}>

                            Select From Neo4j
                        </Button>
                        <Button
                            component="label"
                            // onClick={(e)=>uploadDashboard(e)}
                            style={{  marginLeft: "10px",  backgroundColor: "white", marginBottom: "10px" }}
                            color="default"
                            variant="contained"
                            size="medium"
                            endIcon={<PostAddIcon />}>
                            <input
                                type="file"
                                onChange={(e) => uploadDashboard(e)}
                                hidden
                            />
                            Select From File
                        </Button>
                       
                        <Button onClick={(text.length > 0) ? handleCloseAndLoad : null}
                            style={{ color: text.length > 0 ? "white" : "lightgrey", float: "right", marginLeft: "10px", marginBottom: "10px", backgroundColor: text.length > 0 ? "green" : "white" }}
                            color="default"
                            variant="contained"
                            size="medium"
                            endIcon={<PlayArrow />}>
                            Load Dashboard
                        </Button>
                    </div>


                    <TextareaAutosize
                        style={{ minHeight: "500px", width: "100%", border: "1px solid lightgray" }}
                        className={"textinput-linenumbers"}
                        onChange={(e) => setText(e.target.value)}
                        value={text}
                        aria-label=""
                        placeholder="Select a dashboard first, then preview it here..." />

                </DialogContent>
                {/* <DialogActions> */}
                {/* </DialogActions> */}
            </Dialog>
            <Dialog maxWidth={"lg"} open={loadFromNeo4jModalOpen} onClose={(e) => { setLoadFromNeo4jModalOpen(false) }} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    Select From Neo4j
                    <IconButton onClick={(e) => { setLoadFromNeo4jModalOpen(false) }} style={{ padding: "3px", float: "right" }}>
                        <Badge badgeContent={""} >
                            <CloseIcon />
                        </Badge>
                    </IconButton>
                </DialogTitle>
                <DialogContent style={{ width: "800px" }}>
                    <DialogContentText>If dashboards are saved in your current database, choose a dashboard below.
                    </DialogContentText>

                    <div style={{ height: "360px" }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5]}
                            disableSelectionOnClick
                            components={{
                                ColumnSortedDescendingIcon: () => <></>,
                                ColumnSortedAscendingIcon: () => <></>,
                            }}
                        /></div>

                </DialogContent>
            </Dialog>
        </div>
    );
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
    loadDashboard: text => dispatch(loadDashboardThunk(text)),
    loadDashboardFromNeo4j: (driver, uuid, callback) => dispatch(loadDashboardFromNeo4jThunk(driver, uuid, callback)),
    loadDashboardListFromNeo4j: (driver, callback) => dispatch(loadDashboardListFromNeo4jThunk(driver, callback)),
});

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(NeoLoadModal));



