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

import Dashboard from './pages/Dashboard';
import App from './containers/App';

import './styles/app.css';

ReactDOM.render(
    <RMWCProvider>
        <ThemeProvider
            options={{
                primary: 'red',
                secondary: 'blue'
            }}
        >
            <Provider store={store}>
                <Router>
                    <App>
                        <Switch>
                            <Route
                                exact
                                path="/dashboard"
                                component={Dashboard}
                            />
                            <Redirect to="/dashboard" />
                        </Switch>
                    </App>
                </Router>
            </Provider>
        </ThemeProvider>
    </RMWCProvider>,
    document.getElementById('root')
);
