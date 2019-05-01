import * as actionTypes from '../actionTypes';
import { Record, List, fromJS, Map } from 'immutable';

const initialData = Map({
    children: List()
});

const Model = Record({
    data: initialData,
    isPending: false,
    isError: false,
    isExpanded: true
});

const initialState = Model();

const UserReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.GET_DATA.FULFILLED:
            return state.withMutations(mutant => {
                mutant.set('isPending', false);
                mutant.set('isError', false);
                mutant.set('data', fromJS(action.payload));
            });
        case actionTypes.GET_DATA.PENDING:
            return state.withMutations(mutant => {
                mutant.set('isPending', true);
                mutant.set('isError', false);
                mutant.set('data', initialData);
            });
        case actionTypes.GET_DATA.REJECTED:
            return state.withMutations(mutant => {
                mutant.set('isError', true);
                mutant.set('isPending', false);
                mutant.set('data', initialData);
            });
        case actionTypes.TOGGLE_DATA_IS_EXPANDED:
            return state.withMutations(mutant => {
                mutant.set('isExpanded', !mutant.get('isExpanded'));
            });
        default:
            return state;
    }
};

export default UserReducer;
