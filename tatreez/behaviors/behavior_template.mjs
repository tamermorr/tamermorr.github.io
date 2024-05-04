import {BEHAVIOR_NAME_INDEX} from '../behaviors_indx.mjs';
import { CanvasConfig } from '../canvas_config.mjs';

export const BEHAVIOR_NAME = {
    index : BEHAVIOR_NAME_INDEX,
    caption : "behavior caption",
    twin_behavior_index : null,
    number_of_children: 0,
    
    compatibility : function (atom, canvas_config) {
        return 1;
    },

    draw : function (atom, area, graphix) {
        
    },

    branch : function(atom, canvas_config) {
        // returns an array of CanvasConfig
        return null;
    },

    mask_for_child : function(i, atom, parent_canvas_config, area) {
        return null;
    }
};