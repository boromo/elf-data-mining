require('normalize.css/normalize.css');
require('../styles/App.css');

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import d3 from 'd3';

const width = 1120;
const height = 2000;
const x = d3.scale.linear().range([0, width]);
const y = d3.scale.linear().range([0, height]);

class Chart extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        var dom =  ReactDOM.findDOMNode(this);
        this.initD3Chart(dom, this.props.data);
    }
    shouldComponentUpdate() {
        var dom =  ReactDOM.findDOMNode(this);
        this.initD3Chart(dom, this.props.data);
        return false;
    }
    initD3Chart(dom, root) {
        const vis = d3.select(dom).append('div')
            .attr('class', 'chart')
            .style('width', width + 'px')
            .style('height', height + 'px')
            .append('svg:svg')
            .attr('width', width)
            .attr('height', height);

        const partition = d3.layout.partition()
            .value(function(d) { return d.size; });


        const g = vis.selectAll('g')
            .data(partition.nodes(root))
            .enter().append('svg:g')
            .attr('transform', function (d) {
                return 'translate(' + x(d.y) + ',' + y(d.x) + ')';
            })
            .on('click', click);

        let kx = width / root.dx,
            ky = height / 1;

        const transform = (d) => {
            return "translate(8," + d.dx * ky / 2 + ")";
        };

        g.append('svg:rect')
            .attr('width', root.dy * kx)
            .attr('height', function (d) {
                return d.dx * ky;
            })
            .attr('class', function (d) {
                return d.children ? 'parent' : 'child';
            });


        // g.append('svg:text')
        //     .attr('transform', transform)
        //     .attr('dy', '.35em')
        //     .style('opacity', function (d) {
        //         return d.dx * ky > 12 ? 1 : 0;
        //     })
        //     .text(function (d) {
        //         return d.name;
        //     })

        d3.select(window)
            .on('click', function () {
                click(root);
            });

        function click(d) {
            if (!d.children) return;

            kx = (d.y ? width - 40 : width) / (1 - d.y);
            ky = height / d.dx;
            x.domain([d.y, 1]).range([d.y ? 40 : 0, width]);
            y.domain([d.x, d.x + d.dx]);

            var t = g.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; });

            t.select("rect")
                .attr("width", d.dy * kx)
                .attr("height", function(d) { return d.dx * ky; });

            t.select("text")
                .attr("transform", transform)
                .style("opacity", function(d) { return d.dx * ky > 12 ? 1 : 0; });

            d3.event.stopPropagation();
        }
    }

    render() {
        return (
            <div id="char">
            </div>
        );
    }
}

Chart.defaultProps = {
    data: {}
};
Chart.propTypes = {
    data: PropTypes.object.isRequired
};

export default Chart;
