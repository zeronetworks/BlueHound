import React from 'react';
import { ChartProps } from './Chart';
import GaugeVisualization from './visualizations/GaugeVisualization';


const NeoGaugeChart = (props: ChartProps) => {
    if (props.records == null || props.records.length == 0 || props.records[0].keys == null){
        return <>No data, re-run the report.</>
    }
    return <GaugeVisualization records={props.records} settings={props.settings} first={(props.records) ? props.records[0] : null}
        layout={(props.settings && props.settings.layout) ? props.settings.layout : "vertical"}
        stacked={(props.settings && props.settings.groupMode && props.settings.groupMode == "grouped") ? undefined : true}
    />
}

export default NeoGaugeChart;