# Mapshaper Memory API

This fork extends mapshaper with a new Memory API that allows you to process GeoJSON data directly in memory without file references.

## Installation

```bash
npm install
npm run build
```

## Usage

The Memory API provides direct functions that accept GeoJSON objects and return processed GeoJSON:

```javascript
const mapshaper = require('./mapshaper.js');

// Example GeoJSON FeatureCollection
const featureCollection = {
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
    }
  ]
};

// Dissolve polygons by field
const dissolved = mapshaper.dissolve(featureCollection, {
  fields: ['state'],
  sum_fields: ['population']
});
```

## Available Functions

### dissolve(geojson, options)
Dissolve features based on shared attributes.

```javascript
const result = mapshaper.dissolve(featureCollection, {
  fields: ['state'],        // Fields to group by
  sum_fields: ['population'] // Fields to sum
});
```

### filter(geojson, expression, options)
Filter features using expressions.

```javascript
const filtered = mapshaper.filter(featureCollection, 'population > 1000');
```

### calc(geojson, expressions, options)
Add calculated fields to features.

```javascript
const calculated = mapshaper.calc(featureCollection, {
  area: 'width * height',
  perimeter: '2 * (width + height)'
});
```

### simplify(geojson, options)
Simplify geometry.

```javascript
const simplified = mapshaper.simplify(featureCollection, {
  percentage: 0.1  // Keep 10% of vertices
});
```

### buffer(geojson, distance, options)
Buffer features by a distance.

```javascript
const buffered = mapshaper.buffer(pointFeatures, 100);
```

### clip(targetGeojson, clipGeojson, options)
Clip features using another GeoJSON as boundary.

```javascript
const clipped = mapshaper.clip(targetFeatures, boundaryFeatures);
```

### merge(geojsonArray, options)
Merge multiple GeoJSON objects.

```javascript
const merged = mapshaper.merge([featureCollection1, featureCollection2]);
```

### clean(geojson, options)
Clean topology (remove slivers, fix overlaps).

```javascript
const cleaned = mapshaper.clean(featureCollection);
```

### union(geojson, options)
Union features.

```javascript
const unioned = mapshaper.union(featureCollection);
```

### join(targetGeojson, sourceGeojson, options)
Join attributes from one GeoJSON to another.

```javascript
const joined = mapshaper.join(targetFeatures, sourceFeatures, {
  keys: ['id', 'id']  // Join on matching id fields
});
```

## Input Formats

The Memory API accepts:
- GeoJSON FeatureCollection
- Single GeoJSON Feature
- GeoJSON Geometry objects (Point, LineString, Polygon, etc.)

## Example: Complete Workflow

```javascript
const mapshaper = require('./mapshaper.js');

// Start with raw GeoJSON data in memory
const states = {
  type: 'FeatureCollection',
  features: [
    // ... state polygons with population data
  ]
};

// 1. Filter to specific states
const filtered = mapshaper.filter(states, 'population > 1000000');

// 2. Add calculated density field
const withDensity = mapshaper.calc(filtered, {
  density: 'population / area'
});

// 3. Dissolve by region
const byRegion = mapshaper.dissolve(withDensity, {
  fields: ['region'],
  sum_fields: ['population', 'area']
});

// 4. Simplify for web display
const simplified = mapshaper.simplify(byRegion, {
  percentage: 0.05
});

// Result is GeoJSON that can be used directly
console.log(JSON.stringify(simplified));
```

## Differences from CLI

Unlike the CLI which uses file references, the Memory API:
- Accepts GeoJSON objects directly
- Returns GeoJSON objects directly
- No file I/O required
- All processing happens in memory

## Backward Compatibility

The original mapshaper API remains unchanged:
- `mapshaper.runCommands()` - CLI-style command strings
- `mapshaper.applyCommands()` - Process with input/output objects

The new Memory API functions are additions that don't affect existing functionality.