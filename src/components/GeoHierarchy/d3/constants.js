
// CONFIG
export const DEFAULT_SVG_CLASS = 'd3-hierarchy';
export const DEFAULT_WIDTH = 200;
export const DEFAULT_HEIGHT = 200;
export const DEFAULT_NDDE_SIZE = [60, 60];
export const DEFAULT_NODE_DISTANCE = 200;
export const DEFAULT_SCALE_STEP = 0.25;
export const DEFAULT_SCALE_EXTENT = [0.5, 2];
export const DEFAULT_CHILDREN_KEY = 'children';
export const DEFAULT_UNIQUE_ID_KEY = 'id';
export const DEFAULT_ON_NODE_CLICK = () => null;
export const DEFAULT_FORMAT_LABEL_TEXT = node => node.data.name;

// COLORS
export const ROOT_COLOR = '#ff7140';
export const NODE_COLOR = '#2f385e';
export const CHILD_COLOR = '#c3c3c3';
export const LINK_COLOR = '#c3c3c3';
export const SELECTED_COLOR = '#00bfa5';
export const HOVER_COLOR = '#ff7140';

// MISC
export const TRANSITION_DURATION = 400;