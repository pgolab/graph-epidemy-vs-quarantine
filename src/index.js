import * as d3 from 'd3';
import { clone, isNil } from 'ramda';

import './styles.css';
import { initGraph } from './layout';
import { NODES_STATES, SIMULATION_PARAMS } from './const';
import { updateNodesVisualisation } from './layout/nodesVisualisation';
import { initGraphData, initSimulation, performSimulationStep } from './epidemySimulation';
import { initPlot, updatePlot } from './statistics/historyPlot';
import { initStatusSummary, resetStatusSummary, updateSummary } from './statistics/statusSummary';
import { generateBAGraph } from './generators/ba-generator';

const lesMiserables = require('../data/data.json');
let data = SIMULATION_PARAMS.USE_RANDOM_GRAPH
    ? generateBAGraph(SIMULATION_PARAMS.M, SIMULATION_PARAMS.NODES_COUNT)
    : clone(lesMiserables);
initGraphData(data);

let graphSvg;
let chartSvg;
let graphWidth;
let graphHeight;
let graphViewWidth;
let graphViewHeight;
let chartWidth;
let chartHeight;

let nodes;
let simulationLoopId;

let localSimulationParams = {
    ...SIMULATION_PARAMS
};

const initLayout = () => {
    graphWidth = parseInt(d3.select('#graph-container').style('width'), 10);
    graphHeight = parseInt(d3.select('#graph-container').style('height'), 10);
    graphViewWidth = Math.round(graphWidth * 0.95);
    graphViewHeight = Math.round(graphHeight * 0.95);
    chartWidth = parseInt(d3.select('#plot-container').style('width'), 10);
    chartHeight = parseInt(d3.select('#plot-container').style('height'), 10);

    graphSvg = d3.select('#graph')
        .attr('width', graphWidth)
        .attr('height', graphHeight)
        .attr('viewBox', [0, 0, graphViewWidth, graphViewHeight]);
    chartSvg = d3.select('#plot')
        .attr('width', chartWidth)
        .attr('height', chartHeight);

    document.getElementById('quarantined')
        .addEventListener('input', (event) => {
            const { value } = event.target;
            localSimulationParams = {
                ...localSimulationParams,
                QUARANTINED_NODES: value
            };
            document.getElementById('quarantined-label').innerHTML = `${Math.round(value * 100)}%`;
        });

    document.getElementById('use-random-graph')
        .addEventListener('change', (event) => {
            localSimulationParams = {
                ...localSimulationParams,
                USE_RANDOM_GRAPH: event.target.checked
            };
            if (!isNil(simulationLoopId)) {
                clearInterval(simulationLoopId);
                simulationLoopId = undefined;
            }

            data = localSimulationParams.USE_RANDOM_GRAPH
                ? generateBAGraph(localSimulationParams.M, localSimulationParams.NODES_COUNT)
                : clone(lesMiserables);
            initGraphData(data);

            initDisplayAndSimulation();
        });

    document.getElementById('run-simulation-button')
        .addEventListener(
            'click',
            () => runSimulation(nodes)
        );

    initDisplayAndSimulation();
};

const initDisplayAndSimulation = () => {
    nodes = initGraph(graphSvg, data, graphViewWidth, graphViewHeight, !localSimulationParams.USE_RANDOM_GRAPH).nodes;
    initPlot(chartSvg, chartWidth, chartHeight, localSimulationParams.ITERATIONS, data.nodes.length, localSimulationParams.HEALTH_CARE_CAPACITY);
    initStatusSummary(document.getElementById('summary'));

    setTimeout(() => runSimulation(nodes),1500);
};

let plotData = {
    plottedNodes: [NODES_STATES.SICK_LATENT_PHASE, NODES_STATES.SICK_ACTIVE_PHASE],
    plotClass: 'total-cases'
};
const runSimulation = (nodes) => {
    initSimulation(data, localSimulationParams);
    updateNodesVisualisation(nodes);
    plotData = initPlot(chartSvg, chartWidth, chartHeight, localSimulationParams.ITERATIONS, data.nodes.length, localSimulationParams.HEALTH_CARE_CAPACITY, plotData);
    resetStatusSummary(data, localSimulationParams);

    let iteration = 0;
    if (!isNil(simulationLoopId)) {
        clearInterval(simulationLoopId);
        simulationLoopId = undefined;
    }
    simulationLoopId = setInterval(
        () => {
            performSimulationStep(data, localSimulationParams);
            updateNodesVisualisation(nodes);

            iteration++;

            updatePlot(plotData, data, iteration);
            updateSummary(data, iteration);

            if (iteration === localSimulationParams.ITERATIONS) {
                clearInterval(simulationLoopId);
                simulationLoopId = undefined;
            }
        },
        localSimulationParams.STEP_TIME
    )
};

if(document.readyState !== 'loading') {
    initLayout();
}
else {
    document.addEventListener('DOMContentLoaded', initLayout);
}
