import assert from 'assert';
import api from '../mapshaper.js';

describe('Memory API', function() {

  describe('dissolve()', function() {
    
    it('should dissolve a simple polygon FeatureCollection', function() {
      const input = {
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
          },
          {
            type: 'Feature',
            properties: { group: 'B', value: 30 },
            geometry: {
              type: 'Polygon',
              coordinates: [[[2, 0], [3, 0], [3, 1], [2, 1], [2, 0]]]
            }
          }
        ]
      };

      const result = api.dissolve(input, { fields: ['group'] });
      
      assert.equal(result.type, 'FeatureCollection');
      assert.equal(result.features.length, 2);
      
      // Check that groups A and B exist
      const groups = result.features.map(f => f.properties.group).sort();
      assert.deepEqual(groups, ['A', 'B']);
      
      // Group A should have merged the two adjacent polygons
      const groupA = result.features.find(f => f.properties.group === 'A');
      assert.equal(groupA.geometry.type, 'Polygon');
    });

    it('should dissolve points by grouping', function() {
      const input = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { city: 'NYC', population: 100 },
            geometry: { type: 'Point', coordinates: [0, 0] }
          },
          {
            type: 'Feature',
            properties: { city: 'NYC', population: 200 },
            geometry: { type: 'Point', coordinates: [1, 1] }
          },
          {
            type: 'Feature',
            properties: { city: 'LA', population: 150 },
            geometry: { type: 'Point', coordinates: [2, 2] }
          }
        ]
      };

      const result = api.dissolve(input, { 
        fields: ['city'],
        sum_fields: ['population']
      });
      
      assert.equal(result.features.length, 2);
      
      const nyc = result.features.find(f => f.properties.city === 'NYC');
      assert.equal(nyc.properties.population, 300);
      
      const la = result.features.find(f => f.properties.city === 'LA');
      assert.equal(la.properties.population, 150);
    });

    it('should handle a single Feature input', function() {
      const input = {
        type: 'Feature',
        properties: { name: 'test' },
        geometry: {
          type: 'Polygon',
          coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
        }
      };

      const result = api.dissolve(input);
      assert.equal(result.type, 'FeatureCollection');
      assert.equal(result.features.length, 1);
    });

    it('should handle a Geometry input', function() {
      const input = {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
      };

      const result = api.dissolve(input);
      assert.equal(result.type, 'FeatureCollection');
      assert.equal(result.features.length, 1);
      assert.equal(result.features[0].geometry.type, 'Polygon');
    });
  });

  describe('filter()', function() {
    
    it('should filter features by expression', function() {
      const input = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { population: 1000 },
            geometry: { type: 'Point', coordinates: [0, 0] }
          },
          {
            type: 'Feature',
            properties: { population: 2000 },
            geometry: { type: 'Point', coordinates: [1, 1] }
          },
          {
            type: 'Feature',
            properties: { population: 500 },
            geometry: { type: 'Point', coordinates: [2, 2] }
          }
        ]
      };

      const result = api.filter(input, 'population > 1000');
      
      assert.equal(result.features.length, 1);
      assert.equal(result.features[0].properties.population, 2000);
    });
  });

  describe('calc()', function() {
    
    it('should add calculated fields', function() {
      const input = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { width: 10, height: 5 },
            geometry: { type: 'Point', coordinates: [0, 0] }
          },
          {
            type: 'Feature',
            properties: { width: 20, height: 3 },
            geometry: { type: 'Point', coordinates: [1, 1] }
          }
        ]
      };

      const result = api.calc(input, {
        area: 'width * height',
        perimeter: '2 * (width + height)'
      });
      
      assert.equal(result.features[0].properties.area, 50);
      assert.equal(result.features[0].properties.perimeter, 30);
      assert.equal(result.features[1].properties.area, 60);
      assert.equal(result.features[1].properties.perimeter, 46);
    });
  });

  describe('simplify()', function() {
    
    it('should simplify a complex polygon', function() {
      // Create a polygon with many vertices
      const coords = [];
      for (let i = 0; i <= 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        coords.push([Math.cos(angle), Math.sin(angle)]);
      }
      
      const input = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        }
      };

      const result = api.simplify(input, { percentage: 0.1 });
      
      assert.equal(result.type, 'FeatureCollection');
      assert.equal(result.features[0].geometry.type, 'Polygon');
      
      // Should have fewer vertices after simplification
      const simplifiedCoords = result.features[0].geometry.coordinates[0];
      assert(simplifiedCoords.length < coords.length);
    });
  });

  describe('merge()', function() {
    
    it('should merge multiple FeatureCollections', function() {
      const fc1 = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { id: 1 },
            geometry: { type: 'Point', coordinates: [0, 0] }
          }
        ]
      };
      
      const fc2 = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { id: 2 },
            geometry: { type: 'Point', coordinates: [1, 1] }
          }
        ]
      };

      const result = api.merge([fc1, fc2]);
      
      assert.equal(result.type, 'FeatureCollection');
      assert.equal(result.features.length, 2);
      assert.equal(result.features[0].properties.id, 1);
      assert.equal(result.features[1].properties.id, 2);
    });
  });

  describe('Error handling', function() {
    
    it('should throw error for invalid GeoJSON', function() {
      assert.throws(() => {
        api.dissolve({ invalid: 'object' });
      }, /Invalid GeoJSON/);
      
      assert.throws(() => {
        api.dissolve(null);
      }, /Invalid GeoJSON/);
      
      assert.throws(() => {
        api.dissolve('not an object');
      }, /Invalid GeoJSON/);
    });

    it('should throw error for missing required parameters', function() {
      const validGeoJSON = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [0, 0] }
      };
      
      assert.throws(() => {
        api.buffer(validGeoJSON); // Missing distance
      }, /Buffer distance is required/);
      
      assert.throws(() => {
        api.filter(validGeoJSON); // Missing expression
      }, /Filter expression is required/);
    });
  });
});