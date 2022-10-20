import React, {useCallback} from "react";
import {ee} from "../report/Report";
import {RUN_QUERY_EVENT} from "../modal/QueryModal";
import debounce from 'lodash/debounce';
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import {connect} from "react-redux";
import {getZeroAlertOpen, getZeroAlertShown} from "../application/ApplicationSelectors";
import {setZeroAlertOpen, setZeroAlertShown} from "../application/ApplicationActions";

export const NeoPageAlert = ({zeroAlertOpen, zeroAlertShown, setZeroAlertOpen, setZeroAlertShown}) => {

    const handleOpenAlert = () => {
        if (!zeroAlertShown) {
            setZeroAlertOpen(true);
            setZeroAlertShown(true);
        }
    }

    const debouncedOpenAlert = useCallback(
        debounce(handleOpenAlert),
        [],
    );

    ee.addListener(RUN_QUERY_EVENT, debouncedOpenAlert);

    return (
        <Box sx={{ width: '100%', zIndex: 999, position: "fixed", left: 56 }}>
        <Collapse in={zeroAlertOpen}>
            <Alert severity="info" variant="filled" style={{backgroundColor: "#39E5AC"}}
                   action={
                       <IconButton
                           color="inherit"
                           size="small"
                           style={{marginRight: 70, marginLeft: "auto"}}
                           onClick={() => {
                               setZeroAlertOpen(false);
                           }}>
                           <CloseIcon fontSize="inherit" />
                       </IconButton>
                   }>
                Want to see how Zero Networks can help you eliminated these paths? <a href={"https://zeronetworks.com/"}>Click here</a> to find out!
            </Alert>
        </Collapse>
    </Box>)
}

const mapStateToProps = state => ({
    zeroAlertOpen: getZeroAlertOpen(state),
    zeroAlertShown: getZeroAlertShown(state),
})

const mapDispatchToProps = dispatch => ({
    setZeroAlertShown: (alert_state) => dispatch(setZeroAlertShown(alert_state)),
    setZeroAlertOpen: (alert_state) => dispatch(setZeroAlertOpen(alert_state))
})

export default connect(mapStateToProps, mapDispatchToProps)(NeoPageAlert);