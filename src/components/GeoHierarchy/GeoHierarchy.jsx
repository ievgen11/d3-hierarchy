import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';

import _d3 from './_d3';

class GeoHierarchy extends Component {
    static propTypes = {
        data: PropTypes.object,
        width: PropTypes.number,
        height: PropTypes.number
    };

    static defaultProps = {
        width: 1000,
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

        this._d3.updateData(data);
    }

    render() {
        return (
            <div
                ref={node => {
                    this._root = select(node);
                }}
            />
        );
    }
}

export default GeoHierarchy;
