import { BEHAVIORS } from './behaviors.mjs';
import { getRandomness, sampleFromWeights2D, logBranch, logDraw } from './util.mjs';
import { Atom } from './atom.mjs';
import { Arrangement } from './arrangement.mjs';
import { CanvasConfig } from './canvas_config.mjs';
import { Area } from './area.mjs';
import { ATOMS_METADATA_FILENAME, CANVAS_WIDTH, CANVAS_HEIGHT, SPLIT_PROB, GAP, DEBUG, MAX_ATTEMPTS } from './specs.mjs';
import { HORIZONTAL_SPLIT } from './behaviors/horizontal_split.mjs';

export class TatreezGenerator {
    // Map<String,Atom> atoms;
    
    constructor(atoms_src) {
      this.loadAtoms(atoms_src);
    }
    
    generateTatreez() {
      if(DEBUG) console.log("generating tatreez...");
      let canvas_config = new CanvasConfig(
        new Area(CANVAS_WIDTH - 2 * GAP, CANVAS_HEIGHT - 2 * GAP, GAP, GAP));
        
      this.unused_atom_ids = new Set(this.atoms.keys());

      this.ResetOutput();
      
      this.generateForCanvas(canvas_config);
      return this.output_buffer;
    }

    ResetOutput() {
      this.output_buffer = "";
      this.output_buffer = this.output_buffer.concat(
        GAP, ".", GAP, ".", CANVAS_WIDTH - 2 * GAP, ".", CANVAS_HEIGHT - 2 * GAP, ";");
    }

    generateForCanvas(canvas_config) {
      // sample arrangment - atom and behavior
      var arrangement = this.sampleArrangement(canvas_config);

      if(!arrangement) {
        this.pushTerminalToOutput();
        return;
      }

      if(arrangement.atom) {
        this.unused_atom_ids.delete(arrangement.atom.id);
      }
      if(arrangement.twin_atom) {
        this.unused_atom_ids.delete(arrangement.twin_atom.id)
      }

      // encode
      this.pushToOutput(canvas_config, arrangement);

      // generate children
      var children_configs = arrangement.branch(canvas_config);
      if(DEBUG) logBranch(arrangement, canvas_config, children_configs);
        
      // generate recursively for children
      if(children_configs) {
          for(var child of children_configs) {
              if(!child.isEmpty()) {
                  push();
                  this.generateForCanvas(child);
                  pop();
              } else {
                this.pushTerminalToOutput();
              }
          }
      }
    }

    pushToOutput(canvas_config, arrangement) {
      this.output_buffer = this.output_buffer.concat(this.encodeArrangemet(arrangement));
      if(arrangement.atom) {
        this.output_buffer = this.output_buffer.concat(this.encodeCanvas(canvas_config));
      }
    }

    pushTerminalToOutput(){
      this.output_buffer = this.output_buffer.concat("0;");
    }

    encodeArrangemet(arrangement) {
      if(arrangement.atom) {
        var encoding = new String().concat(arrangement.behavior.id, "#", arrangement.atom.id);
      } else {
        var encoding = new String().concat(arrangement.behavior.id, ";");
      }

      if(arrangement.twin_atom) {
        encoding = encoding.concat(
          "+", BEHAVIORS.get(arrangement.behavior.twin_behavior_index).id,
          "#", arrangement.twin_atom.id);
      }
      return encoding;
    }

    encodeCanvas(canvas_config) {
      return new String().concat(
        ":", canvas_config.area.x_pos, ".", canvas_config.area.y_pos, ".",
        canvas_config.area.area_width, ".", canvas_config.area.area_height, ";");
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
    
    // returns a random arrangement
    sampleArrangement(canvas_config) {
      // split
      if(getRandomness() <= SPLIT_PROB * HORIZONTAL_SPLIT.compatibility(null, canvas_config)) {
        return new Arrangement(null, HORIZONTAL_SPLIT, canvas_config);
      }

      if(DEBUG) console.log("Sampling from unused atoms:", this.unused_atom_ids);

      let atoms_array = [...this.unused_atom_ids];

      let attempted_atoms = new Set();

      for(var attempts = 0; attempts < MAX_ATTEMPTS; attempts++) {
        let weights = atoms_array.map(
          id => this.atoms.get(id).generateWeightVector(canvas_config).map(w => w * (!attempted_atoms.has(id))));

        let arrangement_indx = sampleFromWeights2D(weights);

        if(! arrangement_indx) {
          return null;
        }

        const atom = this.atoms.get(atoms_array[arrangement_indx[0]]);

        if(canvas_config.isVisible(arrangement_indx[1], atom)) {
          return new Arrangement(this.atoms.get(atoms_array[arrangement_indx[0]]),
                             BEHAVIORS.get(arrangement_indx[1]),
                             canvas_config);
        } else {
          attempted_atoms.add(atom.id);
        }

        if(DEBUG) console.log("skipping not visible", atom.id, arrangement_indx[1], canvas_config);
      }
      
      return null;
    }
}