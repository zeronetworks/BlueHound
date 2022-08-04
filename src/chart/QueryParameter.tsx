
import React, { useCallback, useEffect } from 'react';
import { ChartProps } from './Chart';
import { debounce } from '@material-ui/core';
import LoadingAnimation from "../component/LoadingAnimation";

/**
 * Renders Neo4j records as their JSON representation.
 */
const NeoQueryParameterChart = (props: ChartProps) => {

    const debouncedQueryCallback = useCallback(
        debounce(props.queryCallback, 250),
        [],
    );

    const debouncedSetGlobalParameter = useCallback(
        debounce(props.setGlobalParameter, 500),
        [],
    );

    function trimRecords(mappedRecords) {
        const recordsLimit = 3;
        let recordsToDisplay : string[] = mappedRecords.slice(0, recordsLimit);
        if (recordsToDisplay.length == recordsLimit) { recordsToDisplay.push("...") }
        return recordsToDisplay
    }

    const records = props.records;
    const query = records[0]["input"] ? records[0]["input"] : undefined;
    const parameter = props.settings && props.settings["parameterName"] ? props.settings["parameterName"] : undefined;

    const currentValue = (props.getGlobalParameter && props.getGlobalParameter(parameter)) ? props.getGlobalParameter(parameter) : "";
    const [extraRecords, setExtraRecords] = React.useState([]);
    const [inputText, setInputText] = React.useState(currentValue);
    const [value, setValue] = React.useState(currentValue);

    const [results, setResults] = React.useState(props.getGlobalParameter(parameter) ? props.getGlobalParameter(parameter)  : ["no data."]);
    const debouncedSetResults = useCallback(
        debounce(setResults, 250),
        [],
    );

    useEffect(() => {
        setResults(["Loading..."])
        debouncedQueryCallback && debouncedQueryCallback(query, { input: currentValue }, setExtraRecords, false);
    }, [query]);

    // In case the components gets (re)loaded with a different/non-existing selected parameter, set the text to the current global parameter value.
    if (query && value != currentValue && currentValue != inputText) {
        setValue(currentValue);
        setInputText(currentValue);
        setExtraRecords([]);
    }
    if ((!query || query.trim().length == 0) && (!results)) {
        return <p style={{ margin: "15px" }}>No selection specified. Open up the report settings and choose a node label and property.</p>
    }

    const settings = (props.settings) ? props.settings : {};
    const parameterName = settings['parameterName'] ? "$" + settings['parameterName'] : "";

    if (extraRecords && extraRecords.length > 0) {
        const mappedRecords = extraRecords.map(r => r["_fields"] && r["_fields"][0] !== null ? r["_fields"][0] : [])
        debouncedSetResults(mappedRecords);
        debouncedSetGlobalParameter(parameter, mappedRecords);
    } else if (extraRecords.length == 0) {
        debouncedSetResults(["No results"]);
    }

    return <>
        <p style={{ margin: "15px" }}>Parameter Name: <b>{parameterName}</b></p>
        <div style={{ overflowY: "auto", marginLeft: "10px", marginRight: "10px", height: "100%" }}>
            {(results[0] == "Loading...") ?
                <LoadingAnimation /> :
                <textarea
                    value={trimRecords(results).join("\n")}
                    readOnly={true}
                    style={{ width: "100%", overflowY: "hidden", scrollbarWidth: "auto", paddingLeft: "10px",
                        background: "none",  overflow: "scroll !important", border: "1px solid lightgray", resize: "none",
                        height: "70px"}}
                />}
        </div>

    </>
}

export default NeoQueryParameterChart;