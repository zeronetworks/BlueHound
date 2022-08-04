import React, { useEffect } from 'react';
import { REPORT_TYPES } from '../../config/ReportConfig'
import debounce from 'lodash/debounce';
import { useCallback } from 'react';
import { FormControlLabel, FormGroup, Switch } from '@material-ui/core';
import ReportSetting from '../../component/ReportSetting';

const update = (state, mutations) =>
    Object.assign({}, state, mutations)




const NeoCardSettingsFooter = ({ type, reportSettings, reportSettingsOpen, onToggleReportSettings, onReportSettingUpdate }) => {

    const [reportSettingsText, setReportSettingsText] = React.useState(reportSettings);
    const debouncedReportSettingUpdate = useCallback(
        debounce(onReportSettingUpdate, 250),
        [],
    );

    const updateSpecificReportSetting = (field: string, value: any) => {
        const entry = {}
        entry[field] = value;
        setReportSettingsText(update(reportSettingsText, entry));
        debouncedReportSettingUpdate(field, value);
    };

    useEffect(() => {
        // Reset text to the dashboard state when the page gets reorganized.
        setReportSettingsText(reportSettings);
    }, [JSON.stringify(reportSettings)])

    const settings = REPORT_TYPES[type]["settings"];

    // If there are no advanced settings, render nothing.
    if (Object.keys(settings).length == 0) {
        return <div></div>
    }

    // Else, build the advanced settings view.
    const advancedReportSettings = <div style={{ marginLeft: "5px" }}>
        {Object.keys(settings).map(setting =>
            <ReportSetting key={setting} name={setting}
                value={reportSettingsText[setting]}
                type={settings[setting]["type"]}
                label={settings[setting]["label"]}
                defaultValue={settings[setting]["default"]}
                choices={settings[setting]["values"]}
                onChange={(e) => updateSpecificReportSetting(setting, e)}
            />
        )}
    </div>

    return <FormGroup style={{ borderTop: "1px dashed lightgrey", background: reportSettingsOpen ? "#f6f6f6" : "inherit", maxWidth: "100%" }}>
        <FormControlLabel style={{ marginLeft: "5px", marginBottom: "10px" }}
            control={<Switch
                checked={reportSettingsOpen} onChange={onToggleReportSettings} color="default" />}
            labelPlacement="end"
            label={<div style={{ fontSize: "12px", color: "grey" }}>Show advanced settings</div>} />
        {reportSettingsOpen ? advancedReportSettings : <div></div>}
    </FormGroup>

};

export default NeoCardSettingsFooter;