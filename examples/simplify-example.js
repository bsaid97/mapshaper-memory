// Example: Simplifying complex geometries for web display
const mapshaper = require('../index.js');

// Create a complex polygon (circle approximation with many points)
function createComplexPolygon(centerX, centerY, radius, numPoints) {
  const coords = [];
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    coords.push([
      centerX + radius * Math.cos(angle),
      centerY + radius * Math.sin(angle)
    ]);
  }
  return coords;
}

// Create a feature with a very detailed polygon
const detailedFeature = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {
      name: 'Detailed Circle',
      originalVertices: 1001
    },
    geometry: {
      type: 'Polygon',
      coordinates: [createComplexPolygon(0, 0, 10, 1000)]
    }
  }]
};

console.log('Original geometry:');
console.log(`- Vertices: ${detailedFeature.features[0].geometry.coordinates[0].length}`);
console.log(`- File size estimate: ${JSON.stringify(detailedFeature).length} bytes`);

// Simplify to different levels
const simplificationLevels = [0.5, 0.1, 0.01];

simplificationLevels.forEach(percentage => {
  console.log(`\nSimplifying to ${percentage * 100}% of original vertices...`);
  
  const simplified = mapshaper.simplify(detailedFeature, {
    percentage: percentage,
    keep_shapes: true  // Don't remove the feature even if it becomes very small
  });
  
  const vertexCount = simplified.features[0].geometry.coordinates[0].length;
  const fileSize = JSON.stringify(simplified).length;
  const reduction = Math.round((1 - fileSize / JSON.stringify(detailedFeature).length) * 100);
  
  console.log(`- Vertices: ${vertexCount}`);
  console.log(`- File size: ${fileSize} bytes (${reduction}% reduction)`);
});

// Example with different simplification methods
console.log('\nComparing simplification methods:');

const methods = ['dp', 'visvalingam', 'weighted'];

methods.forEach(method => {
  const simplified = mapshaper.simplify(detailedFeature, {
    percentage: 0.05,
    method: method,
    keep_shapes: true
  });
  
  const vertexCount = simplified.features[0].geometry.coordinates[0].length;
  console.log(`- ${method}: ${vertexCount} vertices`);
});