import {
  geojsonToDataset,
  datasetToGeojson,
  runCommandOnGeojson,
  validateGeojson
} from './mapshaper-api-utils';
import cmd from '../mapshaper-cmd';
import { stop } from '../utils/mapshaper-logging';
import utils from '../utils/mapshaper-utils';

// Dissolve features in a GeoJSON object
// @geojson: GeoJSON FeatureCollection, Feature, or Geometry
// @options: dissolve options (fields, sum-fields, copy-fields, etc.)
export function dissolve(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }
  
  return runCommandOnGeojson(geojson, cmd.dissolve, options);
}

// Buffer features in a GeoJSON object
// @geojson: GeoJSON input
// @distance: buffer distance (required)
// @options: additional buffer options
export function buffer(geojson, distance, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }
  
  if (distance === undefined || distance === null) {
    stop('Buffer distance is required');
  }
  
  const opts = utils.extend({}, options, { distance });
  return runCommandOnGeojson(geojson, cmd.buffer, opts);
}

// Clip features in a GeoJSON object with another GeoJSON object
// @targetGeojson: GeoJSON to be clipped
// @clipGeojson: GeoJSON to use as clip boundary
// @options: clip options
export function clip(targetGeojson, clipGeojson, options = {}) {
  if (!validateGeojson(targetGeojson)) {
    stop('Invalid target GeoJSON input');
  }
  
  if (!validateGeojson(clipGeojson)) {
    stop('Invalid clip GeoJSON input');
  }
  
  // Convert both inputs to datasets
  const targetDataset = geojsonToDataset(targetGeojson);
  const clipDataset = geojsonToDataset(clipGeojson);
  
  // Perform the clip operation
  const clippedLayers = cmd.clipLayers(
    targetDataset.layers,
    clipDataset.layers[0],
    targetDataset,
    clipDataset,
    options
  );
  
  // Create result dataset
  const resultDataset = {
    layers: clippedLayers,
    arcs: targetDataset.arcs,
    info: targetDataset.info || {}
  };
  
  return datasetToGeojson(resultDataset, options);
}

// Simplify features in a GeoJSON object
// @geojson: GeoJSON input
// @options: simplification options (percentage, method, etc.)
export function simplify(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }
  
  // Set default percentage if not provided
  if (!options.percentage && !options.interval && !options.resolution) {
    options = utils.extend({}, options, { percentage: 0.1 }); // Default to 10% simplification
  }
  
  return runCommandOnGeojson(geojson, cmd.simplify, options);
}

// Merge multiple GeoJSON objects into one
// @geojsonArray: Array of GeoJSON objects
// @options: merge options
export function merge(geojsonArray, options = {}) {
  if (!Array.isArray(geojsonArray) || geojsonArray.length === 0) {
    stop('Input must be a non-empty array of GeoJSON objects');
  }
  
  // Validate all inputs
  geojsonArray.forEach((geojson, i) => {
    if (!validateGeojson(geojson)) {
      stop(`Invalid GeoJSON at index ${i}`);
    }
  });
  
  // Convert all inputs to datasets
  const datasets = geojsonArray.map(geojson => geojsonToDataset(geojson));
  
  // Merge all layers
  const mergedLayers = [];
  datasets.forEach(dataset => {
    mergedLayers.push(...dataset.layers);
  });
  
  // Use the first dataset's arcs (for now, assuming compatible projections)
  const resultDataset = {
    layers: mergedLayers,
    arcs: datasets[0].arcs,
    info: datasets[0].info || {}
  };
  
  // If merge-layers option is true, combine into single layer
  if (options.merge_layers !== false) {
    const mergedLayer = cmd.mergeLayers(mergedLayers, options);
    resultDataset.layers = [mergedLayer];
  }
  
  return datasetToGeojson(resultDataset, options);
}

// Filter features in a GeoJSON object
// @geojson: GeoJSON input
// @expression: filter expression (e.g., "population > 1000")
// @options: filter options
export function filter(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }
  
  // Expression can be passed as a string (second parameter) or in options
  let opts;
  if (typeof options === 'string') {
    // Handle legacy API: filter(geojson, expression)
    opts = { expression: options };
  } else {
    opts = options;
  }
  
  if (!opts.expression) {
    stop('Filter expression is required');
  }
  
  // Convert input to dataset
  const dataset = geojsonToDataset(geojson, opts);
  
  // Run filter command
  cmd.filterFeatures(dataset.layers[0], dataset.arcs, opts);
  
  // Convert back to GeoJSON
  return datasetToGeojson(dataset, opts);
}

// Calculate and add new fields to features
// @geojson: GeoJSON input
// @expressions: Object with field names as keys and expressions as values
// @options: calc options
export function calc(geojson, expressions, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }
  
  if (!expressions || typeof expressions !== 'object') {
    stop('Expressions object is required');
  }
  
  // Convert expressions object to expression string for the each command
  const expressionLines = Object.entries(expressions).map(([field, expr]) => {
    return `${field} = ${expr}`;
  });
  const expression = expressionLines.join('; ');
  
  // Convert input to dataset
  const dataset = geojsonToDataset(geojson, options);
  
  // Use the evaluateEachFeature command to add calculated fields
  cmd.evaluateEachFeature(dataset.layers[0], dataset, expression, options);
  
  // Convert back to GeoJSON
  return datasetToGeojson(dataset, options);
}

// Clean topology of features (remove slivers, fix overlaps, etc.)
// @geojson: GeoJSON input
// @options: clean options
export function clean(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }
  
  return runCommandOnGeojson(geojson, cmd.clean, options);
}

// Union features in a GeoJSON object
// @geojson: GeoJSON input
// @options: union options
export function union(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }
  
  return runCommandOnGeojson(geojson, cmd.union, options);
}

// Join attributes from one GeoJSON to another
// @targetGeojson: GeoJSON to receive attributes
// @sourceGeojson: GeoJSON with attributes to join
// @options: join options (keys, fields, etc.)
export function join(targetGeojson, sourceGeojson, options = {}) {
  if (!validateGeojson(targetGeojson)) {
    stop('Invalid target GeoJSON input');
  }
  
  if (!validateGeojson(sourceGeojson)) {
    stop('Invalid source GeoJSON input');
  }
  
  // Convert inputs to datasets
  const targetDataset = geojsonToDataset(targetGeojson);
  const sourceDataset = geojsonToDataset(sourceGeojson);
  
  // Perform join operation
  cmd.join(targetDataset.layers[0], sourceDataset.layers[0], options);
  
  return datasetToGeojson(targetDataset, options);
}

// Export all memory API functions
export default {
  dissolve,
  buffer,
  clip,
  simplify,
  merge,
  filter,
  calc,
  clean,
  union,
  join
};