# MapShaper Memory API

A memory-focused JavaScript library for processing GeoJSON data with advanced geospatial operations. Based on [mapshaper](https://github.com/mbloch/mapshaper) by Matthew Bloch, this library provides a clean, functional API for working with geographic data directly in memory.

## Features

🗺️ **13 Geospatial Operations** - dissolve, buffer, clip, simplify, and more
⚡ **Memory-Optimized** - Process GeoJSON without file I/O
🔧 **TypeScript Support** - Full type definitions included
🌐 **Universal** - Works in Node.js and browsers
📦 **Zero Config** - Simple install and use

## Installation

```bash
npm install mapshaper-memory
```

## Quick Start

```javascript
import { dissolve, buffer, clip } from 'mapshaper-memory';
// or
const mapshaper = require('mapshaper-memory');

// Dissolve features by shared properties
const dissolved = dissolve(geojson, { fields: 'region' });

// Create 100-meter buffers
const buffered = buffer(geojson, 100, { units: 'meters' });

// Clip features to a boundary
const clipped = clip(targetLayer, boundaryLayer);
```

## API Reference

### Core Operations

#### `dissolve(geojson, options?)`
Dissolve features based on shared attribute values.
```javascript
const result = dissolve(geojson, {
  fields: 'region',           // Field(s) to dissolve by
  'sum-fields': 'population', // Fields to sum during dissolve
  'copy-fields': 'name'       // Fields to copy from first feature
});
```

#### `dissolve2(geojson, options?)`
Advanced dissolve with topological analysis (removes overlaps and gaps).
```javascript
const result = dissolve2(geojson, {
  fields: 'category',
  'gap-fill-area': '1km2',
  'sliver-control': 0.5
});
```

#### `buffer(geojson, distance, options?)`
Create buffer zones around features.
```javascript
const result = buffer(geojson, 500, {
  units: 'meters'
});
```

#### `clip(targetGeojson, clipGeojson, options?)`
Clip features using another geometry as boundary.
```javascript
const result = clip(counties, stateBoundary);
```

#### `simplify(geojson, options?)`
Simplify feature geometries to reduce complexity.
```javascript
const result = simplify(geojson, {
  percentage: 0.1,  // Keep 10% of vertices
  method: 'dp'      // Douglas-Peucker algorithm
});
```

### Data Operations

#### `filter(geojson, options)`
Filter features based on JavaScript expressions.
```javascript
const result = filter(geojson, {
  expression: 'population > 50000 && area < 1000'
});
```

#### `calc(geojson, expressions, options?)`
Calculate and add new fields to features.
```javascript
const result = calc(geojson, {
  density: 'population / area',
  category: 'population > 100000 ? "urban" : "rural"'
});
```

#### `join(targetGeojson, sourceGeojson, options)`
Join attributes from source to target features.
```javascript
const result = join(counties, demographics, {
  keys: 'county_id,id',
  fields: 'population,income'
});
```

### Geometry Operations

#### `clean(geojson, options?)`
Clean topology - remove slivers, fix overlaps, and repair geometry.
```javascript
const result = clean(geojson);
```

#### `snap(geojson, options?)`
Snap coordinates to a grid for precision control.
```javascript
const result = snap(geojson, {
  precision: 0.001  // Snap to ~100m grid
});
```

#### `filterSlivers(geojson, options?)`
Remove small polygons (slivers) from the data.
```javascript
const result = filterSlivers(geojson, {
  'min-area': '10km2',
  'remove-empty': true
});
```

#### `union(geojson, options?)`
Union all features into a single geometry.
```javascript
const result = union(geojson);
```

#### `merge(geojsonArray, options?)`
Merge multiple GeoJSON objects into one.
```javascript
const result = merge([layer1, layer2, layer3]);
```

## Advanced Usage

### Chaining Operations
```javascript
import { dissolve, buffer, simplify } from 'mapshaper-memory';

const result = simplify(
  buffer(
    dissolve(geojson, { fields: 'region' }),
    1000
  ),
  { percentage: 0.05 }
);
```

### TypeScript Usage
```typescript
import { GeoJsonFeatureCollection, DissolveOptions } from 'mapshaper-memory';

const options: DissolveOptions = {
  fields: 'region',
  'sum-fields': ['population', 'area']
};

const result: GeoJsonFeatureCollection = dissolve(geojson, options);
```

### Expression Syntax
Many functions support JavaScript expressions for dynamic operations:

```javascript
// Filter with complex conditions
filter(geojson, {
  expression: 'population > 50000 && state === "CA"'
});

// Calculate new fields
calc(geojson, {
  pop_density: 'population / (area_km2 || 1)',
  size_class: `
    area_km2 > 1000 ? 'large' :
    area_km2 > 100 ? 'medium' : 'small'
  `
});
```

## Error Handling

All functions validate input and throw descriptive errors:

```javascript
try {
  const result = dissolve(geojson, { fields: 'nonexistent_field' });
} catch (error) {
  console.error('Dissolve failed:', error.message);
}
```

## Performance Tips

- Use `dissolve2` for overlapping polygons, `dissolve` for simple grouping
- Apply `simplify` before expensive operations to improve performance
- Use `clean` to fix topology issues before geometric operations
- Filter large datasets early in processing chains

## Browser Usage

```html
<script src="https://unpkg.com/mapshaper-memory"></script>
<script>
  const { dissolve, buffer } = mapshaper;

  // Use the API
  const result = dissolve(geojson, { fields: 'category' });
</script>
```

## License & Attribution

This library is based on [mapshaper](https://github.com/mbloch/mapshaper) by Matthew Bloch and is distributed under the Mozilla Public License 2.0. This is a derivative work that provides a memory-focused API for the original mapshaper functionality.

**Original Copyright:** Matthew Bloch
**Derivative Work:** Ben Said
**License:** MPL-2.0

According to Mozilla's [FAQ](http://www.mozilla.org/MPL/2.0/FAQ.html), "The MPL's 'file-level' copyleft is designed to encourage contributors to share modifications they make to your code, while still allowing them to combine your code with code under other licenses (open or proprietary) with minimal restrictions."

## Contributing

Issues and pull requests welcome at [github.com/bsaid97/mapshaper-memory](https://github.com/bsaid97/mapshaper-memory).

## Related Projects

- [mapshaper](https://github.com/mbloch/mapshaper) - Original CLI tool and web interface
- [turf](https://github.com/Turfjs/turf) - Alternative geospatial analysis library
- [JSTS](https://github.com/bjornharrtell/jsts) - JavaScript topology suite

## Acknowledgements

Matthew Bloch and contributors to the original mapshaper project, for creating an exceptional geospatial processing library.
