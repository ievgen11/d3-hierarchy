import * as actionTypes from "../actionTypes";
import { Record, List, fromJS, Map } from "immutable";

const initialData = Map({
    children: List(),
});

const Model = Record({
    data: initialData,
    isPending: false,
    isError: false
});

const initialState = Model();

const UserReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_DATA.FULFILLED:
            return state.withMutations(mutant => {
                mutant.set("isPending", false);
                mutant.set("isError", false);
                mutant.set("data", fromJS(action.payload[0]));
            });
        case actionTypes.GET_DATA.PENDING:
            return state.withMutations(mutant => {
                mutant.set("isPending", true);
                mutant.set("isError", false);
                mutant.set("data", initialData);
            });
        case actionTypes.GET_DATA.REJECTED:
            return state.withMutations(mutant => {
                mutant.set("isError", true);
                mutant.set("isPending", false);
                mutant.set("data", initialData);
            });
        default:
            return state;
    }
};

export default UserReducer;
