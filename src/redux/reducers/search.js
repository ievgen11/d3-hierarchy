import * as actionTypes from '../actionTypes';
import { Record } from 'immutable';

const Model = Record({
    searchQuery: ''
});

const initialState = Model();

const UserReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_SEARCH_QUERY:
            return state.withMutations(mutant => {
                mutant.set('searchQuery', action.payload);
            });
        case actionTypes.RESET_SEARCH_QUERY:
            return state.withMutations(mutant => {
                mutant.set('searchQuery', null);
            });
        default:
            return state;
    }
};

export default UserReducer;
