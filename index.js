// Main entry point for mapshaper-memory package
// This provides a clean API for using mapshaper with in-memory GeoJSON data

// Load the built mapshaper library
const mapshaper = require('./mapshaper.js');

// Export the Memory API functions directly
module.exports = {
  // Memory API functions for direct GeoJSON manipulation
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