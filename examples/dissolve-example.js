// Example: Dissolving polygons by attributes
const mapshaper = require('../index.js');

// Sample data: US counties with state information
const counties = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { 
        county: 'Los Angeles',
        state: 'CA',
        population: 10000000,
        area: 4000
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-118.5, 34], [-118, 34], [-118, 34.5], [-118.5, 34.5], [-118.5, 34]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        county: 'Orange',
        state: 'CA',
        population: 3200000,
        area: 950
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-118, 33.5], [-117.5, 33.5], [-117.5, 34], [-118, 34], [-118, 33.5]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        county: 'San Diego',
        state: 'CA',
        population: 3300000,
        area: 4200
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-117.5, 32.5], [-117, 32.5], [-117, 33], [-117.5, 33], [-117.5, 32.5]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        county: 'Maricopa',
        state: 'AZ',
        population: 4500000,
        area: 9200
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-112.5, 33], [-112, 33], [-112, 33.5], [-112.5, 33.5], [-112.5, 33]]]
      }
    },
    {
      type: 'Feature',
      properties: {
        county: 'Pima',
        state: 'AZ',
        population: 1000000,
        area: 9200
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[-111.5, 32], [-111, 32], [-111, 32.5], [-111.5, 32.5], [-111.5, 32]]]
      }
    }
  ]
};

console.log('Original data:');
console.log(`- ${counties.features.length} counties`);
counties.features.forEach(f => {
  console.log(`  ${f.properties.county}, ${f.properties.state}: pop=${f.properties.population.toLocaleString()}`);
});

console.log('\nDissolving counties by state...');

// Dissolve by state, summing population and area
const states = mapshaper.dissolve(counties, {
  fields: ['state'],
  sum_fields: ['population', 'area'],
  copy_fields: ['state']
});

console.log('\nResult:');
console.log(`- ${states.features.length} states`);
states.features.forEach(f => {
  const pop = f.properties.population.toLocaleString();
  const area = f.properties.area.toLocaleString();
  console.log(`  ${f.properties.state}: population=${pop}, area=${area} sq km`);
});

// Calculate density for each state
console.log('\nAdding density calculation...');
const statesWithDensity = mapshaper.calc(states, {
  density: 'Math.round(population / area)'
});

console.log('States with density:');
statesWithDensity.features.forEach(f => {
  console.log(`  ${f.properties.state}: ${f.properties.density} people per sq km`);
});