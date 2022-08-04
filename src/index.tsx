import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { configureStore } from './store';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/lib/integration/react';
import Application from './application/Application';


/**
 * Set up the BlueHound application and wrap it in the needed providers.
 */
export const store = configureStore();

// @ts-ignore
const persister = persistStore(store);

/** Wrap the application in a redux provider / browser cache persistance gate **/
const provider = <ReduxProvider store={store}>
    <PersistGate persistor={persister} loading={<div>Loading BlueHound...</div>}>
        <Application />
    </PersistGate>
</ReduxProvider>

ReactDOM.render(<React.StrictMode>{provider}</React.StrictMode>, document.getElementById('root'));