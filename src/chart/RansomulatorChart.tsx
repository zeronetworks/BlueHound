import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Tooltip from '@material-ui/core/Tooltip';
import { ChartProps } from './Chart';
import useDimensions from "react-cool-dimensions";
import GetAppIcon from '@material-ui/icons/GetApp';
import { CSVLink } from "react-csv";

const NeoRansomulatorChart = (props: ChartProps) => {
    const ransomulatorResults = props.records;
    if (ransomulatorResults.waves == undefined) {
        return <p>Loading data...</p>
    }


    const waveHeaders = [];
    for (let i = 0; i < ransomulatorResults.maxWaveLength; i ++) {
        waveHeaders.push("wave_" + String(i + 1));
    }
    const headers = ["hostname", "total"].concat(waveHeaders)
    const columns = [];
    headers.forEach((header) => {columns.push({
        field: header,
        headerName: header.charAt(0).toUpperCase() + header.slice(1),
        headerClassName: 'table-small-header',
        disableColumnSelector: true,
        flex: 1,
        disableClickEventBubbling: true
    })})

    const rows = ransomulatorResults.waves.map((key, index) => {
        const row = Object.assign({ id: index, hostname: key[0], total: key[1].total});
        waveHeaders.forEach((wave, index) => { row[wave] = key[1]['waves'][index] });
        return row
    })

    const csv_data = rows.map((key, i) => {
        const { id, ...data} = key;
        return Object.assign(data);
    });

    const { observe, unobserve, width, height, entry } = useDimensions({
        onResize: ({ observe, unobserve, width, height, entry }) => {
            // Triggered whenever the size of the target is changed...
            unobserve(); // To stop observing the current target element
            observe(); // To re-start observing the current target element
        },
    });

    const fullscreen = props.fullscreen ? props.fullscreen : false;

    return (
        <div ref={observe} style={{ position: "relative", overflow: "hidden", height: "100%", width: '100%' }}>
            <CSVLink data={csv_data} filename={props.title}>
            <Tooltip title="Export data." aria-label="">
                <GetAppIcon style={{ fontSize: "1.5rem", opacity: 0.6, bottom: 9, left: 38, position: "absolute", zIndex: 5 }} color="disabled" fontSize="small"></GetAppIcon>
            </Tooltip>
        </CSVLink>
        <DataGrid
            headerHeight={32}
            rows={rows}
            columns={columns}
            pageSize={fullscreen ? 15 : (props.dimensions && props.dimensions.height == 3) ? 5 : 13}
            rowsPerPageOptions={[fullscreen ? 15 : (props.dimensions && props.dimensions.height == 3) ? 5 : 13]}
            disableSelectionOnClick
            components={{
                ColumnSortedDescendingIcon: () => <></>,
                ColumnSortedAscendingIcon: () => <></>,
            }}
        /></div>
    )
}

export default NeoRansomulatorChart;