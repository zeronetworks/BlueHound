import Card from '@material-ui/core/Card';
import Collapse from '@material-ui/core/Collapse';
import Fade from '@material-ui/core/Fade';
import React, { useCallback, useEffect, useState } from 'react';
import NeoCardSettings from './settings/CardSettings';
import NeoCardView from './view/CardView';
import { connect } from 'react-redux';
import {
    updateCypherParametersThunk,
    updateFieldsThunk,
    updateSelectionThunk,
    updateReportQueryThunk,
    toggleCardSettingsThunk,
    updateReportRefreshRateThunk,
    updateReportSettingThunk,
    updateReportSizeThunk,
    updateReportTitleThunk,
    updateReportTypeThunk,
    toggleCardInfoThunk, updateQueryInfoThunk, updateInfoURLThunk
} from './CardThunks';
import { toggleReportSettings } from './CardActions';
import { getReportState } from './CardSelectors';
import { debounce } from '@material-ui/core';
import { getDashboardIsEditable, getDatabase, getGlobalParameters } from '../settings/SettingsSelectors';
import { updateGlobalParameterThunk } from '../settings/SettingsThunks';
import NeoCardInfo from "./info/CardInfo";


const NeoCard = ({
    index,  // index of the card. 
    report, // state of the card, retrieved based on card index.
    editable, // whether the card is editable.
    database, // the neo4j database that the card is running against.
    globalParameters, // Query parameters that are globally set for the entire dashboard.
    dashboardSettings, // Dictionary of settings for the entire dashboard.
    onRemovePressed, // action to take when the card is removed. (passed from parent)
    onShiftLeftPressed, // action to take when the card is shifted left.
    onShiftRightPressed, // action to take when the card is shifted right.
    onTitleUpdate, // action to take when the card title is updated.
    onSizeUpdate, // action to take when the card size is updated.
    onTypeUpdate, // action to take when the card report type is updated.
    onFieldsUpdate, // action to take when the set of returned query fields is updated.
    onQueryUpdate, // action to take when the card query is updated.
    onRefreshRateUpdate, // action to take when the card refresh rate is updated.
    onCypherParametersUpdate, // action to take when the query parameters are updated.
    onQueryInfoUpdate, // action to take when the query info is updated.
    onInfoURLUpdate, // action to take when the info URL is updated.
    onReportSettingUpdate, // action to take when an advanced report setting is updated.
    onSelectionUpdate, // action to take when the selected visualization fields are updated.
    onGlobalParameterUpdate, // action to take when a report updates a dashboard parameter.
    onToggleCardSettings, // action to take when the card settings button is clicked.
    onToggleCardInfo, // action to take when the card info button is clicked.
    onToggleReportSettings // action to take when the report settings (advanced settings) button is clicked.
}) => {

    const [settingsOpen, setSettingsOpen] = React.useState(report.settingsOpen);
    const [infoOpen, setInfoOpen] = React.useState(report.infoOpen);
    const debouncedOnToggleCardSettings = useCallback(
        debounce(onToggleCardSettings, 500),
        [],
    );
    const debouncedOnToggleCardInfo = useCallback(
        debounce(onToggleCardInfo, 500),
        [],
    );
    const [collapseTimeout, setCollapseTimeout] = React.useState(report.collapseTimeout);

    const [expanded, setExpanded] = useState(false);
    const onToggleCardExpand = () => {
        setExpanded(!expanded);
    }
    
    useEffect(() => {
        setSettingsOpen(report.settingsOpen);
    }, [report.settingsOpen])

    useEffect(() => {
        setCollapseTimeout(report.collapseTimeout);
    }, [report.collapseTimeout])

    // TODO - get rid of some of the props-drilling here...
    return (
        <div>
            {/* The front of the card, referred to as the 'view' */}
            <Collapse disableStrictModeCompat in={!settingsOpen && !infoOpen} timeout={collapseTimeout}>
                <Card>
                    <NeoCardView
                        settingsOpen={settingsOpen}
                        editable={editable}
                        dashboardSettings={dashboardSettings}
                        settings={report.settings ? report.settings : {}}
                        type={report.type}
                        database={database}
                        query={report.query}
                        cypherParameters={report.parameters}
                        queryInfo={report.queryInfo}
                        globalParameters={globalParameters}
                        fields={report.fields ? report.fields : []}
                        refreshRate={report.refreshRate}
                        selection={report.selection}
                        width={report.width}
                        height={report.height}
                        title={report.title}
                        expanded={expanded}
                        onToggleCardExpand={onToggleCardExpand}
                        onGlobalParameterUpdate={onGlobalParameterUpdate}
                        onSelectionUpdate={(selectable, field) => onSelectionUpdate(index, selectable, field)}
                        onTitleUpdate={(title) => onTitleUpdate(index, title)}
                        onFieldsUpdate={(fields) => onFieldsUpdate(index, fields)}
                        onToggleCardSettings={() => {
                            setSettingsOpen(true);
                            setCollapseTimeout("auto");
                            debouncedOnToggleCardSettings(index, true)
                        }}
                        onToggleCardInfo={() => {
                            setInfoOpen(true);
                            setCollapseTimeout("auto");
                            debouncedOnToggleCardInfo(index, true)
                        }}/>
                </Card>
            </Collapse>
            {/* The back of the card, referred to as the 'settings' */}
            <Collapse disableStrictModeCompat in={settingsOpen} timeout={collapseTimeout} >
                <Card>
                    <NeoCardSettings
                        settingsOpen={settingsOpen}
                        query={report.query}
                        database={database}
                        width={report.width}
                        height={report.height}
                        type={report.type}
                        refreshRate={report.refreshRate}
                        cypherParameters={report.parameters}
                        queryInfo={report.queryInfo}
                        infoURL={report.infoURL}
                        expanded={expanded}
                        dashboardSettings={dashboardSettings}
                        onToggleCardExpand={onToggleCardExpand}
                        reportSettings={report.settings}
                        reportSettingsOpen={report.advancedSettingsOpen}
                        onQueryUpdate={(query) => onQueryUpdate(index, query)}
                        onRefreshRateUpdate={(rate) => onRefreshRateUpdate(index, rate)}
                        onReportSettingUpdate={(setting, value) => onReportSettingUpdate(index, setting, value)}
                        onTypeUpdate={(type) => onTypeUpdate(index, type)}
                        onCypherParametersUpdate={(parameters) => onCypherParametersUpdate(index, parameters)}
                        onQueryInfoUpdate={(queryInfo) => onQueryInfoUpdate(index, queryInfo)}
                        onInfoURLUpdate={(infoUrl) => onInfoURLUpdate(index, infoUrl)}
                        onSizeUpdate={(size) => onSizeUpdate(index, size[0], size[1])}
                        onRemovePressed={() => onRemovePressed(index)}
                        onShiftLeftPressed={() => onShiftLeftPressed(index)}
                        onShiftRightPressed={() => onShiftRightPressed(index)}
                        onToggleCardSettings={() => {
                            setSettingsOpen(false);
                            setCollapseTimeout("auto");
                            debouncedOnToggleCardSettings(index, false);
                        }}
                        onToggleReportSettings={() => onToggleReportSettings(index)} />
                </Card>
            </Collapse>
            <Collapse disableStrictModeCompat in={infoOpen} timeout={collapseTimeout} >
                <Card>
                    <NeoCardInfo
                        expanded={expanded}
                        infoOpen={infoOpen}
                        title={report.title}
                        height={report.height}
                        dashboardSettings={dashboardSettings}
                        onToggleCardExpand={onToggleCardExpand}
                        queryInfo={report.queryInfo}
                        infoURL={report.infoURL}
                        onToggleCardInfo={() => {
                            setInfoOpen(false);
                            setCollapseTimeout("auto");
                            debouncedOnToggleCardInfo(index, false)
                        }}/>
                </Card>
            </Collapse>
        </div>
    );
};

const mapStateToProps = (state, ownProps) => ({
    report: getReportState(state, ownProps.index),
    editable: getDashboardIsEditable(state),
    database: getDatabase(state),
    globalParameters: getGlobalParameters(state)
});

const mapDispatchToProps = dispatch => ({
    onTitleUpdate: (index: any, title: any) => {
        dispatch(updateReportTitleThunk(index, title))
    },
    onQueryUpdate: (index: any, query: any) => {
        dispatch(updateReportQueryThunk(index, query))
    },
    onSizeUpdate: (index: any, width: any, height: any) => {
        dispatch(updateReportSizeThunk(index, width, height))
    },
    onRefreshRateUpdate: (index: any, rate: any) => {
        dispatch(updateReportRefreshRateThunk(index, rate))
    },
    onTypeUpdate: (index: any, type: any) => {
        dispatch(updateReportTypeThunk(index, type))
    },
    onReportSettingUpdate: (index: any, setting: any, value: any) => {
        dispatch(updateReportSettingThunk(index, setting, value))
    },
    onCypherParametersUpdate: (index: any, parameters: any) => {
        dispatch(updateCypherParametersThunk(index, parameters))
    },
    onQueryInfoUpdate: (index: any, queryInfo: any) => {
        dispatch(updateQueryInfoThunk(index, queryInfo))
    },
    onInfoURLUpdate: (index: any, infoURL: any) => {
        dispatch(updateInfoURLThunk(index, infoURL))
    },
    onFieldsUpdate: (index: any, fields: any) => {
        dispatch(updateFieldsThunk(index, fields))
    },
    onGlobalParameterUpdate: (key: any, value: any) => {
        dispatch(updateGlobalParameterThunk(key, value))
    },
    onSelectionUpdate: (index: any, selectable: any, field: any) => {
        dispatch(updateSelectionThunk(index, selectable, field))
    },
    onToggleCardSettings: (index: any, open: any) => {
        dispatch(toggleCardSettingsThunk(index, open))
    },
    onToggleCardInfo: (index: any, open: any) => {
        dispatch(toggleCardInfoThunk(index, open))
    },
    onToggleReportSettings: (index: any) => {
        dispatch(toggleReportSettings(index))
    }
});


export default connect(mapStateToProps, mapDispatchToProps)(NeoCard);

