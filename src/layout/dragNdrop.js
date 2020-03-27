import { event, drag} from 'd3';

export const initDragNDrop = (simulation) => {
    const dragstarted = (d) => {
        if (!event.active) {
            simulation.alphaTarget(0.3).restart();
        }

        d.fx = d.x;
        d.fy = d.y;
    };

    const dragged = (d) => {
        d.fx = event.x;
        d.fy = event.y;
    };

    const dragended = (d) => {
        if (!event.active) {
            simulation.alphaTarget(0);
        }

        d.fx = null;
        d.fy = null;
    };

    return drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
};
