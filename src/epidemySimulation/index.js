import { addIndex, groupBy, prop, reduce, map, uniq, pipe, forEach, filter, contains, range } from 'ramda';
import { NODES_STATES } from '../const';

let nodesDict = {};
let nodesNeighbors = {};

export const initGraphData = ({ nodes, links }) => {
    nodesDict = addIndex(reduce)(
        (acc, { id }, index) => ({ ...acc, [id]: index }),
        {},
        nodes
    );

    nodesNeighbors = pipe(
        reduce(
            (acc, { source, target }) => ([
                ...acc,
                { source: source, target: target },
                { source: target, target: source }
            ]),
            []
        ),
        groupBy(prop('source')),
        map(pipe(map(prop('target')), uniq))
    )(links);

    forEach((node) => {
        node.state = NODES_STATES.HEALTHY;
        node.degree = nodesNeighbors[node.id].length;
    }, nodes);
};

export const initSimulation = ({ nodes }, simulationParams) => {
    forEach((node) => node.state = NODES_STATES.HEALTHY, nodes);

    forEach(
        () => {
            const randomNode = nodes[Math.floor(nodes.length * Math.random())];
            randomNode.state = NODES_STATES.SICK_LATENT_PHASE;
            randomNode.daysToActivePhase = simulationParams.LATENT_PHASE_TIME;
            randomNode.treatmentTimeLeft = simulationParams.TREATMENT_TIME;
        },
        range(0, Math.round(simulationParams.INITIALLY_INFECTED_NODES * nodes.length))
    );

    forEach(
        (node) => {
            node.quarantined = Math.random() < simulationParams.QUARANTINED_NODES;
        },
        nodes
    )
};

export const performSimulationStep = ({ nodes }, simulationParams) => {
    const stayedAtHome = {};
    forEach(
        (node) => stayedAtHome[node.id] = node.quarantined ? Math.random() > simulationParams.LEAVING_HOUSE_CHANCE : false,
        nodes
    );

    const sickNodes = filter(
        ({state}) => contains(state, [NODES_STATES.SICK_LATENT_PHASE, NODES_STATES.SICK_ACTIVE_PHASE]),
        nodes
    );

    const recoveryChance = sickNodes.length > simulationParams.HEALTH_CARE_CAPACITY * nodes.length
        ? simulationParams.OVERLOADED_RECOVERY_CHANCE
        : simulationParams.RECOVERY_CHANCE;

    forEach(
        (node) => {
            if (node.state === NODES_STATES.SICK_ACTIVE_PHASE) {
                node.treatmentTimeLeft--;

                if (node.treatmentTimeLeft === 0) {
                    node.state = NODES_STATES.IMMUNE;
                } else if (Math.random() > recoveryChance) {
                    node.state = NODES_STATES.DECEASED;
                }
            }

            if (node.state === NODES_STATES.SICK_LATENT_PHASE) {
                const id = node.id;

                if (!stayedAtHome[node.id]) {
                    forEach(
                        (neighborId) => {
                            const neighbor = nodes[nodesDict[neighborId]];

                            if (
                                (neighbor.state === NODES_STATES.HEALTHY)
                                && !stayedAtHome[neighborId]
                                && (Math.random() < simulationParams.CONTAGION_CHANCE)
                            ) {
                                neighbor.state = NODES_STATES.SICK_LATENT_PHASE;
                                neighbor.daysToActivePhase = simulationParams.LATENT_PHASE_TIME;
                                neighbor.treatmentTimeLeft = simulationParams.TREATMENT_TIME;
                            }
                        },
                        nodesNeighbors[id]
                    );
                }

                node.daysToActivePhase--;
                if (node.daysToActivePhase === 0) {
                    node.state = NODES_STATES.SICK_ACTIVE_PHASE;
                }
            }
        },
        sickNodes
    );
};
