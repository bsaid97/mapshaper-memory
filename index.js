// Main entry point for mapshaper-memory package
// This provides a clean API for using mapshaper with in-memory GeoJSON data

// Load the built mapshaper library
const mapshaper = require('./mapshaper.js');

// Export the Memory API functions directly
module.exports = {
  // Core Memory API functions for direct GeoJSON manipulation
  dissolve: mapshaper.dissolve,
  dissolve2: mapshaper.dissolve2,
  filter: mapshaper.filter,
  calc: mapshaper.calc,
  simplify: mapshaper.simplify,
  buffer: mapshaper.buffer,
  clip: mapshaper.clip,
  merge: mapshaper.merge,
  clean: mapshaper.clean,
  union: mapshaper.union,
  join: mapshaper.join,
  snap: mapshaper.snap,
  filterSlivers: mapshaper.filterSlivers,

  // Geometry operations
  explode: mapshaper.explode,
  points: mapshaper.points,
  lines: mapshaper.lines,
  polygons: mapshaper.polygons,
  mosaic: mapshaper.mosaic,

  // Data operations
  sort: mapshaper.sort,
  each: mapshaper.each,
  split: mapshaper.split,
  mergeLayers: mapshaper.mergeLayers,
  renameFields: mapshaper.renameFields,
  filterFields: mapshaper.filterFields,

  // Advanced geometry operations
  divide: mapshaper.divide,
  innerlines: mapshaper.innerlines,
  rectangle: mapshaper.rectangle,
  affine: mapshaper.affine,
  proj: mapshaper.proj,
  inlay: mapshaper.inlay,

  // Visualization & analysis
  dots: mapshaper.dots,
  graticule: mapshaper.graticule,
  pointGrid: mapshaper.pointGrid,
  info: mapshaper.info,
  checkGeometry: mapshaper.checkGeometry,
  
  // Also export the original API for compatibility
  runCommands: mapshaper.runCommands,
  applyCommands: mapshaper.applyCommands,
  runCommandsXL: mapshaper.runCommandsXL,
  enableLogging: mapshaper.enableLogging,
  
  // Export internal namespaces for advanced usage
  internal: mapshaper.internal,
  utils: mapshaper.utils,
  geom: mapshaper.geom,
  cmd: mapshaper.cmd,
  cli: mapshaper.cli
};