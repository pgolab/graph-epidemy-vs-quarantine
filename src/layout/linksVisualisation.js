import { path } from 'ramda';

export const linksVisualisationInit = (svg, data) => svg
    .selectAll('line')
    .data(data)
    .join(
        (enter) => enter.append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', ({ value }) => Math.sqrt(value))
    );

export const updateLinksVisualisation = (links) => links
    .attr('x1', path(['source', 'x']))
    .attr('y1', path(['source', 'y']))
    .attr('x2', path(['target', 'x']))
    .attr('y2', path(['target', 'y']))
    .attr('stroke-opacity', ({ source, target }) => source.quarantined || target.quarantined ? 0.2 : 0.6);
