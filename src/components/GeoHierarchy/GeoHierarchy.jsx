import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
import { Map } from 'immutable';

import _d3 from './d3';

import './styles.css';

class GeoHierarchy extends Component {
    static propTypes = {
        data: PropTypes.object,
        width: PropTypes.number,
        height: PropTypes.number,
        selectedValue: PropTypes.string
    };

    static defaultProps = {
        width: 1280,
        height: 800
    };

    constructor(props) {
        super(props);

        this.state = {
            selected: null
        };
    }

    componentDidMount() {
        const { width, height } = this.props;
        this._d3 = new _d3({
            root: this._root,
            width: width,
            height: height,
            svgClass: 'geo-hierarchy',
            uniqueIdKey: 'location',
            onNodeClick: node => {
                if (node.data.type === 'Port') {
                    window
                        .open(`http://locode.info/${node.data.location}`, '_blank')
                        .focus();
                    return;
                }
            },
            formatLabelText: node => {
                if (node.data.type === 'Port') {
                    return `${node.data.name} (${node.data.location})`;
                }
                return node.data.name;
            }
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
            if (this.props.selectedValue === '') {
                return this._d3.resetSelection()
            }
            this._d3.updateSelection(this.props.selectedValue)
        }
    }

    render() {
        const { selectedValue } = this.props;

        return (
            <div
                className="container"
                style={{
                    width: this.props.width,
                    height: this.props.height
                }}
                ref={node => {
                    this._root = select(node);
                }}
            >
                <div className="toolbar">
                    <button onClick={() => this._d3.zoomIn()}>+</button>
                    <button onClick={() => this._d3.resetZoom()}>O</button>
                    <button onClick={() => this._d3.zoomOut()}>-</button>
                    <br></br>
                    <button disabled={selectedValue === ''} onClick={() => this._d3.resetSelection()}>reset</button>
                    <br></br>
                    <button onClick={() => this._d3.reload()}>reload</button>
                </div>
            </div>
        );
    }
}

export default GeoHierarchy;
