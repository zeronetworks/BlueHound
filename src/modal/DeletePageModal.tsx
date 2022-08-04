import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import PlayArrow from '@material-ui/icons/PlayArrow';
import { Tooltip } from '@material-ui/core';

/**
 * Configures setting the current Neo4j database connection for the dashboard.
 */
export const NeoDeletePageModal = ({modalOpen, onRemove, handleClose}) => {

    return (
        <Dialog maxWidth={"lg"} open={modalOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">
                Delete page?
            </DialogTitle>
            <DialogContent>
                <DialogContentText> Are you sure you want to remove this page? This cannot be undone.</DialogContentText>
                <Button onClick={() => {
                    onRemove();
                    handleClose();
                }}
                    style={{ float: "right", marginTop: "20px", marginBottom: "20px", backgroundColor: "red" }}
                    color="secondary"
                    variant="contained"
                    size="large"
                    endIcon={<DeleteIcon color={"white"} />}>
                    Remove
                </Button>
                <Button onClick={() => {
                    handleClose();
                }}
                    style={{ float: "right", marginTop: "20px", marginRight: "6px", marginBottom: "20px", backgroundColor: "white" }}
                    color="default"
                    variant="contained"
                    size="large">
                    Cancel
                </Button>
              
            </DialogContent>
        </Dialog>
    );
}

export default (NeoDeletePageModal);
