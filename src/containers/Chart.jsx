import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import actions from '../redux/actions';
import selectors from '../redux/selectors';

import GeoHierarchy from '../components/GeoHierarchy';

class Chart extends Component {
    static propTypes = {
        data: PropTypes.object,
        selectedValue: PropTypes.string,
        isError: PropTypes.bool.isRequired,
        isPending: PropTypes.bool.isRequired,
        getDataAction: PropTypes.func.isRequired
    };

    componentDidMount() {
        const { getDataAction } = this.props;

        getDataAction();
    }

    render() {
        const { data, isPending, isError, selectedValue } = this.props;

        return <GeoHierarchy
            data={data}
            isPending={isPending}
            isError={isError}
            selectedValue={selectedValue}
        />;
    }
}

const mapStateToProps = state => ({
    data: selectors.getData(state),
    selectedValue: selectors.getSelectedValue(state),
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
