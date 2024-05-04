import { drawBehaviorMask } from '../util.mjs';
import {ROTATED_FRAME_INDEX, ROTATED_CORNER_INDEX} from '../behaviors_indx.mjs';
import { CanvasConfig } from '../canvas_config.mjs';
import { VEE } from './vee.mjs';
import { CROSS_HEIGHT, CROSS_WIDTH, DEFAULT_GAP } from '../specs.mjs';
import { Area } from '../area.mjs';
import { Arrangement } from '../arrangement.mjs';

export const ROTATED_FRAME = {
    index : ROTATED_FRAME_INDEX,
    caption : "in a rotated frame",
    twin_behavior_index : null,
    id: "W",
    number_of_children: 2,
    
    compatibility : function (atom, canvas_config) {
      return (canvas_config.area.area_width > 2 * atom.atom_width) &&
             (canvas_config.area.area_height > 2 * atom.atom_height);
    },

    draw : function (atom, area, graphix) {
        const half_area = new Area(area.area_width, Math.floor(area.area_height / 2),
                                   0, 0);
        const half_canvas = new CanvasConfig(half_area);
        const vee_arrangement = new Arrangement(atom, VEE, half_canvas);

        graphix.push();
        graphix.translate(0, Math.ceil(area.area_height / 2) * CROSS_HEIGHT);
        half_canvas.drawArrangement(vee_arrangement, graphix);
        graphix.translate(0, ((-1 / 2) * (area.area_height % 2)) * CROSS_HEIGHT);
        graphix.scale(1, -1);
        graphix.translate(0, ((1 / 2) * (area.area_height % 2)) * CROSS_HEIGHT);
        half_canvas.drawArrangement(vee_arrangement, graphix);
        graphix.pop();
    },

    branch : function(atom, canvas_config) {
        const gap = canvas_config.sampleGap();

        drawBehaviorMask(this, canvas_config, atom, gap);

        // const vee_width = 2* atom.atom_width * cols + (canvas_config.area.area_width % 2);
        // const vee_x = (canvas_config.area.area_width - vee_width) / 2;

        const [frame_x, bottom_vee_y, frame_girth, frame_width, frame_height] =
          computeRotatedFrameSpecs(canvas_config, atom, gap);
        
        const inner_x = (frame_x <= 0)? 0 : gap + frame_x;
        const inner_width = canvas_config.area.area_width - 2 * inner_x;
        const inner_height = canvas_config.area.area_height - 2 * frame_girth;

        var inner_area = canvas_config.area.getCrop(
          inner_x, frame_girth, inner_width, inner_height);
        var inner_canvas = new CanvasConfig(
          inner_area, this.mask_for_child(0, atom, canvas_config, inner_area));

        canvas_config.mask = this.mask_for_child(1, atom, canvas_config, canvas_config.area);
        
        return new Array(inner_canvas, canvas_config);
    },

    mask_for_child : function(i, atom, parent_canvas_config, area) {
      if (area.area_width < 0 || area.area_height < 0) {
        return null;
      }
      
      if(i == 0) {
        const frame_girth = area.y_pos - parent_canvas_config.area.y_pos;
        parent_canvas_config.gap = frame_girth - atom.atom_height + atom.atom_width - 1;
      }

      if(!parent_canvas_config.gap) {
        parent_canvas_config.gap = DEFAULT_GAP;
      }

      drawBehaviorMask(this, parent_canvas_config, atom, parent_canvas_config.gap);

      const [frame_x, bottom_vee_y, frame_girth, frame_width, frame_height] =
        computeRotatedFrameSpecs(parent_canvas_config, atom, parent_canvas_config.gap);

      const child_mask = parent_canvas_config.getCroppedMask(
        area.x_pos - parent_canvas_config.area.x_pos,
        area.y_pos - parent_canvas_config.area.y_pos,
        area.area_width, area.area_height);
      
      if(i == 1) {
        // fix outer mask
        // top half
        child_mask.triangle(
          child_mask.width / 2, 0,
          (frame_x) * CROSS_WIDTH, frame_height * CROSS_HEIGHT,
          (parent_canvas_config.area.area_width - frame_x) * CROSS_WIDTH,  frame_height * CROSS_HEIGHT);
        // bottom half
        //canvas_config.mask.fill(0,255,0);
        child_mask.triangle(
          child_mask.width / 2, child_mask.height,
          (frame_x) * CROSS_WIDTH, bottom_vee_y * CROSS_HEIGHT,
          (parent_canvas_config.area.area_width - frame_x) * CROSS_WIDTH, bottom_vee_y * CROSS_HEIGHT);


        /// middle horizontal rectangle
        //canvas_config.mask.fill(0,0,255);
        child_mask.rect(
          (frame_x - Math.max(parent_canvas_config.gap, 0)) * CROSS_WIDTH, frame_height * CROSS_HEIGHT,
          (frame_width + 2 * Math.max(parent_canvas_config.gap, 0)) * CROSS_WIDTH,
          (parent_canvas_config.area.area_height - 2 * frame_height) * CROSS_HEIGHT);
        
        // middle vertical rectangle
        //canvas_config.mask.fill(20,150,100);
        child_mask.rect(
          Math.floor(parent_canvas_config.area.area_width / 2) * CROSS_WIDTH, 0,
          (parent_canvas_config.area.area_width % 2) * CROSS_WIDTH,
          child_mask.height);

      } else {
        // fix inner mask
        // top left
        child_mask.triangle(
          0, 0,
          (Math.floor(area.area_width / 2) - 1) * CROSS_WIDTH, (-1) * parent_canvas_config.gap * CROSS_HEIGHT,
          0, (frame_height - frame_girth - 1) * CROSS_HEIGHT);
        // top right
        child_mask.triangle(
          area.area_width * CROSS_WIDTH, 0,
          (Math.ceil(area.area_width / 2) + 1) * CROSS_WIDTH, (-1) * parent_canvas_config.gap * CROSS_HEIGHT,
          area.area_width * CROSS_WIDTH, (frame_height - frame_girth - 1) * CROSS_HEIGHT);     
        // bottom left
        child_mask.triangle(
          0, area.area_height * CROSS_HEIGHT,
          (Math.floor(area.area_width / 2) - 1) * CROSS_WIDTH,
          (area.area_height + parent_canvas_config.gap) * CROSS_HEIGHT,
          0, (area.area_height - frame_height + frame_girth) * CROSS_HEIGHT);
        // bottom right
        child_mask.triangle(
          area.area_width * CROSS_WIDTH, area.area_height * CROSS_HEIGHT,
          (Math.ceil(area.area_width / 2) + 1) * CROSS_WIDTH,
          (area.area_height + parent_canvas_config.gap) * CROSS_HEIGHT,
          area.area_width * CROSS_WIDTH,
          (area.area_height - frame_height + frame_girth) * CROSS_HEIGHT);

        /*
        child_mask.rect(
          Math.floor(area.area_width / 2) * CROSS_WIDTH, 0,
          (area.area_width % 2) * CROSS_WIDTH, frame_girth);
        

        child_mask.rect(
          Math.floor(area.area_width / 2) * CROSS_WIDTH,
          (area.area_height - frame_girth) * CROSS_HEIGHT,
          (area.area_width % 2) * CROSS_WIDTH, frame_girth);*/
      }

      return child_mask;
    }
};

function computeRotatedFrameSpecs(canvas_config, atom, gap) {
  const cols_by_width = Math.floor(canvas_config.area.area_width / 2) / atom.atom_width;
  const cols_by_height =
    Math.floor((canvas_config.area.area_height - 2 * atom.atom_height) / 2) / atom.atom_width + 1;

  const cols = Math.min(cols_by_width, cols_by_height);

  const frame_width =
    2 * atom.atom_width * cols
    + 2 * (cols == cols_by_height)
      * (atom.atom_height - atom.atom_width)
    + 2 * ((Math.ceil(cols) - cols) * atom.atom_width % 2)
    + (canvas_config.area.area_width % 2);
  const frame_height = atom.atom_width * (cols - 1) + atom.atom_height;

  const frame_girth = gap + atom.atom_height - atom.atom_width + 1;

  const frame_x = (canvas_config.area.area_width - frame_width) / 2;

  const bottom_vee_y = canvas_config.area.area_height - frame_height;

  return [frame_x, bottom_vee_y, frame_girth, frame_width, frame_height];
}