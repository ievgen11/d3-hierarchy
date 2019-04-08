import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { select } from 'd3-selection';
import cx from 'classnames';

import _d3 from './d3';

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
            nodeSize: [60, 60],
            nodeDistance: 200
        });

        //this._d3.updateSelection(this.state.selected);
    }

    componentDidUpdate() {
        const { data } = this.props;

        if (data.get('children').size <= 0) {
            return;
        }

        this._d3.updateData(data.toJS());

        // setTimeout(() => this._d3.updateSelection('UAMPW'), 2000);
        // setTimeout(() => this._d3.updateSelection('MDGIU'), 4000);
        // setTimeout(() => this._d3.updateSelection('TWKEL'), 6000);
        // setTimeout(() => this._d3.updateSelection('SOBBO'), 8000);

        // setTimeout(() => this._d3.resetSelection(), 10000);
    }

    render() {
        const { isPending } = this.props;

        return (
            <div
                className={cx('container', { isPending: isPending })}
                style={{
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
