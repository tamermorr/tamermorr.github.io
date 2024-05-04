import { BEHAVIORS_BY_ID } from './behaviors.mjs';
import { logDraw } from './util.mjs';
import { Atom } from './atom.mjs';
import { Arrangement } from './arrangement.mjs';
import { CanvasConfig } from './canvas_config.mjs';
import { Area } from './area.mjs';
import { ATOMS_METADATA_FILENAME, DEBUG } from './specs.mjs';
import { HORIZONTAL_SPLIT } from './behaviors/horizontal_split.mjs';
import { NO_INDEX } from './behaviors_indx.mjs';

export class TatreezDrawer {
    // Map<String,Atom> atoms;
    
    constructor(atoms_src) {
      this.loadAtoms(atoms_src);
    }

    drawTatreez(encoding) {
      if(DEBUG) console.log("drawing encoding...");
      console.log(encoding);

      this.input_buffer = encoding.split(/#|\+|\.|:|;/);

      this.input_pointer = 0;
      
      // reads header
      let root_canvas = this.readRoot();
      let [arrangement, canvas_config] = this.readNextArrangement(0, root_canvas);

      this.drawOnCanvas(arrangement, canvas_config);
    }

    drawOnCanvas(arrangement, canvas_config) {
      if(!arrangement) {
        return;
      }

      // draw arrangement on canvas
      if(arrangement && canvas_config) {
        if(DEBUG) logDraw(arrangement, canvas_config);
        canvas_config.drawArrangement(arrangement); 
      }
      

      var children_configs = new Array(arrangement.behavior.number_of_children);

      for(var i = 0; i < children_configs.length; i++) {
        var [child_arrangement, child_canvas] =
          this.readNextArrangement(i, canvas_config, arrangement);

        /*
        if(arrangement && arrangement.atom && arrangement.atom.id == "12" && i == 1) {
           //console.log("child:", child_arrangement.behavior.id, child_arrangement.atom.id);
           //console.log("child config:", child_canvas);
           console.log("parent config:", canvas_config);
           child_canvas.debugMask();
           child_canvas.area.debug();
        }*/

        children_configs[i] = child_canvas;

        if(child_arrangement) {
          push();
          this.drawOnCanvas(child_arrangement, child_canvas);
          pop();
        }
      }
    }
    
    readRoot() {
      const x_pos = parseInt(this.input_buffer[this.input_pointer++]);
      const y_pos = parseInt(this.input_buffer[this.input_pointer++]);
      const area_width = parseInt(this.input_buffer[this.input_pointer++]);
      const area_height = parseInt(this.input_buffer[this.input_pointer++]);

      const area = new Area(area_width, area_height, x_pos, y_pos);
      const mask = area.getFullMask();

      return new CanvasConfig(area, mask);
    }

    readNextArrangement(i, parent_canvas_config, parent_arrangement = null) {
      const first = this.input_buffer[this.input_pointer++];
      if(first == "0" || first == "") {
        return [null, null];
      }

      const behavior = BEHAVIORS_BY_ID.get(first);
      var atom = null;
      var area = parent_canvas_config.area;
      var twin_behavior;
      var twin_atom;


      if(behavior.index != NO_INDEX) {
        atom = this.atoms.get(this.input_buffer[this.input_pointer++]);

        if(behavior.twin_behavior_index) {
          twin_behavior = BEHAVIORS_BY_ID.get(this.input_buffer[this.input_pointer++]);
          twin_atom = this.atoms.get(this.input_buffer[this.input_pointer++]);
        }

        const x_pos = parseInt(this.input_buffer[this.input_pointer++]);
        const y_pos = parseInt(this.input_buffer[this.input_pointer++]);
        const area_width = parseInt(this.input_buffer[this.input_pointer++]);
        const area_height = parseInt(this.input_buffer[this.input_pointer++]);

        area = new Area(area_width, area_height, x_pos, y_pos);
      }

      var mask;
      if(parent_arrangement) {
        mask = this.getMaskForChildArea(i, parent_arrangement, parent_canvas_config, area);
      } else {
        mask = parent_canvas_config.mask;
      }

      const canvas_config = new CanvasConfig(area, mask);

      const arrangement = new Arrangement(atom, behavior, canvas_config);
      arrangement.twin_behavior = twin_behavior;
      arrangement.twin_atom = twin_atom;

      return [arrangement , canvas_config];
    }

    getMaskForChildArea(i, parent_arrangement, parent_canvas_config, area) {
      return parent_arrangement.behavior.mask_for_child(
        i, parent_arrangement.atom, parent_canvas_config, area);
    }

    // loads atoms into factory
    loadAtoms(atoms_src) {
      this.atoms = new Map();
      
      if(DEBUG) console.log("loading JSON from " + atoms_src + "/" + ATOMS_METADATA_FILENAME);
  
      loadJSON(atoms_src + "/" + ATOMS_METADATA_FILENAME,
               data => {
                 this.decodeAtoms(atoms_src, data.atoms);
                 if(DEBUG) console.log("finished loading atoms", this.atoms);
                },
               response => {
                if(DEBUG) console.log("json loading error: " + response);
               });
    }
  
    decodeAtoms(atoms_src, json_array) {
      for(var encoding of json_array) {  
        this.atoms.set(encoding.id,
                       new Atom(encoding.id,
                                encoding.img_src.map(filename => atoms_src + "/" + filename),
                                encoding.rarity,
                                encoding.width,
                                encoding.height,
                                encoding.behavior_probs,
                                encoding.twins));
      }
  
      for(var atom of this.atoms.values()) {
        atom.loadTwins(this.atoms);
      }
    }
}