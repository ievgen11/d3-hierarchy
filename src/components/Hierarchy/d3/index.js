import { hierarchy, tree } from 'd3-hierarchy';
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom';
import { event, select } from 'd3-selection';
import { transform } from 'd3-transform';

import 'd3-transition';

import {
    TRANSITION_DURATION,
    ROOT_COLOR,
    NODE_COLOR,
    LEAF_COLOR,
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
    DEFAULT_SVG_CLASS,
    DEFAULT_ON_SELECTION_CLEAR,
    DEFAULT_LEAF_TYPE,
    DEFAULT_CHILD_TYPE_KEY,
    DEFAULT_LEAF_DASH_ARRAY_SIZE
} from './constants';

function elbow(s, d) {
    return `M ${s.y} ${s.x}
    C ${(s.y + d.y) / 2} ${s.x},
      ${(s.y + d.y) / 2} ${d.x},
      ${d.y} ${d.x}`;
}

function getTranslation(transform) {
    // Create a dummy g for calculation purposes only. This will never
    // be appended to the DOM and will be discarded once this function
    // returns.
    var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // Set the transform attribute to the provided string value.
    g.setAttributeNS(null, 'transform', transform);

    // consolidate the SVGTransformList containing all transformations
    // to a single SVGTransform of type SVG_TRANSFORM_MATRIX and get
    // its SVGMatrix.
    var matrix = g.transform.baseVal.consolidate().matrix;

    // As per definition values e and f are the ones for the translation.
    return [matrix.e, matrix.f];
}

class _d3 {
    constructor({
        root,
        nodeSize = DEFAULT_NDDE_SIZE,
        nodeDistance = DEFAULT_NODE_DISTANCE,
        scaleStep = DEFAULT_SCALE_STEP,
        scaleExtent = DEFAULT_SCALE_EXTENT,
        childrenKey = DEFAULT_CHILDREN_KEY,
        uniqueIdKey = DEFAULT_UNIQUE_ID_KEY,
        onLeafClick = DEFAULT_ON_NODE_CLICK,
        formatLabelText = DEFAULT_FORMAT_LABEL_TEXT,
        svgClass = DEFAULT_SVG_CLASS,
        onSelectionClear = DEFAULT_ON_SELECTION_CLEAR,
        leafType = DEFAULT_LEAF_TYPE,
        childTypeKey = DEFAULT_CHILD_TYPE_KEY,
        leafDashArraySize = DEFAULT_LEAF_DASH_ARRAY_SIZE,
        selectedValue = null
    }) {
        this.config = {
            nodeSize,
            nodeDistance,
            scaleStep,
            scaleExtent,
            childrenKey,
            uniqueIdKey,
            onLeafClick,
            formatLabelText,
            svgClass,
            onSelectionClear,
            leafType,
            childTypeKey,
            leafDashArraySize
        };

        this.tree = tree().nodeSize(nodeSize);
        this.data = hierarchy({});
        this.selected = selectedValue;

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

        if (this.selected !== null) {
            this.updateSelection(this.selected);
        }

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

        this._getConfig('onSelectionClear')();

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

        for (let i = 0, len = nodes.length; i < len; i += 1) {
            this._expandChildren(nodes[i]);
            this._updateD3(nodes[i]);

            if (i === nodes.length - 1) {
                this._focusOnSelectedNode(nodes[i]);
            }
        }
    }

    _focusOnSelectedNode(node) {
        setTimeout(() => {
            const { y, x } = select(node).node();
            this._selectNode(node);
            this._zoomToPosition(y, x, 1.5);
        }, TRANSITION_DURATION);
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

        for (let i = 0; i < children.length; i += 1) {
            pathArray.push(node);

            const found = this._searchTree(
                children[i],
                searchString,
                pathArray
            );

            if (found) {
                return found;
            }

            pathArray.pop();
        }

        return null;
    }

    _collapseDescendants(node) {
        const collapsedNode = node;

        if (this._childrenKeySelector(collapsedNode)) {
            collapsedNode[
                `_${this._getConfig('childrenKey')}`
            ] = this._childrenKeySelector(collapsedNode);
            collapsedNode[`_${this._getConfig('childrenKey')}`].forEach(child =>
                this._collapseDescendants(child)
            );
            collapsedNode[this._getConfig('childrenKey')] = null;
        }

        return collapsedNode;
    }

    _expandChildren(node) {
        const expandedNode = node;

        if (this._childrenKeySelector(expandedNode) === null) {
            expandedNode[this._getConfig('childrenKey')] =
                expandedNode[`_${this._getConfig('childrenKey')}`];
            expandedNode[`_${this._getConfig('childrenKey')}`] = null;
        }

        return expandedNode;
    }

    _handleClick(d) {
        if (
            d.data[this._getConfig('childTypeKey')] ===
            this._getConfig('leafType')
        ) {
            this._getConfig('onLeafClick')(d);
        }

        if (this._childrenKeySelector(d)) {
            this.resetSelection();
            this._collapseDescendants(d);
        } else {
            this._expandChildren(d);
        }

        this._updateD3(d);
    }

    _formatIndicator(node) {
        const that = this;

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

                if (
                    d.data[that._getConfig('childTypeKey')] ===
                    that._getConfig('leafType')
                ) {
                    return LEAF_COLOR;
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

                if (
                    d.data[that._getConfig('childTypeKey')] ===
                    that._getConfig('leafType')
                ) {
                    return LEAF_COLOR;
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
                if (
                    d.data[this._getConfig('childTypeKey')] ===
                    this._getConfig('leafType')
                ) {
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

    _formatLink(node) {
        return node
            .attr('fill', 'none')
            .attr('d', function(d) {
                if (!d.parent) {
                    return null;
                }

                return elbow(d.parent, d);
            })
            .attr('stroke', function() {
                if (this.getAttribute('is-selected') === 'true') {
                    return SELECTED_COLOR;
                }

                if (this.getAttribute('is-hover') === 'true') {
                    return HOVER_COLOR;
                }

                return LINK_COLOR;
            })
            .attr('transform', function(d) {
                if (!d.parent) {
                    return null;
                }

                return transform().translate(d => [d.y, d.x])({
                    x: -getTranslation(
                        select(this.parentNode).attr('transform')
                    )[1],
                    y: -getTranslation(
                        select(this.parentNode).attr('transform')
                    )[0]
                });
            })
            .attr('stroke-dasharray', d =>
                d.data[this._getConfig('childrenKey')].length > 0 ? null : this._getConfig('leafDashArraySize')
            )
            .attr('stroke-width', 2);
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
        this.svg
            .selectAll('.node')
            .filter(
                node =>
                    d
                        .ancestors()
                        .reverse()
                        .indexOf(node) >= 0
            )
            .filter(function() {
                select(this).raise();
            });

        this._formatLink(
            this.svg
                .selectAll('.link')
                .filter(
                    node =>
                        d
                            .ancestors()
                            .reverse()
                            .indexOf(node) >= 0
                )
                .attr('is-hover', 'true')
                .transition()
                .duration(TRANSITION_DURATION)
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
                .transition()
                .duration(TRANSITION_DURATION)
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
                .transition()
                .duration(TRANSITION_DURATION)
        );
        this._formatIndicator(
            this.svg
                .selectAll('.indicator')
                .filter(function() {
                    return this.getAttribute('is-hover') === 'true';
                })
                .attr('is-hover', null)
                .transition()
                .duration(TRANSITION_DURATION)
        );
    }

    _generateExisting(node) {
        this._formatLink(node.selectAll('.link'));
        this._formatIndicator(node.selectAll('.indicator'));
        this._formatLabel(node.selectAll('.label'));
        this._formatOverlay(node.selectAll('.overlay'));
    }

    _generateEnter(node, target) {
        const nodeEnter = node
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('id', d => d.data[this._getConfig('uniqueIdKey')])
            .attr('transform', d =>
                transform().translate(d => [d.y, d.x])({
                    x: target.x0,
                    y: target.y0
                })
            )
            .attr('cursor', 'pointer');

        nodeEnter.call(d => d.lower());

        nodeEnter
            .style('opacity', 0)
            .transition()
            .duration(TRANSITION_DURATION)
            .style('opacity', 1);

        this._formatLink(nodeEnter.append('path', 'g').attr('class', 'link'));

        this._formatIndicator(
            nodeEnter.append('circle').attr('class', 'indicator')
        );
        this._formatLabel(nodeEnter.append('text').attr('class', 'label'));
        this._formatOverlay(nodeEnter.append('rect').attr('class', 'overlay'));

        return nodeEnter;
    }

    _generateExit(node, target) {
        node.exit()
            .selectAll('.link')
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('d', () =>
                elbow(
                    { x: target.x, y: target.y },
                    { x: target.x, y: target.y }
                )
            )
            .attr('transform', d =>
                transform().translate(d => [d.y, d.x])({
                    x: -target.x,
                    y: -target.y
                })
            );

        node.exit()
            .style('opacity', 1)
            .transition()
            .duration(TRANSITION_DURATION)
            .style('opacity', 0)
            .attr('transform', () =>
                transform().translate(d => [d.y, d.x])({
                    x: target.x,
                    y: target.y
                })
            )
            .remove();
    }

    _generateUpdate(node, enterNodes, target) {
        const nodeUpdate = enterNodes.merge(node);

        nodeUpdate
            .on('click', d => this._handleClick(d))
            .on('mouseover', d => this._handleMouseOver(d, target))
            .on('mouseleave', d => this._handleMouseLeave(d, target));

        nodeUpdate.attr('transform', d =>
            transform().translate(d => [d.y, d.x])({
                x: d.x,
                y: d.y
            })
        );

        this._formatLink(nodeUpdate.selectAll('.link'));
    }

    _generateNodes(target, data) {
        const node = this.svg
            .select('.container')
            .selectAll('.node')
            .data(data, d => d.data[this._getConfig('uniqueIdKey')]);

        // Format existing stuff
        this._generateExisting(node);

        // Format exit stuff
        this._generateExit(node, target);

        // Format update stuff
        this._generateUpdate(node, this._generateEnter(node, target), target);
    }

    _updateD3(target) {
        const data = this.tree(this.data)
            .descendants()
            .map(node => {
                const updatedNode = node;
                updatedNode.y =
                    updatedNode.depth * this._getConfig('nodeDistance');
                updatedNode.x0 = node.x;
                updatedNode.y0 = node.y;

                return updatedNode;
            });

        this._generateNodes(target, data);
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
        const { width, height } = root.node().getBoundingClientRect();

        this.config.width = width > 0 ? width : DEFAULT_WIDTH;
        this.config.height = height > 0 ? height : DEFAULT_HEIGHT;

        this.svg = root
            .append('svg')
            .attr('class', this._getConfig('svgClass'))
            .style('pointer-events', 'all');

        this.svg.append('g').attr('class', 'container');

        this.zoom = zoom()
            .scaleExtent(this._getConfig('scaleExtent'))
            .on('zoom', () => {
                this.svg
                    .select('.container')
                    .attr('transform', event.transform);
            });
    }
}

export default _d3;
