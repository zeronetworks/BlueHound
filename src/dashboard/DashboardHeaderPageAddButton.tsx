import React from 'react';
import Grid from '@material-ui/core/Grid';
import { IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

export const NeoPageAddButton = ({onClick}) => {
    const content = (
        <div key={9999} style={{
            padding: "5px", cursor: 'pointer',
            display: "inline-block", borderRight: "1px solid #ddd", borderLeft: "1px solid #ddd"
        }}>
            <Grid style={{ cursor: 'pointer', height: "100%" }} container spacing={1} alignItems="flex-end">
                <Grid item>
                    <IconButton size="medium" style={{  padding: "5px", color: "white" }} aria-label="move left"
                        onClick={onClick}>
                        <AddIcon color="disabled" />
                    </IconButton>
                </Grid>
            </Grid>
        </div>
    );
    return content;
}


export default (NeoPageAddButton);