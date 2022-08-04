import { SELECTION_TYPES } from "./ReportConfig";

export const DASHBOARD_SETTINGS = {
    /*"editable": {
        label: "Editable",
        type: SELECTION_TYPES.LIST,
        values: [true, false],
        default: true,
        helperText: "This controls whether users can edit your dashboard. Disable this to turn the dashboard into presentation mode."
    },
    "fullscreenEnabled": {
        label: "Enable Fullscreen Report Views",
        type: SELECTION_TYPES.LIST,
        values: [true, false],
        default: true,
        helperText: "Enables a 'fullscreen view' button for each report, letting users expand a visualization."
    },*/
    "queryTimeLimit": {
        label: "Maximum Query Time (seconds)",
        type: SELECTION_TYPES.NUMBER,
        default: 120,
        helperText: "The maximum time a report is allowed to run before automatically aborted."
    },
    "queryRowLimit": {
        label: "Query Row Limit",
        type: SELECTION_TYPES.NUMBER,
        default: 1000,
        helperText: "Limit the results set size."
    },
    /*"pagenumber": {
        label: "Page Number",
        type: SELECTION_TYPES.NUMBER,
        disabled: true,
        helperText: "This is the number of the currently selected page."
    },
    "parameters": {
        label: "Global Parameters",
        type: SELECTION_TYPES.DICTIONARY,
        disabled: true,
        helperText: "These are the query parameters shared across all reports. You can set these using a 'property select' report."
    }*/
}