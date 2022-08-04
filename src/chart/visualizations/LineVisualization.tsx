import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { ChartReportProps, ExtendedChartReportProps } from './VisualizationProps';
import { recordToNative } from './Utils';

interface LineChartData {
    id: string;
    data: Record<any, any>[]
}

export default function LineReport(props: ExtendedChartReportProps) {
    const { records, first } = props

    const label = first!.keys[0] as string
    const keys = first!.keys.slice(1)
    const settings = (props.settings) ? props.settings : {};

    const colorScheme = (settings["colors"]) ? settings["colors"] : 'set2';
    const xScale = (settings["xScale"]) ? settings["xScale"] : 'linear';
    const yScale = (settings["yScale"]) ? settings["yScale"] : 'linear';
    const xScaleLogBase = (settings["xScaleLogBase"]) ? settings["xScaleLogBase"] : 10;
    const yScaleLogBase = (settings["yScaleLogBase"]) ? settings["yScaleLogBase"] : 10;
    const minXValue = (settings["minXValue"]) ? settings["minXValue"] : 'auto';
    const maxXValue = (settings["maxXValue"]) ? settings["maxXValue"] : 'auto';
    const minYValue = (settings["minYValue"]) ? settings["minYValue"] : 'auto';
    const maxYValue = (settings["maxYValue"]) ? settings["maxYValue"] : 'auto';

    const legend = (settings["legend"] != undefined) ? settings["legend"] : false;

    const legendWidth = (settings["legendWidth"]) ? settings["legendWidth"] : 70;
    const curve = (settings["curve"]) ? settings["curve"] : "linear";
    const marginRight = (settings["marginRight"]) ? settings["marginRight"] : 24;
    const marginLeft = (settings["marginLeft"]) ? settings["marginLeft"] : 36;
    const marginTop = (settings["marginTop"]) ? settings["marginTop"] : 24;
    const marginBottom = (settings["marginBottom"]) ? settings["marginBottom"] : 40;
    const lineWidth = (settings["lineWidth"]) ? settings["lineWidth"] : 2;
    const pointSize = (settings["pointSize"]) ? settings["pointSize"] : 10;
    const showGrid = (settings["showGrid"] != undefined) ? settings["showGrid"] : true;

    if (!keys.length) {
        return <p>No data.</p>
    }

    const data: LineChartData[] = keys.map(key => ({
        id: key as string,
        data: []
    }))

    records.forEach((row) => {
        keys.forEach(key => {
            const index = data.findIndex(item => (item as Record<string, any>).id === key)
            const x: string | number = recordToNative(row.get(label)) || 0
            const y: any = recordToNative(row.get(key)) || 0

            data[index].data.push({ x, y })
        })
    })

    return (
        <div className="h-full w-full overflow-hidden" style={{ height: "100%" }}>

            <ResponsiveLine
                data={data}
                margin={{ top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft }}
                xScale={xScale == 'linear' ?
                    { type: xScale, min: minXValue, max: maxXValue } :
                    { type: xScale, min: minXValue, max: maxXValue, constant: xScaleLogBase, base: xScaleLogBase }
                }
                yScale={yScale == 'linear' ?
                    { type: yScale, min: minYValue, max: maxYValue, stacked: false, reverse: false } :
                    { type: yScale, min: minYValue, max: maxYValue,  constant: xScaleLogBase, base: yScaleLogBase }}
                curve={curve}
                enableGridX={showGrid}
                enableGridY={showGrid}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    orient: 'bottom',
                    tickSize: 6,
                    tickPadding: 12,
                    tickRotation: 0,
                }}
                axisLeft={{
                    tickSize: 6,
                    tickPadding: 12,
                    tickRotation: 0,
                }}
                pointSize={pointSize}
                lineWidth={lineWidth}
                pointColor="white"

                colors={{ scheme: colorScheme }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                useMesh={true}
                legends={(legend) ? [
                    {
                        anchor: 'top-right',
                        direction: 'row',
                        justify: false,
                        translateX: -10,
                        translateY: -35,
                        itemsSpacing: 0,
                        itemDirection: 'right-to-left',
                        itemWidth: legendWidth,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 6,
                        symbolShape: 'circle',
                        symbolBorderColor: 'rgba(0, 0, 0, .5)',
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemBackground: 'rgba(0, 0, 0, .03)',
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ] : []}

                {...props.config}
            />
        </div>
    )
}