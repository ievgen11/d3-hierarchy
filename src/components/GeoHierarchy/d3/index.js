import { tree, hierarchy } from 'd3-hierarchy';
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { event, select } from 'd3-selection';
import 'd3-transition';

import {
    TRANSITION_DURATION,
    ROOT_COLOR,
    NODE_COLOR,
    CHILD_COLOR,
    LINK_COLOR,
    SELECTED_COLOR,
    HOVER_COLOR,
    DEFAULT_CHILDREN_KEY,
    DEFAULT_FORMAT_LABEL_TEXT,
    DEFAULT_HEIGHT,
    DEFAULT_NDDE_SIZE,
    DEFAULT_NODE_DISTANCE,
    DEFAULT_ON_NODE_CLICK,
    DEFAULT_SCALE_EXTENT,
    DEFAULT_SCALE_STEP,
    DEFAULT_UNIQUE_ID_KEY,
    DEFAULT_WIDTH,
    DEFAULT_SVG_CLASS
} from './constants';

import './styles.css';

function diagonal(s, d) {
    return `M ${s.y} ${s.x}
    C ${(s.y + d.y) / 2} ${s.x},
      ${(s.y + d.y) / 2} ${d.x},
      ${d.y} ${d.x}`;
}

class _d3 {
    constructor({
        root,
        width = DEFAULT_WIDTH,
        height = DEFAULT_HEIGHT,
        nodeSize = DEFAULT_NDDE_SIZE,
        nodeDistance = DEFAULT_NODE_DISTANCE,
        scaleStep = DEFAULT_SCALE_STEP,
        scaleExtent = DEFAULT_SCALE_EXTENT,
        childrenKey = DEFAULT_CHILDREN_KEY,
        uniqueIdKey = DEFAULT_UNIQUE_ID_KEY,
        onNodeClick = DEFAULT_ON_NODE_CLICK,
        formatLabelText = DEFAULT_FORMAT_LABEL_TEXT,
        svgClass = DEFAULT_SVG_CLASS
    }) {
        this.config = {
            width,
            height,
            nodeSize,
            nodeDistance,
            scaleStep,
            scaleExtent,
            childrenKey,
            uniqueIdKey,
            onNodeClick,
            formatLabelText,
            svgClass
        };

        this.tree = tree().nodeSize(nodeSize);
        this.data = hierarchy({});
        this.selected = null;

        this._init(root);
    }

    updateData(data) {
        this.data = hierarchy(data, this._getConfig('childrenKeySelector'));

        if (this.data[this._getConfig('childrenKey')]) {
            this.data[this._getConfig('childrenKey')].forEach(child =>
                this._collapseDescendants(child)
            );
        }

        this._updateD3(this.data);
        this._zoomToPosition(this._getConfig('nodeDistance') / 2, 0, 1);
    }

    updateSelection(selected) {
        this.selected = selected;

        const nodes = this._searchTree(this.data, selected, []);

        if (nodes) {
            this._unselectNodes();
            this._expandSelected(nodes);
        }
    }

    resetSelection() {
        this.selected = null;

        this._unselectNodes();

        this._updateD3(this.data);
    }

    reload() {
        this.selected = null;

        this._unselectNodes();

        if (this.data[this._getConfig('childrenKey')]) {
            this.data[this._getConfig('childrenKey')].forEach(child =>
                this._collapseDescendants(child)
            );
        }

        this._zoomToPosition(this._getConfig('nodeDistance') / 2, 0, 1);
        this._updateD3(this.data);
    }

    resetZoom() {
        this._zoomToPosition(this._getConfig('nodeDistance') / 2, 0, 1);
    }

    zoomIn() {
        const { k: scale } = zoomTransform(this.svg.node());

        this.zoom.scaleTo(this.svg, scale + this._getConfig('scaleStep'));
    }

    zoomOut() {
        const { k: scale } = zoomTransform(this.svg.node());

        this.zoom.scaleTo(this.svg, scale - this._getConfig('scaleStep'));
    }

    _getConfig(value) {
        return this.config[value];
    }

    _childrenKeySelector(d) {
        return d[this._getConfig('childrenKey')];
    }

    _expandSelected(nodes) {
        this._collapseDescendants(this.data);

        for (var i = 0, len = nodes.length; i < len; i++) {
            this._expandChildren(nodes[i]);
            this._updateD3(nodes[i]);

            if (i === nodes.length - 1) {
                setTimeout(() => {
                    const { y, x } = select(nodes[i - 1]).node();

                    this._selectNode(nodes[i - 1]);
                    this._zoomToPosition(y, x, 1.5);
                }, TRANSITION_DURATION);
            }
        }
    }

    _unselectNodes() {
        this._formatLink(
            this.svg
                .selectAll('path')
                .filter(function() {
                    return this.getAttribute('is-selected') === 'true';
                })
                .attr('is-selected', null)
        );
        this._formatIndicator(
            this.svg
                .selectAll('.indicator')
                .filter(function() {
                    return this.getAttribute('is-selected') === 'true';
                })
                .attr('is-selected', null)
        );
    }

    _selectNode(d) {
        this._formatLink(
            this.svg
                .selectAll('path')
                .filter(
                    node =>
                        d
                            .ancestors()
                            .reverse()
                            .indexOf(node) >= 0
                )
                .attr('is-selected', 'true')
        );
        this._formatIndicator(
            this.svg
                .selectAll('.indicator')
                .filter(
                    node =>
                        d
                            .ancestors()
                            .reverse()
                            .indexOf(node) >= 0
                )
                .attr('is-selected', 'true')
        );
    }

    _searchTree(node, searchString, pathArray) {
        if (node.data[this._getConfig('uniqueIdKey')] === searchString) {
            pathArray.push(node);

            return pathArray;
        }

        const children = node[this._getConfig('childrenKey')]
            ? node[this._getConfig('childrenKey')]
            : node[`_${this._getConfig('childrenKey')}`];

        if (!children) {
            return false;
        }

        for (var i = 0; i < children.length; i++) {
            pathArray.push(node);

            var found = this._searchTree(children[i], searchString, pathArray);

            if (found) {
                return found;
            }

            pathArray.pop();
        }
    }

    _collapseDescendants(d) {
        if (this._childrenKeySelector(d)) {
            d[`_${this._getConfig('childrenKey')}`] = this._childrenKeySelector(
                d
            );
            d[`_${this._getConfig('childrenKey')}`].forEach(child =>
                this._collapseDescendants(child)
            );
            d[this._getConfig('childrenKey')] = null;
        }

        return d;
    }

    _expandChildren(d) {
        if (this._childrenKeySelector(d) === null) {
            d[this._getConfig('childrenKey')] =
                d[`_${this._getConfig('childrenKey')}`];
            d[`_${this._getConfig('childrenKey')}`] = null;
        }

        return d;
    }

    _handleClick(d) {
        this._getConfig('onNodeClick')(d);

        if (this._childrenKeySelector(d)) {
            this._collapseDescendants(d);
        } else {
            this._expandChildren(d);
        }

        this._updateD3(d);
    }

    _formatIndicator(node) {
        return node
            .attr('r', 5)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('stroke-width', 5)
            .attr('stroke', function(d) {
                if (this.getAttribute('is-selected') === 'true') {
                    return SELECTED_COLOR;
                }

                if (this.getAttribute('is-hover') === 'true') {
                    return HOVER_COLOR;
                }

                if (d.data.type === 'Port') {
                    return CHILD_COLOR;
                }

                if (!d.parent) {
                    return ROOT_COLOR;
                }

                return NODE_COLOR;
            })
            .attr('fill', function(d) {
                if (this.getAttribute('is-selected') === 'true') {
                    return SELECTED_COLOR;
                }

                if (this.getAttribute('is-hover') === 'true') {
                    return HOVER_COLOR;
                }

                if (d.data.type === 'Port') {
                    return CHILD_COLOR;
                }

                if (!d.parent) {
                    return ROOT_COLOR;
                }

                return NODE_COLOR;
            });
    }

    _formatLabel(node) {
        return node
            .attr('font-weight', d => {
                if (d.data.type === 'Port') {
                    return 600;
                }

                return 300;
            })
            .attr('dy', -15)
            .attr('x', 0)
            .style('fill', '#10183a')
            .attr('text-anchor', () => 'middle')
            .text(this._getConfig('formatLabelText'));
    }

    _formatOverlay(node) {
        return node
            .attr('x', -25)
            .attr('y', -25)
            .attr('height', 50)
            .attr('width', 50)
            .style('fill', 'none')
            .style('pointer-events', 'all');
    }

    _handleMouseOver(d) {
        this._formatLink(
            this.svg
                .selectAll('path')
                .filter(
                    node =>
                        d
                            .ancestors()
                            .reverse()
                            .indexOf(node) >= 0
                )
                .attr('is-hover', 'true')
        );
        this._formatIndicator(
            this.svg
                .selectAll('.indicator')
                .filter(
                    node =>
                        d
                            .ancestors()
                            .reverse()
                            .indexOf(node) >= 0
                )
                .attr('is-hover', 'true')
        );
    }

    _handleMouseLeave() {
        this._formatLink(
            this.svg
                .selectAll('path')
                .filter(function() {
                    return this.getAttribute('is-hover') === 'true';
                })
                .attr('is-hover', null)
        );
        this._formatIndicator(
            this.svg
                .selectAll('.indicator')
                .filter(function() {
                    return this.getAttribute('is-hover') === 'true';
                })
                .attr('is-hover', null)
        );
    }

    _generateNodes(target, data) {
        var node = this.svg
            .select('.container')
            .selectAll('.node')
            .data(data, d => d.data[this._getConfig('uniqueIdKey')]);

        var nodeEnter = node
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', () => `translate(${target.y0},${target.x0})`);

        var nodeExit = node
            .exit()
            .style('opacity', 1)
            .transition()
            .duration(TRANSITION_DURATION)
            .style('opacity', 0)
            .attr('transform', () => `translate(${target.y},${target.x})`)
            .remove();

        this._formatIndicator(node.selectAll('.indicator'));
        this._formatLabel(node.selectAll('.label'));
        this._formatOverlay(node.selectAll('.overlay'));

        this._formatIndicator(
            nodeEnter
                .append('circle')
                .attr('class', 'indicator')
                .style('opacity', 0)
                .transition()
                .duration(TRANSITION_DURATION)
                .style('opacity', 1)
        );

        this._formatLabel(
            nodeEnter
                .append('text')
                .attr('class', 'label')
                .style('opacity', 0)
                .transition()
                .duration(TRANSITION_DURATION)
                .style('opacity', 1)
        );

        this._formatOverlay(nodeEnter.append('rect').attr('class', 'overlay'));

        var nodeUpdate = nodeEnter.merge(node);

        nodeUpdate
            .on('click', d => this._handleClick(d))
            .on('mouseover', d => this._handleMouseOver(d))
            .on('mouseleave', d => this._handleMouseLeave(d));

        nodeUpdate
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('transform', d => `translate(${d.y},${d.x})`);
    }

    _formatLink(node) {
        return node
            .attr('fill', 'none')
            .attr('stroke', function(d) {
                if (this.getAttribute('is-selected') === 'true') {
                    return SELECTED_COLOR;
                }

                if (this.getAttribute('is-hover') === 'true') {
                    return HOVER_COLOR;
                }

                return LINK_COLOR;
            })
            .attr('stroke-width', 1);
    }

    _generateLinks(target, data) {
        var link = this.svg
            .select('.container')
            .selectAll('.link')
            .data(data, d => d.data[this._getConfig('uniqueIdKey')]);

        var linkEnter = link
            .enter()
            .insert('path', 'g')
            .attr('class', 'link');

        var linkExit = link
            .exit()
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('d', () =>
                diagonal(
                    { x: target.x, y: target.y },
                    { x: target.x, y: target.y }
                )
            )
            .remove();

        this._formatLink(
            link
                .selectAll('.link')
                .attr('d', () =>
                    diagonal(
                        { x: target.x0, y: target.y0 },
                        { x: target.x0, y: target.y0 }
                    )
                )
        );

        this._formatLink(
            linkEnter.attr('d', () =>
                diagonal(
                    { x: target.x0, y: target.y0 },
                    { x: target.x0, y: target.y0 }
                )
            )
        );

        var linkUpdate = linkEnter.merge(link);

        linkUpdate
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('d', d => (d && d.parent ? diagonal(d, d.parent) : null));
    }

    _updateD3(target) {
        var data = this.tree(this.data)
            .descendants()
            .map(d => {
                d.y = d.depth * this._getConfig('nodeDistance');
                d.x0 = d.x;
                d.y0 = d.y;

                return d;
            });

        this._generateNodes(target, data);
        this._generateLinks(target, data);
    }

    _zoomToPosition(y, x, scale) {
        this.svg
            .call(this.zoom)
            .transition()
            .duration(TRANSITION_DURATION)
            .call(
                this.zoom.transform,
                zoomIdentity
                    .translate(
                        -y * scale + this._getConfig('width') / 2,
                        -x * scale + this._getConfig('height') / 2
                    )
                    .scale(scale)
            );
    }

    _init(root) {
        this.svg = root
            .append('svg')
            .attr('class', this._getConfig('svgClass'))
            .style('pointer-events', 'all');

        this.svg.append('g').attr('class', 'container');

        this.zoom = zoom()
            .scaleExtent(this._getConfig('scaleExtent'))
            .on('zoom', () =>
                this.svg.select('.container').attr('transform', event.transform)
            );
    }
}

export default _d3;
