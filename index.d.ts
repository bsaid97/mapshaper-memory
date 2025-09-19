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

export interface ExplodeOptions extends BaseOptions {
  'convert-holes'?: boolean;
}

export interface PointsOptions extends BaseOptions {
  x?: string;
  y?: string;
  inner?: boolean;
  centroid?: boolean;
}

export interface LinesOptions extends BaseOptions {
  fields?: string | string[];
}

export interface PolygonsOptions extends BaseOptions {
  // No specific options documented
}

export interface MosaicOptions extends BaseOptions {
  calc?: string;
  'copy-fields'?: string | string[];
  'sum-fields'?: string | string[];
}

export interface SortOptions extends BaseOptions {
  expression?: string;
  descending?: boolean;
}

export interface EachOptions extends BaseOptions {
  expression?: string;
  'target'?: string;
}

export interface SplitOptions extends BaseOptions {
  field?: string;
  'no-replace'?: boolean;
}

export interface MergeLayersOptions extends BaseOptions {
  target?: string;
  force?: boolean;
}

export interface RenameFieldsOptions extends BaseOptions {
  fields?: Record<string, string>;
}

export interface FilterFieldsOptions extends BaseOptions {
  fields?: string | string[];
  invert?: boolean;
}

export interface DivideOptions extends BaseOptions {
  fields?: string | string[];
  'copy-fields'?: string | string[];
}

export interface InnerlinesOptions extends BaseOptions {
  where?: string;
}

export interface RectangleOptions extends BaseOptions {
  bbox?: number[];
  'offset'?: number;
  'aspect-ratio'?: number;
}

export interface AffineOptions extends BaseOptions {
  shift?: string;
  scale?: string;
  rotate?: number;
}

export interface ProjOptions extends BaseOptions {
  crs?: string;
  'init'?: string;
  'match'?: string;
  'source'?: string;
  'target'?: string;
}

export interface InlayOptions extends BaseOptions {
  fields?: string | string[];
}

export interface DotsOptions extends BaseOptions {
  'copy-fields'?: string | string[];
  radius?: number;
  colors?: string;
}

export interface GraticuleOptions extends BaseOptions {
  interval?: number;
  'bbox'?: number[];
}

export interface PointGridOptions extends BaseOptions {
  interval?: number;
  cols?: number;
  rows?: number;
  'bbox'?: number[];
}

export interface InfoOptions extends BaseOptions {
  // No specific options
}

export interface CheckGeometryOptions extends BaseOptions {
  verbose?: boolean;
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

/**
 * Explode multi-part features into single-part features
 */
export function explode(geojson: GeoJsonInput, options?: ExplodeOptions): GeoJsonFeatureCollection;

/**
 * Convert features to points
 */
export function points(geojson: GeoJsonInput, options?: PointsOptions): GeoJsonFeatureCollection;

/**
 * Convert features to lines
 */
export function lines(geojson: GeoJsonInput, options?: LinesOptions): GeoJsonFeatureCollection;

/**
 * Convert features to polygons
 */
export function polygons(geojson: GeoJsonInput, options?: PolygonsOptions): GeoJsonFeatureCollection;

/**
 * Create mosaic from overlapping polygons
 */
export function mosaic(geojson: GeoJsonInput, options?: MosaicOptions): GeoJsonFeatureCollection;

/**
 * Sort features by expression
 */
export function sort(geojson: GeoJsonInput, options?: SortOptions): GeoJsonFeatureCollection;

/**
 * Apply expression to each feature
 */
export function each(geojson: GeoJsonInput, options?: EachOptions): GeoJsonFeatureCollection;

/**
 * Split features into separate layers
 */
export function split(geojson: GeoJsonInput, options?: SplitOptions): GeoJsonFeatureCollection;

/**
 * Merge multiple layers into one
 */
export function mergeLayers(geojsonArray: GeoJsonInput[], options?: MergeLayersOptions): GeoJsonFeatureCollection;

/**
 * Rename feature fields
 */
export function renameFields(geojson: GeoJsonInput, fieldMap: Record<string, string>, options?: RenameFieldsOptions): GeoJsonFeatureCollection;

/**
 * Filter feature fields
 */
export function filterFields(geojson: GeoJsonInput, fields: string | string[], options?: FilterFieldsOptions): GeoJsonFeatureCollection;

/**
 * Divide target features by source features
 */
export function divide(targetGeojson: GeoJsonInput, sourceGeojson: GeoJsonInput, options?: DivideOptions): GeoJsonFeatureCollection;

/**
 * Extract inner lines from polygons
 */
export function innerlines(geojson: GeoJsonInput, options?: InnerlinesOptions): GeoJsonFeatureCollection;

/**
 * Create rectangle from bounding box
 */
export function rectangle(geojson: GeoJsonInput, options?: RectangleOptions): GeoJsonFeatureCollection;

/**
 * Apply affine transformation
 */
export function affine(geojson: GeoJsonInput, options?: AffineOptions): GeoJsonFeatureCollection;

/**
 * Project to different coordinate system
 */
export function proj(geojson: GeoJsonInput, options?: ProjOptions): GeoJsonFeatureCollection;

/**
 * Inlay smaller features into larger ones
 */
export function inlay(targetGeojson: GeoJsonInput, sourceGeojson: GeoJsonInput, options?: InlayOptions): GeoJsonFeatureCollection;

/**
 * Create dot density visualization
 */
export function dots(geojson: GeoJsonInput, options?: DotsOptions): GeoJsonFeatureCollection;

/**
 * Create coordinate graticule
 */
export function graticule(geojson: GeoJsonInput, options?: GraticuleOptions): GeoJsonFeatureCollection;

/**
 * Create point grid
 */
export function pointGrid(geojson: GeoJsonInput, options?: PointGridOptions): GeoJsonFeatureCollection;

/**
 * Get dataset information
 */
export function info(geojson: GeoJsonInput, options?: InfoOptions): any;

/**
 * Check geometry validity
 */
export function checkGeometry(geojson: GeoJsonInput, options?: CheckGeometryOptions): any;

// Default export with all functions
declare const mapshaper: {
  // Core operations
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

  // Geometry operations
  explode: typeof explode;
  points: typeof points;
  lines: typeof lines;
  polygons: typeof polygons;
  mosaic: typeof mosaic;

  // Data operations
  sort: typeof sort;
  each: typeof each;
  split: typeof split;
  mergeLayers: typeof mergeLayers;
  renameFields: typeof renameFields;
  filterFields: typeof filterFields;

  // Advanced geometry
  divide: typeof divide;
  innerlines: typeof innerlines;
  rectangle: typeof rectangle;
  affine: typeof affine;
  proj: typeof proj;
  inlay: typeof inlay;

  // Visualization & analysis
  dots: typeof dots;
  graticule: typeof graticule;
  pointGrid: typeof pointGrid;
  info: typeof info;
  checkGeometry: typeof checkGeometry;
};

export default mapshaper;