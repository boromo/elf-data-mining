import {combineReducers} from 'redux';
import {SELECT_DATA, INVALIDATE_DATA, REQUEST_DATA, RECEIVE_DATA} from '../actions';

function selectedData(state = 'elf', action) {
    switch (action.type) {
        case SELECT_DATA:
            return action.fileName;
        default:
            return state;
    }
}

function data(state = {
    isFetching: false,
    didInvalidate: false,
    data: {}
}, action) {
    switch (action.type) {
        case INVALIDATE_DATA:
            return Object.assign({}, state, {
                didInvalidate: true
            });
        case REQUEST_DATA:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            });
        case RECEIVE_DATA:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                data: action.data,
                lastUpdated: action.receivedAt
            });
        default:
            return state;
    }
}

function elfData(state = {}, action) {
    switch (action.type) {
        case INVALIDATE_DATA:
        case RECEIVE_DATA:
        case REQUEST_DATA:
            return Object.assign({}, state, {
                [action.fileName]: data(state[action.fileName], action)
            });
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    elfData,
    selectedData
});

export default rootReducer;