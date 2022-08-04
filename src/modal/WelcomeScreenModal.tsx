import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import { Tooltip } from '@material-ui/core';

/**
 * Configures setting the current Neo4j database connection for the dashboard.
 */
export const NeoWelcomeScreenModal = ({ welcomeScreenOpen, setWelcomeScreenOpen,
    hasCachedDashboard, hasNeo4jDesktopConnection, createConnectionFromDesktopIntegration, resetDashboard,
    onConnectionModalOpen, onCollectionModalOpen, onAboutModalOpen }) => {

    const [promptOpen, setPromptOpen] = React.useState(false);
    const handleOpen = () => {
        setWelcomeScreenOpen(true);
    };

    const handleClose = () => {
        setWelcomeScreenOpen(false);
    };

    const handlePromptClose = () => {
        setPromptOpen(false);
    };


    return (
        <div>
            <Dialog maxWidth="xs" open={welcomeScreenOpen} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">BlueHound
                    <IconButton disabled style={{ color: "white", padding: "5px", float: "right" }}>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Tooltip title="Login." aria-label="">
                        {(hasCachedDashboard) ?
                            <Button onClick={(e) => { handleClose(); onConnectionModalOpen(); }}
                                style={{ marginTop: "0px", width: "100%", backgroundColor: "white", boxShadow: "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)" }}
                                color="default"
                                variant="contained"
                                size="large">
                                Login
                            </Button> : <Button onClick={() => {onConnectionModalOpen(); handleClose(); }}
                                style={{ marginTop: "0px", width: "100%", backgroundColor: "white", boxShadow: "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)" }}
                                color="default"
                                variant="contained"
                                size="large">
                                Login
                            </Button>
                        }
                    </Tooltip>
                    <br />
                    <IconButton aria-label="delete">
                    </IconButton>
                </DialogContent>
            </Dialog>

            {/* Prompt when creating new dashboard with existing cache */}
            <Dialog maxWidth="xs" open={promptOpen} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Create new dashboard
                    <IconButton disabled style={{ color: "white", padding: "5px", float: "right" }}>
                        ⚠️
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    Are you sure you want to create a new dashboard?
                    This will remove your currently cached dashboard.
                </DialogContent>
                <DialogActions style={{ background: "white" }}>
                    <DialogContent>
                        <DialogContentText style={{ color: "black" }}>
                            <Button onClick={(e) => { handleOpen(); handlePromptClose(); }}
                                style={{ marginTop: "10px", float: "right", backgroundColor: "white", boxShadow: "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)" }}
                                color="default"
                                variant="contained"
                                size="large">
                                No
                            </Button>
                            <Button onClick={(e) => { handleClose(); handlePromptClose(); resetDashboard(); onConnectionModalOpen(); }}
                                style={{ marginTop: "10px", float: "right", backgroundColor: "white", boxShadow: "0px 3px 1px -2px rgb(0 0 0 / 20%), 0px 2px 2px 0px rgb(0 0 0 / 14%), 0px 1px 5px 0px rgb(0 0 0 / 12%)" }}
                                color="default"
                                variant="contained"
                                size="large">
                                Yes
                            </Button>

                        </DialogContentText>
                    </DialogContent>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default (NeoWelcomeScreenModal);