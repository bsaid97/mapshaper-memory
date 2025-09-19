/**
 * MapShaper Memory API - TypeScript Definitions
 *
 * Based on mapshaper by Matthew Bloch (https://github.com/mbloch/mapshaper)
 * This is a derivative work under Mozilla Public License 2.0
 */

// Core GeoJSON types
export interface GeoJsonProperties {
  [key: string]: any;
}

export interface GeoJsonGeometry {
  type: string;
  coordinates: any;
}

export interface GeoJsonFeature {
  type: "Feature";
  geometry: GeoJsonGeometry | null;
  properties: GeoJsonProperties | null;
}

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

export type GeoJsonInput = GeoJsonFeatureCollection | GeoJsonFeature | GeoJsonGeometry;

// Common options interfaces
export interface BaseOptions {
  [key: string]: any;
}

export interface DissolveOptions extends BaseOptions {
  fields?: string | string[];
  'sum-fields'?: string | string[];
  'copy-fields'?: string | string[];
  'gap-fill-area'?: string | number;
  'sliver-control'?: number;
  'allow-overlaps'?: boolean;
  calc?: string;
}

export interface BufferOptions extends BaseOptions {
  distance?: number;
  units?: string;
}

export interface ClipOptions extends BaseOptions {
  bbox?: number[];
}

export interface SimplifyOptions extends BaseOptions {
  percentage?: number;
  interval?: number;
  resolution?: number;
  method?: string;
}

export interface FilterOptions extends BaseOptions {
  expression?: string;
}

export interface CalcOptions extends BaseOptions {
  [key: string]: any;
}

export interface JoinOptions extends BaseOptions {
  keys?: string | string[];
  fields?: string | string[];
}

export interface SnapOptions extends BaseOptions {
  precision?: number;
}

export interface FilterSliversOptions extends BaseOptions {
  'min-area'?: number | string;
  'remove-empty'?: boolean;
}

// Memory API function declarations

/**
 * Dissolve features based on shared attribute values
 */
export function dissolve(geojson: GeoJsonInput, options?: DissolveOptions): GeoJsonFeatureCollection;

/**
 * Dissolve features with topological analysis (removes overlaps and gaps)
 */
export function dissolve2(geojson: GeoJsonInput, options?: DissolveOptions): GeoJsonFeatureCollection;

/**
 * Create buffer zones around features
 */
export function buffer(geojson: GeoJsonInput, distance: number, options?: BufferOptions): GeoJsonFeatureCollection;

/**
 * Clip features using another geometry as boundary
 */
export function clip(targetGeojson: GeoJsonInput, clipGeojson: GeoJsonInput, options?: ClipOptions): GeoJsonFeatureCollection;

/**
 * Simplify feature geometries
 */
export function simplify(geojson: GeoJsonInput, options?: SimplifyOptions): GeoJsonFeatureCollection;

/**
 * Merge multiple GeoJSON objects into one
 */
export function merge(geojsonArray: GeoJsonInput[], options?: BaseOptions): GeoJsonFeatureCollection;

/**
 * Filter features based on expression
 */
export function filter(geojson: GeoJsonInput, options?: FilterOptions): GeoJsonFeatureCollection;

/**
 * Calculate and add new fields to features
 */
export function calc(geojson: GeoJsonInput, expressions: Record<string, string>, options?: CalcOptions): GeoJsonFeatureCollection;

/**
 * Clean topology (remove slivers, fix overlaps)
 */
export function clean(geojson: GeoJsonInput, options?: BaseOptions): GeoJsonFeatureCollection;

/**
 * Union all features into single geometry
 */
export function union(geojson: GeoJsonInput, options?: BaseOptions): GeoJsonFeatureCollection;

/**
 * Join attributes from source to target features
 */
export function join(targetGeojson: GeoJsonInput, sourceGeojson: GeoJsonInput, options?: JoinOptions): GeoJsonFeatureCollection;

/**
 * Snap coordinates to a grid for precision control
 */
export function snap(geojson: GeoJsonInput, options?: SnapOptions): GeoJsonFeatureCollection;

/**
 * Filter out small polygons (slivers)
 */
export function filterSlivers(geojson: GeoJsonInput, options?: FilterSliversOptions): GeoJsonFeatureCollection;

// Default export with all functions
declare const mapshaper: {
  dissolve: typeof dissolve;
  dissolve2: typeof dissolve2;
  buffer: typeof buffer;
  clip: typeof clip;
  simplify: typeof simplify;
  merge: typeof merge;
  filter: typeof filter;
  calc: typeof calc;
  clean: typeof clean;
  union: typeof union;
  join: typeof join;
  snap: typeof snap;
  filterSlivers: typeof filterSlivers;
};

export default mapshaper;