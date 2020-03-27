import * as d3 from 'd3';
import { initDragNDrop } from './dragNdrop';
import { nodesVisualisationInit, updateNodesVisualisation } from './nodesVisualisation';
import { linksVisualisationInit, updateLinksVisualisation } from './linksVisualisation';
import { prop } from 'ramda';

export const initGraph = (svg, data, width, height, displayLabels) => {
    const { links : linksData, nodes : nodesData } = data;

    const simulation = d3
        .forceSimulation(nodesData)
            .force('link', d3.forceLink(linksData).id(prop('id')))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(width / 2, height / 2));

    svg.selectAll('*').remove();

    const links = linksVisualisationInit(svg, linksData);
    const nodes = nodesVisualisationInit(svg, nodesData, displayLabels);

    nodes.call(initDragNDrop(simulation));

    simulation.on('tick', () => {
        updateLinksVisualisation(links);
        updateNodesVisualisation(nodes);
    });

    return { links, nodes, simulation };
};
