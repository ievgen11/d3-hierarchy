import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import actions from '../redux/actions';
import selectors from '../redux/selectors';

import HierarchyComponent from '../components/Hierarchy';

class Hierarchy extends Component {
    static propTypes = {
        data: PropTypes.object,
        selectedValue: PropTypes.string,
        isError: PropTypes.bool.isRequired,
        isPending: PropTypes.bool.isRequired,
        getDataAction: PropTypes.func.isRequired,
        setSelectedValue: PropTypes.func.isRequired,
        resetSelectedValue: PropTypes.func.isRequired
    };

    componentDidMount() {
        const { getDataAction } = this.props;

        getDataAction();
    }

    render() {
        const {
            data,
            isPending,
            isError,
            selectedValue,
            resetSelectedValue,
            setSelectedValue
        } = this.props;

        return (
            <HierarchyComponent
                data={data}
                minWidth={800}
                minHeight={600}
                leafType="Port"
                onLeafClick={node => {
                    window
                        .open(
                            `http://locode.info/${node.data.location}`,
                            '_blank'
                        )
                        .focus();
                    return;
                }}
                formatLabelText={node => {
                    if (node.data.type === 'Port') {
                        return `${node.data.name} (${node.data.location})`;
                    }
                    return node.data.name;
                }}
                isPending={isPending}
                isError={isError}
                selectedValue={selectedValue}
                onSearchSubmit={searchString => setSelectedValue(searchString)}
                onSelectionClear={() => resetSelectedValue()}
            />
        );
    }
}

const mapStateToProps = state => ({
    data: selectors.getData(state),
    selectedValue: selectors.getSelectedValue(state),
    isError: selectors.getDataIsError(state),
    isPending: selectors.getDataIsPending(state)
});

const mapDispatchToProps = dispatch => ({
    getDataAction: () => dispatch(actions.getData()),
    setSelectedValue: searchString => dispatch(actions.setSelectedValue(searchString)),
    resetSelectedValue: () => dispatch(actions.resetSelectedValue())
});

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Hierarchy)
);
