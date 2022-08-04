import React from 'react';
// import BarReport from "@graphapps/charts/dist/components/reports/bar";
import { ChartProps } from './Chart';
import { ResponsiveBar } from '@nivo/bar'


/**
 * Embeds a BarReport (from Charts) into BlueHound.
 */
const NeoRansomulatorBarChart = (props: ChartProps) => {
    if (props.records == null || props.records.waves == null){
        return <>No data, re-run the report.</>
    }

    const data = props.records.waves.slice(0, 5).map(record => {
        return {computer: record[0], total: record[1].total}
    })

    return <ResponsiveBar
        data={data}
        keys={['total']}
        indexBy='computer'
        margin={{ top: 24, right: 24, bottom: 40, left: 50 }}
        padding={0.3}
        colors={{ scheme: 'set2' }}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 45,
        }}
    />
}

export default NeoRansomulatorBarChart;