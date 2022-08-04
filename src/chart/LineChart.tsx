import React from 'react';
import { ChartProps } from './Chart';
import LineVisualization from './visualizations/LineVisualization';


/**
 * Embeds a LineReport (from Charts) into BlueHound.
 */
const NeoLineChart = (props: ChartProps) => {
    if (props.records == null || props.records.length == 0 || props.records[0].keys == null) {
        return <>No data, re-run the report.</>
    }
    // Wrapping this report ensures a refresh on a switch of fullscreen mode.
    return <div style={{ width: "100%", height: "100%" }} key={props.fullscreen}>
        <LineVisualization settings={props.settings} records={props.records} first={(props.records) ? props.records[0] : null}
        /></div>
}

export default NeoLineChart;