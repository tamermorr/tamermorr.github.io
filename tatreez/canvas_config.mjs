import { Area } from './area.mjs';
import { CROSS_HEIGHT, CROSS_WIDTH, FRAME_GAP_MEAN, FRAME_GAP_STD,
  CANVAS_WIDTH, CANVAS_HEIGHT, MIN_AREA_DIMENSION, MIN_CROP_SIZE, MAX_CROP_RATE } from './specs.mjs';
import { drawBehaviorMask, drawPixel, pgMask } from './util.mjs';
import { BEHAVIORS } from './behaviors.mjs';
import { VERTICAL_INDEX } from './behaviors_indx.mjs';
import { DEBUG } from './specs.mjs';

export class CanvasConfig {
    // Area area;
    // Graphics mask;
    
    constructor(area, mask = null) {
      this.area = area;
      if(mask == null) {
        this.mask = area.getFullMask();
      } else{
        this.mask = mask;
      }
    }
    
    drawArrangement(arrangement, graphix = null) {
      var temp_graphix = createGraphics(this.area.area_width * CROSS_WIDTH,
                                   this.area.area_height * CROSS_HEIGHT);

      arrangement.draw(this.area, temp_graphix);
  
      var img = createImage(temp_graphix.width,temp_graphix.height);
      img.copy(temp_graphix, 0, 0, temp_graphix.width, temp_graphix.height,
        0, 0, temp_graphix.width, temp_graphix.height);
      img = pgMask(img, this.mask);
      if(graphix) {
        graphix.image(img, this.area.x_pos * CROSS_WIDTH, this.area.y_pos * CROSS_HEIGHT);
      } else {
        image(img, this.area.x_pos * CROSS_WIDTH, this.area.y_pos * CROSS_HEIGHT);
      }
    }

    splitHorizontally(split_pos, gap) {
      return new Array(
        this.getCroppedCanvas(0, 0, this.area.area_width, split_pos - gap),
        this.getCroppedCanvas(0, split_pos, this.area.area_width, this.area.area_height - split_pos));
    }
  
    getCroppedMask(x_pos, y_pos, crop_width, crop_height) {
      let cropped_mask = this.mask.get(x_pos * CROSS_WIDTH, y_pos * CROSS_HEIGHT,
                                       crop_width * CROSS_WIDTH, crop_height * CROSS_HEIGHT);
      let crop = createGraphics(crop_width * CROSS_WIDTH, crop_height * CROSS_HEIGHT);
      crop.background(255);
      crop.fill(0);
      crop.image(cropped_mask, 0, 0);
      return crop;
    }
  
    getCopyOfMask() {
      return this.getCroppedMask(this.area);
    }
  
    getCopyOfArea() {
      return new Area(this.area.area_width, this.area.area_height,
                      this.area.x_pos, this.area.y_pos);
    }
  
    getCopy() {
      return new CanvasConfig(this.getCopyOfArea(), this.getCopyOfMask());
    }
  
    isEmpty() {
      return this.area.area_width <= MIN_AREA_DIMENSION || this.area.area_height <= MIN_AREA_DIMENSION;
    }

    isVisible(behavior_indx, atom) {
      const silhouette = new CanvasConfig(this.area, this.area.getFullMask());
      //silhouette.mask.pixelDensity(1);
      //this.mask.pixelDensity(1);

      drawBehaviorMask(BEHAVIORS.get(behavior_indx), silhouette, atom, 0);

      var count = 0;
      // console.log(this.mask);
      this.mask.loadPixels();
      silhouette.mask.loadPixels();

      /*
      if(atom.id == "34") {
        silhouette.mask.push();
        silhouette.mask.fill(255,100,100);
        silhouette.mask.stroke(100,100,255);
        console.log("SIL DIMS ", silhouette.mask.width, silhouette.mask.height);
        console.log("CANVAS DIMS ", this.area.area_width * CROSS_WIDTH, this.area.area_height * CROSS_HEIGHT);
      }*/

      const step = 4 * CROSS_WIDTH;
      for(var j = 0; j < this.area.area_height; j++) {
        for(var i = 0; i < this.area.area_width; i++) {
          const k = j  * step * this.area.area_width + i * step;
          if(silhouette.mask.pixels[k] != 0) { /* } ||
            silhouette.mask.pixels[k + step] != 0 ||
            silhouette.mask.pixels[k - step] != 0) {
            // console.log("skipping irrelevant");
            
            if(atom.id == "34") {
              console.log("PIXEL at ", k, "/", silhouette.mask.pixels.length, ":", silhouette.mask.pixels[k]);
              silhouette.mask.rect(i * CROSS_WIDTH, j * CROSS_WIDTH, CROSS_WIDTH, CROSS_WIDTH);
            }*/
            continue;
          }

          // if(atom.id == "30" && this.area.x_pos == 25 && this.area.y_pos == 20) console.log("here");
  
          if(this.mask.pixels[k] != 0 &&
            this.mask.pixels[k + step] != 0 &&
            this.mask.pixels[k - step] != 0) {
            count++;
          }
        }
      }
      
      /*
      if(atom.id == "34") {
        silhouette.debugMask();
        silhouette.area.debug();
        silhouette.mask.pop();
      }*/

      if(DEBUG) console.log("visibility count for ", BEHAVIORS.get(behavior_indx).id , "#", atom.id, ":", count, " in ", this);
      return count >= Math.max(MIN_CROP_SIZE, MAX_CROP_RATE * atom.atom_width * atom.atom_height);
    }

    isCenterVisible() {
      this.mask.loadPixels();
      const outcome = (this.mask.pixels[Math.floor(this.mask.pixels.length / 2)] != 0);
      if(DEBUG) console.log("isCenterVisible = ", outcome, "; center pixel = ", this.mask.pixels[Math.floor(this.mask.pixels.length / 2)]);
      return outcome;
    }
  
    resetPosition() {
      this.area.x_pos = this.area.y_pos = 0;
    }
  
    sampleGap() {
      const gap = Math.floor(
        FRAME_GAP_MEAN + Math.abs(
          randomGaussian(0, FRAME_GAP_STD * Math.sqrt((this.area.area_width * this.area.area_height) /
                                                      (CANVAS_WIDTH * CANVAS_HEIGHT)))));
      return gap;
    }

    getCroppedCanvas(x_pos, y_pos, crop_width, crop_height) {
      var new_area = this.area.getCrop(x_pos, y_pos, crop_width, crop_height);
      var new_mask = null;
      if (crop_width > 0 && crop_height > 0) {
        new_mask = this.getCroppedMask(x_pos, y_pos, crop_width, crop_height);
      }
      return new CanvasConfig(new_area, new_mask);
    }

    debugMask() {
      image(this.mask, this.area.x_pos * CROSS_WIDTH, this.area.y_pos * CROSS_HEIGHT);
    }
}