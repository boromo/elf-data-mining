import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { selectData, fetchDataIfNeeded, invalidateData } from '../actions';

class App extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleRefreshClick = this.handleRefreshClick.bind(this);
    }

    componentDidMount() {
        const { dispatch, selectedData } = this.props;
        dispatch(fetchDataIfNeeded(selectedData));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedData !== this.props.selectedData) {
            const { dispatch, selectedData } = nextProps;
            dispatch(fetchDataIfNeeded(selectedData));
        }
    }

    handleChange(nextData) {
        this.props.dispatch(selectData(nextData));
    }

    handleRefreshClick(e) {
        e.preventDefault();

        const { dispatch, selectedData } = this.props;
        dispatch(invalidateData(selectedData));
        dispatch(fetchDataIfNeeded(selectedData));
    }

    render() {
        const { selectedData, data, isFetching, lastUpdated } = this.props;
        const isEmpty = Object.keys(data).length === 0;
        return (
            <div>
                {
                    !isEmpty ?
                        JSON.stringify(data):
                        'Loading...'
                }
            </div>
        );
    }
}

App.propTypes = {
    selectedData: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    isFetching: PropTypes.bool.isRequired,
    lastUpdated: PropTypes.number,
    dispatch: PropTypes.func.isRequired
};

function mapStateToProps(state) {
    const { selectedData, elfData } = state;
    const {
        isFetching,
        lastUpdated,
        data: data
    } = elfData[selectedData] || {
        isFetching: true,
        data: {} // Posts to empty array
    };

    return {
        selectedData,
        data,
        isFetching,
        lastUpdated
    };
}

export default connect(mapStateToProps)(App);