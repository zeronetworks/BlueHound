import React, { useEffect } from 'react';
import CardContent from '@material-ui/core/CardContent';
import MenuItem from '@material-ui/core/MenuItem';
import { REPORT_TYPES } from '../../config/ReportConfig'
import debounce from 'lodash/debounce';
import { useCallback } from 'react';
import NeoFieldSelection from '../../component/FieldSelection';
import NeoCodeField from '../../component/EditableCodeField';
import { CARD_SIZES } from '../../config/CardConfig';


const NeoCardSettingsContent = ({ query, database, reportSettings, refreshRate, cypherParameters, queryInfo, infoURL, width, height, type,
    onQueryUpdate, onSizeUpdate, onRefreshRateUpdate, onReportSettingUpdate, onCypherParametersUpdate, onQueryInfoUpdate, onInfoURLUpdate, onTypeUpdate }) => {

    // Ensure that we only trigger a text update event after the user has stopped typing.
    const [queryText, setQueryText] = React.useState(query);
    const debouncedQueryUpdate = useCallback(
        debounce(onQueryUpdate, 250),
        [],
    );
    const [refreshRateText, setRefreshRateText] = React.useState(refreshRate);
    const debouncedRefreshRateUpdate = useCallback(
        debounce(onRefreshRateUpdate, 250),
        [],
    );

    const [cypherParametersText, setCypherParametersText] = React.useState(cypherParameters);
    const debouncedCypherParametersUpdate = useCallback(
        debounce(onCypherParametersUpdate, 250),
        [],
    );

    const [queryInfoText, setQueryInfoText] = React.useState(queryInfo);
    const debouncedQueryInfoUpdate = useCallback(
        debounce(onQueryInfoUpdate, 250),
        [],
    );

    const [infoURLText, setInfoURLText] = React.useState(infoURL);
    const debouncedInfoURLUpdate = useCallback(
        debounce(onInfoURLUpdate, 250),
        [],
    );

    useEffect(() => {
        // Reset text to the dashboard state when the page gets reorganized.
        if (query !== queryText) {
            setQueryText(query);
        }
    }, [query])

    useEffect(() => {
        // Reset text to the dashboard state when the page gets reorganized.
        if (cypherParameters !== cypherParametersText) {
            setCypherParametersText((cypherParameters !== undefined) ? cypherParameters : "");
        }
    }, [cypherParameters])

    useEffect(() => {
        // Reset text to the dashboard state when the page gets reorganized.
        if (refreshRate != refreshRateText) {
            setRefreshRateText((refreshRate !== undefined) ? refreshRate : "");
        }
    }, [refreshRate])

    useEffect(() => {
        // Reset text to the dashboard state when the page gets reorganized.
        if (queryInfo != queryInfoText) {
            setQueryInfoText((queryInfo !== undefined) ? queryInfo : "");
        }
    }, [queryInfo])

    useEffect(() => {
        // Reset text to the dashboard state when the page gets reorganized.
        if (infoURL != infoURLText) {
            setInfoURLText((infoURL !== undefined) ? infoURL : "");
        }
    }, [infoURL])


    const SettingsComponent = REPORT_TYPES[type].settingsComponent;
    const settings = REPORT_TYPES[type]["settingsComponent"] ? <SettingsComponent type={type} onReportSettingUpdate={onReportSettingUpdate} settings={reportSettings} database={database} query={query} onQueryUpdate={onQueryUpdate} onRefreshRateUpdate={onRefreshRateUpdate} onCypherParametersUpdate={onCypherParametersUpdate}/> :
    <>
        <NeoCodeField value={queryText}
            language={REPORT_TYPES[type]["inputMode"] ? REPORT_TYPES[type]["inputMode"] : "cypher"}
            onChange={(value) => {
                setQueryText(value);
                debouncedQueryUpdate(value);
            }}
            placeholder={"Enter Cypher here..."}
        />
        <p style={{ color: "grey", fontSize: 12, paddingLeft: "5px", borderBottom: "1px solid lightgrey", borderLeft: "1px solid lightgrey", borderRight: "1px solid lightgrey", marginTop: "0px" }}>{REPORT_TYPES[type].helperText}</p>
    </>;
    return <CardContent style={{ paddingTop: "10px", paddingBottom: "10px" }}>
        <NeoFieldSelection select label={"Type"} value={type}
            onChange={(value) => onTypeUpdate(value)}
            choices={Object.keys(REPORT_TYPES).map((option) => (
                <MenuItem key={option} value={option}>
                    {REPORT_TYPES[option].label}
                </MenuItem>
            ))} />
        <NeoFieldSelection select label={"Size"} value={[width, height]}
            onChange={(value) => onSizeUpdate(value.split(","))}
            choices={CARD_SIZES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))} />
        {REPORT_TYPES[type]["disableCypherParameters"] == undefined ? <NeoFieldSelection label={"Cypher Parameters"} placeholder='{"x": "abc", "y": 5}'
            onChange={(value) => {
                setCypherParametersText(value);
                debouncedCypherParametersUpdate(value);
            }}
            value={cypherParametersText} /> : <></>}
        {REPORT_TYPES[type]["disableRefreshRate"] == undefined ? <NeoFieldSelection placeholder='0 (No Refresh)'
            label="Refresh Rate (sec)" numeric={true} value={refreshRateText}
            onChange={(value) => {
                setRefreshRateText(value);
                debouncedRefreshRateUpdate(value);
            }} /> : <></>}

        <br /><br />
        {/* Allow for overriding the code box with a custom component */}
        {!type.startsWith('ransomulator') ? settings : <></>}

        <NeoFieldSelection placeholder='Query Info' label="Query Info" value={queryInfoText} style={{width: "100%"}}
                            onChange={(value) => {
                                setQueryInfoText(value);
                                debouncedQueryInfoUpdate(value);
                            }} />
        <br /><br />
        <NeoFieldSelection placeholder='Info URL' label="Info URL" value={infoURLText} style={{width: "100%"}}
                            onChange={(value) => {
                                setInfoURLText(value);
                                debouncedInfoURLUpdate(value);
                            }} />

    </CardContent>
};

export default NeoCardSettingsContent;