// Test that the package works correctly
const mapshaper = require('./index.js');

console.log('Testing mapshaper-memory package...\n');

// Test 1: Check that all memory API functions are exported
console.log('Checking exported functions:');
const expectedFunctions = [
  'dissolve', 'filter', 'calc', 'simplify', 'buffer',
  'clip', 'merge', 'clean', 'union', 'join'
];

expectedFunctions.forEach(fn => {
  if (typeof mapshaper[fn] === 'function') {
    console.log(`✓ ${fn} function is available`);
  } else {
    console.log(`✗ ${fn} function is missing`);
  }
});

// Test 2: Simple dissolve operation
console.log('\nTesting dissolve function:');
const testData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { group: 'A', value: 10 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    },
    {
      type: 'Feature',
      properties: { group: 'A', value: 20 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]]]
      }
    }
  ]
};

try {
  const result = mapshaper.dissolve(testData, {
    fields: ['group'],
    sum_fields: ['value']
  });
  
  console.log('✓ Dissolve successful');
  console.log(`  Input features: ${testData.features.length}`);
  console.log(`  Output features: ${result.features.length}`);
  console.log(`  Aggregated value: ${result.features[0].properties.value}`);
} catch (err) {
  console.log('✗ Dissolve failed:', err.message);
}

// Test 3: Filter operation
console.log('\nTesting filter function:');
try {
  const filtered = mapshaper.filter(testData, {
    expression: 'value > 15'
  });
  
  console.log('✓ Filter successful');
  console.log(`  Filtered features: ${filtered.features.length}`);
} catch (err) {
  console.log('✗ Filter failed:', err.message);
}

// Test 4: Calc operation
console.log('\nTesting calc function:');
try {
  const calculated = mapshaper.calc(testData, {
    density: 'value * 2'
  });
  
  console.log('✓ Calc successful');
  console.log(`  Added field 'density' with values:`, 
    calculated.features.map(f => f.properties.density));
} catch (err) {
  console.log('✗ Calc failed:', err.message);
}

console.log('\n✅ Package test complete!');