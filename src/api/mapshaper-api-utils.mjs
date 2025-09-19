import { importGeoJSON } from '../geojson/geojson-import';
import { exportLayerAsGeoJSON } from '../geojson/geojson-export';
import { stop } from '../utils/mapshaper-logging';

// Convert a GeoJSON object (FeatureCollection, Feature, or Geometry) to internal dataset format
export function geojsonToDataset(geojson, opts = {}) {
  if (!geojson) {
    stop('Invalid input: GeoJSON object is required');
  }
  
  // importGeoJSON can handle FeatureCollection, Feature, or Geometry types
  const dataset = importGeoJSON(geojson, opts);
  
  if (!dataset || !dataset.layers || dataset.layers.length === 0) {
    stop('Failed to convert GeoJSON to dataset');
  }
  
  return dataset;
}

// Convert internal dataset to GeoJSON FeatureCollection
export function datasetToGeojson(dataset, opts = {}) {
  if (!dataset || !dataset.layers || dataset.layers.length === 0) {
    stop('Invalid dataset: no layers found');
  }
  
  // Export layer as GeoJSON FeatureCollection
  // The third parameter (asFeatures) should be true for FeatureCollection output
  const features = exportLayerAsGeoJSON(dataset.layers[0], dataset, opts, true);
  
  return {
    type: 'FeatureCollection',
    features: features
  };
}

// Convert a single layer to GeoJSON
export function layerToGeojson(layer, dataset, opts = {}) {
  return exportLayerAsGeoJSON(layer, dataset, opts);
}

// Helper to run a command on in-memory GeoJSON and return GeoJSON
export function runCommandOnGeojson(geojson, commandFunc, opts = {}) {
  // Convert input to dataset
  const dataset = geojsonToDataset(geojson, opts);
  
  // Run the command
  const resultLayer = commandFunc(dataset.layers[0], dataset.arcs, opts);
  
  // Handle commands that might return null or modify in place
  if (!resultLayer) {
    // Some commands modify the layer in place
    return datasetToGeojson(dataset, opts);
  }
  
  // Create a new dataset with the result
  const resultDataset = {
    layers: [resultLayer],
    arcs: dataset.arcs,
    info: dataset.info || {}
  };
  
  // Convert back to GeoJSON
  return datasetToGeojson(resultDataset, opts);
}

// Helper to validate GeoJSON structure
export function validateGeojson(geojson) {
  if (!geojson || typeof geojson !== 'object') {
    return false;
  }
  
  const validTypes = [
    'FeatureCollection',
    'Feature',
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'GeometryCollection'
  ];
  
  return geojson.type && validTypes.includes(geojson.type);
}