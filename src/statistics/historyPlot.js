import * as d3 from 'd3';
import { range, length, filter, contains, clone } from 'ramda';
import { NODES_STATES } from '../const';

const defaultPlotData = {
    previousSimulations: [],
    history: [],
    plot: null,
    x: null,
    y: null,
    plotHeight: null,
    plottedNodes: [NODES_STATES.SICK_LATENT_PHASE, NODES_STATES.SICK_ACTIVE_PHASE],
    plotClass: 'total-cases'
};

export const initPlot = (svg, width, height, iterations, nodesCount, healthCareCapacity, plotData = {}, showCapacityLine = true, noLabels=false) => {
    const margin = {top: 10, right: 0, bottom: noLabels ? 0 : 20, left: noLabels ? 0 : 35};

    const newPlotData = {
        ...clone(defaultPlotData),
        ...plotData
    };

    newPlotData.previousSimulations = [...newPlotData.previousSimulations, ...newPlotData.history];
    if (newPlotData.previousSimulations.length > 1000) {
        newPlotData.previousSimulations.splice(0, (newPlotData.previousSimulations.length - 1000) * 0.2);
    }
    newPlotData.history = [];

    height = height - (margin.top + margin.bottom);
    width = width - (margin.left + margin.right);
    newPlotData.plotHeight = height;

    newPlotData.x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    newPlotData.y = d3.scaleLinear()
        .range([height, 0]);

    newPlotData.x.domain(range(1, iterations + 1));
    newPlotData.y.domain([0, 1]);

    svg.selectAll('*').remove();

    const plotRoot = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    plotRoot.append('rect')
        .attr('fill', '#fff')
        .attr('width', width)
        .attr('height', height);

    if (!noLabels) {
        plotRoot.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(
                d3.axisBottom(newPlotData.x)
                    .tickValues(newPlotData.x.domain().filter((d, i) => (i % 10 === 0)))
            );

        plotRoot.append('g')
            .call(d3.axisLeft(newPlotData.y).tickFormat((d) => `${d * 100}%`));
    }

    if (showCapacityLine) {
        plotRoot
            .append("g")
            .attr('class', 'capacity-line')
            .attr('transform', `translate(0, ${newPlotData.y(healthCareCapacity)})`)
            .append("line")
            .attr('x2', width);

    }

    newPlotData.plot = plotRoot;

    drawHistoryPlotBars(newPlotData, 'previousSimulations', 'previous-plot');

    return newPlotData;
};

export const updatePlot = (plotData, { nodes }, iteration) => {
    plotData.history = [
        ...plotData.history,
        {
            iteration,
            value: length(filter(
                ({ state }) => contains(state, plotData.plottedNodes),
                nodes
            )) / nodes.length
        }
    ];

    drawHistoryPlotBars(plotData, 'history', 'current');

    d3.select('.capacity-line').raise();
};

const drawHistoryPlotBars = (plotData, dataSource, otherClass) => {
    plotData.plot
        .selectAll(`.${otherClass}`)
            .data(plotData[dataSource])
            .enter()
                .append('rect')
                    .attr('class', `${otherClass} ${plotData.plotClass}`)
                    .attr('x', (d) => plotData.x(d.iteration))
                    .attr('width', plotData.x.bandwidth())
                    .attr('y', (d) => plotData.y(d.value) )
                    .attr('height', (d) => plotData.plotHeight - plotData.y(d.value));
};
