// Simple test script to demonstrate the new memory API
const mapshaper = require('./mapshaper.js');

// Test 1: Dissolve polygons by a field
console.log('Test 1: Dissolve polygons by field');
const polygonFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { state: 'CA', population: 100 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      }
    },
    {
      type: 'Feature',
      properties: { state: 'CA', population: 200 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[1, 0], [2, 0], [2, 1], [1, 1], [1, 0]]]
      }
    },
    {
      type: 'Feature',
      properties: { state: 'NV', population: 50 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[2, 0], [3, 0], [3, 1], [2, 1], [2, 0]]]
      }
    }
  ]
};

try {
  const dissolved = mapshaper.dissolve(polygonFeatureCollection, {
    fields: ['state'],
    sum_fields: ['population']
  });
  
  console.log('✓ Dissolve successful!');
  console.log('  Input features:', polygonFeatureCollection.features.length);
  console.log('  Output features:', dissolved.features.length);
  dissolved.features.forEach(f => {
    console.log(`  - ${f.properties.state}: population = ${f.properties.population}`);
  });
} catch (err) {
  console.error('✗ Dissolve failed:', err.message);
}

console.log('\n---\n');

// Test 2: Filter features
console.log('Test 2: Filter features by expression');
const pointFeatures = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { city: 'San Francisco', population: 884000 },
      geometry: { type: 'Point', coordinates: [-122.4, 37.8] }
    },
    {
      type: 'Feature',
      properties: { city: 'Oakland', population: 430000 },
      geometry: { type: 'Point', coordinates: [-122.3, 37.8] }
    },
    {
      type: 'Feature',
      properties: { city: 'San Jose', population: 1030000 },
      geometry: { type: 'Point', coordinates: [-121.9, 37.3] }
    }
  ]
};

try {
  const filtered = mapshaper.filter(pointFeatures, 'population > 500000');
  
  console.log('✓ Filter successful!');
  console.log('  Input features:', pointFeatures.features.length);
  console.log('  Output features:', filtered.features.length);
  filtered.features.forEach(f => {
    console.log(`  - ${f.properties.city}: ${f.properties.population}`);
  });
} catch (err) {
  console.error('✗ Filter failed:', err.message);
}

console.log('\n---\n');

// Test 3: Calculate new fields
console.log('Test 3: Calculate new fields');
const rectangles = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'A', width: 10, height: 5 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [10, 0], [10, 5], [0, 5], [0, 0]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'B', width: 8, height: 4 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [8, 0], [8, 4], [0, 4], [0, 0]]]
      }
    }
  ]
};

try {
  const calculated = mapshaper.calc(rectangles, {
    area: 'width * height',
    perimeter: '2 * (width + height)'
  });
  
  console.log('✓ Calc successful!');
  calculated.features.forEach(f => {
    console.log(`  - ${f.properties.name}: area=${f.properties.area}, perimeter=${f.properties.perimeter}`);
  });
} catch (err) {
  console.error('✗ Calc failed:', err.message);
}

console.log('\n---\n');

// Test 4: Complex dissolve with overlapping polygons
console.log('Test 4: Complex dissolve with overlapping/adjacent polygons');
const complexFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // County A - multiple districts that should merge
    {
      type: 'Feature',
      properties: { county: 'A', district: '1', population: 1000, area: 100 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [2, 0], [2, 2], [0, 2], [0, 0]]]
      }
    },
    {
      type: 'Feature',
      properties: { county: 'A', district: '2', population: 1500, area: 150 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[2, 0], [4, 0], [4, 2], [2, 2], [2, 0]]]
      }
    },
    {
      type: 'Feature',
      properties: { county: 'A', district: '3', population: 800, area: 80 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[1, 2], [3, 2], [3, 3], [1, 3], [1, 2]]]
      }
    },
    // County B - separate districts
    {
      type: 'Feature',
      properties: { county: 'B', district: '1', population: 2000, area: 200 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[5, 0], [7, 0], [7, 2], [5, 2], [5, 0]]]
      }
    },
    {
      type: 'Feature',
      properties: { county: 'B', district: '2', population: 2500, area: 250 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[5, 2], [7, 2], [7, 4], [5, 4], [5, 2]]]
      }
    },
    // County C - single district
    {
      type: 'Feature',
      properties: { county: 'C', district: '1', population: 3000, area: 300 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 5], [3, 5], [3, 7], [0, 7], [0, 5]]]
      }
    }
  ]
};

try {
  // Dissolve by county, summing population and area
  const dissolved = mapshaper.dissolve(complexFeatureCollection, {
    fields: ['county'],
    sum_fields: ['population', 'area'],
    copy_fields: ['county']  // Ensure county name is preserved
  });
  
  console.log('✓ Complex dissolve successful!');
  console.log('  Input features:', complexFeatureCollection.features.length);
  console.log('  Output features:', dissolved.features.length);
  console.log('  Dissolved counties:');
  
  // Sort by county name for consistent output
  const sortedFeatures = dissolved.features.sort((a, b) => 
    (a.properties.county || '').localeCompare(b.properties.county || ''));
  
  sortedFeatures.forEach(f => {
    console.log(`    - County ${f.properties.county}: population=${f.properties.population}, area=${f.properties.area}`);
  });
  
  // Verify the sums are correct
  const countyA = dissolved.features.find(f => f.properties.county === 'A');
  const countyB = dissolved.features.find(f => f.properties.county === 'B');
  const countyC = dissolved.features.find(f => f.properties.county === 'C');
  
  if (countyA && countyA.properties.population === 3300 && countyA.properties.area === 330) {
    console.log('  ✓ County A totals verified (3300 population, 330 area)');
  }
  if (countyB && countyB.properties.population === 4500 && countyB.properties.area === 450) {
    console.log('  ✓ County B totals verified (4500 population, 450 area)');
  }
  if (countyC && countyC.properties.population === 3000 && countyC.properties.area === 300) {
    console.log('  ✓ County C totals verified (3000 population, 300 area)');
  }
  
} catch (err) {
  console.error('✗ Complex dissolve failed:', err.message);
}

console.log('\n---\n');
console.log('All tests completed!');
