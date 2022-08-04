import React, { useContext } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import PlayArrow from '@material-ui/icons/PlayArrow';
import SaveIcon from '@material-ui/icons/Save';
import { ListItem, ListItemIcon, ListItemText, TextareaAutosize, Tooltip } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import GetAppIcon from '@material-ui/icons/GetApp';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme, withStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import DashboardIcon from '@material-ui/icons/Dashboard';
/**
 * A modal to save a dashboard as a JSON text string.
 * The button to open the modal is intended to use in a drawer at the side of the page.
 */

const styles = {

};

export const NeoLoadSharedDashboardModal = ({ shareDetails, onResetShareDetails, onConfirmLoadSharedDashboard }) => {

    const handleClose = () => {
        onResetShareDetails();
    };

    return (
        <div>
            <Dialog maxWidth={"lg"} open={shareDetails !== undefined} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                <DashboardIcon style={{
                        height: "30px",
                        paddingTop: "4px",
                        marginBottom: "-8px",
                        marginRight: "5px",
                        paddingBottom: "5px"
                    }} /> Loading Dashboard

                    <IconButton onClick={handleClose} style={{ padding: "3px", float: "right" }}>
                        <Badge badgeContent={""} >
                            <CloseIcon />
                        </Badge>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {shareDetails !== undefined ? <>
                        You are loading a Neo4j dashboard.<br />
                        {shareDetails && shareDetails.url ? <>You will be connected to <b>{shareDetails && shareDetails.url}</b>.</> : <>You will still need to specify a connection manually.</>}
                        <br /> <br />
                        This will override your current dashboard (if any). Continue?
                        </> : <><br/><br/><br/></>}
                        <br/>
                       
                        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                        <Button
                            component="label"
                            onClick={e => {
                                onConfirmLoadSharedDashboard();
                            }}
                            style={{ backgroundColor: "white", marginTop: "20px", float: "right" }}
                            color="default"
                            variant="contained"
                            endIcon={<PlayArrow />}
                            size="medium">
                            Continue
                        </Button>
                        <Button
                            component="label"
                            onClick={handleClose}
                            style={{ float: "right", marginTop: "20px", marginRight: "10px", backgroundColor: "white" }}
                            color="default"
                            variant="contained"
                            size="medium">
                            Cancel
                        </Button>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>

                </DialogActions>
            </Dialog>
        </div>
    );
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
});


export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(NeoLoadSharedDashboardModal));



