import React from 'react';
import { hot } from 'react-hot-loader';
import NeoPage from '../page/Page';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import NeoDrawer from '../dashboard/DashboardDrawer';
import { createDriver, Neo4jProvider } from 'use-neo4j';
import NeoNotificationModal from '../modal/NotificationModal';
import NeoWelcomeScreenModal from '../modal/WelcomeScreenModal';
import { removeReportRequest } from '../page/PageThunks';
import { connect } from 'react-redux';
import {
    applicationGetConnection,
    applicationGetShareDetails,
    applicationGetOldDashboard,
    applicationHasNeo4jDesktopConnection,
    applicationHasCollectionModalOpen,
    applicationHasAboutModalOpen,
    applicationHasCachedDashboard,
    applicationHasConnectionModalOpen,
    applicationIsConnected,
    applicationHasWelcomeScreenOpen,
    applicationGetDebugState,
    getVulnerabilityReportLoading,
    getVulnerabilityReportsData,
    getToolsParameters,
    getToolsRunning,
    getToolsOutput,
    getToolsParallel,
    getSharpHoundUploadResults,
    getSharpHoundClearResults,
    applicationHasFilterModalOpen,
    applicationHasQueryModalOpen,
    getParallelQueries, applicationGetDBVersion, deleteOldCache
} from '../application/ApplicationSelectors';
import { createConnectionThunk, createConnectionFromDesktopIntegrationThunk, setDatabaseFromNeo4jDesktopIntegrationThunk, handleSharedDashboardsThunk, onConfirmLoadSharedDashboardThunk } from '../application/ApplicationThunks';
import {
    clearDesktopConnectionProperties,
    clearNotification,
    resetShareDetails,
    setCollectionModalOpen,
    setAboutModalOpen,
    setConnected,
    setConnectionModalOpen,
    setDashboardToLoadAfterConnecting,
    setOldDashboard,
    setStandAloneMode,
    setWelcomeScreenOpen,
    setVulnerabilityReportLoading,
    setVulnerabilityReportsData,
    setToolsParameters,
    setToolsRunning,
    setToolsOutput,
    setToolsParallel,
    setSharpHoundUploadResults,
    setSharpHoundClearResults,
    createNotification, setFilterModalOpen, setQueryModalOpen, setParallelQueries
} from '../application/ApplicationActions';
import { resetDashboardState } from '../dashboard/DashboardActions';
import { NeoDashboardPlaceholder } from '../dashboard/DashboardPlaceholder';
import NeoConnectionModal from '../modal/ConnectionModal';
import Dashboard from '../dashboard/Dashboard';
import NeoCollectionModal from '../modal/CollectionModal';
import NeoAboutModal from '../modal/AboutModal';
import NeoQueryModal from '../modal/QueryModal'
import { NeoUpgradeOldDashboardModal } from '../modal/UpgradeOldDashboardModal';
import { loadDashboardThunk } from '../dashboard/DashboardThunks';
import { NeoLoadSharedDashboardModal } from '../modal/LoadSharedDashboardModal';
import {getDashboardJson} from "../modal/ModalSelectors";
import { store } from "../index"
import { cloneDeep } from 'lodash';
import {NeoFilterModal} from "../modal/FilterModal";
import {initializeEdgeFiltering, updateGlobalParameterThunk} from "../settings/SettingsThunks";
import {getGlobalParameters} from "../settings/SettingsSelectors";
import {getDashboardSettings, getPages} from "../dashboard/DashboardSelectors";
import {deleteOldCachedResults} from "../component/QueriesCache";

/**
 * 
 */
const Application = ({ connection, connected, hasCachedDashboard, oldDashboard, clearOldDashboard,
    connectionModalOpen, collectionModalOpen, filterModalOpen, aboutModalOpen, queryModalOpen, loadDashboard, hasNeo4jDesktopConnection, shareDetails,
    createConnection, createConnectionFromDesktopIntegration, onResetShareDetails, onConfirmLoadSharedDashboard,
    initializeApplication, resetDashboard, onCollectionModalOpen, onCollectionModalClose, onFilterModalOpen, onFilterModalClose,
    onAboutModalOpen, onAboutModalClose, getDebugState, onQueryModalOpen, onQueryModalClose, pages, parallelQueries, setParallelQueries,
    welcomeScreenOpen, setWelcomeScreenOpen, vulnerabilityReportsData, setVulnerabilityReportsData, vulnerabilityReportLoading, setVulnerabilityReportLoading,
    nessusReportPath, setNessusReportPath, qualysReportPath, setQualysReportPath, nmapReportPath, setNmapReportPath, openvasReportPath, setOpenVASReportPath,
    onConnectionModalOpen, onConnectionModalClose, toolsParameters, setToolsParameters, toolsRunning, setToolsRunning, toolsOutput, setToolsOutput,
    toolsParallel, setToolsParallel, sharphoundUploadResults, setSharphoundUploadResults, sharphoundClearResults, setSharpHoundClearResults,
    globalParameters, onGlobalParameterUpdate, dashboardSettings, dbVersion, createNotification }) => {

    const [initialized, setInitialized] = React.useState(false);

    if (!initialized) {
        initializeApplication();
        setInitialized(true);
        deleteOldCachedResults();

        if (connection.successful) {
            setWelcomeScreenOpen(false);
            createConnection(connection.protocol, connection.url, connection.port, connection.database, connection.username, connection.password);
        }


    }

    // Only render the dashboard component if we have an active Neo4j connection.
    return (
        <div style={{ display: 'flex' }}>
            <CssBaseline />
            <NeoDashboardPlaceholder connected={false}></NeoDashboardPlaceholder>
            {(connected) ? <Dashboard></Dashboard> : <></>}
            <NeoCollectionModal
                open={collectionModalOpen}
                handleClose={onCollectionModalClose}
                nessusReportPath={nessusReportPath}
                setNessusReportPath={setNessusReportPath}
                qualysReportPath={qualysReportPath}
                setQualysReportPath={setQualysReportPath}
                nmapReportPath={nmapReportPath}
                setNmapReportPath={setNmapReportPath}
                openvasReportPath={openvasReportPath}
                setOpenVASReportPath={setOpenVASReportPath}
                vulnerabilityReportsData={vulnerabilityReportsData}
                setVulnerabilityReportsData={setVulnerabilityReportsData}
                vulnerabilityReportLoading={vulnerabilityReportLoading}
                setVulnerabilityReportLoading={setVulnerabilityReportLoading}
                toolsParameters={toolsParameters}
                setToolsParameters={setToolsParameters}
                toolsRunning={toolsRunning}
                setToolsRunning={setToolsRunning}
                toolsOutput={toolsOutput}
                setToolsOutput={setToolsOutput}
                toolsParallel={toolsParallel}
                setToolsParallel={setToolsParallel}
                sharphoundUploadResults={sharphoundUploadResults}
                setSharphoundUploadResults={setSharphoundUploadResults}
                sharphoundClearResults={sharphoundClearResults}
                setSharpHoundClearResults={setSharpHoundClearResults}
                connection={connection}
            ></NeoCollectionModal>
            <NeoFilterModal
                    open={filterModalOpen}
                    handleClose={onFilterModalClose}
                    setGlobalParameter={onGlobalParameterUpdate}
                    globalParameters={globalParameters}
            >
            </NeoFilterModal>
            <NeoAboutModal
                open={aboutModalOpen}
                handleClose={onAboutModalClose}
                getDebugState={getDebugState}
            >
            </NeoAboutModal>
            <NeoQueryModal
                open={queryModalOpen}
                handleClose={onQueryModalClose}
                pages={pages}
                parallelQueries={parallelQueries}
                setParallelQueries={setParallelQueries}
                createNotification={createNotification}
            >
            </NeoQueryModal>
            <NeoConnectionModal
                open={connectionModalOpen}
                dismissable={connected}
                connection={connection}
                createConnection={createConnection}
                onConnectionModalClose={onConnectionModalClose}>
            </NeoConnectionModal>
            <NeoWelcomeScreenModal
                welcomeScreenOpen={welcomeScreenOpen}
                setWelcomeScreenOpen={setWelcomeScreenOpen}
                hasCachedDashboard={hasCachedDashboard}
                hasNeo4jDesktopConnection={hasNeo4jDesktopConnection}
                onConnectionModalOpen={onConnectionModalOpen}
                createConnectionFromDesktopIntegration={createConnectionFromDesktopIntegration}
                onCollectionModalOpen={onCollectionModalOpen}
                onAboutModalOpen={onAboutModalOpen}
                resetDashboard={resetDashboard}></NeoWelcomeScreenModal>
            {/*<NeoUpgradeOldDashboardModal
                open={oldDashboard}
                text={oldDashboard}
                loadDashboard={loadDashboard}
                clearOldDashboard={clearOldDashboard}>
            </NeoUpgradeOldDashboardModal>*/}
            <NeoLoadSharedDashboardModal
                shareDetails={shareDetails}
                onResetShareDetails={onResetShareDetails}
                onConfirmLoadSharedDashboard={onConfirmLoadSharedDashboard}>
            </NeoLoadSharedDashboardModal>
            <NeoNotificationModal></NeoNotificationModal>
        </div>
    );
}

const mapStateToProps = state => ({
    connected: applicationIsConnected(state),
    connection: applicationGetConnection(state),
    pages: getPages(state),
    shareDetails: applicationGetShareDetails(state),
    oldDashboard: applicationGetOldDashboard(state),
    connectionModalOpen: applicationHasConnectionModalOpen(state),
    collectionModalOpen: applicationHasCollectionModalOpen(state),
    globalParameters: getGlobalParameters(state),
    filterModalOpen: applicationHasFilterModalOpen(state),
    aboutModalOpen: applicationHasAboutModalOpen(state),
    queryModalOpen: applicationHasQueryModalOpen(state),
    welcomeScreenOpen: applicationHasWelcomeScreenOpen(state),
    hasCachedDashboard: applicationHasCachedDashboard(state),
    getDebugState: () => {return applicationGetDebugState(state)},
    hasNeo4jDesktopConnection: applicationHasNeo4jDesktopConnection(state),
    vulnerabilityReportsData: getVulnerabilityReportsData(state),
    vulnerabilityReportLoading: getVulnerabilityReportLoading(state),
    toolsParameters: getToolsParameters(state),
    toolsRunning: getToolsRunning(state),
    toolsOutput: getToolsOutput(state),
    toolsParallel: getToolsParallel(state),
    parallelQueries: getParallelQueries(state),
    sharphoundUploadResults: getSharpHoundUploadResults(state),
    sharphoundClearResults: getSharpHoundClearResults(state),
    dashboardSettings: getDashboardSettings(state),
    dbVersion: applicationGetDBVersion(state),
});

const mapDispatchToProps = dispatch => ({
    createConnection: (protocol, url, port, database, username, password) => {
        dispatch(setConnected(false));
        dispatch(createConnectionThunk(protocol, url, port, database, username, password));
    },
    createConnectionFromDesktopIntegration: () => {
        dispatch(setConnected(false));
        dispatch(createConnectionFromDesktopIntegrationThunk());
    },
    loadDashboard: text => {
        dispatch(clearNotification());
        dispatch(loadDashboardThunk(text));
    },
    resetDashboard: _ => dispatch(resetDashboardState()),
    clearOldDashboard: _ => dispatch(setOldDashboard(null)),
    initializeApplication: _ => {
        dispatch(initializeEdgeFiltering());
        dispatch(clearDesktopConnectionProperties());
        dispatch(setDatabaseFromNeo4jDesktopIntegrationThunk());
        const old = localStorage.getItem('bluehound-dashboard');
        dispatch(setOldDashboard(old));
        dispatch(setConnected(false));
        dispatch(setDashboardToLoadAfterConnecting(null));
        dispatch(setStandAloneMode(false));
        dispatch(setWelcomeScreenOpen(true));
        dispatch(setCollectionModalOpen(false));
        dispatch(setFilterModalOpen(false));
        dispatch(setVulnerabilityReportLoading(false));
        dispatch(clearNotification());
        dispatch(handleSharedDashboardsThunk());
        dispatch(setVulnerabilityReportsData({}));
        dispatch(setConnectionModalOpen(false));
        const currentDashboard = getDashboardJson(store.getState());
        dispatch(setToolsParameters(cloneDeep(currentDashboard["importTools"])));
        dispatch(setToolsRunning({}));
        dispatch(setToolsOutput({}));
        dispatch(setAboutModalOpen(false));
        dispatch(setQueryModalOpen(false));
    },
    onResetShareDetails: _ => {
        dispatch(setWelcomeScreenOpen(true));
        dispatch(resetShareDetails());
    },
    onConfirmLoadSharedDashboard: _ => dispatch(onConfirmLoadSharedDashboardThunk()),
    onConnectionModalOpen: _ => dispatch(setConnectionModalOpen(true)),
    onConnectionModalClose: _ => dispatch(setConnectionModalOpen(false)),
    onCollectionModalOpen: _ => dispatch(setCollectionModalOpen(true)),
    onCollectionModalClose: _ => dispatch(setCollectionModalOpen(false)),
    onGlobalParameterUpdate: (key, value) => dispatch(updateGlobalParameterThunk(key, value)),
    onFilterModalOpen: _ => dispatch(setFilterModalOpen(true)),
    onFilterModalClose: _ => dispatch(setFilterModalOpen(false)),
    onAboutModalOpen: _ => dispatch(setAboutModalOpen(true)),
    onQueryModalOpen: _ => dispatch(setQueryModalOpen(true)),
    setWelcomeScreenOpen: open => dispatch(setWelcomeScreenOpen(open)),
    onAboutModalClose: _ => dispatch(setAboutModalOpen(false)),
    onQueryModalClose: _ => dispatch(setQueryModalOpen(false)),
    setVulnerabilityReportsData: data => dispatch(setVulnerabilityReportsData(data)),
    setVulnerabilityReportLoading: status => dispatch(setVulnerabilityReportLoading(status)),
    setToolsParameters: data => dispatch(setToolsParameters(data)),
    setToolsRunning: data => dispatch(setToolsRunning(data)),
    setToolsOutput: data => dispatch(setToolsOutput(data)),
    setToolsParallel: toolsParallel => dispatch(setToolsParallel(toolsParallel)),
    setParallelQueries: amount => dispatch(setParallelQueries(amount)),
    setSharpHoundUploadResults: uploadResults => dispatch(setSharpHoundUploadResults(uploadResults)),
    setSharpHoundClearResults: clearResults => dispatch(setSharpHoundClearResults(clearResults)),
    createNotification: (title, message) => { dispatch(createNotification(title, message)); }
});


export default hot(module)(connect(mapStateToProps, mapDispatchToProps)(Application));