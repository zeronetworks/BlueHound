import React, { useState } from 'react';
import { connect } from 'react-redux';
import { addReportRequest } from '../page/PageThunks';
import { getReports } from '../page/PageSelectors';
import { Card, CardContent, Typography, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

/**
 * Button to add a new report to the current page.
 */
const NeoAddNewCard = ({ onCreatePressed }) => {
    return (
        <div>
            <Card style={{ background: "#e0e0e0" }}>
                <CardContent style={{ height: '422px' }}>
                    <Typography variant="h2" color="textSecondary" style={{ paddingTop: "155px", textAlign: "center" }}>
                        <Fab size="medium" className={"blue-grey"} aria-label="add"
                            onClick={() => {
                                onCreatePressed();
                            }} >
                            <AddIcon />
                        </Fab>
                    </Typography>
                </CardContent>
            </Card>
        </div>
    );
};

const mapStateToProps = state => ({
    
});

const mapDispatchToProps = dispatch => ({
    onCreatePressed: text => dispatch(addReportRequest(text)),
});

export default connect(mapStateToProps, mapDispatchToProps)(NeoAddNewCard);