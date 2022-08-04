import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import PlayArrow from '@material-ui/icons/PlayArrow';
import { MenuItem, Tooltip } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import SecurityIcon from '@material-ui/icons/Security';

const SSO_ENABLED = false;

/**
 * Configures setting the current Neo4j database connection for the dashboard.
 */
export default function NeoConnectionModal({ open, connection, dismissable = false, createConnection, onConnectionModalClose }) {
    const protocols = ["bolt", "bolt+s", "bolt+ssc", "neo4j", "neo4j+s", "neo4j+ssc"]
    const [protocol, setProtocol] = React.useState(connection.protocol);
    const [url, setUrl] = React.useState(connection.url);
    const [port, setPort] = React.useState(connection.port);
    const [username, setUsername] = React.useState(connection.username);
    const [password, setPassword] = React.useState(connection.password);
    const [database, setDatabase] = React.useState(connection.database);

    return (
        <div>
            <Dialog maxWidth="xs" open={open} onClose={() => { dismissable ? onConnectionModalClose() : null }} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Connect to Neo4j
                    <IconButton style={{ padding: "3px", float: "right" }}>
                        <Badge badgeContent={""} >
                            <img style={{ width: "36px", height: "36px" }} src="neo4j-icon-color.png" />
                        </Badge>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField select={true} autoFocus margin="dense" id="protocol" value={protocol}
                        onChange={(e) => setProtocol(e.target.value)} style={{ width: "25%" }} label="Protocol"
                        placeholder="bolt://" type="text" >
                        {protocols.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField type="text" autoFocus margin="dense" id="url" value={url} onChange={(e) => {
                        // Help the user here a bit by extracting the hostname if they copy paste things in
                        const input = e.target.value;
                        const splitted = input.split("://")
                        const host = splitted[splitted.length - 1].split(":")[0].split("/")[0]
                        setUrl(host)
                    }}
                        label="Hostname" style={{ marginLeft: "2.5%", width: "60%", marginRight: "2.5%" }}
                        placeholder="localhost" type="text" />
                    <TextField autoFocus margin="dense" id="port" value={port} onChange={(event) => {
                        if (event.target.value.toString().length == 0) {
                            setPort(event.target.value);
                        } else if (!isNaN(event.target.value)) {
                            setPort(Number(event.target.value));
                        }
                    }} label="Port" style={{ width: "10%" }} placeholder="7687" type="text" />

                    {(window.location.href.startsWith("https") && (!(protocol.endsWith("+s") || protocol.endsWith("+scc"))))
                        ? <div> You're running BlueHound from a secure (https) webpage.
                            You can't connect to a Neo4j database with an unencrypted protocol.
                            Change the protocol, or use BlueHound using http instead: &nbsp;
                            <a href={window.location.href.replace("https://", "http://")}>
                                {window.location.href.replace("https://", "http://")}
                            </a>.
                        </div>
                        : <div></div>}
                    {(url == "localhost" && (protocol.endsWith("+s") || protocol.endsWith("+scc"))) ?
                        <div>
                            {/* <WarningIcon fontSize="small" style={{ lineHeight: 8, color: "orange" }} /> */}
                            A local host with an encrypted connection will likely not work - try an unencrypted protocol instead.
                        </div> : <div></div>
                    }
                    <TextField autoFocus margin="dense" id="database" value={database} onChange={(e) => setDatabase(e.target.value)} label="Database (optional)" placeholder="neo4j" type="text" fullWidth />
                    <TextField autoFocus margin="dense" id="dbusername" value={username} onChange={(e) => setUsername(e.target.value)} label="Username" placeholder="neo4j" type="text" fullWidth />

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        onConnectionModalClose();
                        createConnection(protocol, url, port, database, username, password);
                    }}>
                     
                        <TextField autoFocus margin="dense" id="dbpassword" value={password} onChange={(e) => setPassword(e.target.value)} label="Password" type="password" fullWidth />
                        {SSO_ENABLED ? <Button style={{ float: "left", marginTop: "20px", marginBottom: "20px", backgroundColor: "white" }}
                            color="default"
                            variant="contained"
                            size="large"
                            endIcon={<SecurityIcon />}>
                            Single Sign-On
                        </Button> : <></>}

                        <Button type="submit" onClick={(e) => {
                            e.preventDefault();
                            onConnectionModalClose();
                            createConnection(protocol, url, port, database, username, password);
                        }}
                            style={{ float: "right", marginTop: "20px", marginBottom: "20px", backgroundColor: "white" }}
                            color="default"
                            variant="contained"
                            size="large"
                            endIcon={<PlayArrow />}>
                            Connect
                        </Button>
                    </form>
                </DialogContent>
                {/*<DialogActions style={{ background: "#555" }}>
                    <DialogContent>
                        <DialogContentText style={{ color: "lightgrey" }}>
                            Enter your Neo4j database credentials to start.
                            Don't have a Neo4j database yet?
                            Create your own in <a style={{ color: "white" }} href="https://neo4j.com/download/">Neo4j Desktop</a>,
                            or try the <a style={{ color: "white" }} href="https://console.neo4j.io/">Neo4j Aura</a> free tier.

                        </DialogContentText>
                    </DialogContent>
                </DialogActions>*/}
            </Dialog>
        </div>
    );
}