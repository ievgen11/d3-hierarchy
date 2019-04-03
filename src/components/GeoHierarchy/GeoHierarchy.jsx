import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';

import _d3 from './_d3';

import './styles.css';

class GeoHierarchy extends Component {
    static propTypes = {
        data: PropTypes.object,
        width: PropTypes.number,
        height: PropTypes.number
    };

    static defaultProps = {
        width: 1280,
        height: 500
    };

    componentDidMount() {
        const { width, height } = this.props;
        this._d3 = new _d3(
            this._root,
            width,
            height
        );
    }

    componentDidUpdate() {
        const { data } = this.props;

        if (Object.keys(data).length <= 0) {
            return;
        }

        this._d3.updateData(data);
    }

    render() {
        return (
            <div className="container" style={{
                width: this.props.width,
                height: this.props.height
            }}
                ref={node => {
                    this._root = select(node);
                }}
            />
        );
    }
}

export default GeoHierarchy;
