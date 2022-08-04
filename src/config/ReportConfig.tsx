
import React from 'react';
import NeoCardSettingsContentPropertySelect from '../card/settings/custom/CardSettingsContentPropertySelect';
import NeoCardSettingsContentQueryParameter from '../card/settings/custom/CardSettingsContentQueryParameter';
import NeoBarChart from '../chart/BarChart';
import NeoGaugeChart from "../chart/GaugeChart";
import NeoGraphChart from '../chart/GraphChart';
import NeoBloodHoundChart from '../chart/BloodHoundChart';
import NeoIFrameChart from '../chart/IFrameChart';
import NeoJSONChart from '../chart/JSONChart';
import NeoLineChart from '../chart/LineChart';
import NeoMapChart from '../chart/MapChart';
import NeoMarkdownChart from '../chart/MarkdownChart';
import NeoParameterSelectionChart from '../chart/ParameterSelectionChart';
import NeoPieChart from '../chart/PieChart';
import NeoSingleValueChart from '../chart/SingleValueChart';
import NeoTableChart from '../chart/TableChart';
import NeoMultiParameterSelectionChart from "../chart/MultiParameterSelectionChart";
import NeoConfigurationChart from "../chart/ConfigurationChart";
import NeoQueryParameterChart from '../chart/QueryParameter';
import NeoRansomulatorChart from "../chart/RansomulatorChart";
import NeoRansomulatorBarChart from "../chart/RansomulatorBarChart";
import NeoRansomulatorLineChart from "../chart/RansomulatorLineChart";
import {RansomulatorType} from "../report/RansomulatorRunner";

export enum SELECTION_TYPES {
    NUMBER,
    NUMBER_OR_DATETIME,
    LIST,
    TEXT,
    DICTIONARY,
    NODE_PROPERTIES
};

// Use Neo4j 4.0 subqueries to limit the number of rows returned by overriding the query.
export const HARD_ROW_LIMITING = false;

// A small delay (for UX reasons) between when to run the query after saving a report.
export const RUN_QUERY_DELAY_MS = 300;

// The default number of rows to process in a visualization.
export const DEFAULT_ROW_LIMIT = 100;

// A dictionary of available reports (visualizations).
export const REPORT_TYPES = {
    "table": {
        label: "Table",
        helperText: "A table will contain all returned data.",
        component: NeoTableChart,
        maxRecords: 1000,
        settings: {
            "transposed": {
                label: "Transpose Rows & Columns",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "columnWidths": {
                label: "Relative Column Sizes",
                type: SELECTION_TYPES.TEXT,
                default: "[1, 1, 1, ...]"
            }
        }
    },
    "graph": {
        label: "Graph",
        helperText: "A graph visualization will draw all returned nodes, relationships and paths.",
        selection: {
            "properties": {
                label: "Node Properties",
                type: SELECTION_TYPES.NODE_PROPERTIES
            }
        },
        useNodePropsAsFields: true,
        autoAssignSelectedProperties: true,
        component: NeoGraphChart,
        maxRecords: 1000,
        withoutFooter: true,
        settings: {
            "nodeColorScheme": {
                label: "Node Color Scheme",
                type: SELECTION_TYPES.LIST,
                values: ["bluehound", "nivo", "category10", "accent", "dark2", "paired", "pastel1", "pastel2", "set1", "set2", "set3"],
                default: "bluehound"
            },
            "nodeLabelColor": {
                label: "Node Label Color",
                type: SELECTION_TYPES.TEXT,
                default: "black"
            },
            "nodeLabelFontSize": {
                label: "Node Label Font Size",
                type: SELECTION_TYPES.NUMBER,
                default: 3.5
            },
            "defaultNodeSize": {
                label: "Node Size",
                type: SELECTION_TYPES.NUMBER,
                default: 2
            },
            "nodeSizeProp": {
                label: "Node Size Property",
                type: SELECTION_TYPES.TEXT,
                default: "size"
            },
            "nodeColorProp": {
                label: "Node Color Property",
                type: SELECTION_TYPES.TEXT,
                default: "color"
            },
            "defaultRelColor": {
                label: "Relationship Color",
                type: SELECTION_TYPES.TEXT,
                default: "#909090"
            },
            "defaultRelWidth": {
                label: "Relationship Width",
                type: SELECTION_TYPES.NUMBER,
                default: 1
            },
            "relLabelColor": {
                label: "Relationship Label Color",
                type: SELECTION_TYPES.TEXT,
                default: "#909090"
            },
            "relLabelFontSize": {
                label: "Relationship Label Font Size",
                type: SELECTION_TYPES.NUMBER,
                default: 4
            },
            "relColorProp": {
                label: "Relationship Color Property",
                type: SELECTION_TYPES.TEXT,
                default: "color"
            },
            "relWidthProp": {
                label: "Relationship Width Property",
                type: SELECTION_TYPES.TEXT,
                default: "width"
            },
            "relationshipParticles": {
                label: "Animated particles on Relationships",
                type: SELECTION_TYPES.LIST,
                default: false,
                values: [false, true]
            },
            "backgroundColor": {
                label: "Background Color",
                type: SELECTION_TYPES.TEXT,
                default: "#fafafa"
            },
            "layout": {
                label: "Graph Layout (experimental)",
                type: SELECTION_TYPES.LIST,
                values: ["force-directed", "tree", "tree-horizontal", "radial"],
                default: "force-directed"
            },
            "showPropertiesOnHover": {
                label: "Show pop-up on Hover",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: true
            },
            "showPropertiesOnClick": {
                label: "Show properties on Click",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: true
            },
            "fixNodeAfterDrag": {
                label: "Fix node positions after Drag",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: true
            },
            "hideSelections": {
                label: "Hide Property Selection",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: true
            },
        }
    },
    "bar": {
        label: "Bar Chart",
        component: NeoBarChart,
        helperText: <div>A bar chart expects two fields: a <code>category</code> and a <code>value</code>.</div>,
        selection: {
            "index": {
                label: "Category",
                type: SELECTION_TYPES.TEXT
            },
            "value": {
                label: "Value",
                type: SELECTION_TYPES.NUMBER,
                key: true
            },
            "key": {
                label: "Group",
                type: SELECTION_TYPES.TEXT,
                optional: true
            }
        },
        useRecordMapper: true,
        maxRecords: 100,
        withoutFooter: true,
        settings: {
            "legend": {
                label: "Show Legend",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "showOptionalSelections": {
                label: "Grouping",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "valueScale": {
                label: "Value Scale",
                type: SELECTION_TYPES.LIST,
                values: ["linear", "symlog"],
                default: "linear"
            },
            "minValue": {
                label: "Min Value",
                type: SELECTION_TYPES.NUMBER,
                default: "auto"
            },
            "maxValue": {
                label: "Max Value",
                type: SELECTION_TYPES.NUMBER,
                default: "auto"
            },
            "groupMode": {
                label: "Group Mode",
                type: SELECTION_TYPES.LIST,
                values: ["grouped", "stacked"],
                default: "stacked"
            },
            "layout": {
                label: "Layout",
                type: SELECTION_TYPES.LIST,
                values: ["horizontal", "vertical"],
                default: "vertical"
            },
            "colors": {
                label: "Color Scheme",
                type: SELECTION_TYPES.LIST,
                values: ["nivo", "category10", "accent", "dark2", "paired", "pastel1", "pastel2", "set1", "set2", "set3"],
                default: "set2"
            },
            "barValues": {
                label: "Show Value on Bars",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "labelRotation": {
                label: "Label Rotation (degrees)",
                type: SELECTION_TYPES.NUMBER,
                default: 45
            },
            "marginLeft": {
                label: "Margin Left (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 50
            },
            "marginRight": {
                label: "Margin Right (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 24
            },
            "marginTop": {
                label: "Margin Top (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 24
            },
            "marginBottom": {
                label: "Margin Bottom (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 40
            },
            "legendWidth": {
                label: "Legend Width (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 128
            },
            "hideSelections": {
                label: "Hide Property Selection",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "enableGridY": {
                label: "Enable Y Grid",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: true
            },
            "animate": {
                label: "Animate",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "borderWidth": {
                label: "Border Width",
                type: SELECTION_TYPES.NUMBER,
                default: 0
            },
            "borderRadius": {
                label: "Border Radius",
                type: SELECTION_TYPES.NUMBER,
                default: 0
            },
            "axisBottom": {
                label: "Axis Bottom",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: true
            },
            "scoreColors": {
                label: "Color by Score",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
        }
    },
    "gauge": {
        label: "Gauge Chart",
        component: NeoGaugeChart,
        helperText: <div>A gauge chart expects a single <code>value</code>.</div>,
        selection: {
            "value": {
                label: "Value",
                type: SELECTION_TYPES.NUMBER,
                key: true
            }
        },
        useRecordMapper: false,
        maxRecords: 1,
        withoutFooter: true,
        settings: {}
    },
    "pie": {
        label: "Pie Chart",
        component: NeoPieChart,
        helperText: <div>A pie chart expects two fields: a <code>category</code> and a <code>value</code>.</div>,
        selection: {
            "index": {
                label: "Category",
                type: SELECTION_TYPES.TEXT
            },
            "value": {
                label: "Value",
                type: SELECTION_TYPES.NUMBER,
                key: true
            },
            "key": {
                label: "Group",
                type: SELECTION_TYPES.TEXT,
                optional: true
            }
        },
        useRecordMapper: true,
        maxRecords: 100,
        settings: {
            "legend": {
                label: "Show Legend",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "sortByValue": {
                label: "Auto-sort slices by value",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "enableArcLabels": {
                label: "Show Values in slices",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: true
            },
            "enableArcLinkLabels": {
                label: "Show categories next to slices",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: true
            },
            "interactive": {
                label: "Enable interactivity",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: true
            },
            "colors": {
                label: "Color Scheme",
                type: SELECTION_TYPES.LIST,
                values: ["nivo", "category10", "accent", "dark2", "paired", "pastel1", "pastel2", "set1", "set2", "set3"],
                default: "set2"
            },
            "innerRadius": {
                label: "Pie Inner Radius (between 0 and 1)",
                type: SELECTION_TYPES.NUMBER,
                default: 0
            },
            "padAngle": {
                label: "Slice padding angle (degrees)",
                type: SELECTION_TYPES.NUMBER,
                default: 0
            },
            "borderWidth": {
                label: "Slice border width (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 0
            },
            "marginLeft": {
                label: "Margin Left (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 24
            },
            "marginRight": {
                label: "Margin Right (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 24
            },
            "marginTop": {
                label: "Margin Top (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 24
            },
            "marginBottom": {
                label: "Margin Bottom (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 40
            }
        }
    },
    "line": {
        label: "Line Chart",
        component: NeoLineChart,
        helperText: <div>A line chart expects two fields: an <code>x</code> value and a <code>y</code> value. Values are automatically selected from your query results.</div>,
        selection: {
            "x": {
                label: "X-value",
                type: SELECTION_TYPES.NUMBER
            },
            "value": {
                label: "Y-value",
                type: SELECTION_TYPES.NUMBER,
                key: true,
                multiple: true
            },
        },
        maxRecords: 100,
        useRecordMapper: true,
        settings: {
            "legend": {
                label: "Show Legend",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "colors": {
                label: "Color Scheme",
                type: SELECTION_TYPES.LIST,
                values: ["nivo", "category10", "accent", "dark2", "paired", "pastel1", "pastel2", "set1", "set2", "set3"],
                default: "set2"
            },
            "xScale": {
                label: "X Scale",
                type: SELECTION_TYPES.LIST,
                values: ["linear", "log"],
                default: "linear"
            },
            "yScale": {
                label: "Y Scale",
                type: SELECTION_TYPES.LIST,
                values: ["linear", "log"],
                default: "linear"
            },
            "minXValue": {
                label: "Min X Value",
                type: SELECTION_TYPES.NUMBER,
                default: "auto"
            },
            "maxXValue": {
                label: "Max X Value",
                type: SELECTION_TYPES.NUMBER,
                default: "auto"
            },
            "minYValue": {
                label: "Min Y Value",
                type: SELECTION_TYPES.NUMBER,
                default: "auto"
            },
            "maxYValue": {
                label: "Max Y Value",
                type: SELECTION_TYPES.NUMBER,
                default: "auto"
            },
            "curve": {
                label: "Line Smoothing",
                type: SELECTION_TYPES.LIST,
                values: ["linear", "basis", "cardinal", "step"],
                default: "linear"
            },
            "showGrid": {
                label: "Show Grid",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: true
            },
            "pointSize": {
                label: "Point Radius (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 10
            },
            "lineWidth": {
                label: "Line Width (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 2
            },
            "marginLeft": {
                label: "Margin Left (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 50
            },
            "marginRight": {
                label: "Margin Right (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 24
            },
            "marginTop": {
                label: "Margin Top (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 24
            },
            "marginBottom": {
                label: "Margin Bottom (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 40
            },
            "legendWidth": {
                label: "Legend Label Width (px)",
                type: SELECTION_TYPES.NUMBER,
                default: 100
            },
            "hideSelections": {
                label: "Hide Property Selection",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
        }
    },
    "map": {
        label: "Map",
        helperText: "A map will draw all nodes and relationships with spatial properties.",
        selection: {
            "properties": {
                label: "Node Properties",
                type: SELECTION_TYPES.NODE_PROPERTIES
            }
        },
        useNodePropsAsFields: true,
        component: NeoMapChart,
        maxRecords: 1000,
        settings: {
            "nodeColorScheme": {
                label: "Node Color Scheme",
                type: SELECTION_TYPES.LIST,
                values: ["bluehound", "nivo", "category10", "accent", "dark2", "paired", "pastel1", "pastel2", "set1", "set2", "set3"],
                default: "bluehound"
            },
            "defaultNodeSize": {
                label: "Node Marker Size",
                type: SELECTION_TYPES.LIST,
                values: ['small', 'medium', 'large'],
                default: "large"
            },
            "nodeColorProp": {
                label: "Node Color Property",
                type: SELECTION_TYPES.TEXT,
                default: "color"
            },
            "defaultRelColor": {
                label: "Relationship Color",
                type: SELECTION_TYPES.TEXT,
                default: "#666"
            },
            "defaultRelWidth": {
                label: "Relationship Width",
                type: SELECTION_TYPES.NUMBER,
                default: 3.5
            },
            "relColorProp": {
                label: "Relationship Color Property",
                type: SELECTION_TYPES.TEXT,
                default: "color"
            },
            "relWidthProp": {
                label: "Relationship Width Property",
                type: SELECTION_TYPES.TEXT,
                default: "width"
            },
            "hideSelections": {
                label: "Hide Property Selection",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            }
        }
    },
    "value": {
        label: "Single Value",
        helperText: "This report will show only the first value of the first row returned.",
        component: NeoSingleValueChart,
        maxRecords: 1,
        settings: {
            "fontSize": {
                label: "Font Size",
                type: SELECTION_TYPES.NUMBER,
                default: 32
            },
            "color": {
                label: "Color",
                type: SELECTION_TYPES.TEXT,
                default: "rgba(0, 0, 0, 0.87)"
            },
            "textAlign": {
                label: "Text Align",
                type: SELECTION_TYPES.LIST,
                values: ["left", "center", "right"],
                default: "left"
            },
            "marginTop": {
                label: "Margin Top (px)", 
                type: SELECTION_TYPES.NUMBER,
                default: 0
            },
        }
    },
    "json": {
        label: "Raw JSON",
        helperText: "This report will render the raw data returned by Neo4j.",
        component: NeoJSONChart,
        allowScrolling: true,
        maxRecords: 500,
        settings: {}
    },
    "select": {
        label: "Parameter Select",
        helperText: "This report will let users interactively select Cypher parameters that are available globally, in all reports. A parameter can either be a node property, relationship property, or a free text field.",
        component: NeoParameterSelectionChart,
        settingsComponent: NeoCardSettingsContentPropertySelect,
        disableRefreshRate: true,
        disableCypherParameters: true,
        textOnly: true,
        maxRecords: 5,
        settings: {
            "clearParameterOnFieldClear": {
                label: "Clear Parameter on Field Reset",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "manualPropertyNameSpecification": {
                label: "Enable Manual Label/Property Name Specification",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "helperText": {
                label: "Helper Text (Override)",
                type: SELECTION_TYPES.TEXT,
                default: "Enter a custom helper text here..."
            },
        }
    },
    "multiselect": {
        label: "Multi Param Select",
        helperText: "This report will let users interactively select Cypher parameters that are available globally, in all reports. A parameter can either be a node property, relationship property, or a free text field.",
        component: NeoMultiParameterSelectionChart,
        settingsComponent: NeoCardSettingsContentPropertySelect,
        disableRefreshRate: true,
        disableCypherParameters: true,
        textOnly: true,
        maxRecords: 5,
        settings: {
            "clearParameterOnFieldClear": {
                label: "Clear Parameter on Field Reset",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "manualPropertyNameSpecification": {
                label: "Enable Manual Label/Property Name Specification",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "helperText": {
                label: "Helper Text (Override)",
                type: SELECTION_TYPES.TEXT,
                default: "Enter a custom helper text here..."
            },
        }
    },
    "query": {
        label: "Query Parameter",
        helperText: "This report will let users interactively select Cypher parameters that are available globally, in all reports. A parameter can either be a node property, relationship property, or a free text field.",
        useNodePropsAsFields: true,
        autoAssignSelectedProperties: true,
        component: NeoQueryParameterChart,
        settingsComponent: NeoCardSettingsContentQueryParameter,
        textOnly: true,
        maxRecords: 5,
        settings: {
            "clearParameterOnFieldClear": {
                label: "Clear Parameter on Field Reset",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "manualPropertyNameSpecification": {
                label: "Enable Manual Label/Property Name Specification",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "helperText": {
                label: "Helper Text (Override)",
                type: SELECTION_TYPES.TEXT,
                default: "Enter a custom helper text here..."
            },
        }
    },
    /*"configuration": {
        label: "Configuration",
        component: NeoConfigurationChart,
        settingsComponent: NeoCardSettingsContentPropertySelect,
        disableRefreshRate: true,
        disableCypherParameters: true,
        textOnly: true,
        maxRecords: 5,
        settings: {
            "clearParameterOnFieldClear": {
                label: "Clear Parameter on Field Reset",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "manualPropertyNameSpecification": {
                label: "Enable Manual Label/Property Name Specification",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            },
            "helperText": {
                label: "Helper Text (Override)",
                type: SELECTION_TYPES.TEXT,
                default: "Enter a custom helper text here..."
            },
        }
    },*/
    "iframe": {
        label: "iFrame",
        helperText: "iFrame reports let you embed external webpages into your dashboard. Enter an URL in the query box above to embed it as an iFrame.",
        textOnly: true, // this makes sure that no query is executed, input of the report gets passed directly to the renderer.
        component: NeoIFrameChart,
        inputMode: "url",
        maxRecords: 1,
        allowScrolling: true,
        settings: {
            "passGlobalParameters": {
                label: "Pass global variables to iFrame URL",
                type: SELECTION_TYPES.LIST,
                values: [true, false],
                default: false
            }
        }
    },
    "text": {
        label: "Markdown",
        helperText: "Markdown text specified above will be rendered in the report.",
        component: NeoMarkdownChart,
        inputMode: "markdown",
        textOnly: true, // this makes sure that no query is executed, input of the report gets passed directly to the renderer.
        maxRecords: 1,
        allowScrolling: true,
        settings: {}
    },
    "ransomulator": {
        label: "Ransomulator",
        helperText: "Ransomware simulator.",
        component: NeoRansomulatorChart,
        textOnly: true,
        settings: {
            "type": {
                label: "Type of lateral movement to simulate",
                type: SELECTION_TYPES.LIST,
                values: [RansomulatorType.Practical, RansomulatorType.Logical, RansomulatorType.NetOnly],
                default: RansomulatorType.Logical
            },
            "maxWaves": {
                label: "Max Waves",
                type: SELECTION_TYPES.NUMBER,
                default: 3
            },
        }
    },
    "ransomulator_bar": {
        label: "Ransomulator Bar",
        helperText: "Ransomulator bar chart.",
        component: NeoRansomulatorBarChart,
        textOnly: true,
        settings: {
            "type": {
                label: "Type of lateral movement to simulate",
                type: SELECTION_TYPES.LIST,
                values: [RansomulatorType.Practical, RansomulatorType.Logical, RansomulatorType.NetOnly],
                default: RansomulatorType.Logical
            },
            "maxWaves": {
                label: "Max Waves",
                type: SELECTION_TYPES.NUMBER,
                default: 3
            },
        }
    },
    "ransomulator_line": {
        label: "Ransomulator Line",
        helperText: "Ransomulator line chart.",
        component: NeoRansomulatorLineChart,
        textOnly: true,
        settings: {
            "type": {
                label: "Type of lateral movement to simulate",
                type: SELECTION_TYPES.LIST,
                values: [RansomulatorType.Practical, RansomulatorType.Logical, RansomulatorType.NetOnly],
                default: RansomulatorType.Logical
            },
            "maxWaves": {
                label: "Max Waves",
                type: SELECTION_TYPES.NUMBER,
                default: 3
            },
        }
    },
}

// Default node labels to display when rendering a node in a graph visualization.
export const DEFAULT_NODE_LABELS = [
    "name", "title", "label", "id", "uid", "(label)"
]

// Default node labels to display when rendering a node in a graph visualization.
export const DEFAULT_NODE_LABEL_BLANK = "(no label)"