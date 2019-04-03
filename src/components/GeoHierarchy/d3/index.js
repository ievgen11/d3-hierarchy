import { tree, hierarchy } from 'd3-hierarchy';
import { zoom, zoomIdentity } from 'd3-zoom';
import { event } from 'd3-selection';
import 'd3-transition';

import { TRANSITION_DURATION } from './constants';

import './styles.css';

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

function diagonal(s, d) {
    return `M ${s.y} ${s.x}
    C ${(s.y + d.y) / 2} ${s.x},
      ${(s.y + d.y) / 2} ${d.x},
      ${d.y} ${d.x}`;
}

class _d3 {
    constructor(root, width, height) {
        this.numberOfItems = 0;
        this.width = width;
        this.height = height;
        this.treeMap = tree().nodeSize([60, 60]);
        this.data = null;

        this._init(root);
    }

    updateData(data) {
        this.data = hierarchy(data, d => d.children);

        this.data.x0 = 0;
        this.data.y0 = 0;

        if (this.data.children) {
            this.data.children.forEach(collapse);
        }

        this._updateD3(this.data);
    }

    _click(d) {
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

    _updateD3(source) {
        var treeData = this.treeMap(this.data);

        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        nodes.forEach(function(d) {
            d.y = d.depth * 200;
        });

        var node = this.svg
            .select('.content')
            .selectAll('g.node')
            .data(nodes, d => d.id || (d.id = ++this.numberOfItems));

        node.selectAll('circle').attr('fill', d => {
            if (d.data.type === 'Port') {
                return '#ffbb1d';
            }

            if (!d.parent) {
                return '#f57c00';
            }

            return d.children ? '#3B90E3' : '#2F385E';
        });

        var nodeEnter = node
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', () => `translate(${source.y0},${source.x0})`)
            .on('click', this._click.bind(this));

        nodeEnter
            .append('circle')
            .style('opacity', 0)
            .transition()
            .duration(TRANSITION_DURATION)
            .style('opacity', 1)
            .attr('r', 5)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', d => {
                if (d.data.type === 'Port') {
                    return '#ffbb1d';
                }

                if (!d.parent) {
                    return '#f57c00';
                }

                return d.children ? '#3B90E3' : '#2F385E';
            });

        nodeEnter
            .append('text')
            .style('opacity', 0)
            .transition()
            .duration(TRANSITION_DURATION)
            .style('opacity', 1)
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

        var nodeUpdate = nodeEnter.merge(node);

        nodeUpdate
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('transform', d => `translate(${d.y},${d.x})`);

        var nodeExit = node
            .exit()
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('transform', () => `translate(${source.y},${source.x})`)
            .remove();

        nodeExit.select('rect').style('opacity', 1e-6);
        nodeExit.select('rect').attr('stroke-opacity', 1e-6);
        nodeExit.select('text').style('fill-opacity', 1e-6);

        var link = this.svg
            .select('.content')
            .selectAll('path.link')
            .data(links, d => d.id);

        var linkEnter = link
            .enter()
            .insert('path', 'g')
            .attr('class', 'link')
            .attr('d', () =>
                diagonal(
                    { x: source.x0, y: source.y0 },
                    { x: source.x0, y: source.y0 }
                )
            );

        var linkUpdate = linkEnter.merge(link);

        linkUpdate
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('d', d => diagonal(d, d.parent));

        var linkExit = link
            .exit()
            .transition()
            .duration(TRANSITION_DURATION)
            .attr('d', () =>
                diagonal(
                    { x: source.x, y: source.y },
                    { x: source.x, y: source.y }
                )
            )
            .remove();

        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    _handleZoom() {
        return zoom()
            .scaleExtent([1 / 2, 4])
            .on('zoom', () => {
                this.svg.select('.content').attr('transform', event.transform);
            });
    }

    _initZoom(element) {
        element
            .append('rect')
            .attr('class', 'zoom')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .call(
                zoom()
                    .scaleExtent([1 / 2, 4])
                    .on('zoom', () => {
                        element
                            .select('.content')
                            .attr('transform', event.transform);
                    })
            )
            .call(
                zoom().transform,
                zoomIdentity.translate(this.width / 4, this.height / 2).scale(1)
            );

        element
            .append('g')
            .attr('class', 'content')
            .attr(
                'transform',
                zoomIdentity.translate(this.width / 4, this.height / 2).scale(1)
            );

        return element;
    }

    _init(root) {
        var svg = root.append('svg');

        this.svg = this._initZoom(svg);
    }
}

export default _d3;
