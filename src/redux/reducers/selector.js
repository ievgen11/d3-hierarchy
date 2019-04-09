import * as actionTypes from "../actionTypes";
import { Record } from "immutable";

const Model = Record({
    selectedValue: ''
});

const initialState = Model();

const UserReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_SELECTED_VALUE:
            return state.withMutations(mutant => {
                mutant.set("selectedValue", action.payload);
            });
        case actionTypes.RESET_SELECTED_VALUE:
            return state.withMutations(mutant => {
                mutant.set("selectedValue", '');
            });
        default:
            return state;
    }
};

export default UserReducer;
