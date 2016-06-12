import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { selectData, fetchDataIfNeeded, invalidateData } from '../actions';
import Chart from '../components/Chart';

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
        return (
            <div>
                {isFetching && Object.keys(data).length === 0 &&
                <h2>Loading...</h2>
                }
                {!isFetching && Object.keys(data).length === 0 &&
                <h2>Empty.</h2>
                }
                {Object.keys(data).length > 0 &&
                <div style={{ opacity: isFetching ? 0.5 : 1 }}>
                    <Chart data={data} />
                </div>
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
        data: {} // Default data to empty object
    };

    return {
        selectedData,
        data,
        isFetching,
        lastUpdated
    };
}

export default connect(mapStateToProps)(App);