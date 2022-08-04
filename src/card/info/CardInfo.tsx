import React from 'react';
import NeoCardInfoHeader from './CardInfoHeader'
import { ReportItemContainer } from '../CardStyle';
import NeoCardSettingsHeader from './CardSettingsHeader';
import NeoCardSettingsContent from './CardSettingsContent';
import NeoCardSettingsFooter from './CardSettingsFooter';
import {CardContent, Chip} from '@material-ui/core';
import {MoreVert} from "@material-ui/icons";
import {InfoOutlined} from "@material-ui/icons";
import {Typography} from "@mui/material";
import LanguageIcon from '@material-ui/icons/Language'

const NeoCardInfo = ({expanded, infoOpen, title, height, onToggleCardInfo, dashboardSettings, onToggleCardExpand,
                         queryInfo, infoURL}) => {

    const cardHeight = 10 + (120 * height) + (78 * Math.floor((height - 1) / 3)) + "px";

    const cardInfoHeader = <NeoCardInfoHeader
        expanded={expanded}
        onToggleCardExpand={onToggleCardExpand}
        fullscreenEnabled={dashboardSettings.fullscreenEnabled}
        onToggleCardInfo={onToggleCardInfo} />

    const cardInfoContent = (infoOpen) ? <CardContent style={{ paddingTop: "10px", paddingBottom: "10px" }}>
        <div style={{ padding: 15, display: "flex" }}>
            <Typography variant="subtitle2">{title}</Typography>
        </div>
        <div style={{ paddingLeft: 30, paddingTop: 5, display: "flex" }}>
            <InfoOutlined fontSize={"small"} style={{marginRight: 6}} />
            <Typography variant="body2">{queryInfo}</Typography>
        </div>
        { infoURL ?
            <div style={{ paddingLeft: 30, paddingTop: 20, display: "flex" }}>
                <LanguageIcon fontSize={"small"} style={{marginRight: 6}} opacity={0.6}/>
                <Typography variant="body2"><a href={infoURL} target="_blank" >{infoURL}</a> </Typography>
            </div>  : <></> }
        </CardContent> : <CardContent style={{ paddingTop: "10px", paddingBottom: "10px" }}/>;

    return (
        <div className={`card-view ${expanded ? "expanded" : ""}`} style={{ overflowY: "auto" }}>
            {cardInfoHeader}
            <ReportItemContainer style={{ height: cardHeight, marginTop: "-20px" }} >
                {cardInfoContent}
            </ReportItemContainer>
        </div>
    )
};

export default NeoCardInfo;