// CONFIG
export const DEFAULT_SVG_CLASS = 'd3-hierarchy';
export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;
export const DEFAULT_NDDE_SIZE = [60, 160];
export const DEFAULT_NODE_DISTANCE = 200;
export const DEFAULT_SCALE_STEP = 0.25;
export const DEFAULT_SCALE_EXTENT = [0.5, 2];
export const DEFAULT_CHILDREN_KEY = 'children';
export const DEFAULT_SEARCH_QUERY_KEY = 'name';
export const DEFAULT_ON_NODE_CLICK = () => null;
export const DEFAULT_FORMAT_LABEL_TEXT = node => node.data.name;
export const DEFAULT_ON_SELECTION_CLEAR = () => null;
export const DEFAULT_LEAF_DASH_ARRAY_SIZE = '10,5';

// COLORS
export const ROOT_COLOR = '#EFC958';
export const NODE_COLOR = '#E17A47';
export const LEAF_COLOR = '#EF3D59';
export const LINK_COLOR = '#e6e6ea';
export const SELECTED_COLOR = '#EFC958';
export const HOVER_COLOR = '#4AB19D';

// MISC
export const TRANSITION_DURATION = 250;
