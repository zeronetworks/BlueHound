import React from 'react';
import { ChartProps } from './Chart';
import PieVisualization from './visualizations/PieVisualization';


/**
 * Embeds a PieChart (from Charts) into BlueHound.
 */
const NeoPieChart = (props: ChartProps) => {
    if (props.records == null || props.records.length == 0 || props.records[0].keys == null) {
        return <>No data, re-run the report.</>
    }
    return <PieVisualization records={props.records} settings={props.settings}
        first={(props.records) ? props.records[0] : undefined}
    />
}

export default NeoPieChart;