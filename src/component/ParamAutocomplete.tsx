import {CircularProgress, TextareaAutosize} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import React from 'react';
import NeoFieldSelection from "./FieldSelection";
import Autocomplete from "@material-ui/lab/Autocomplete";

const ParamAutocomplete = ({ helperText = "", label = "" , property="",
                               currentValue,clearParameterOnFieldClear,
                               debouncedSetGlobalParameter,parameter,
                               extraRecords,inputText,setInputText,
                               debouncedQueryCallback,query,setExtraRecords,
                               setGlobalParameter}) => {

    const [value, setValue] = React.useState(currentValue);
    return
            {type == "Free Text" ?
            <>
                <NeoFieldSelection
                    key={"freetext"}
                    label={helperText ? helperText : label + " " + property}
                    defaultValue={""}
                    value={value}
                    variant="outlined"
                    placeholder={"Enter text here..."}
                    style={{ width: 300, marginLeft: "15px", marginTop: "5px" }}
                    onChange={(newValue) => {
                        setValue(newValue);
                        if (newValue == null && clearParameterOnFieldClear) {
                            debouncedSetGlobalParameter(parameter, undefined);
                        } else {
                            debouncedSetGlobalParameter(parameter, newValue);
                        }
                    }}
                />
                {value !== currentValue ? <CircularProgress size={26} style={{marginTop: "20px", marginLeft: "5px"}} /> : <></>}
            </>
            :
            <Autocomplete
                id="autocomplete"
                options={extraRecords.map(r => r["_fields"] && r["_fields"][0] !== null ? r["_fields"][0] : "(no data)")}
                getOptionLabel={(option) => option ? option.toString() : ""}
                style={{ width: 300, marginLeft: "15px", marginTop: "5px" }}
                inputValue={inputText}
                onInputChange={(event, value) => {
                    setInputText("" + value);
                    debouncedQueryCallback(query, { input: value }, setExtraRecords);
                }}
                getOptionSelected={(option, value) => (option && option.toString()) === (value && value.toString())}
                value={value ? value.toString() : "" + currentValue}
                onChange={(event, newValue) => {
                    setValue(newValue);
                    if (newValue && newValue["low"]) {
                        newValue = newValue["low"];
                    }
                    if (newValue == null && clearParameterOnFieldClear) {
                        setGlobalParameter(parameter, undefined);
                    } else {
                        setGlobalParameter(parameter, newValue);
                    }
                }}
                renderInput={(params) => <TextField {...params} InputLabelProps={{ shrink: true }} placeholder="Start typing..." label={helperText ? helperText : label + " " + property} variant="outlined" />}
            />}
};

export default ParamAutocomplete;