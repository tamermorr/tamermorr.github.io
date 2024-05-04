import { Atom } from '../atom.mjs';
import {VEE_INDEX} from '../behaviors_indx.mjs';
import { CanvasConfig } from '../canvas_config.mjs';
import { CROSS_HEIGHT, CROSS_WIDTH, DEFAULT_GAP } from '../specs.mjs';
import { drawBehaviorMask } from '../util.mjs';
import { Area } from '../area.mjs';

export const VEE = {
    index : VEE_INDEX,
    caption : "in a vee",
    id: "V",
    number_of_children: 2,
    
    compatibility : function (atom, canvas_config) {
        return (canvas_config.area.area_width > 2 * atom.atom_width) &&
               (canvas_config.area.area_height > atom.atom_height);
    },

    draw : function (atom, area, graphix) {
        const cols = 2 * Math.ceil(area.area_width / (2 * atom.atom_width));
      
        const y_pos = (area.area_height - atom.atom_height);

        graphix.push();
        // center matrix around middle bottom
        graphix.translate((area.area_width / 2) * CROSS_WIDTH, y_pos * CROSS_HEIGHT);

        // if odd, make a gap at the center
        const gap = (area.area_width % 2 == 1);

        for(var j = 0; j < cols / 2; j++) {
          graphix.push();
          graphix.translate(0, ((-1) * j * atom.atom_width) * CROSS_HEIGHT);

          graphix.push();
          graphix.translate(((-1) * (j + 1) * atom.atom_width - (gap / 2)) * CROSS_WIDTH, 0);
          atom.drawOnCanvas(graphix);
          graphix.pop();

          graphix.scale(-1, 1);
          graphix.translate(((-1) * (j + 1) * atom.atom_width - (gap / 2)) * CROSS_WIDTH, 0);
          atom.drawOnCanvas(graphix);

          graphix.pop();
        }
        graphix.pop();
    },

    branch : function(atom, canvas_config) {
        const gap = canvas_config.sampleGap();

        drawBehaviorMask(this, canvas_config, atom, gap);

        const [vee_x, vee_y, vee_girth, vee_width, vee_height] =
            computeVeeSpecs(canvas_config, atom, gap);

        const top_x = vee_x + (vee_x > 0) * gap;
        const top_width = vee_width - 2 * (top_x - vee_x);
        const top_height = canvas_config.area.area_height - vee_girth;

        var top_area = canvas_config.area.getCrop(
            top_x, 0, top_width, top_height);

        var top_canvas = new CanvasConfig(
            top_area, this.mask_for_child(0, atom, canvas_config, top_area));
        
        const bottom_y = vee_y + (vee_y > 0) * vee_girth;
        const bottom_height = vee_height - (bottom_y - vee_y);


        var bottom_area = canvas_config.area.getCrop(
            0, bottom_y, canvas_config.area.area_width, bottom_height);

        var bottom_canvas = new CanvasConfig(
            bottom_area, this.mask_for_child(1, atom, canvas_config, bottom_area)); 
                      
        return new Array(top_canvas, bottom_canvas);
    },

    mask_for_child : function (i, atom, parent_canvas_config, area) {
        if (area.area_width < 0 || area.area_height < 0) {
            return null;
        }

        if(i == 0) {
            const vee_girth = parent_canvas_config.area.area_height - area.area_height;
            parent_canvas_config.gap = vee_girth - (atom.atom_height - atom.atom_width + 1);
        }

        if(!parent_canvas_config.gap) {
            parent_canvas_config.gap = DEFAULT_GAP;
        }

        drawBehaviorMask(this, parent_canvas_config, atom, parent_canvas_config.gap);

        const [vee_x, vee_y, vee_girth, vee_width, vee_height] =
            computeVeeSpecs(parent_canvas_config, atom, parent_canvas_config.gap);

        var child_mask = parent_canvas_config.getCroppedMask(
            area.x_pos - parent_canvas_config.area.x_pos,
            area.y_pos - parent_canvas_config.area.y_pos,
            area.area_width, area.area_height);
        
        // top
        if(i == 0) {
            child_mask.triangle(
                0, child_mask.height,
                child_mask.width / 2, child_mask.height + CROSS_HEIGHT, // child_mask.width / 2, child_mask.height,
                0, vee_y * CROSS_HEIGHT);
            child_mask.triangle(
                child_mask.width, child_mask.height,
                child_mask.width / 2, child_mask.height + CROSS_HEIGHT, // child_mask.width / 2, child_mask.height,
                child_mask.width, vee_y * CROSS_HEIGHT);

            /*
            child_mask.rect(
                Math.floor(area.area_width / 2) * CROSS_WIDTH,
                child_mask.height - (atom.atom_height - atom.atom_width + 1) * CROSS_HEIGHT,
                (area.area_width % 2) * CROSS_WIDTH, (atom.atom_height - atom.atom_width + 1) * CROSS_HEIGHT);
            */
        } else { // bottom
            const relative_vee_y = area.area_height - vee_height;
            child_mask.triangle(
                vee_x * CROSS_WIDTH, relative_vee_y * CROSS_HEIGHT,
                child_mask.width - vee_x * CROSS_WIDTH, relative_vee_y * CROSS_HEIGHT,
                child_mask.width / 2, child_mask.height);

            child_mask.rect(
                Math.floor(area.area_width / 2) * CROSS_WIDTH, 0,
                (area.area_width % 2)* CROSS_WIDTH,
                area.area_height * CROSS_HEIGHT);
        }

        return child_mask;

    }
};

function computeVeeSpecs(canvas_config, atom, gap) {
    const cols = Math.min(
        Math.floor(canvas_config.area.area_width / 2) / atom.atom_width,
        (canvas_config.area.area_height - atom.atom_height) / atom.atom_width + 1);

    const vee_girth = atom.atom_height - atom.atom_width + 1 + gap;
    const vee_width = 2 * cols * atom.atom_width + (canvas_config.area.area_width % 2);
    const vee_height = (cols - 1) * atom.atom_width + atom.atom_height;
    
    const vee_x = (canvas_config.area.area_width - vee_width) / 2;
    const vee_y = canvas_config.area.area_height - vee_height;
    

    return [vee_x, vee_y, vee_girth, vee_width, vee_height];
}
