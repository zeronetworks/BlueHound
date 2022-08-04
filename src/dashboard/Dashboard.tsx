import React, { useEffect } from 'react';
import NeoPage from '../page/Page';
import Container from '@material-ui/core/Container';
import NeoDrawer from './DashboardDrawer';
import NeoDashboardHeader from './DashboardHeader';
import { createDriver, Neo4jProvider, useConnection } from 'use-neo4j';
import { applicationGetConnection, applicationHasAboutModalOpen } from '../application/ApplicationSelectors';
import { connect } from 'react-redux';
import _ from 'lodash';
import NeoDashboardConnectionUpdateHandler from './DashboardConnectionUpdateHandler';
import { forceRefreshPage } from '../page/PageActions';
import { getPageNumber } from '../settings/SettingsSelectors';
import { createNotification } from '../application/ApplicationActions';



const Dashboard = ({ pagenumber, connection, onConnectionUpdate }) => {
    const [open, setOpen] = React.useState(false);
    const driver = createDriver(connection.protocol, connection.url, connection.port, connection.username, connection.password);

    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };

    const content = <Neo4jProvider driver={driver}>
        <NeoDashboardConnectionUpdateHandler
            pagenumber={pagenumber}
            connection={connection}
            onConnectionUpdate={onConnectionUpdate} />
        <NeoDrawer open={open} handleDrawerClose={handleDrawerClose}></NeoDrawer>
        <NeoDashboardHeader open={open} connection={connection} handleDrawerOpen={handleDrawerOpen}></NeoDashboardHeader>
        <main style={{ flexGrow: 1, height: '100vh', overflow: 'auto', backgroundColor: "#fafafa" }}>
            <Container maxWidth="xl" style={{ marginTop: "60px" }}>
                <NeoPage></NeoPage>
            </Container>
        </main>
    </Neo4jProvider>
    return (content);
}

const mapStateToProps = state => ({
    connection: applicationGetConnection(state),
    pagenumber: getPageNumber(state)
});

const mapDispatchToProps = dispatch => ({
    onConnectionUpdate: pagenumber => {
        dispatch(createNotification("Connection Updated", "You have updated your Neo4j connection, your reports have been reloaded."))
        dispatch(forceRefreshPage(pagenumber))
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);