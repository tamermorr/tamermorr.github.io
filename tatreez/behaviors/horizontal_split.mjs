import {NO_INDEX} from '../behaviors_indx.mjs';
import { CanvasConfig } from '../canvas_config.mjs';
import { MIN_HEIGHT_FOR_SPLIT, SPLIT_STD } from '../specs.mjs';
import { Area } from '../area.mjs';
import { defaultMaskForChild } from '../util.mjs';

export const HORIZONTAL_SPLIT = {
    index : NO_INDEX,
    caption : "horizontal split",
    id : "S",
    number_of_children: 2,
    twin_behavior_index : null,
    
    compatibility : function (atom, canvas_config) {
        return (canvas_config.area.area_height >= 2 * MIN_HEIGHT_FOR_SPLIT);
    },

    draw : function (atom, area, graphix) {
        
    },

    branch : function(atom, canvas_config) {
        var gap = canvas_config.sampleGap();
        var split_pos = Math.floor(canvas_config.area.area_height * (0.5 + randomGaussian(0, SPLIT_STD)));

        split_pos = (split_pos < MIN_HEIGHT_FOR_SPLIT)? MIN_HEIGHT_FOR_SPLIT : split_pos;
        split_pos = (split_pos > canvas_config.area.area_height - MIN_HEIGHT_FOR_SPLIT)?
                     canvas_config.area.area_height - MIN_HEIGHT_FOR_SPLIT : split_pos;
        gap = (split_pos - gap < MIN_HEIGHT_FOR_SPLIT)? 1 : gap;
        return canvas_config.splitHorizontally(split_pos, gap);        
    },

    mask_for_child : defaultMaskForChild
};