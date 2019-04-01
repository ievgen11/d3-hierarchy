import * as actionTypes from "./actionTypes";
import DBService from '../services/DBService';

export const getData = () => dispatch =>
    dispatch({
        type: actionTypes.GET_DATA.TYPE,
        payload: DBService.getData()
    });

export default {
    getData
};
