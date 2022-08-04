import React, { useState } from 'react';
import { ReportItemContainer } from '../CardStyle';
import NeoCardViewHeader from './CardViewHeader';
import NeoCardViewFooter from './CardViewFooter';
import NeoReport from '../../report/Report';
import { CardContent } from '@material-ui/core';
import { REPORT_TYPES } from '../../config/ReportConfig';

const CARD_FOOTER_HEIGHT = 64;

const NeoCardView = ({ title, database, query, cypherParameters, queryInfo, globalParameters, width, height, fields,
    type, selection, dashboardSettings, settings, settingsOpen, refreshRate, editable,
    onGlobalParameterUpdate, onSelectionUpdate, onToggleCardSettings, onToggleCardInfo, onTitleUpdate,
     onFieldsUpdate, expanded, onToggleCardExpand }) => {
    const reportHeight = (97 * height) + (148 * Math.floor((height - 1) / 3));
    const cardHeight = (120 * height) + (78 * Math.floor((height - 1) / 3)) - 7;

    // @ts-ignore
    const reportHeader = <NeoCardViewHeader
        title={title}
        editable={editable}
        fullscreenEnabled={dashboardSettings.fullscreenEnabled}
        onTitleUpdate={onTitleUpdate}
        onToggleCardSettings={onToggleCardSettings}
        onToggleCardInfo={onToggleCardInfo}
        onToggleCardExpand={onToggleCardExpand}
        expanded={expanded}
        queryInfo={queryInfo}
    >
    </NeoCardViewHeader>;

    // @ts-ignore
    const reportFooter = <NeoCardViewFooter
        fields={fields}
        settings={settings}
        selection={selection}
        type={type}
        onSelectionUpdate={onSelectionUpdate}
        showOptionalSelections={(settings["showOptionalSelections"])} >
    </NeoCardViewFooter>;
    
    const withoutFooter = REPORT_TYPES[type].withoutFooter ? REPORT_TYPES[type].withoutFooter : !REPORT_TYPES[type].selection || (settings && settings.hideSelections);

    const getGlobalParameter = (key: string): any => {
        return globalParameters ? globalParameters[key] : undefined;
    }

    return (
        <div className={`card-view ${expanded ? "expanded" : ""}`}>
            {reportHeader}
            {/* if there's no selection for this report, we don't have a footer, so the report can be taller. */}
            <ReportItemContainer style={{ height: expanded ? (withoutFooter ? "calc(100% - 69px)" : "calc(100% - 79px)") : cardHeight }}>
                <CardContent style={{
                    paddingBottom: "0px", paddingLeft: "0px", paddingRight: "0px", paddingTop: "0px", width: "100%", marginTop: "-3px",
                    height: expanded ? (withoutFooter ? "100%" : `calc(100% - ${CARD_FOOTER_HEIGHT}px)`) : ((withoutFooter) ? reportHeight + CARD_FOOTER_HEIGHT + "px" : reportHeight + "px"),
                    overflow: "auto", overflowY: "auto", overflowX: "auto"
                }}>
                    <NeoReport query={query}
                        database={database}
                        stringParameters={cypherParameters}
                        mapParameters={globalParameters}
                        disabled={settingsOpen}
                        selection={selection}
                        fields={fields}
                        settings={settings}
                        expanded={expanded}
                        rowLimit={dashboardSettings['queryRowLimit'] ? dashboardSettings['queryRowLimit'] : REPORT_TYPES[type].maxRecords}
                        refreshRate={refreshRate}
                        dimensions={{ width: width, height: height }}
                        type={type}
                        ChartType={REPORT_TYPES[type].component}
                        setGlobalParameter={onGlobalParameterUpdate}
                        getGlobalParameter={getGlobalParameter}
                        queryTimeLimit={dashboardSettings['queryTimeLimit'] ? dashboardSettings['queryTimeLimit'] : 120}
                        setFields={onFieldsUpdate}
                        title={title}/>
                </CardContent>
                {reportFooter}
            </ReportItemContainer>
        </div>
    );
};


export default NeoCardView;
