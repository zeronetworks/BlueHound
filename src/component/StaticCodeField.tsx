import { TextareaAutosize } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import React from 'react';


/**
 * Returns a static code block, without line numbers.
 */
const NeoStaticCodeField = ({ value = "", placeholder = "" }) => {
    return (
        <div style={{ overflowY: "auto", marginLeft: "10px", marginRight: "10px", height: "100%" }}>
            <TextareaAutosize
                style={{ width: "100%", overflowY: "hidden", scrollbarWidth: "auto", paddingLeft: "10px",
                    background: "none",  overflow: "scroll !important", border: "1px solid lightgray", whiteSpace: "pre-wrap" }}
                className={"textinput-linenumbers"}
                aria-label=""
                value={value}
                placeholder={placeholder} />
        </div>
    );
};

export default NeoStaticCodeField;