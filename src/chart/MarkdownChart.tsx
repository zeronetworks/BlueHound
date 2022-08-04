
import React from 'react';
import { ChartProps } from './Chart';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

/**
 * Renders Markdown text provided by the user.
 */
const NeoMarkdownChart = (props: ChartProps) => {
    // Records are overridden to be a single element array with a field called 'input'.
    const records = props.records;
    const markdown = records[0]["input"];
    return <div style={{marginTop: "0px", marginLeft: "15px", marginRight: "15px", marginBottom: "0px"}}>
        <base target="_blank"/> <ReactMarkdown plugins={[gfm]} children={markdown} />
    </div >;
}

export default NeoMarkdownChart;