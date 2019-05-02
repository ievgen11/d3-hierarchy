import React, { Component } from 'react';
import { hierarchy } from 'd3-hierarchy';
import { Button } from '@rmwc/button';
import { ThemeProvider } from '@rmwc/theme';
import { MenuSurfaceAnchor, Menu, MenuItem } from '@rmwc/menu';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import actions from '../redux/actions';
import selectors from '../redux/selectors';

class Selector extends Component {
    static propTypes = {
        data: PropTypes.object.isRequired,
        searchQuery: PropTypes.string,
        setSearchQuery: PropTypes.func.isRequired,
        resetSearchQuery: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleSearchClear = this.handleSearchClear.bind(this);

        this.state = {
            isOpen: false
        };
    }

    handleSearchSubmit(searchQuery) {
        const { setSearchQuery } = this.props;

        setSearchQuery(searchQuery);
    }

    handleSearchClear() {
        const { resetSearchQuery } = this.props;
        resetSearchQuery();
    }

    render() {
        const { data, searchQuery } = this.props;
        const { isOpen } = this.state;

        return (
            <>
                <MenuSurfaceAnchor>
                    {searchQuery ? (
                        <ThemeProvider
                            options={{
                                primary: '#EFC958'
                            }}
                        >
                            <Button
                                dense
                                icon="close"
                                raised
                                onClick={this.handleSearchClear}
                            >
                                {searchQuery}
                            </Button>
                        </ThemeProvider>
                    ) : (
                        <ThemeProvider
                            options={{
                                primary: '#fff'
                            }}
                        >
                            <Button
                                dense
                                raised
                                icon="search"
                                onClick={() =>
                                    this.setState(() => ({ isOpen: true }))
                                }
                            >
                                Search...
                            </Button>
                        </ThemeProvider>
                    )}
                    <Menu
                        open={isOpen}
                        onSelect={evt =>
                            this.handleSearchSubmit(
                                evt.detail.item.getAttribute('data-name')
                            )
                        }
                        onClose={() => this.setState(() => ({ isOpen: false }))}
                        style={{ width: '300px' }}
                    >
                        {hierarchy(data.toJS())
                            .descendants()
                            .map((item, index) => (
                                <MenuItem
                                    key={index}
                                    data-name={item.data.name}
                                >
                                    {item.data.name}
                                </MenuItem>
                            ))}
                    </Menu>
                </MenuSurfaceAnchor>
            </>
        );
    }
}

const mapStateToProps = state => ({
    data: selectors.getData(state),
    searchQuery: selectors.getSearchQuery(state)
});

const mapDispatchToProps = dispatch => ({
    setSearchQuery: searchString =>
        dispatch(actions.setSearchQuery(searchString)),
    resetSearchQuery: () => dispatch(actions.resetSearchQuery())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Selector);
