
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import SettingsIcon from '@material-ui/icons/Settings';
import Badge from '@material-ui/core/Badge';
import { Grid, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import NeoReport from '../report/Report';
import NeoBarChart from '../chart/BarChart';
import ReportSetting from '../component/ReportSetting';
import { DASHBOARD_SETTINGS } from '../config/DashboardConfig';



export const NeoSettingsModal = ({ dashboardOpen, dashboardSettings, updateDashboardSetting }) => {
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const settings = DASHBOARD_SETTINGS;

    // Else, build the advanced settings view.
    const advancedDashboardSettings = <div style={{ marginLeft: "-10px" }}>
        {Object.keys(settings).map((setting, index) =>
            <div key={"advanced_settings_div_" + index}>
            <ReportSetting key={setting} name={setting}
                value={dashboardSettings[setting]}
                type={settings[setting]["type"]}
                disabled={settings[setting]["disabled"]}
                helperText={settings[setting]["helperText"]}
                label={settings[setting]["label"]}
                defaultValue={settings[setting]["default"]}
                choices={settings[setting]["values"]}
                onChange={(e) => updateDashboardSetting(setting, e)}
            /><br/></div>
        )}
    </div>

    return (
        <div>
            <ListItem button onClick={handleClickOpen} style={{height: 55}}>
                <ListItemIcon>
                    <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" hidden={!dashboardOpen}/>
            </ListItem>

            <Dialog maxWidth={"lg"} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                <SettingsIcon style={{
                        height: "30px",
                        paddingTop: "4px",
                        marginBottom: "-8px",
                        marginRight: "5px",
                        paddingBottom: "5px"
                    }} />  
                    BlueHound Settings
                    <IconButton onClick={handleClose} style={{ padding: "3px", float: "right" }}>
                        <Badge badgeContent={""} >
                            <CloseIcon />
                        </Badge>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You can modify settings here.
                        <br/><br/>
                        {advancedDashboardSettings}
                    </DialogContentText>

                </DialogContent>
            </Dialog>
        </div>
    );
}

export default (NeoSettingsModal);


