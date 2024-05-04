import {  pgMask, computeSpecsHorizontalSymmetry,
   computeSpecsVerticalSymmetry, defaultMaskForChild } from '../util.mjs';
import {FRAME_INDEX, CORNER_INDEX} from '../behaviors_indx.mjs';
import { CanvasConfig } from '../canvas_config.mjs';
import { Area } from '../area.mjs';
import { CROSS_HEIGHT, CROSS_WIDTH} from '../specs.mjs';

export const FRAME = {
    index : FRAME_INDEX,
    caption : "in frame",
    twin_behavior_index : CORNER_INDEX,
    id: "U",
    number_of_children: 1,
    
    compatibility : function (atom, canvas_config) {
        return (canvas_config.area.area_width >= 2 * atom.atom_width) &&
               (canvas_config.area.area_height >= 2 * atom.atom_width);
    },

    draw : function (atom, area, graphix) {
        var frame_graphix = createGraphics(graphix.width, graphix.height);
        drawFrame(atom, area, frame_graphix);

        var mask = area.getFullMask();
        maskCorners(area, mask, atom.atom_width);

        var frame_img = createImage(frame_graphix.width,frame_graphix.height);
        frame_img.copy(frame_graphix,
                       0, 0, frame_graphix.width, frame_graphix.height,
                       0, 0, frame_graphix.width, frame_graphix.height);
        frame_img = pgMask(frame_img, mask);
        graphix.image(frame_img, 0, 0); 
    },

    branch : function(atom, canvas_config) {
        var gap = canvas_config.sampleGap();
        var new_canvas = canvas_config.getCroppedCanvas(
          (atom.atom_width + gap), (atom.atom_width + gap),
          canvas_config.area.area_width - 2 * (atom.atom_width + gap),
          canvas_config.area.area_height - 2 * (atom.atom_width + gap));
        return new Array(new_canvas);
    },

    mask_for_child: defaultMaskForChild
};

function drawFrame(atom, area, graphix) {

  const [cols, h_gap, x_pos] = computeSpecsHorizontalSymmetry(atom, area, true);
  const [rows, v_gap, y_pos] = computeSpecsVerticalSymmetry(atom, area);

  graphix.push();
  graphix.translate(0, y_pos * CROSS_HEIGHT);

  // draw vertical
  for(var i = 0; i < rows; i++) {
    graphix.push();
    graphix.translate(0, i * atom.atom_height * CROSS_HEIGHT);

    // if past center, gap and flip
    if(j >= rows / 2) {
      graphix.translate(0, (atom.atom_height + v_gap) * CROSS_HEIGHT);
      graphix.scale(1,-1);
    }

    atom.drawOnCanvas(graphix);

    graphix.push();
    graphix.translate(area.area_width * CROSS_WIDTH, 0);
    graphix.scale(-1,1);
    atom.drawOnCanvas(graphix);
    graphix.pop();

    graphix.pop();
  }

  graphix.pop();
  
  graphix.push();
  graphix.translate(x_pos * CROSS_WIDTH, 0);
  
  graphix.rotate(radians(-90));
  graphix.scale(-1,1);

  // draw horizontal
  for(var j = 0; j < cols; j++) {
    graphix.push();
    graphix.translate(0, j * atom.atom_height * CROSS_HEIGHT);

    // if past center, gap and flip
    if(j >= cols / 2) {
      graphix.translate(0, (atom.atom_height + h_gap) * CROSS_HEIGHT);
      graphix.scale(1,-1);
    }

    atom.drawOnCanvas(graphix);

    graphix.push();
    graphix.translate(area.area_height * CROSS_WIDTH, 0);
    graphix.scale(-1,1);
    atom.drawOnCanvas(graphix);
    graphix.pop();
    
    graphix.pop();
  }
  graphix.pop();
}

function maskCorners(area, mask, girth) {
  mask.fill(0);
  mask.rect(0, 0, girth * CROSS_WIDTH, girth * CROSS_HEIGHT);
  mask.rect((area.area_width - girth) * CROSS_WIDTH, 0,
             girth * CROSS_WIDTH, girth * CROSS_HEIGHT);
  mask.rect(0, (area.area_height - girth) * CROSS_HEIGHT,
                girth * CROSS_WIDTH, girth * CROSS_HEIGHT);
  mask.rect((area.area_width - girth) * CROSS_WIDTH,
            (area.area_height - girth) * CROSS_HEIGHT,
            girth * CROSS_WIDTH, girth * CROSS_HEIGHT);
}

// TODO
function existsCorner() {

}