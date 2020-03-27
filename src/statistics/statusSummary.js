import { join, map, values, forEach, propEq, filter, length } from 'ramda';
import { NODES_STATES, NODES_STATES_CLASSES, NODES_STATES_LABELS } from '../const';
import { initPlot, updatePlot } from './historyPlot';
import * as d3 from 'd3';

const plotsData = {};
const plotsElements = {};

export const initStatusSummary = (summaryElement) => {
    summaryElement.innerHTML = `
        <table class="summary-table">
            ${
                join(
                    '',
                    map(
                        (state) => `<tr>
                                        <td id="${state}-state-col" class="state-col"> 
                                            <div class="state-cell-content">
                                                <div class="state-viz ${NODES_STATES_CLASSES[state]}"></div>
                                                ${NODES_STATES_LABELS[state]}
                                            </div>
                                        </td>
                                        <td id="${state}-count-col" class="count-col">-</td>
                                        <td id="${state}-percent-col" class="percent-col">-</td>
                                        <td id="${state}-plot-col" class="plot-col"></td>
                                    </tr>`,
                        values(NODES_STATES)
                    )
                )
            }
        </table>
    `;

    forEach(
        (state) => {
            const plotContainerSelector = `#${state}-plot-col`;
            const chartWidth = parseInt(d3.select(plotContainerSelector).style('width'), 10);
            const chartHeight = parseInt(d3.select(plotContainerSelector).style('height'), 10);
            const chartSvg = d3.select(plotContainerSelector).append('svg')
                .attr('width', chartWidth)
                .attr('height', chartHeight);

            plotsElements[state] = {
                chartWidth,
                chartHeight,
                chartSvg
            };

            plotsData[state] = {
                plottedNodes: [state],
                plotClass: NODES_STATES_CLASSES[state]
            };
        },
        values(NODES_STATES)
    )
};

export const resetStatusSummary = (data, simulationParams) => {
    forEach(
        (state) => {
            const { chartWidth, chartHeight, chartSvg } = plotsElements[state];

            updateValuesCells(data, state);

            plotsData[state] = initPlot(
                chartSvg, chartWidth, chartHeight,
                simulationParams.ITERATIONS,
                data.nodes.length, simulationParams.HEALTH_CARE_CAPACITY,
                plotsData[state],
                false, true
            );
        },
        values(NODES_STATES)
    )
};

export const updateSummary = (data, iteration) => {
    forEach(
        (state) => {
            updateValuesCells(data, state);

            updatePlot(plotsData[state], data, iteration);
        },
        values(NODES_STATES)
    )
};

const updateValuesCells = (data, state) => {
    const elementsCount = length(filter(propEq('state', state), data.nodes));
    const totalCount = length(data.nodes);
    document.getElementById(`${state}-count-col`).innerHTML = elementsCount;
    document.getElementById(`${state}-percent-col`).innerHTML = `(${Math.round(elementsCount / totalCount * 100)}%)`;
};
