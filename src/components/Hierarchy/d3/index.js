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
    DEFAULT_SEARCH_QUERY_KEY,
    DEFAULT_WIDTH,
    DEFAULT_SVG_CLASS,
    DEFAULT_ON_SELECTION_CLEAR,
    DEFAULT_LEAF_DASH_ARRAY_SIZE
} from './constants';

import { getTranslation, pathGenerator } from './lib';

const _handleOnItemClick = Symbol('_handleOnItemClick');
const _handleOnItemMouseOver = Symbol('_handleOnItemMouseOver');
const _handleOnItemMouseLeave = Symbol('_handleOnItemMouseLeave');
const _generateItems = Symbol('_generateItems');
const _generateExistingItems = Symbol('_generateExistingItems');
const _generateEnterItems = Symbol('_generateEnterItems');
const _generateExitItems = Symbol('_generateExitItems');
const _generateUpdateItems = Symbol('_generateUpdateItems');
const _formatIndicators = Symbol('_formatIndicators');
const _formatLabels = Symbol('_formatLabels');
const _formatLinks = Symbol('_formatLinks');
const _formatOverlays = Symbol('_formatOverlays');
const _itemHasChildren = Symbol('_itemHasChildren');
const _getConfig = Symbol('_getConfig');
const _childrenKeySelector = Symbol('_childrenKeySelector');
const _expandItems = Symbol('_expandItems');
const _unselectNodes = Symbol('_unselectNodes');
const _selectNode = Symbol('_selectNode');
const _findSelectedPathItems = Symbol('_findSelectedPathItems');
const _collapseDescendants = Symbol('_collapseDescendants');
const _expandChildren = Symbol('_expandChildren');
const _updateD3 = Symbol('_updateD3');
const _zoomToItem = Symbol('_zoomToItem');
const _zoomToPosition = Symbol('_zoomToPosition');
const _init = Symbol('_init');

class _d3 {
    constructor({
        root,
        nodeSize = DEFAULT_NDDE_SIZE,
        nodeDistance = DEFAULT_NODE_DISTANCE,
        scaleStep = DEFAULT_SCALE_STEP,
        scaleExtent = DEFAULT_SCALE_EXTENT,
        childrenKey = DEFAULT_CHILDREN_KEY,
        searchQueryKey = DEFAULT_SEARCH_QUERY_KEY,
        onItemClick = DEFAULT_ON_NODE_CLICK,
        formatLabelText = DEFAULT_FORMAT_LABEL_TEXT,
        svgClass = DEFAULT_SVG_CLASS,
        onSelectionClear = DEFAULT_ON_SELECTION_CLEAR,
        leafDashArraySize = DEFAULT_LEAF_DASH_ARRAY_SIZE,
        searchQuery = null
    }) {
        this.config = {
            nodeSize,
            nodeDistance,
            scaleStep,
            scaleExtent,
            childrenKey,
            searchQueryKey,
            onItemClick,
            formatLabelText,
            svgClass,
            onSelectionClear,
            leafDashArraySize
        };

        this.tree = tree().nodeSize(nodeSize);
        this.data = hierarchy({});
        this.searchQuery = searchQuery;

        this[_init](root);
    }

    [_handleOnItemClick](item) {
        this[_getConfig]('onItemClick')(item);

        if (this[_childrenKeySelector](item)) {
            this.resetSelection();
            this[_collapseDescendants](item);
        } else {
            this[_expandChildren](item);
        }

        this[_updateD3](item);
    }

    [_handleOnItemMouseOver](item) {
        this.svg
            .selectAll('.item')
            .filter(
                node =>
                    item
                        .ancestors()
                        .reverse()
                        .indexOf(node) >= 0
            )
            .attr('is-hover', 'true')
            .each(function() {
                select(this).raise();
            });

        this[_formatLinks](
            this.svg
                .selectAll('.link')
                .transition()
                .duration(TRANSITION_DURATION)
        );
        this[_formatIndicators](
            this.svg
                .selectAll('.indicator')
                .transition()
                .duration(TRANSITION_DURATION)
        );
    }

    [_handleOnItemMouseLeave](item) {
        this.svg
            .selectAll('.item')
            .filter(
                node =>
                    item
                        .ancestors()
                        .reverse()
                        .indexOf(node) >= 0
            )
            .attr('is-hover', null);

        this[_formatLinks](
            this.svg
                .selectAll('.link')
                .transition()
                .duration(TRANSITION_DURATION)
        );
        this[_formatIndicators](
            this.svg
                .selectAll('.indicator')
                .transition()
                .duration(TRANSITION_DURATION)
        );
    }

    [_generateItems](rootItem, data) {
        const items = this.svg
            .select('.container')
            .selectAll('.item')
            .data(data, d => d.data[this[_getConfig]('searchQueryKey')]);

        this[_generateExistingItems](items);
        this[_generateExitItems](items, rootItem);
        this[_generateUpdateItems](
            items,
            this[_generateEnterItems](items, rootItem)
        );
    }

    [_generateExistingItems](items) {
        this[_formatLinks](items.selectAll('.link'));
        this[_formatIndicators](items.selectAll('.indicator'));
        this[_formatLabels](items.selectAll('.label'));
        this[_formatOverlays](items.selectAll('.overlay'));
    }

    [_generateEnterItems](items, rootItem) {
        const enterItems = items
            .enter()
            .append('g')
            .attr('class', 'item')
            .attr('transform', () =>
                transform().translate(d => [d.y, d.x])({
                    x: rootItem.x0,
                    y: rootItem.y0
                })
            )
            .attr('cursor', 'pointer');

        enterItems.call(d => d.lower());

        enterItems
            .style('opacity', 0)
            .transition()
            .duration(TRANSITION_DURATION)
            .style('opacity', 1);

        this[_formatLinks](
            enterItems.append('path', 'g').attr('class', 'link')
        );

        this[_formatIndicators](
            enterItems.append('circle').attr('class', 'indicator')
        );
        this[_formatLabels](enterItems.append('text').attr('class', 'label'));
        this[_formatOverlays](
            enterItems.append('rect').attr('class', 'overlay')
        );

        return enterItems;
    }

    [_generateExitItems](items, rootItem) {
        const exitItems = items.exit();

        exitItems
            .selectAll('.link')
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('d', () =>
                pathGenerator(
                    { x: rootItem.x, y: rootItem.y },
                    { x: rootItem.x, y: rootItem.y }
                )
            )
            .attr('transform', d =>
                transform().translate(d => [d.y, d.x])({
                    x: -rootItem.x,
                    y: -rootItem.y
                })
            );

        exitItems
            .style('opacity', 1)
            .transition()
            .duration(TRANSITION_DURATION)
            .style('opacity', 0)
            .attr('transform', () =>
                transform().translate(d => [d.y, d.x])({
                    x: rootItem.x,
                    y: rootItem.y
                })
            )
            .remove();

        return exitItems;
    }

    [_generateUpdateItems](items, enterItems) {
        const updateItems = enterItems.merge(items);

        updateItems
            .on('click', item => this[_handleOnItemClick](item))
            .on('mouseover', item => this[_handleOnItemMouseOver](item))
            .on('mouseleave', item => this[_handleOnItemMouseLeave](item));

        updateItems.attr('transform', d =>
            transform().translate(d => [d.y, d.x])({
                x: d.x,
                y: d.y
            })
        );

        this[_formatLinks](updateItems.selectAll('.link'));

        return updateItems;
    }

    [_formatIndicators](indicators) {
        const that = this;

        return indicators
            .attr('r', 5)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('stroke-width', 5)
            .attr('stroke', function(d) {
                if (this.parentNode.getAttribute('is-selected') === 'true') {
                    return SELECTED_COLOR;
                }

                if (this.parentNode.getAttribute('is-hover') === 'true') {
                    return HOVER_COLOR;
                }

                if (!that[_itemHasChildren](d)) {
                    return LEAF_COLOR;
                }

                if (!d.parent) {
                    return ROOT_COLOR;
                }

                return NODE_COLOR;
            })
            .attr('fill', function(d) {
                if (this.parentNode.getAttribute('is-selected') === 'true') {
                    return SELECTED_COLOR;
                }

                if (this.parentNode.getAttribute('is-hover') === 'true') {
                    return HOVER_COLOR;
                }

                if (!that[_itemHasChildren](d)) {
                    return LEAF_COLOR;
                }

                if (!d.parent) {
                    return ROOT_COLOR;
                }

                return NODE_COLOR;
            });
    }

    [_formatLabels](labels) {
        return labels
            .attr('font-weight', d => {
                if (!this[_itemHasChildren](d)) {
                    return 600;
                }

                return 300;
            })
            .attr('dy', -15)
            .attr('x', 0)
            .style('fill', '#10183a')
            .attr('text-anchor', () => 'middle')
            .text(this[_getConfig]('formatLabelText'));
    }

    [_formatLinks](links) {
        return links
            .attr('fill', 'none')
            .attr('d', function(d) {
                if (!d.parent) {
                    return null;
                }

                return pathGenerator(d.parent, d);
            })
            .attr('stroke', function() {
                if (this.parentNode.getAttribute('is-selected') === 'true') {
                    return SELECTED_COLOR;
                }

                if (this.parentNode.getAttribute('is-hover') === 'true') {
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
                this[_itemHasChildren](d)
                    ? null
                    : this[_getConfig]('leafDashArraySize')
            )
            .attr('stroke-width', 1.5);
    }

    [_formatOverlays](node) {
        return node
            .attr('x', -25)
            .attr('y', -25)
            .attr('height', 50)
            .attr('width', 50)
            .style('fill', 'none')
            .style('pointer-events', 'all');
    }

    [_itemHasChildren](item) {
        if (!Array.isArray(item.data[this[_getConfig]('childrenKey')])) {
            return false;
        }

        if (item.data[this[_getConfig]('childrenKey')].length === 0) {
            return false;
        }

        return true;
    }

    [_getConfig](value) {
        return this.config[value];
    }

    [_childrenKeySelector](d) {
        return d[this[_getConfig]('childrenKey')];
    }

    [_expandItems](items) {
        for (let i = 0, len = items.length; i < len; i += 1) {
            this[_expandChildren](items[i]);
            this[_updateD3](items[i]);
        }
    }

    [_unselectNodes]() {
        this.svg
            .selectAll('.item')
            .filter(function() {
                return this.getAttribute('is-selected') === 'true';
            })
            .attr('is-selected', null);

        this[_formatLinks](this.svg.selectAll('.link'));
        this[_formatIndicators](this.svg.selectAll('.indicator'));
    }

    [_selectNode](d) {
        this.svg
            .selectAll('.item')
            .filter(
                node =>
                    d
                        .ancestors()
                        .reverse()
                        .indexOf(node) >= 0
            )
            .attr('is-selected', 'true')
            .each(function() {
                select(this).raise();
            });

        this[_formatLinks](this.svg.selectAll('.link'));
        this[_formatIndicators](this.svg.selectAll('.indicator'));
    }

    [_findSelectedPathItems](node, searchString, pathArray) {
        if (
            String(
                node.data[this[_getConfig]('searchQueryKey')]
            ).toLocaleLowerCase() === searchString.toLocaleLowerCase()
        ) {
            pathArray.push(node);

            return pathArray;
        }

        const children = node[this[_getConfig]('childrenKey')]
            ? node[this[_getConfig]('childrenKey')]
            : node[`_${this[_getConfig]('childrenKey')}`];

        if (!children) {
            return false;
        }

        for (let i = 0; i < children.length; i += 1) {
            pathArray.push(node);

            const found = this[_findSelectedPathItems](
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

    [_collapseDescendants](node) {
        const collapsedNode = node;

        if (this[_childrenKeySelector](collapsedNode)) {
            collapsedNode[`_${this[_getConfig]('childrenKey')}`] = this[
                _childrenKeySelector
            ](collapsedNode);
            collapsedNode[`_${this[_getConfig]('childrenKey')}`].forEach(
                child => this[_collapseDescendants](child)
            );
            collapsedNode[this[_getConfig]('childrenKey')] = null;
        }

        return collapsedNode;
    }

    [_expandChildren](node) {
        const expandedNode = node;

        if (this[_childrenKeySelector](expandedNode) === null) {
            expandedNode[this[_getConfig]('childrenKey')] =
                expandedNode[`_${this[_getConfig]('childrenKey')}`];
            expandedNode[`_${this[_getConfig]('childrenKey')}`] = null;
        }

        return expandedNode;
    }

    [_updateD3](rootItem = this.data) {
        this[_generateItems](
            rootItem,
            this.tree(this.data)
                .descendants()
                .map(node => {
                    const updatedNode = node;
                    updatedNode.y =
                        updatedNode.depth * this[_getConfig]('nodeDistance');
                    updatedNode.x0 = node.x;
                    updatedNode.y0 = node.y;

                    return updatedNode;
                })
        );
    }

    [_zoomToItem](item) {
        setTimeout(() => {
            const { y, x } = select(item).node();
            this[_selectNode](item);
            this[_zoomToPosition](y, x, 1.5);
        }, TRANSITION_DURATION);
    }

    [_zoomToPosition](y, x, scale) {
        this.svg
            .call(this.zoom)
            .transition()
            .duration(TRANSITION_DURATION)
            .call(
                this.zoom.transform,
                zoomIdentity
                    .translate(
                        -y * scale + this[_getConfig]('width') / 2,
                        -x * scale + this[_getConfig]('height') / 2
                    )
                    .scale(scale)
            );
    }

    [_init](root) {
        this.svg = root
            .append('svg')
            .attr('class', this[_getConfig]('svgClass'))
            .style('pointer-events', 'all');

        this.svg.append('g').attr('class', 'container');

        this.zoom = zoom()
            .scaleExtent(this[_getConfig]('scaleExtent'))
            .on('zoom', () => {
                this.svg
                    .select('.container')
                    .attr('transform', event.transform);
            });
    }

    updateData(data, expandTree = false) {
        this.data = hierarchy(data, this[_getConfig]('childrenKeySelector'));

        if (!expandTree) {
            this[_collapseDescendants](this.data);
        }

        this[_zoomToPosition](0, 0, 1);

        if (this.searchQuery !== null) {
            this.setSelection(this.searchQuery);
        }

        this[_updateD3]();
    }

    updateDimensions() {
        const { width, height } = this.svg.node().getBoundingClientRect();

        this.config.width = width > 0 ? width : DEFAULT_WIDTH;
        this.config.height = height > 0 ? height : DEFAULT_HEIGHT;

        this.resetZoom();
    }

    setSelection(selected) {
        const items = this[_findSelectedPathItems](
            this.data,
            String(selected),
            []
        );

        if (items) {
            this.searchQuery = String(selected);
            this[_unselectNodes]();
            this[_expandItems](items);
            this[_zoomToItem](items.slice(-1)[0]);
        }
    }

    resetSelection() {
        this.searchQuery = null;

        this[_unselectNodes]();
        this[_updateD3]();

        this[_getConfig]('onSelectionClear')();
    }

    reload() {
        this.searchQuery = null;

        this[_unselectNodes]();

        if (this.data[this[_getConfig]('childrenKey')]) {
            this.data[this[_getConfig]('childrenKey')].forEach(child =>
                this[_collapseDescendants](child)
            );
        }

        this[_zoomToPosition](0, 0, 1);
        this[_updateD3]();
        this[_getConfig]('onSelectionClear')();
    }

    resetZoom() {
        if (this.searchQuery) {
            return this[_zoomToItem](
                this[_findSelectedPathItems](
                    this.data,
                    this.searchQuery,
                    []
                ).pop()
            );
        }

        this[_zoomToPosition](0, 0, 1);
    }

    zoomIn() {
        const { k: scale } = zoomTransform(this.svg.node());

        this.zoom.scaleTo(this.svg, scale + this[_getConfig]('scaleStep'));
    }

    zoomOut() {
        const { k: scale } = zoomTransform(this.svg.node());

        this.zoom.scaleTo(this.svg, scale - this[_getConfig]('scaleStep'));
    }
}

export default _d3;
