import fetch from 'isomorphic-fetch';

export const REQUEST_DATA = 'REQUEST_DATA';
export const RECEIVE_DATA = 'RECEIVE_DATA';
export const SELECT_DATA = 'SELECT_DATA';
export const INVALIDATE_DATA = 'INVALIDATE_DATA';

export function selectData(fileName) {
    return {
        type: SELECT_DATA,
        fileName
    }
}

function requestData(fileName) {
    return {
        type: REQUEST_DATA,
        fileName
    }
}

function receiveData(fileName, json) {
    console.log(json[0]);
    return {
        type: RECEIVE_DATA,
        fileName,
        data: json[0],
        receivedAt: Date.now()
    }
}

function fetchData(fileName) {
    return dispatch => {
        dispatch(requestData(fileName))
        return fetch(`http://localhost:3001/api/${fileName}`)
            .then(response => response.json())
            .then(json => dispatch(receiveData(fileName, json)));
    }
}

function shouldFetchData(state, fileName) {
    const data = state.elfData[fileName];
    if (!data) {
        return true;
    }
    if (data.isFetching) {
        return false;
    }
    return data.didInvalidate;
}

export function fetchDataIfNeeded(fileName) {
    return (dispatch, getState) => {
        if (shouldFetchData(getState(), fileName)) {
            return dispatch(fetchData(fileName));
        }
    }
}