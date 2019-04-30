import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Map } from 'immutable';

import { select } from 'd3-selection';
import { ThemeProvider } from '@rmwc/theme';
import { TextField } from '@rmwc/textfield';
import { Icon } from '@rmwc/icon';
import { Fab } from '@rmwc/fab';
import { CircularProgress } from '@rmwc/circular-progress';

import _d3 from './d3';

import './styles/styles.css';

class Hierarchy extends Component {
    static propTypes = {
        data: PropTypes.object,
        isPending: PropTypes.bool,
        minWidth: PropTypes.any,
        minHeight: PropTypes.any,
        selectedValue: PropTypes.string,
        onSelectionClear: PropTypes.func,
        onSearchSubmit: PropTypes.func,
        svgClass: PropTypes.string,
        uniqueIdKey: PropTypes.string,
        childTypeKey: PropTypes.string,
        leafType: PropTypes.string.isRequired,
        onLeafClick: PropTypes.func.isRequired,
        formatLabelText: PropTypes.func.isRequired
    };

    static defaultProps = {
        isPending: false,
        minWidth: 'auto',
        minHeight: 'auto',
        svgClass: 'geo-hierarchy',
        uniqueIdKey: 'location',
        childTypeKey: 'type',
        selectedValue: null
    };

    constructor(props) {
        super(props);

        this.handleFullscreen = this.handleFullscreen.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleSearchSubmit = this.handleSearchSubmit.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSearchClear = this.handleSearchClear.bind(this);
        this.handleSelectionClear = this.handleSelectionClear.bind(this);

        this.state = {
            isFullscreen: false,
            searchString: ''
        };
    }

    componentDidMount() {
        const {
            selectedValue,
            svgClass,
            uniqueIdKey,
            childTypeKey,
            leafType,
            onLeafClick,
            formatLabelText
        } = this.props;

        this._d3 = new _d3({
            root: this._root,
            selectedValue: selectedValue,
            svgClass: svgClass,
            uniqueIdKey: uniqueIdKey,
            childTypeKey: childTypeKey,
            leafType: leafType,
            onLeafClick: onLeafClick,
            onSelectionClear: this.handleSelectionClear,
            formatLabelText: formatLabelText
        });

        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    }

    componentDidUpdate(prevProps) {
        const { data, selectedValue } = this.props;

        if (!Map.isMap(data)) {
            return;
        }

        if (data.get('children').size <= 0) {
            return;
        }

        if (!data.equals(prevProps.data)) {
            this._d3.updateData(data.toJS());
        }

        if (selectedValue !== prevProps.selectedValue) {
            if (selectedValue === null) {
                this._d3.resetSelection();
            } else {
                this._d3.setSelection(selectedValue);
            }
        }
    }

    handleSelectionClear() {
        const { onSelectionClear } = this.props;

        this.setState(() => ({ searchString: '' }), onSelectionClear);
    }

    handleResize() {
        this._d3.updateDimensions();
    }

    handleFullscreen() {
        this.setState(
            state => ({ isFullscreen: !state.isFullscreen }),
            this.handleResize
        );
    }

    handleSearchSubmit() {
        const { onSearchSubmit } = this.props;
        const { searchString } = this.state;

        onSearchSubmit(searchString);
    }

    handleSearchChange(ev) {
        ev.persist();
        this.setState(() => ({ searchString: ev.target.value }));
    }

    handleSearchClear() {
        this._d3.resetSelection();
        this.setState(() => ({ searchString: '' }));
    }

    render() {
        const { minWidth, minHeight, isPending, selectedValue } = this.props;
        const { isFullscreen, searchString } = this.state;

        return (
            <div
                className={cx([
                    'container',
                    {
                        'container--is-fullscreen': isFullscreen
                    }
                ])}
                style={{
                    minWidth,
                    minHeight
                }}
                ref={node => {
                    this._root = select(node);
                }}
            >
                {isPending ? (
                    <div className="loaderContainer">
                        <CircularProgress size="xlarge" />
                    </div>
                ) : null}
                <div className="toolbar--top-left">
                    <ThemeProvider
                        options={{
                            primary: 'rgba(0, 0, 0, 0.54)'
                        }}
                    >
                        {selectedValue ? (
                            <TextField
                                className="searchBar"
                                value={selectedValue}
                                readOnly
                                trailingIcon={{
                                    icon: 'close',
                                    tabIndex: 0,
                                    onClick: this.handleSearchClear
                                }}
                            />
                        ) : (
                            <TextField
                                className="searchBar"
                                value={searchString}
                                onChange={this.handleSearchChange}
                                trailingIcon={{
                                    icon: 'search',
                                    tabIndex: 0,
                                    onClick: this.handleSearchSubmit
                                }}
                            />
                        )}
                    </ThemeProvider>
                </div>
                <div className="toolbar--top-right">
                    <Fab
                        className="toolbarIcon"
                        onClick={() => this.handleFullscreen()}
                    >
                        <Icon
                            icon={{
                                icon: isFullscreen
                                    ? 'fullscreen_exit'
                                    : 'fullscreen',
                                size: 'medium'
                            }}
                        />
                    </Fab>
                    <Fab
                        className="toolbarIcon"
                        onClick={() => this._d3.reload()}
                    >
                        <Icon icon={{ icon: 'refresh', size: 'medium' }} />
                    </Fab>
                </div>
                <div className="toolbar--bottom">
                    <Fab
                        className="toolbarIcon"
                        onClick={() => this._d3.zoomIn()}
                    >
                        <Icon icon={{ icon: 'add', size: 'medium' }} />
                    </Fab>
                    <Fab
                        className="toolbarIcon"
                        onClick={() => this._d3.resetZoom()}
                    >
                        <Icon icon={{ icon: 'gps_fixed', size: 'small' }} />
                    </Fab>
                    <Fab
                        className="toolbarIcon"
                        onClick={() => this._d3.zoomOut()}
                    >
                        <Icon icon={{ icon: 'remove', size: 'medium' }} />
                    </Fab>
                </div>
            </div>
        );
    }
}

export default Hierarchy;
