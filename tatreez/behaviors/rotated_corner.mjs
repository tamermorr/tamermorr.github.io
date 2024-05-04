import {ROTATED_FRAME_INDEX, ROTATED_CORNER_INDEX} from '../behaviors_indx.mjs';
import { CanvasConfig } from '../canvas_config.mjs';

export const ROTATED_CORNER = {
    index : ROTATED_CORNER_INDEX,
    caption : "in rotated corners",
    id: "Q",
    number_of_children: 2,
    twin_behavior_index : ROTATED_FRAME_INDEX,
    
    compatibility : function (atom, canvas_config) {
        return true;
    },

    draw : function (atom, area, graphix) {
        
    },

    branch : function(atom, canvas_config) {
        return null;
    },

    mask_for_child : function(i, atom,parent_canvas_config, area) {
        return null;
    }
};