import { AppBar, Toolbar, IconButton, Typography } from "@material-ui/core";
import React from "react";
import MenuIcon from '@material-ui/icons/Menu';
import LoadingAnimation from "../component/LoadingAnimation";


export const NeoDashboardPlaceholder = ({connected}) => {
    const content = (
        <div style={{zIndex: -99}}>
            <AppBar position="absolute" style={{
                zIndex: "auto",
                boxShadow: "none",
                transition: "width 125ms cubic-bezier(0.4, 0, 0.6, 1) 0ms"
            }
            }>
                <Toolbar style={{ paddingRight: 24, minHeight: "64px", background: '#000331', zIndex: 1201 }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        style={
                            (open) ? {
                                display: 'none',
                            } : {
                                marginRight: 36,
                                marginLeft: -19,
                            }
                        }
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
                <Toolbar style={{ zIndex: 10, minHeight: "50px", paddingLeft: "0px", paddingRight: "0px", background: "white" }}>
                    <div style={{
                        width: '100%', zIndex: -112, height: "48px", overflowX: "hidden", overflowY: "auto", background: "rgba(240,240,240)",
                        boxShadow: "2px 1px 10px 0px rgb(0 0 0 / 12%)",
                        borderBottom: "1px solid lightgrey"
                    }}>

                    </div>
                </Toolbar>
            </AppBar>
            <div style={{
                position: "absolute",
                width: "100%",
                height: "100%"
            }}>
                <Typography variant="h2" color="textSecondary" style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)"
                }}>
                    {!connected ? <LoadingAnimation /> :<></>}
                </Typography>
            </div>
        </div>
    );
    return content;
}



export default (NeoDashboardPlaceholder);
