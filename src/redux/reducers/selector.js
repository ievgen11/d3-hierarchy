import * as actionTypes from "../actionTypes";
import { Record } from "immutable";

const Model = Record({
    selectedValue: null
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
                mutant.set("selectedValue", null);
            });
        default:
            return state;
    }
};

export default UserReducer;
