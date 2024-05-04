import { CROSS_HEIGHT, CROSS_WIDTH } from './specs.mjs';

export class Area {
    // int x_pos;
    // int y_pos;
    // int area_width;
    // int area_height;
    
    constructor(area_width, area_height,
                x_pos = 0, y_pos = 0) {
      this.x_pos = x_pos;
      this.y_pos = y_pos;
      this.area_width = area_width;
      this.area_height = area_height;
    }
  
    // returns a mask filling the entire area
    getFullMask() {
      var graphix = createGraphics(this.area_width * CROSS_WIDTH, this.area_height * CROSS_HEIGHT);
      graphix.background(255);
      graphix.fill(0);
      return graphix;
    }

    getCrop(x_pos, y_pos, crop_width, crop_height) {
      return new Area(crop_width, crop_height, this.x_pos + x_pos, this.y_pos + y_pos);
    }


    debug(r = 255, g = 0, b = 0) {
      push();
      stroke(r, g, b);
      fill(0,0);
      rect(this.x_pos * CROSS_WIDTH, this.y_pos * CROSS_HEIGHT,
           this.area_width * CROSS_WIDTH, this.area_height * CROSS_HEIGHT);
      pop();
    }
  }