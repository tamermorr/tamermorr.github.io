import { VERTICAL_INDEX } from '../behaviors_indx.mjs';
import { computeSpecsVerticalSymmetry, defaultMaskForChild } from '../util.mjs';
import { CROSS_WIDTH, CROSS_HEIGHT } from '../specs.mjs';

export const VERTICAL = {
    index : VERTICAL_INDEX,
    caption : "vertically",
    id: "C",
    number_of_children: 1,
    
    compatibility : function (atom, canvas_config) {
        // TODO if starting with whole drop parity check
        return (canvas_config.area.area_width >= 2 * atom.atom_width) &&
               (canvas_config.area.area_height >=  atom.atom_height);
    },

    draw : function (atom, area, graphix) {
        const [rows, gap, y_pos] = computeSpecsVerticalSymmetry(atom, area);
        
        graphix.push();
        graphix.translate(0, y_pos * CROSS_HEIGHT);
      
        for(var i = 0; i < rows; i++) {
          graphix.push();
          graphix.translate(0, (i * atom.atom_height + (i >= rows / 2) * gap) * CROSS_HEIGHT);

          atom.drawOnCanvas(graphix);
      
          graphix.pop();
        }

        for(var i = 0; i < rows; i++) {
          graphix.push();
          graphix.translate(0, (i * atom.atom_height + (i >= rows / 2) * gap) * CROSS_HEIGHT);
          graphix.translate(area.area_width * CROSS_WIDTH, 0);
          graphix.scale(-1,1);
          atom.drawOnCanvas(graphix);      
          graphix.pop();
        }
      
        graphix.pop();
    },

    branch : function(atom, canvas_config) {
        const gap = canvas_config.sampleGap();
        const new_canvas = canvas_config.getCroppedCanvas((atom.atom_width + gap), 0,
                                                          canvas_config.area.area_width
                                                            - 2 * (atom.atom_width + gap),
                                                          canvas_config.area.area_height,);
        return new Array(new_canvas);
    },

    mask_for_child : defaultMaskForChild
};