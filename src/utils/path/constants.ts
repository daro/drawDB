import { TABLE_CONFIG } from "../../data/constants";

const { HEIGHT: tableHeaderHeight, COLOR_STRIP_HEIGHT: tableColorStripHeight } = TABLE_CONFIG.HEADER;
const { FIELD_HEIGHT: tableFieldHeight } = TABLE_CONFIG;

export const DEFAULT_RADIUS = 10;
export const DEFAULT_SIDE_MARGIN = 20;

// Re-export constants for convenience if needed elsewhere
export { tableFieldHeight, tableHeaderHeight, tableColorStripHeight };
