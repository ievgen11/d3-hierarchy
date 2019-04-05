import { tree, hierarchy } from 'd3-hierarchy';
import { zoom, zoomIdentity } from 'd3-zoom';
import { event, select } from 'd3-selection';
import 'd3-transition';

import {
    TRANSITION_DURATION,
    ROOT_COLOR,
    PARENT_COLOR,
    PARENT_COLLAPSED_COLOR,
    CHILD_COLOR,
    LINK_COLOR,
    SELECTED_COLOR,
    HOVER_COLOR
} from './constants';

import './styles.css';

function diagonal(s, d) {
    return `M ${s.y} ${s.x}
    C ${(s.y + d.y) / 2} ${s.x},
      ${(s.y + d.y) / 2} ${d.x},
      ${d.y} ${d.x}`;
}

class _d3 {
    constructor({ root, width, height, nodeSize, nodeDistance }) {
        this.width = width;
        this.height = height;
        this.nodeSize = nodeSize;
        this.nodeDistance = nodeDistance;

        this.tree = tree().nodeSize(nodeSize);
        this.data = hierarchy({});
        this.selected = null;

        this._init(root);
    }

    updateData(data) {
        this.data = hierarchy(data, d => d.children);

        if (this.data.children) {
            this.data.children.forEach(child =>
                this._collapseDescendants(child)
            );
        }

        this._updateD3(this.data);
    }

    updateSelection(selected) {
        this.selected = selected;

        const nodes = this._searchTree(this.data, selected, []);

        if (nodes) {
            this._expandSelected(nodes);
        }
    }

    resetSelection() {
        this.selected = null;

        this._unselectNode();
        this._updateD3(this.data);
    }

    _expandSelected(nodes) {
        this._collapseDescendants(this.data);

        for (var i = 0, len = nodes.length; i < len; i++) {
            this._expandChildren(nodes[i]);
            this._updateD3(nodes[i]);

            if (i === nodes.length - 1) {
                setTimeout(() => {
                    this._selectNode(nodes[i - 1]);
                    this._zoomTo(nodes[i - 1]);
                }, 1000);
            }
        }
    }

    _zoomTo(d) {
        console.log('Zoom to: ', d);
    }

    _unselectNode() {
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
        if (node.data.location === searchString) {
            pathArray.push(node);

            return pathArray;
        }

        const children = node.children ? node.children : node._children;

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
        if (d.children) {
            d._children = d.children;
            d._children.forEach(child => this._collapseDescendants(child));
            d.children = null;
        }

        return d;
    }

    _expandChildren(d) {
        if (d.children === null) {
            d.children = d._children;
            d._children = null;
        }

        return d;
    }

    _handleClick(d) {
        if (d.data.type === 'Port') {
            window
                .open(`http://locode.info/${d.data.location}`, '_blank')
                .focus();
            return;
        }

        if (d.children) {
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

                return d.children ? PARENT_COLOR : PARENT_COLLAPSED_COLOR;
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

                return d.children ? PARENT_COLOR : PARENT_COLLAPSED_COLOR;
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
            .text(d => {
                if (d.data.type === 'Port') {
                    return `${d.data.name} (${d.data.location})`;
                }
                return d.data.name;
            });
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
            .select('.content')
            .selectAll('.node')
            .data(data, d => d.data.location);

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
        // Existing
        var link = this.svg
            .select('.content')
            .selectAll('.link')
            .data(data, d => d.data.location);

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
                d.y = d.depth * this.nodeDistance;
                d.x0 = d.x;
                d.y0 = d.y;

                return d;
            });

        this._generateNodes(target, data);
        this._generateLinks(target, data);
    }

    _handleTranslate(x, y, scale) {
        return zoomIdentity.translate(x, y).scale(scale);
    }

    _setZoom(element) {
        this.zoom = zoom()
            .scaleExtent([0.5, 2])
            .on('zoom', () => {
                element.select('.content').attr('transform', event.transform);
            });
    }

    _initZoom() {
        const svg = this.svg;
        this._setZoom(svg);

        svg.append('rect')
            .attr('class', 'zoom')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .call(this.zoom)
            .call(zoom().transform, this._handleTranslate(this.width / 3, this.height / 2, 1));

        svg.append('g')
            .attr('class', 'content')
            .attr('transform', this._handleTranslate(this.width / 3, this.height / 2, 1));

        this.svg = svg;
    }

    _init(root) {
        this.svg = root.append('svg');

        this._initZoom();
    }
}

export default _d3;
