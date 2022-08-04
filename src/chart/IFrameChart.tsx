
import React from 'react';
import { ChartProps } from './Chart';

/**
 * Renders an iFrame provided by the user.
 */
const NeoIFrameChart = (props: ChartProps) => {
    const [extraRecords, setExtraRecords] = React.useState([]);
    // Records are overridden to be a single element array with a field called 'input'.
    const records = props.records;
    const passGlobalParameters = props?.settings?.passGlobalParameters
    const url = records[0]["input"];

    if (!url || !(url.startsWith("http://") || url.startsWith("https://"))) {
        return <p style={{ margin: "15px" }}>Invalid iFrame URL. Make sure your url starts with <code>http://</code> or <code>https://</code>.</p>
    }

    const mapParameters = records[0]["mapParameters"] || {};
    const queryString = Object.keys(mapParameters).map(key => key + '=' + mapParameters[key]).join('&');
    return <iframe style={{ width: "100%", border: "none", marginBottom: "-5px", height: "100%", overflow: "hidden" }} src={url + (passGlobalParameters ? "#" + queryString : "")} />;
}

export default NeoIFrameChart;