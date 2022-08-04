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
import CloseIcon from "@material-ui/icons/Close";
import {TextField} from "@material-ui/core";

const NeoCardInfoHeader = ({ onToggleCardInfo, onToggleCardExpand, expanded, fullscreenEnabled }) => {

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
             action={<>
                {fullscreenEnabled ? (expanded ? unMaximizeButton : maximizeButton) : <></>}
                {!expanded ? <IconButton aria-label="save" onClick={(e) => { e.preventDefault(); onToggleCardInfo() }}><CloseIcon /></IconButton> : <></>}
            </>}
            title=""
            subheader="" />
    );
};

export default NeoCardInfoHeader;