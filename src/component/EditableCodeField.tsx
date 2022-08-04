import { TextareaAutosize } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import React from 'react';

import "codemirror/lib/codemirror.css";
import "codemirror/addon/lint/lint.css";
import "codemirror/addon/hint/show-hint.css";
import CypherEditor from './CypherEditor';
// import "cypher-codemirror/dist/cypher-codemirror-syntax.css";



const NeoEditableCodeField = ({ value, onChange = (e) => { }, placeholder,
    editable = true, language = "cypher",
    style = { width: "100%", height: "auto", border: "1px solid lightgray" } }) => {

    const options = {
        viewPortMargin: Infinity,
        mode: language,
        theme: "cypher",
        height: "auto",
        lineNumberFormatter: line => line
    };

    // TODO -  we force a recreating of the editor object here in a strange way...
    const editor = (language == "cypher") ? <CypherEditor
        options={options}
        aria-label=""
        value={value}
        onValueChange={(val) => {
            if (editable) {
                onChange(val);
            }
        }}
        placeholder={placeholder} /> : <div><CypherEditor
        options={options}
        aria-label=""
        value={value}
        onValueChange={(val) => {
            if (editable) {
                onChange(val);
            }
        }}
        placeholder={placeholder} /></div>

    return (
        <div className={"autosize"} style={style}>
            {editor}</div>
    );
};

export default NeoEditableCodeField;