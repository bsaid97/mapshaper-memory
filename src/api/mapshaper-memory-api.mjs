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

// Dissolve features with true geometric merging (removes overlaps and gaps)
// @geojson: GeoJSON FeatureCollection, Feature, or Geometry
// @options: dissolve options (fields, sum-fields, copy-fields, etc.)
// Note: Unlike dissolve(), dissolve2() performs topological analysis to merge adjacent polygons
export function dissolve2(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  // Convert input to dataset
  const dataset = geojsonToDataset(geojson, options);

  // dissolve2 expects (layers, dataset, opts) signature
  const resultLayers = cmd.dissolve2(dataset.layers, dataset, options);

  // Create result dataset
  const resultDataset = {
    layers: resultLayers,
    arcs: dataset.arcs,
    info: dataset.info || {}
  };

  // Convert back to GeoJSON
  return datasetToGeojson(resultDataset, options);
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

// Explode multi-part features into single-part features
// @geojson: GeoJSON input
// @options: explode options (naive mode, etc.)
export function explode(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.explodeFeatures, options);
}

// Create point layer from other geometries
// @geojson: GeoJSON input
// @options: points options (vertices, centroids, endpoints, etc.)
export function points(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.createPointLayer, options);
}

// Convert points/polygons to polylines
// @geojson: GeoJSON input
// @options: lines options
export function lines(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.convertToPolylines, options);
}

// Convert polylines to polygons
// @geojson: GeoJSON input
// @options: polygons options
export function polygons(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.convertToPolygons, options);
}

// Create mosaic by removing overlaps
// @geojson: GeoJSON input
// @options: mosaic options
export function mosaic(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.mosaic, options);
}

// Sort features using expression
// @geojson: GeoJSON input
// @options: sort options with expression
export function sort(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.sortFeatures, options);
}

// Apply JavaScript expressions to each feature
// @geojson: GeoJSON input
// @expression: JavaScript expression to evaluate
// @options: each options
export function each(geojson, expression, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  if (!expression) {
    stop('Expression is required for each function');
  }

  const opts = utils.extend({}, options, { expression });

  // Convert input to dataset
  const dataset = geojsonToDataset(geojson, opts);

  // Use the evaluateEachFeature command
  cmd.evaluateEachFeature(dataset.layers[0], dataset, expression, opts);

  // Convert back to GeoJSON
  return datasetToGeojson(dataset, opts);
}

// Split features into multiple layers
// @geojson: GeoJSON input
// @options: split options
export function split(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  // Convert input to dataset
  const dataset = geojsonToDataset(geojson, options);

  // Split the layer
  const splitLayers = cmd.splitLayer(dataset.layers[0], options);

  // Create result dataset with split layers
  const resultDataset = {
    layers: splitLayers,
    arcs: dataset.arcs,
    info: dataset.info || {}
  };

  // Convert back to GeoJSON - return array of GeoJSON objects
  if (splitLayers.length === 1) {
    return datasetToGeojson(resultDataset, options);
  } else {
    // Return array of GeoJSON objects for multiple layers
    return splitLayers.map(layer => {
      const singleLayerDataset = {
        layers: [layer],
        arcs: dataset.arcs,
        info: dataset.info || {}
      };
      return datasetToGeojson(singleLayerDataset, options);
    });
  }
}

// Merge multiple layers into one
// @geojsonArray: Array of GeoJSON objects or single GeoJSON with multiple layers
// @options: merge-layers options
export function mergeLayers(geojsonArray, options = {}) {
  if (Array.isArray(geojsonArray)) {
    // Handle array of GeoJSON objects
    return merge(geojsonArray, utils.extend({}, options, { 'merge-layers': true }));
  } else {
    // Handle single GeoJSON, merge its internal layers
    if (!validateGeojson(geojsonArray)) {
      stop('Invalid GeoJSON input');
    }

    const dataset = geojsonToDataset(geojsonArray, options);
    const mergedLayer = cmd.mergeLayers(dataset.layers, options);

    const resultDataset = {
      layers: [mergedLayer],
      arcs: dataset.arcs,
      info: dataset.info || {}
    };

    return datasetToGeojson(resultDataset, options);
  }
}

// Divide polylines by polygon boundaries
// @targetGeojson: Polyline GeoJSON to divide
// @dividerGeojson: Polygon GeoJSON to use as divider
// @options: divide options
export function divide(targetGeojson, dividerGeojson, options = {}) {
  if (!validateGeojson(targetGeojson)) {
    stop('Invalid target GeoJSON input');
  }

  if (!validateGeojson(dividerGeojson)) {
    stop('Invalid divider GeoJSON input');
  }

  // Convert both inputs to datasets
  const targetDataset = geojsonToDataset(targetGeojson);
  const dividerDataset = geojsonToDataset(dividerGeojson);

  // Perform the divide operation
  const dividedLayer = cmd.divideLayer(
    targetDataset.layers[0],
    dividerDataset.layers[0],
    targetDataset,
    options
  );

  // Create result dataset
  const resultDataset = {
    layers: [dividedLayer],
    arcs: targetDataset.arcs,
    info: targetDataset.info || {}
  };

  return datasetToGeojson(resultDataset, options);
}

// Extract shared boundaries between polygons
// @geojson: GeoJSON polygon input
// @options: innerlines options
export function innerlines(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.innerlines, options);
}

// Create rectangular polygons
// @options: rectangle options (bbox, coordinates, etc.)
export function rectangle(options = {}) {
  // This function creates geometry from scratch, doesn't need input GeoJSON

  // Convert to dataset format expected by the command
  const dataset = {
    layers: [],
    arcs: null,
    info: {}
  };

  // Create rectangle layer
  const rectangleLayer = cmd.rectangle(dataset, options);

  const resultDataset = {
    layers: [rectangleLayer],
    arcs: dataset.arcs,
    info: dataset.info
  };

  return datasetToGeojson(resultDataset, options);
}

// Transform coordinates (shift, scale, rotate)
// @geojson: GeoJSON input
// @options: affine transformation options
export function affine(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.affineTransform, options);
}

// Project dataset to different coordinate system
// @geojson: GeoJSON input
// @options: projection options
export function proj(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.proj, options);
}

// Create inlay polygons
// @geojson: GeoJSON input
// @options: inlay options
export function inlay(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.inlay, options);
}

// Remove small detached polygon rings
// @geojson: GeoJSON input
// @options: filter-islands options (min-area, etc.)
export function filterIslands(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.filterIslands, options);
}

// Rename data fields
// @geojson: GeoJSON input
// @options: rename-fields options
export function renameFields(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.renameFields, options);
}

// Delete specific data fields
// @geojson: GeoJSON input
// @options: filter-fields options
export function filterFields(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.filterFields, options);
}

// Delete layers or elements within layers
// @geojson: GeoJSON input
// @options: drop options
export function drop(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.drop, options);
}

// Remove duplicate features
// @geojson: GeoJSON input
// @options: uniq options
export function uniq(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.uniq, options);
}

// Join with fuzzy matching
// @targetGeojson: GeoJSON to receive attributes
// @sourceGeojson: GeoJSON with attributes to join
// @options: fuzzy-join options
export function fuzzyJoin(targetGeojson, sourceGeojson, options = {}) {
  if (!validateGeojson(targetGeojson)) {
    stop('Invalid target GeoJSON input');
  }

  if (!validateGeojson(sourceGeojson)) {
    stop('Invalid source GeoJSON input');
  }

  // Convert inputs to datasets
  const targetDataset = geojsonToDataset(targetGeojson);
  const sourceDataset = geojsonToDataset(sourceGeojson);

  // Perform fuzzy join operation
  cmd.fuzzyJoin(targetDataset.layers[0], sourceDataset.layers[0], options);

  return datasetToGeojson(targetDataset, options);
}

// Fill polygons with random points
// @geojson: GeoJSON input
// @options: dots options (count, spacing, etc.)
export function dots(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.dots, options);
}

// Create grid lines for world maps
// @options: graticule options
export function graticule(options = {}) {
  // This function creates geometry from scratch
  const dataset = {
    layers: [],
    arcs: null,
    info: {}
  };

  const graticuleLayer = cmd.graticule(dataset, options);

  const resultDataset = {
    layers: [graticuleLayer],
    arcs: dataset.arcs,
    info: dataset.info
  };

  return datasetToGeojson(resultDataset, options);
}

// Create rectangular grid of points
// @options: point-grid options
export function pointGrid(options = {}) {
  const dataset = {
    layers: [],
    arcs: null,
    info: {}
  };

  const gridLayer = cmd.pointGrid(dataset, options);

  const resultDataset = {
    layers: [gridLayer],
    arcs: dataset.arcs,
    info: dataset.info
  };

  return datasetToGeojson(resultDataset, options);
}

// Get dataset information
// @geojson: GeoJSON input
export function info(geojson) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  const dataset = geojsonToDataset(geojson);
  return cmd.printInfo(dataset);
}

// Validate geometry
// @geojson: GeoJSON input
// @options: check-geometry options
export function checkGeometry(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.checkGeometry, options);
}

// Filter out small polygons (slivers)
// @geojson: GeoJSON input
// @options: filter-slivers options
export function filterSlivers(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.filterSlivers, options);
}

// Snap coordinates to a grid for precision control
// @geojson: GeoJSON input
// @options: snap options
export function snap(geojson, options = {}) {
  if (!validateGeojson(geojson)) {
    stop('Invalid GeoJSON input');
  }

  return runCommandOnGeojson(geojson, cmd.snap, options);
}

// Export all memory API functions
export default {
  dissolve,
  dissolve2,
  buffer,
  clip,
  simplify,
  merge,
  filter,
  calc,
  clean,
  union,
  join,
  snap,
  filterSlivers,
  explode,
  points,
  lines,
  polygons,
  mosaic,
  sort,
  each,
  split,
  mergeLayers,
  divide,
  innerlines,
  rectangle,
  affine,
  proj,
  inlay,
  filterIslands,
  renameFields,
  filterFields,
  drop,
  uniq,
  fuzzyJoin,
  dots,
  graticule,
  pointGrid,
  info,
  checkGeometry
};