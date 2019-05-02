import React from 'react';
import ReactDOM from 'react-dom';
import { RMWCProvider } from '@rmwc/provider';
import { Provider } from 'react-redux';
import store from './redux/store/configureStore';

import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';

import Hierarchy from './pages/Hierarchy';

import '@rmwc/icon/icon.css';
import '@rmwc/circular-progress/circular-progress.css';
import '@material/fab/dist/mdc.fab.css';
import '@material/textfield/dist/mdc.textfield.css';
import '@material/floating-label/dist/mdc.floating-label.css';
import '@material/notched-outline/dist/mdc.notched-outline.css';
import '@material/line-ripple/dist/mdc.line-ripple.css';
import '@material/typography/dist/mdc.typography.css';
import '@material/button/dist/mdc.button.css';
import '@material/dialog/dist/mdc.dialog.css';
import '@material/switch/dist/mdc.switch.css';
import '@material/form-field/dist/mdc.form-field.css';
import '@material/menu/dist/mdc.menu.css';
import '@material/menu-surface/dist/mdc.menu-surface.css';
import '@material/list/dist/mdc.list.css';

import './styles/app.css';

ReactDOM.render(
    <RMWCProvider>
        <Provider store={store}>
            <Router>
                <Switch>
                    <Route exact path="/hierarchy" component={Hierarchy} />
                    <Redirect to="/hierarchy" />
                </Switch>
            </Router>
        </Provider>
    </RMWCProvider>,
    document.getElementById('root')
);
