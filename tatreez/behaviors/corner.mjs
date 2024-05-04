import {CORNER_INDEX, FRAME_INDEX} from '../behaviors_indx.mjs';
import { CanvasConfig } from '../canvas_config.mjs';
import { Area } from '../area.mjs';
import { CROSS_WIDTH, CROSS_HEIGHT } from '../specs.mjs';
import { FRAME } from './frame.mjs';
import { defaultMaskForChild } from '../util.mjs';

export const CORNER = {
    index : CORNER_INDEX,
    caption : "in corners",
    id: "Z",
    number_of_children: 1,
    twin_behavior_index : FRAME_INDEX,

    compatibility : function (atom, canvas_config) {
        return (canvas_config.area.area_width >= 2 * atom.atom_width) &&
               (canvas_config.area.area_height >= 2 * atom.atom_width);
    },

    draw : function (atom, area, graphix) {
        graphix.push();
        atom.drawOnCanvas(graphix);
        graphix.translate(area.area_width * CROSS_WIDTH, 0);
        graphix.scale(-1,1);
        atom.drawOnCanvas(graphix);
        graphix.translate(0, area.area_height * CROSS_HEIGHT);
        graphix.scale(1,-1);
        atom.drawOnCanvas(graphix);
        graphix.translate(area.area_width * CROSS_WIDTH, 0);
        graphix.scale(-1,1);
        atom.drawOnCanvas(graphix);
        graphix.translate(0, area.area_height * CROSS_HEIGHT);
        graphix.scale(1,-1);
        graphix.pop();
    },

    branch : FRAME.branch,

    mask_for_child : defaultMaskForChild
};