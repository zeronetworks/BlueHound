import React from 'react';
import { ChartProps } from './Chart';
import { ResponsiveLine } from '@nivo/line';


/**
 * Embeds a LineReport (from Charts) into BlueHound.
 */
const NeoRansomulatorLineChart = (props: ChartProps) => {
    if (props.records == null || props.records.waves == null){
        return <>No data, re-run the report.</>
    }

    const data = props.records.waves.map(record => {
        return {x: record[0], y: record[1].total}
    })

    const lineData = [{id: "ransomulator", data: data}]

    return <ResponsiveLine
        data={lineData}
        margin={{ top: 24, right: 24, bottom: 40, left: 70 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear' }}
        colors={{ scheme: 'set2' }}
        curve={"catmullRom"}
        enableArea={true}
        enablePoints={false}
        enableGridX={false}
        areaOpacity={1}
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={{
            tickSize: 6,
            tickPadding: 12,
            tickRotation: 0
        }}
    />
}

export default NeoRansomulatorLineChart;