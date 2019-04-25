import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Map } from 'immutable';

import { select } from 'd3-selection';

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
    toolbarContent: PropTypes.node,
    svgClass: PropTypes.string,
    uniqueIdKey: PropTypes.string,
    childTypeKey: PropTypes.string,
    leafType: PropTypes.string.isRequired,
    onLeafClick: PropTypes.func.isRequired,
    formatLabelText: PropTypes.func.isRequired,
  };

  static defaultProps = {
    isPending: false,
    minWidth: 'auto',
    minHeight: 'auto',
    svgClass: 'geo-hierarchy',
    uniqueIdKey: 'location',
    childTypeKey: 'type',
    selectedValue: null,
  };

  constructor(props) {
    super(props);

    this.handleFullscreen = this.handleFullscreen.bind(this);

    this.state = {
      isFullscreen: false,
    };
  }

  componentDidMount() {
    const {
      onSelectionClear,
      selectedValue,
      svgClass,
      uniqueIdKey,
      childTypeKey,
      leafType,
      onLeafClick,
      formatLabelText,
    } = this.props;

    this._d3 = new _d3({
      root: this._root,
      selectedValue: selectedValue,
      svgClass: svgClass,
      uniqueIdKey: uniqueIdKey,
      childTypeKey: childTypeKey,
      leafType: leafType,
      onLeafClick: onLeafClick,
      onSelectionClear: onSelectionClear,
      formatLabelText: formatLabelText,
    });
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props;

    if (!Map.isMap(data)) {
      return;
    }

    if (data.get('children').size <= 0) {
      return;
    }

    if (!data.equals(prevProps.data)) {
      this._d3.updateData(data.toJS());
    }

    if (this.props.selectedValue !== prevProps.selectedValue) {
      if (this.props.selectedValue === null) {
        this._d3.resetSelection();
      } else {
        this._d3.updateSelection(this.props.selectedValue);
      }
    }
  }

  handleFullscreen() {
    this.setState(state => ({ isFullscreen: !state.isFullscreen }));
  }

  render() {
    const {
      toolbarContent,
      minWidth,
      minHeight,
      isPending,
    } = this.props;
    const { isFullscreen } = this.state;

    return (
        <div
          className={cx([
            "container",
            {
              "container--is-fullscreen": isFullscreen,
            },
          ])}
          style={{
            minWidth,
            minHeight,
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
          {toolbarContent ? (
            <div className="toolbar--top-left">
              {toolbarContent}
            </div>
          ) : null}
          <div className="toolbar--top-right">
            <Fab
              className="toolbarIcon"
              onClick={() => this.handleFullscreen()}
            >
              <Icon
                icon={{
                  icon: isFullscreen ? 'fullscreen_exit' : 'fullscreen',
                  size: 'medium',
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
