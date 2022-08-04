import React from 'react'
import GaugeChart from 'react-gauge-chart'
import { ExtendedChartReportProps } from './VisualizationProps'
import { checkResultKeys, recordToNative } from './Utils'
import { createUUID } from '../../dashboard/DashboardThunks'

export default function GaugeVisualization(props: ExtendedChartReportProps) {
    const { records, first } = props

    if (!first) {
        return <p>Loading data...</p>
    }

    const error = checkResultKeys(first, ['value'])

    if (error !== false) {
        return <p>{error.message}</p>
    }

    const chartId = createUUID();
    let score;
    if (typeof records[0] == 'object') {
        const scoreRecord = records[0]
        score = scoreRecord._fields[scoreRecord._fieldLookup['value']]
    } else {
        score = records[0].get(0);
    }

    if (!score) return <p>Error calculating score</p>
    if (score.low != undefined) score = score.low;
    if (score > 1) score = score / 100; // supporting older versions of Neo4j which don't support round to 2 decimal points

    return <div>
        {typeof(score) == "number" ? <GaugeChart
            id={chartId}
            percent={score}
            arcsLength={[0.15, 0.55, 0.3]}
            arcPadding={0.02}
            colors={['#5BE12C', '#F5CD19', '#EA4228']}
            textColor={"black"}
            style={{width: "70%", margin: "0 auto"}}
            animDelay={0}
            animateDuration={2000}
    ></GaugeChart> : <></>}
    </div>
}