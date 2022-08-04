import React from 'react';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import { red } from '@material-ui/core/colors';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import { FullscreenExit } from '@material-ui/icons';

const NeoCardSettingsHeader = ({ onRemovePressed, onShiftLeftPressed, onShiftRightPressed,
     onToggleCardSettings, onToggleCardExpand, expanded, fullscreenEnabled }) => {
    const maximizeButton = <IconButton aria-label="maximize"
        onClick={onToggleCardExpand}>
        <FullscreenIcon />
    </IconButton>

    const unMaximizeButton = <IconButton aria-label="un-maximize"
        onClick={onToggleCardExpand}>
        <FullscreenExit />
    </IconButton>

    return (
        <CardHeader
            avatar={<div style={{ marginTop: "-8px" }}>
                <IconButton size="medium" style={{ padding: "8px", backgroundColor: red[500], color: "white" }} aria-label="remove"
                    onClick={onRemovePressed} >
                    <DeleteIcon />
                </IconButton>
                <IconButton size="medium" style={{ padding: "8px", backgroundColor: "#222", color: "white" }} aria-label="move left"
                    onClick={onShiftLeftPressed}>
                    <ChevronLeft />
                </IconButton>
                <IconButton size="medium" style={{ padding: "8px", backgroundColor: "#222", color: "white" }} aria-label="move-right"
                    onClick={onShiftRightPressed}>
                    <ChevronRight />
                </IconButton>
            </div>}
             action={<>
                {fullscreenEnabled ? (expanded ? unMaximizeButton : maximizeButton) : <></>}
                {!expanded ? <IconButton aria-label="save" onClick={(e) => { e.preventDefault(); onToggleCardSettings() }}><SaveIcon /></IconButton> : <></>}
            </>}
            title=""
            subheader="" />
    );
};

export default NeoCardSettingsHeader;