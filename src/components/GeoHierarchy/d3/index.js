import { tree, hierarchy } from 'd3-hierarchy';
import { zoom, zoomIdentity } from 'd3-zoom';
import { event } from 'd3-selection';
import 'd3-transition';

import {
    TRANSITION_DURATION,
    ROOT_COLOR,
    PARENT_COLOR,
    PARENT_COLLAPSED_COLOR,
    CHILD_COLOR
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
        this.data = null;

        this._init(root);
    }

    updateData(data) {
        this.data = hierarchy(data, d => d.children);

        if (this.data.children) {
            this.data.children.forEach(child => this._collapseNodes(child));
        }

        this._updateD3(this.data);
    }

    _collapseNodes(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(child => this._collapseNodes(child));
            d.children = null;
        }
    }

    _handleClick(d) {
        if (d.data.type === 'Port') {
            window
                .open(`http://locode.info/${d.data.location}`, '_blank')
                .focus();
            return;
        }

        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }

        this._updateD3(d);
    }

    _formatCircle(node) {
        return node
            .attr('r', 5)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', d => {
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

    _generateNodes(target, data) {
        var node = this.svg
            .select('.content')
            .selectAll('g.node')
            .data(data, d => d.data.location);

        // Update existing stuff
        this._formatCircle(node.selectAll('circle'));
        this._formatLabel(node.selectAll('text'));

        var nodeEnter = node
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', () => `translate(${target.y0},${target.x0})`)
            .on('click', d => this._handleClick(d));

        this._formatCircle(
            nodeEnter
                .append('circle')
                .style('opacity', 0)
                .transition()
                .duration(TRANSITION_DURATION)
                .style('opacity', 1)
        );

        this._formatLabel(
            nodeEnter
                .append('text')
                .style('opacity', 0)
                .transition()
                .duration(TRANSITION_DURATION)
                .style('opacity', 1)
        );

        var nodeUpdate = nodeEnter.merge(node);

        nodeUpdate
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('transform', d => `translate(${d.y},${d.x})`);

        var nodeExit = node
            .exit()
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('transform', () => `translate(${target.y},${target.x})`)
            .remove();

        nodeExit.select('rect').style('opacity', 1e-6);
        nodeExit.select('rect').attr('stroke-opacity', 1e-6);
        nodeExit.select('text').style('fill-opacity', 1e-6);
    }

    _generateLinks(target, data) {
        var link = this.svg
            .select('.content')
            .selectAll('path.link')
            .data(data, d => d.data.location);

        var linkEnter = link
            .enter()
            .insert('path', 'g')
            .attr('class', 'link')
            .attr('d', () =>
                diagonal(
                    { x: target.x0, y: target.y0 },
                    { x: target.x0, y: target.y0 }
                )
            );

        var linkUpdate = linkEnter.merge(link);

        linkUpdate
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('d', d => (d && d.parent ? diagonal(d, d.parent) : null));

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

    _handleTranslate() {
        return zoomIdentity.translate(this.width / 3, this.height / 2).scale(1);
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
            .call(zoom().transform, this._handleTranslate());

        svg.append('g')
            .attr('class', 'content')
            .attr('transform', this._handleTranslate());

        this.svg = svg;
    }

    _init(root) {
        this.svg = root.append('svg');

        this._initZoom();
    }
}

export default _d3;
