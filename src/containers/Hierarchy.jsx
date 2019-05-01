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
        searchQuery: PropTypes.string,
        isError: PropTypes.bool.isRequired,
        isPending: PropTypes.bool.isRequired,
        getDataAction: PropTypes.func.isRequired,
        setSearchQuery: PropTypes.func.isRequired,
        resetSearchQuery: PropTypes.func.isRequired,
        isExpanded: PropTypes.bool.isRequired
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
            searchQuery,
            resetSearchQuery,
            setSearchQuery,
            isExpanded
        } = this.props;

        return (
            <HierarchyComponent
                data={data}
                minWidth={800}
                minHeight={500}
                onItemClick={node => {
                    if (node.data.children.length !== 0) {
                        return;
                    }

                    window
                        .open(
                            `https://www.google.com/search?q=${node.data.name}`,
                            '_blank'
                        )
                        .focus();
                    return;
                }}
                isExpanded={isExpanded}
                isPending={isPending}
                isError={isError}
                searchQuery={searchQuery}
                onSearchSubmit={searchString => setSearchQuery(searchString)}
                onSelectionClear={() => resetSearchQuery()}
            />
        );
    }
}

const mapStateToProps = state => ({
    data: selectors.getData(state),
    searchQuery: selectors.getSearchQuery(state),
    isExpanded: selectors.getDataIsExpanded(state),
    isError: selectors.getDataIsError(state),
    isPending: selectors.getDataIsPending(state)
});

const mapDispatchToProps = dispatch => ({
    getDataAction: () => dispatch(actions.getData()),
    setSearchQuery: searchString =>
        dispatch(actions.setSearchQuery(searchString)),
    resetSearchQuery: () => dispatch(actions.resetSearchQuery())
});

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Hierarchy)
);
