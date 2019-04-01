import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import actions from '../redux/actions';
import selectors from '../redux/selectors';

class Chart extends Component {
    static propTypes = {
        data: PropTypes.array,
        isError: PropTypes.bool.isRequired,
        isPending: PropTypes.bool.isRequired,
        getDataAction: PropTypes.func.isRequired
    };

    componentDidMount() {
        const { getDataAction } = this.props;

        getDataAction();
    }

    render() {
        const { data, isPending, isError } = this.props;

        if (isPending) {
            return (<b>Loading...</b>);
        }

        if (isError) {
            return (<b>Error!</b>);
        }

        console.log(data);

        return <b>{JSON.stringify(data)}</b>;
    }
}

const mapStateToProps = state => ({
    data: selectors.getData(state),
    isError: selectors.getDataIsError(state),
    isPending: selectors.getDataIsPending(state)
});

const mapDispatchToProps = dispatch => ({
    getDataAction: () => dispatch(actions.getData())
});

const ConnectedChart = withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Chart)
);

export default ConnectedChart;
