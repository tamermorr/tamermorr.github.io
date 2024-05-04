import { isWidthParityCompatible, isHeightParityCompatible } from '../util.mjs';
import { SOLO_INDEX } from '../behaviors_indx.mjs';
import { CROSS_WIDTH, CROSS_HEIGHT } from '../specs.mjs';

export const SOLO = {
    index : SOLO_INDEX,
    caption : "solo",
    id: "X",
    number_of_children: 0,

    compatibility : function (atom, canvas_config) {
        return (canvas_config.area.area_width > 0.9 * atom.atom_width) *
               (canvas_config.area.area_height > 0.9 * atom.atom_height) *
               isWidthParityCompatible(atom, canvas_config.area) *
               // TODO: canvas_config.isCenterVisible() *
               Math.exp(8 - 8 *
               Math.sqrt((Math.abs(canvas_config.area.area_width - atom.atom_width) *
               Math.abs(canvas_config.area.area_height - atom.atom_height)) /
               (atom.atom_width * atom.atom_height)));
    },

    draw : function (atom, area, graphix) {
        var x_pos = Math.floor((area.area_width - atom.atom_width) / 2);
        var y_pos = Math.ceil((area.area_height - atom.atom_height) / 2);
      
        graphix.push();
        graphix.translate(x_pos * CROSS_WIDTH, y_pos * CROSS_HEIGHT);
      
        atom.drawOnCanvas(graphix);
      
        graphix.pop();
    },

    branch : function(atom, canvas_config) {
        return null;
    },

    mask_for_child : function(i, atom, parent_canvas_config, area) {
        return null;
    }
};