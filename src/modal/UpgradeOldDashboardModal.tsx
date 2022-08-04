
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import { TextareaAutosize } from '@material-ui/core';


export const NeoUpgradeOldDashboardModal = ({ open, text, clearOldDashboard, loadDashboard }) => {
    return (
        <div>
            <Dialog maxWidth={"lg"} open={open} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    Old Dashboard Found
                </DialogTitle>
                <DialogContent>
                    We've found a dashboard built with an old version of BlueHound.
                    Would you like to attempt an upgrade, or start from scratch?
                    <br />
                    <b>Make sure you back up this dashboard first!</b><br />
                    <Button onClick={() => {
                        localStorage.removeItem("bluehound-dashboard");
                        clearOldDashboard();
                    }}
                        style={{ marginTop: "20px", marginBottom: "20px", marginRight: "20px" }}
                        color="default"
                        variant="contained"
                        size="large"
                        endIcon={<DeleteIcon color={"white"} />}>
                        Delete Old Dashboard
                    </Button>
                    <Button onClick={() => {
                        localStorage.removeItem("bluehound-dashboard");
                        loadDashboard(text);
                        clearOldDashboard();
                    }}
                        style={{ marginTop: "20px", marginRight: "6px", marginBottom: "20px", backgroundColor: "white" }}
                        color="default"
                        variant="contained"
                        size="large">
                        Upgrade
                    </Button>
                    <TextareaAutosize
                        style={{ minHeight: "200px", width: "100%", border: "1px solid lightgray" }}
                        className={"textinput-linenumbers"}
                        onChange={(e) => { }}
                        value={text ? text : ""}
                        aria-label=""
                        placeholder="" />
                </DialogContent>
            </Dialog>
        </div >
    );
}

export default (NeoUpgradeOldDashboardModal);


