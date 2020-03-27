import { contains, forEach, range } from 'ramda';

export const generateBAGraph = (m, nodesCount) => {
    const nodes = [];
    const links = [];
    const nodesWeights = [];
    let totalWeight = 0;

    forEach(
        (nodeId) => {
            const newNode = { id: nodeId };

            let currentTotalWeight = totalWeight;
            const selectedNodes = [];

            for (let i = 0; i < Math.min(m, nodes.length); i++) {
                const selectedPlace = Math.floor(Math.random() * currentTotalWeight);

                let target = 0;
                let sum = contains(target, selectedNodes) ? 0 : nodesWeights[target];

                while (sum < selectedPlace) {
                    target++;

                    if (!contains(target, selectedNodes)) {
                        sum += nodesWeights[target];
                    }
                }

                selectedNodes.push(target);
                currentTotalWeight -= nodesWeights[target];
            }

            nodesWeights.push(selectedNodes.length);
            forEach(
                (target) => {
                    links.push({ source: nodeId, target, value: 1 });

                    nodesWeights[target] += 1;
                },
                selectedNodes
            );
            totalWeight += selectedNodes.length * 2;

            nodes.push(newNode);
        },
        range(0, nodesCount)
    );

    return { nodes, links };
};
