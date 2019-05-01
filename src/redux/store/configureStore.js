import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import { createStore, applyMiddleware, compose } from 'redux';
import reducers from '../reducers';

const middleware = [thunk, promiseMiddleware()];
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    reducers,
    composeEnhancers(applyMiddleware(...middleware))
);

export default store;
