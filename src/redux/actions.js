import * as actionTypes from "./actionTypes";
import DBService from '../services/DBService';

export const getData = () => dispatch =>
    dispatch({
        type: actionTypes.GET_DATA.TYPE,
        payload: DBService.getData()
    });

export const setSelectedValue = value => dispatch =>
    dispatch({
        type: actionTypes.SET_SELECTED_VALUE,
        payload: value
    });

export const resetSelectedValue = () => dispatch =>
    dispatch({
        type: actionTypes.RESET_SELECTED_VALUE
    });

export default {
    getData,
    setSelectedValue,
    resetSelectedValue
};
