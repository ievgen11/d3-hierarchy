import { tree, hierarchy } from 'd3-hierarchy';
import 'd3-transition';

var i = 0,
    duration = 750;

var margin = { top: 20, right: 90, bottom: 30, left: 90 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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
        this.i = 0;
        this.width = width;
        this.height = height;
        this.treeMap = tree().size([height, width]);
        this.root = null;

        this._init(root);
    }

    updateData(data) {
        this.root = hierarchy(data, d => d.children);

        this.root.x0 = height / 2;
        this.root.y0 = 0;

        if (this.root.children) {
            this.root.children.forEach(collapse);
        }

        this._updateD3(this.root);
    }

    _click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        console.log('click!')
        this._updateD3(d);
    }

    _updateD3(source) {
        var treeData = this.treeMap(this.root);

        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);

        nodes.forEach(function(d) {
            d.y = d.depth * 180;
        });

        var node = this.svg
            .selectAll('g.node')
            .data(nodes, d => d.id || (d.id = ++this.i));

        var nodeEnter = node
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${source.y0},${source.x0})`)
            .on('click', this._click.bind(this));

        nodeEnter
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style('fill', d => (d.parent ? 'rgb(39, 43, 77)' : '#fe6e9e'));

        nodeEnter
            .append('rect')
            .attr('rx', d => {
                if (d.parent) return d.children || d._children ? 0 : 6;
                return 10;
            })
            .attr('ry', d => {
                if (d.parent) return d.children || d._children ? 0 : 6;
                return 10;
            })
            .attr('stroke-width', d => (d.parent ? 1 : 0))
            .attr('stroke', d =>
                d.children || d._children
                    ? 'rgb(3, 192, 220)'
                    : 'rgb(38, 222, 176)'
            )
            .attr('stroke-dasharray', d =>
                d.children || d._children ? '0' : '2.2'
            )
            .attr('stroke-opacity', d =>
                d.children || d._children ? '1' : '0.6'
            )
            .attr('x', 0)
            .attr('y', -10)
            .attr('width', d => (d.parent ? 40 : 20))
            .attr('height', 20);

        nodeEnter
            .append('text')
            .style('fill', d => {
                if (d.parent) {
                    return d.children || d._children
                        ? '#ffffff'
                        : 'rgb(38, 222, 176)';
                }
                return 'rgb(39, 43, 77)';
            })
            .attr('dy', '.35em')
            .attr('x', d => (d.parent ? 20 : 10))
            .attr('text-anchor', d => 'middle')
            .text(d => d.data.name);

        var nodeUpdate = nodeEnter.merge(node);

        nodeUpdate
            .transition()
            .duration(duration)
            .attr('transform', d => `translate(${d.y},${d.x})`);

        var nodeExit = node
            .exit()
            .transition()
            .duration(duration)
            .attr('transform', () => `translate(${source.y},${source.x})`)
            .remove();

        nodeExit.select('rect').style('opacity', 1e-6);
        nodeExit.select('rect').attr('stroke-opacity', 1e-6);
        nodeExit.select('text').style('fill-opacity', 1e-6);

        var link = this.svg.selectAll('path.link').data(links, d => d.id);

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
            .duration(duration)
            .attr('d', d => diagonal(d, d.parent));

        var linkExit = link
            .exit()
            .transition()
            .duration(duration)
            .attr('d', () => diagonal({ x: source.x, y: source.y }, { x: source.x, y: source.y }))
            .remove();

        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    _init(root) {
        this.svg = root
            .append('svg')
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr(
                'transform',
                'translate(' + margin.left + ',' + margin.top + ')'
            );
    }
}

export default _d3;
