import React from 'react'
import { linearGradientDef } from '@nivo/core'
import { ResponsiveBar } from '@nivo/bar'
import { ChartReportProps, ExtendedChartReportProps } from './VisualizationProps'
import { checkResultKeys, recordToNative } from './Utils'
import { createUUID } from '../../dashboard/DashboardThunks'
import {isInt} from 'neo4j-driver-core/lib/integer.js'
import {int} from 'neo4j-driver-core/lib/integer.js'

export default function BarVisualization(props: ExtendedChartReportProps) {
    const { records, first } = props

    if (!first) {
        return <p>Loading data...</p>
    }

    const error = checkResultKeys(first, ['index', 'key', 'value'])

    if (error !== false) {
        return <p>{error.message}</p>
    }

    const keys: string[] = []

    const data: Record<string, any>[] = records.reduce((data: Record<string, any>[], row: Record<string, any>) => {
        let index;
        let idx;
        let key;
        let value;
        if (typeof row == 'object') {
            index = row._fields[row._fieldLookup["index"]];
            idx = data.findIndex(item => { item.index === index });
            key = row._fields[row._fieldLookup["key"]];
            value = row._fields[row._fieldLookup["value"]];
            if (!isInt(value)) {
                value = int(value);
            }
        } else {
            index = recordToNative(row.get('index'))
            idx = data.findIndex(item => item.index === index)

            key = recordToNative(row.get('key'))
            value = recordToNative(row.get('value'))
        }

        if (!keys.includes(key)) {
            keys.push(key)
        }

        if (idx > -1) {
            data[idx][key] = value
        }
        else {
            data.push({ index, [key]: value })
        }

        return data
    }, [])
        .map(row => {
            keys.forEach(key => {
                if (!row.hasOwnProperty(key)) {
                    row[key] = 0
                }
            })

            return row
        })

    const getColorByScore = (() => {
        try {
            const score = data[0][Object.keys(data[0])[1]];
            if (score > 75) {
                return ["#49de3f", "#29b61f"] // Green
            } else if (score > 50) {
                return ["#faf047", "#e4b400"] // Yellow
            } else if (score > 25) {
                return ["#ffb647", "#f28511"] // Orange
            } else {
                return ["#ff0000", "#ad0303"] // Red
            }
        } catch (error) {
            return ["#49de3f", "#29b61f"]; // Green
        }
    })

    const settings = (props.settings) ? props.settings : {};
    const legendWidth = (settings["legendWidth"]) ? settings["legendWidth"] : 128;
    const marginRight = (settings["marginRight"]) ? settings["marginRight"] : 24;
    const marginLeft = (settings["marginLeft"]) ? settings["marginLeft"] : 50;
    const marginTop = (settings["marginTop"]) ? settings["marginTop"] : 24;
    const marginBottom = (settings["marginBottom"]) ? settings["marginBottom"] : 40;
    const legend = (settings["legend"]) ? settings["legend"] : false;
    const labelRotation = (settings["labelRotation"] != undefined) ? settings["labelRotation"] : 45;
    const labelSkipSize = (settings["barValues"]) ? 1 : 2000;
    const colorScheme = (settings["colors"]) ? settings["colors"] : 'set2';
    const valueScale = (settings["valueScale"]) ? settings["valueScale"] : 'linear';
    const minValue = (settings["minValue"]) ? settings["minValue"] : 'auto';
    const maxValue = (settings["maxValue"]) ? settings["maxValue"] : 'auto';
    const enableGridY = (settings["enableGridY"] != undefined) ? settings["enableGridY"] : true;
    const animate = (settings["animate"] != undefined) ? settings["animate"] : false;
    const borderWidth = (settings["borderWidth"] != undefined) ? settings["borderWidth"] : 0;
    const borderRadius = (settings["borderRadius"] != undefined) ? settings["borderRadius"] : 0;
    const axisBottom = (settings["axisBottom"] != undefined) ? settings["axisBottom"] : true;
    const scoreColors = (settings["scoreColors"] != undefined) ? settings["scoreColors"] : false;
    const gradientId = createUUID()

    return <ResponsiveBar
        layout={props.layout}
        groupMode={props.stacked ? 'stacked' : 'grouped'}
        data={data}
        keys={keys}
        indexBy="index"
        margin={{ top: marginTop, right: (legend) ? legendWidth + marginRight : marginRight, bottom: marginBottom, left: marginLeft }}
        padding={0.3}
        borderWidth={borderWidth}
        borderRadius={borderRadius}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    '1.6'
                ]
            ]
        }}
        // valueScale={{ type: valueScale }}
        minValue={minValue}
        maxValue={maxValue}
        enableGridY={enableGridY}
        colors={{ scheme: colorScheme }}
        defs={scoreColors ? [
            {
                id: gradientId,
                type: 'linearGradient',
                colors: [
                    { offset: 0, color: getColorByScore()[0] },
                    { offset: 100, color: getColorByScore()[1] },
                ],
            },
        ] : []}
        fill={scoreColors ? [{ match: '*', id: gradientId }]: []}
        axisTop={null}
        axisRight={null}
        axisBottom={axisBottom ? {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: labelRotation,
        } : null}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
        }}
        labelSkipWidth={labelSkipSize}
        labelSkipHeight={labelSkipSize}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        legends={(legend) ? [
            {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: true,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: legendWidth - 28,
                itemHeight: 20,
                itemDirection: 'right-to-left',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ] : []}
        animate={animate}
        motionStiffness={90}
        motionDamping={15}

        {...props.config}
    />

}