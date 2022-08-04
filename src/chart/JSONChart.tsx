
import React from 'react';
import { ChartProps } from './Chart';
import { TextareaAutosize } from '@material-ui/core';
import { CardContent, Chip, IconButton, Tooltip } from "@material-ui/core";
import WarningIcon from '@material-ui/icons/Warning';
/**
 * Renders Neo4j records as their JSON representation.
 */
const NeoJSONChart = (props: ChartProps) => {
    const records = props.records;

    return <div style={{marginTop: "0px"}}>

        <TextareaAutosize
            style={{ width: "100%", border: "1px solid lightgray" }}
            className={"textinput-linenumbers"}
            value={JSON.stringify(records, null, 2)}
            aria-label=""
            placeholder="Query output should be rendered here." />
    </div >;
}

export default NeoJSONChart;