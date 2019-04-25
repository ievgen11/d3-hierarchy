import React from 'react';
import ReactDOM from 'react-dom';
import { RMWCProvider } from '@rmwc/provider';
import { ThemeProvider } from '@rmwc/theme';
import { Provider } from 'react-redux';
import store from './redux/store/configureStore';

import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';

import Hierarchy from './containers/Hierarchy';

import '@rmwc/icon/icon.css';
import '@rmwc/circular-progress/circular-progress.css';
import '@material/fab/dist/mdc.fab.css';

import './styles/app.css';

ReactDOM.render(
    <RMWCProvider>
        <ThemeProvider
            options={{
                primary: '#fe4a49',
                secondary: 'rgba(255, 255, 255, 1)',
                onSecondary: '#000'
            }}
        >
            <Provider store={store}>
                <Router>
                    <Switch>
                        <Route
                            exact
                            path="/hierarchy"
                            component={Hierarchy}
                        />
                        <Redirect to="/hierarchy" />
                    </Switch>
                </Router>
            </Provider>
        </ThemeProvider>
    </RMWCProvider>,
    document.getElementById('root')
);
