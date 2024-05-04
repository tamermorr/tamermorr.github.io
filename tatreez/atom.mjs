import {CROSS_WIDTH, CROSS_HEIGHT, AMPLIFICATION_SCALAR} from './specs.mjs';
import {BEHAVIORS} from './behaviors.mjs';
import { BEHAVIOR_NUM } from './behaviors_indx.mjs';

export class Atom {
    // String id;
    // Set<PImage> images;
    // int rarity;
    // int atom_width;
    // int atom_height;
    // Array<float> behavior_probs;
    // Set<Atom> twins;
    
    constructor(id, img_src, rarity, atom_width, atom_height, behavior_probs, twins) {
      this.id = id;
      this.rarity = rarity;
      this.atom_width = atom_width;
      this.atom_height = atom_height;
      this.behavior_probs = behavior_probs;
      this.twin_ids = twins;
      this.variant_counter = 0;

      this.images = img_src.map(filename =>
        loadImage(filename, img => img.resize(atom_width * CROSS_WIDTH, atom_height * CROSS_HEIGHT)));
    }
    
    loadTwins(atoms) {
        this.twins = this.twin_ids.map(id => atoms.get(id));
    }

    // generates vector of weights for different behaviors w.r.t. canvas
    generateWeightVector(canvas_config) {
      var outcome_weights = new Array(BEHAVIOR_NUM);
  
      for(var behavior_indx = 0; behavior_indx < BEHAVIOR_NUM; behavior_indx++) {
        outcome_weights[behavior_indx] = this.computeWeightForBehavior(canvas_config, behavior_indx);
      }
      
      return outcome_weights;
    }
  
    // generates vector of weights for different behaviors w.r.t. canvas
    computeWeightForBehavior(canvas_config, behavior_indx, secondary = false) {
      return AMPLIFICATION_SCALAR *
             Math.exp((-1) * this.rarity) *
             this.behavior_probs[behavior_indx] *
             (secondary? 1 : BEHAVIORS.get(behavior_indx).compatibility(this, canvas_config));
    }
  
    // draws atom on a Graphics object
    drawOnCanvas(graphix) {
      graphix.image(this.images[this.variant_counter % this.images.length], 0, 0);
      this.variant_counter++;
    }
}