import { NODES_STATES_CLASSES } from '../const';
import { prop, map, reduce, min, max } from 'ramda';
import * as d3 from 'd3';

export const nodesVisualisationInit = (svg, data, displayLabel) => {
    const nodesDegrees = map(prop('degree'), data);
    const nodeSizeScale = d3.scaleSqrt()
        .domain([reduce(min, 1, nodesDegrees), reduce(max, 1, nodesDegrees)])
        .range([3, 9]);

    const nodes = svg.append('g')
        .selectAll('g')
        .data(data)
        .enter()
        .append('g')
        .on('mouseover', function() { d3.select(this).raise() })
        .attr('class', 'node-group');

    nodes.append('circle')
        .attr('r', ({ degree }) => nodeSizeScale(degree))
        .attr('class', getNodeClasses);

    if (displayLabel) {
        nodes.append('text')
            .text(prop('id'))
            .attr('class', 'node-label');
    }

    return nodes;
};

export const updateNodesVisualisation = (nodes) => nodes
    .attr('transform', ({ x, y }) => `translate(${x}, ${y})`)
    .select('circle')
    .attr('class', getNodeClasses);

const getNodeClasses = ({ quarantined, state }) => `${quarantined ? 'quarantined' : 'not-quarantined'} ${NODES_STATES_CLASSES[state]}`;
