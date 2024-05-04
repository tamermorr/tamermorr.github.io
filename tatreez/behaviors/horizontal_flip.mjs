import { HORIZONTAL } from './horizontal.mjs';
import { HORIZONTAL_FLIP_INDEX } from '../behaviors_indx.mjs';
import { CROSS_WIDTH } from '../specs.mjs';
import { defaultMaskForChild } from '../util.mjs';

export const HORIZONTAL_FLIP = {
    index : HORIZONTAL_FLIP_INDEX,
    caption : "horizontally with flip around center",
    id: "RR",
    number_of_children: 1,
    
    compatibility : function (atom, canvas_config) {
        return 2 * atom.atom_width <= canvas_config.area.area_width;
    },

    draw : function (atom, area, graphix) {      
        const cols = 2 * Math.ceil(area.area_width / (2 * atom.atom_width));
      
        const x_pos = Math.floor((area.area_width - cols * atom.atom_width) / 2);
        
        graphix.push();
        graphix.translate(x_pos * CROSS_WIDTH, 0);

        // if odd, make a gap at the center
        const gap = (area.area_width % 2 == 1);
      
        for(var j = 0; j < cols; j++) {
          graphix.push();
          graphix.translate(j * atom.atom_width * CROSS_WIDTH, 0);
          
          // if past center, gap
          if(j >= cols / 2) {
            graphix.translate((atom.atom_width + gap) * CROSS_WIDTH, 0);
            graphix.scale(-1,1);
          }
      
          atom.drawOnCanvas(graphix);
          
          graphix.pop();
        }
        graphix.pop();
    },

    branch : HORIZONTAL.branch,

    mask_for_child: defaultMaskForChild
};