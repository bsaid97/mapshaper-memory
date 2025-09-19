// Main entry point for mapshaper-memory package
// This provides a clean API for using mapshaper with in-memory GeoJSON data

// Build the library if it hasn't been built yet
const fs = require('fs');
const path = require('path');

// Check if mapshaper.js exists, if not, provide instructions
if (!fs.existsSync(path.join(__dirname, 'mapshaper.js'))) {
  console.error('Error: mapshaper.js not found. Please run "npm run build" first.');
  process.exit(1);
}

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