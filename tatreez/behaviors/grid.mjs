import { isWidthParityCompatible, isHeightParityCompatible,
  computeSpecsHorizontalSymmetry, computeSpecsVerticalSymmetry } from '../util.mjs';
import { GRID_INDEX } from '../behaviors_indx.mjs';
import { CROSS_WIDTH, CROSS_HEIGHT } from '../specs.mjs';

export const GRID = {
    index : GRID_INDEX,
    caption : "in grid",
    id: "Y",
    number_of_children: 0,
    
    compatibility : function (atom, canvas_config) {
        var width_distance = canvas_config.area.area_width / atom.atom_width - 4;
        var height_distance = canvas_config.area.area_height / atom.atom_height - 4;
      
        width_distance = (width_distance < 0)? 0 : width_distance;
        height_distance = (height_distance < 0)? 0 : height_distance;
      
        return isWidthParityCompatible(atom, canvas_config.area) *
               isHeightParityCompatible(atom, canvas_config.area) *
               Math.exp((-1) * (width_distance) * (height_distance));
    },

    draw : function (atom, area, graphix) {              
        const [cols, v_gap, x_pos] = computeSpecsHorizontalSymmetry(atom, area);
        const [rows, h_gap, y_pos] = computeSpecsVerticalSymmetry(atom, area);

        graphix.push();
        graphix.translate(x_pos * CROSS_WIDTH, y_pos * CROSS_HEIGHT);
      
        for(var i = 0; i < rows; i++) {
          graphix.push();
          graphix.translate(0, (i * atom.atom_height + h_gap * (i > rows / 2)) * CROSS_HEIGHT);
          for(var j = 0; j < cols; j++) {
            graphix.push();
            graphix.translate((j * atom.atom_width + v_gap * (j > cols / 2)) * CROSS_WIDTH, 0);
            atom.drawOnCanvas(graphix);
            graphix.pop();
          }
          graphix.pop();
        }
      
        graphix.pop();
    },

    branch : function(atom, canvas_config) {
        return null;
    },

    mask_for_child : function(i, atom, canvas_config, area) {
      return null;
    }
};