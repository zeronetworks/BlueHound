import React, { useEffect } from 'react';
import CardContent from '@material-ui/core/CardContent';
import MenuItem from '@material-ui/core/MenuItem';
import { REPORT_TYPES } from '../../../config/ReportConfig'
import debounce from 'lodash/debounce';
import { useCallback } from 'react';
import NeoFieldSelection from '../../../component/FieldSelection';
import NeoCodeField from '../../../component/EditableCodeField';
import { CARD_SIZES } from '../../../config/CardConfig';
import NeoStaticCodeField from "../../../component/StaticCodeField";


const NeoCardSettingsContentQueryParameter = ({ query, database, settings, refreshRate, cypherParameters, width, height, type,
                                                  onQueryUpdate, onSizeUpdate, onRefreshRateUpdate, onReportSettingUpdate, onCypherParametersUpdate, onTypeUpdate }) => {

    const [queryText, setQueryText] = React.useState(query);
    const debouncedQueryUpdate = useCallback(
        debounce(onQueryUpdate, 250),
        [],
    );

    const [parameterText, setParameterText] = React.useState(settings['parameterName']);
    const debouncedReportSettingUpdate = useCallback(
        debounce(onReportSettingUpdate, 250),
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

    return <>
        <NeoFieldSelection label={"Parameter Name"} placeholder='parameter'
                           onChange={(value) => {
                               setParameterText(value);
                               debouncedReportSettingUpdate("parameterName", value);
                           }}
                           adornment={"$"}
                           value={parameterText} />
        <NeoCodeField value={query}
                      language={"cypher"}
                      onChange={(value) => {
                          setQueryText(value);
                          debouncedQueryUpdate(value);
                      }}
                      placeholder={"Enter Cypher here..."}
        />
        <p style={{ color: "grey", fontSize: 12, paddingLeft: "5px", borderBottom: "1px solid lightgrey", borderLeft: "1px solid lightgrey", borderRight: "1px solid lightgrey", marginTop: "0px" }}>{REPORT_TYPES[type].helperText}</p>
    </>
};

export default NeoCardSettingsContentQueryParameter;