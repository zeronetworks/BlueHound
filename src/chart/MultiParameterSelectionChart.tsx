
import React, { useCallback, useEffect } from 'react';
import {Cancel} from '@material-ui/icons';
import { ChartProps } from './Chart';
import { CircularProgress, debounce, TextareaAutosize, TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import NeoFieldSelection from '../component/FieldSelection';
import {Button} from "@mui/material";
import CardAddButton from "../card/CardAddButton";
import ParamAutocomplete from "../component/ParamAutocomplete";
import {convertLength} from "@mui/material/styles/cssUtils";

/**
 * Renders Neo4j records as their JSON representation.
 */
const NeoMultiParameterSelectionChart = (props: ChartProps) => {

    useEffect(() => {
        debouncedQueryCallback && debouncedQueryCallback(query, { input: inputText }, setExtraRecords);
    }, [inputText, query]);

    const debouncedQueryCallback = useCallback(
        debounce(props.queryCallback, 250),
        [],
    );

    const debouncedSetGlobalParameter = useCallback(
        debounce(props.setGlobalParameter, 500),
        [],
    );

    const records = props.records;
    const query = records[0]["input"] ? records[0]["input"] : undefined;
    const parameter = props.settings && props.settings["parameterName"] ? props.settings["parameterName"] : undefined;
    const type = props.settings && props.settings["type"] ? props.settings["type"] : undefined;

    const currentValue = (props.getGlobalParameter && props.getGlobalParameter(parameter)) ? props.getGlobalParameter(parameter) : "";
    const [extraRecords, setExtraRecords] = React.useState([]);
    const [inputText, setInputText] = React.useState(currentValue);
    const [value, setValue] = React.useState(currentValue);

    // In case the components gets (re)loaded with a different/non-existing selected parameter, set the text to the current global parameter value.
    if (query && value != currentValue && currentValue != inputText) {
        setValue(currentValue);
        setInputText(currentValue);
        setExtraRecords([]);
    }
    if (!query || query.trim().length == 0) {
        return <p style={{ margin: "15px" }}>No selection specified. Open up the report settings and choose a node label and property.</p>
    }

    if (value && extraRecords.length == 0) {
        debouncedQueryCallback(query, { input: value.toString() }, setExtraRecords);
    }

    const label = props.settings && props.settings["entityType"] ? props.settings["entityType"] : "";
    const property = props.settings && props.settings["propertyType"] ? props.settings["propertyType"] : "";
    const settings = (props.settings) ? props.settings : {};
    const helperText = settings.helperText;
    const clearParameterOnFieldClear = settings.clearParameterOnFieldClear;
    return (
        <Autocomplete
            multiple
            filterSelectedOptions
            id="autocomplete"
            options={extraRecords.map(r => r["_fields"] && r["_fields"][0] !== null ? r["_fields"][0] : "(no data)")}
            getOptionLabel={(option) => option ? option.toString() : ""}
            style={{ width: 300, marginLeft: "15px", marginTop: "5px" }}
            //inputValue={inputText}
            defaultValue={value ? value : []}
            onInputChange={(event, value) => {
                setInputText("" + value);
                debouncedQueryCallback(query, { input: value }, setExtraRecords);
            }}
            getOptionSelected={(option, value) => (option && option.toString()) === (value && value.toString())}
            // value={value ? value.toString() : "" + currentValue}
            onChange={(event, newValue) => {
                setValue(newValue);
                if (newValue && newValue["low"]) {
                    newValue = newValue["low"];
                }
                if (newValue == null && clearParameterOnFieldClear) {
                    props.setGlobalParameter(parameter, undefined);
                } else {
                    props.setGlobalParameter(parameter, newValue);
                }
            }}
            renderInput={(params) => <TextField {...params} InputLabelProps={{ shrink: true }} placeholder="Start typing..." label={helperText ? helperText : label + " " + property} variant="outlined" />}
        />
    )
}

export default NeoMultiParameterSelectionChart;