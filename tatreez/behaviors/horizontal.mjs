import {computeSpecsHorizontalSymmetry, defaultMaskForChild} from '../util.mjs';
import {HORIZONTAL_INDEX} from '../behaviors_indx.mjs';
import { CanvasConfig } from '../canvas_config.mjs';
import { Area } from '../area.mjs';
import { CROSS_WIDTH } from '../specs.mjs';

export const HORIZONTAL = {
    index : HORIZONTAL_INDEX,
    caption : "horizontally",
    id: "R",
    number_of_children: 1,

    compatibility : function (atom, canvas_config) {
        return canvas_config.area.area_width >= atom.atom_width;
    },

    draw : function (atom, area, graphix) {
        const [cols, gap, x_pos] = computeSpecsHorizontalSymmetry(atom, area);
              
        graphix.push();
        graphix.translate(x_pos * CROSS_WIDTH, 0);
      
        for(var j = 0; j < cols; j++) {
          graphix.push();
          graphix.translate((j  * atom.atom_width + gap * (j >= cols / 2)) * CROSS_WIDTH, 0);
      
          atom.drawOnCanvas(graphix);
          
          graphix.pop();
        }
        graphix.pop();
    },

    branch : function(atom, canvas_config) {
        const gap = canvas_config.sampleGap();
        var new_canvas = canvas_config.getCroppedCanvas(0, atom.atom_height + gap,
                                                        canvas_config.area.area_width,
                                                        canvas_config.area.area_height - atom.atom_height - gap);
      
        return new Array(new_canvas);
    },

    mask_for_child : defaultMaskForChild
};