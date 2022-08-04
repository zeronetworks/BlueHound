import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { SELECTION_TYPES } from '../config/ReportConfig';
import NeoFieldSelection from './FieldSelection';
import { categoricalColorSchemes } from '../config/ColorConfig';

const generateListItem = (label, option) => {
    if ('boolean' === typeof option) {
        return (option ? 'on' : 'off')
    } else {
        if (label == "Color Scheme" || label == "Node Color Scheme") {
            const colors = categoricalColorSchemes[option];
            return (<div>
                {/* <div style={{ width: "100px" }}>{option}:</div> */}
                {colors.map(element => {
                    return <span key={element} style={{ display: "inline-block", background: element, width: "18px", height: "18px" }}></span>
                })}</div>)

        } else {
            return "" + option
        }

    }
}
const ReportSetting = ({ name, value, choices, type, label, defaultValue, disabled = undefined, 
    helperText = undefined, inverted = false, onChange,
style = { width: "100%", marginBottom: "10px", marginRight: "10px", marginLeft: "10px" } }) => {
    switch (type) {
        case SELECTION_TYPES.NUMBER:
            return <div key={label} style={{ width: "100%", paddingRight: "28px" }}>
                <NeoFieldSelection
                    label={label} numeric={true}
                    key={label}
                    value={value}
                    disabled={disabled}
                    helperText={helperText}
                    defaultValue={""}
                    placeholder={"" + defaultValue}
                    style={style}
                    onChange={(val) => onChange(val)} />
            </div>;
        case SELECTION_TYPES.TEXT:
        return <div key={label} style={{ width: "100%", paddingRight: "28px" }}>
            <NeoFieldSelection
                label={label} 
                key={label}
                disabled={disabled}
                helperText={helperText}
                value={value}
                defaultValue={""}
                placeholder={"" + defaultValue}
                style={style}
                onChange={(val) => onChange(val)} />
        </div>;
         case SELECTION_TYPES.DICTIONARY:
            return <div key={label} style={{ width: "100%", paddingRight: "28px" }}>
                <NeoFieldSelection
                    label={label} 
                    key={label}
                    disabled={disabled}
                    helperText={helperText}
                    value={JSON.stringify(value)}
                    defaultValue={""}
                    placeholder={defaultValue ? "" + JSON.stringify(defaultValue) : "{}"}
                    style={style}
                    onChange={(val) => onChange(val)} />
            </div>;
        case SELECTION_TYPES.LIST:
            return <div key={label} style={{ width: "100%", paddingRight: "28px" }}>
                <NeoFieldSelection
                    select
                    label={label}
                    disabled={disabled}
                    helperText={helperText}
                    key={label}
                    value={value}
                    defaultValue={defaultValue}
                    style={style}
                    choices={choices.map((option) => (
                        <MenuItem key={option} value={option}>
                            {generateListItem(label, option)}
                        </MenuItem>
                    ))}
                    onChange={(val) => onChange(val)} />
            </div>
    }
    return <div key={label}></div>;

};

export default ReportSetting;