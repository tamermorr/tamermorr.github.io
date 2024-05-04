import { SOLO } from './behaviors/solo.mjs';
import { GRID } from './behaviors/grid.mjs';
import { HORIZONTAL } from './behaviors/horizontal.mjs';
import { HORIZONTAL_FLIP } from './behaviors/horizontal_flip.mjs';
import { VERTICAL } from './behaviors/vertical.mjs';
import { CORNER } from './behaviors/corner.mjs';
import { FRAME } from './behaviors/frame.mjs';
import{ ROTATED_FRAME } from './behaviors/rotated_frame.mjs';
import{ ROTATED_CORNER } from './behaviors/rotated_corner.mjs';
import { VEE } from './behaviors/vee.mjs';
import { HORIZONTAL_SPLIT } from './behaviors/horizontal_split.mjs';


// Behaviors
export const BEHAVIORS = new Map();

BEHAVIORS.set(SOLO.index, SOLO);
BEHAVIORS.set(GRID.index, GRID);
BEHAVIORS.set(HORIZONTAL.index, HORIZONTAL);
BEHAVIORS.set(HORIZONTAL_FLIP.index, HORIZONTAL_FLIP);
BEHAVIORS.set(VERTICAL.index, VERTICAL);
BEHAVIORS.set(CORNER.index, CORNER);
BEHAVIORS.set(FRAME.index, FRAME);
BEHAVIORS.set(ROTATED_CORNER.index, ROTATED_CORNER);
BEHAVIORS.set(ROTATED_FRAME.index, ROTATED_FRAME);
BEHAVIORS.set(VEE.index, VEE);

export const BEHAVIORS_BY_ID = new Map();

BEHAVIORS_BY_ID.set(SOLO.id, SOLO);
BEHAVIORS_BY_ID.set(GRID.id, GRID);
BEHAVIORS_BY_ID.set(HORIZONTAL.id, HORIZONTAL);
BEHAVIORS_BY_ID.set(HORIZONTAL_FLIP.id, HORIZONTAL_FLIP);
BEHAVIORS_BY_ID.set(VERTICAL.id, VERTICAL);
BEHAVIORS_BY_ID.set(CORNER.id, CORNER);
BEHAVIORS_BY_ID.set(FRAME.id, FRAME);
BEHAVIORS_BY_ID.set(ROTATED_CORNER.id, ROTATED_CORNER);
BEHAVIORS_BY_ID.set(ROTATED_FRAME.id, ROTATED_FRAME);
BEHAVIORS_BY_ID.set(VEE.id, VEE);
BEHAVIORS_BY_ID.set(HORIZONTAL_SPLIT.id, HORIZONTAL_SPLIT);