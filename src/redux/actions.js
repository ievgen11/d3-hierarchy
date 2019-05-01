import * as actionTypes from './actionTypes';
import DBService from '../services/DBService';

export const getData = () => dispatch =>
    dispatch({
        type: actionTypes.GET_DATA.TYPE,
        payload: DBService.generateData()
    });

export const toggleDataIsExpanded = () => dispatch =>
    dispatch({
        type: actionTypes.TOGGLE_DATA_IS_EXPANDED
    });

export const setSearchQuery = value => dispatch =>
    dispatch({
        type: actionTypes.SET_SEARCH_QUERY,
        payload: String(value)
    });

export const resetSearchQuery = () => dispatch =>
    dispatch({
        type: actionTypes.RESET_SEARCH_QUERY
    });

export default {
    getData,
    setSearchQuery,
    resetSearchQuery,
    toggleDataIsExpanded
};
