import { CROSS_HEIGHT, CROSS_WIDTH } from "./specs.mjs";
import { Atom } from "./atom.mjs";
import { ROTATED_FRAME_ID, VEE_ID, ROTATED_CORNER_ID } from "./behaviors_indx.mjs";

export function isWidthParityCompatible(atom, area) {
    return (atom.atom_width % 2 == area.area_width % 2);
}
  
export function isHeightParityCompatible(atom, area) {
    return (atom.atom_height % 2 == area.area_height % 2);
}

// Returns a random number in [0,1] using seed
export function getRandomness() {
    return random(1);
}
  
export function normalizeWeights(weights) {
    let total = 0;
    for(var weight of weights) {
        total += weight;
    }
    return weights.map(x => x / total);
}
  
export function sampleFromWeights(weights) {
    var probs = normalizeWeights(weights);
    var random_number = getRandomness();
    var total = 0;
    for(var i = 0; i < probs.length; i++) {
        total += probs[i];
        if (random_number <= total) {
        return i;
        }
    }
}
  
export function normalizeWeights2D(weights) {
    let total = 0;
    for(var weight_array of weights) {
        for(var weight of weight_array) {
        total += weight;
        }
    }

    return weights.map(a => a.map(w => w / total));
}
  
export function sampleFromWeights2D(weights) {
    var probs = normalizeWeights2D(weights);
    var random_number = getRandomness();
    var total = 0;
    for(var i = 0; i < probs.length; i++) {

        for(var j = 0; j < probs[i].length; j++) {
        total += probs[i][j];
        if (random_number <= total) {
            return Array(i,j);
        }
        }
    }
}
  
export function pgMask(_content,_mask){
    //Create the mask as image
    var img = createImage(_mask.width,_mask.height);
    img.copy(_mask, 0, 0, _mask.width, _mask.height, 0, 0, _mask.width, _mask.height);
    //load pixels
    img.loadPixels();
    for (var i = 0; i < img.pixels.length; i += 4) {
        var v = img.pixels[i];
        img.pixels[i] = 0;
        img.pixels[i+1] = 0;
        img.pixels[i+2] = 0;
        img.pixels[i+3] = v;
    }
    img.updatePixels();

    _content.mask(img);
    // return the masked image
    return _content;
}

export function drawPixel(graphix) {
    graphix.rect(0, 0, CROSS_WIDTH, CROSS_HEIGHT);
}

export function getSilhouette(atom, rotated = false) {
    var graphix = createGraphics(atom.atom_width * CROSS_WIDTH, atom.atom_height * CROSS_HEIGHT);
    
    if(rotated) {
        graphix.fill(0, 255);
        for (var j = 0; j < atom.atom_width; j++) {
            for(var i = 0; i < atom.atom_height - atom.atom_width + 1; i++) {
                graphix.push();
                graphix.translate(j * CROSS_WIDTH, (i + j) * CROSS_HEIGHT);
                drawPixel(graphix);
                graphix.pop();
            }
        }
    } else {
        graphix.background(0, 255);
    }
    

    var img = createImage(graphix.width, graphix.height);
    img.copy(graphix, 0, 0, graphix.width, graphix.height, 0, 0, graphix.width, graphix.height);

    var s_atom = new Atom('', [], 0, atom.atom_width, atom.atom_height, [], []);
    s_atom.images = new Array(img);

    return s_atom;
}

export function drawBehaviorMask(behavior, canvas_config, atom, gap) {
    const silhouette_atom = getSilhouette(atom, isRotated(behavior));
    behavior.draw(silhouette_atom, canvas_config.area, canvas_config.mask);

    if (gap == 0) {
        behavior.draw(silhouette_atom, canvas_config.area, canvas_config.mask);
        return;
    }
    
    for(var i = 1; i <= gap; i++) {
        canvas_config.mask.push();
        canvas_config.mask.translate(0, i * CROSS_HEIGHT);
        behavior.draw(silhouette_atom, canvas_config.area, canvas_config.mask);
        canvas_config.mask.pop();

        canvas_config.mask.push();
        canvas_config.mask.translate(0, (-1) * i * CROSS_HEIGHT);
        behavior.draw(silhouette_atom, canvas_config.area, canvas_config.mask);
        canvas_config.mask.pop();

        canvas_config.mask.push();
        canvas_config.mask.translate(i * CROSS_WIDTH, 0);
        behavior.draw(silhouette_atom, canvas_config.area, canvas_config.mask);
        canvas_config.mask.pop();

        canvas_config.mask.push();
        canvas_config.mask.translate((-1) * gap * CROSS_WIDTH, 0);
        behavior.draw(silhouette_atom, canvas_config.area, canvas_config.mask);
        canvas_config.mask.pop();
    }
}

export function computeSpecsHorizontalSymmetry(atom, area, rotate_atom = false) {
    const atom_dim = rotate_atom? atom.atom_height : atom.atom_width;

    const center = (atom_dim % 2) || (area.area_width % 2);

    const gap =  (atom_dim % 2 == 0) && (area.area_width % 2);

    var cols = Math.ceil(area.area_width / atom_dim);

    if(center) {
        cols = Math.ceil(Math.floor(area.area_width / 2) / atom_dim) * 2;
    }

    if((atom_dim % 2) && (area.area_width % 2)) {
        cols = Math.ceil((area.area_width - atom_dim) / (2 * atom_dim)) * 2 + 1;
    }

    const x_pos = Math.floor((area.area_width- cols * atom_dim) / 2);

    return [cols, gap, x_pos];
}

export function computeSpecsVerticalSymmetry(atom, area) {
    const center = (atom.atom_height % 2) || (area.area_height % 2);
    const gap =  (atom.atom_height % 2 == 0) && (area.area_height % 2);
    
    var rows = Math.ceil(area.area_height / atom.atom_height);

    if(center) {
        rows = Math.ceil(Math.floor(area.area_height / 2) / atom.atom_height) * 2;
    }

    if((atom.atom_height % 2) && (area.area_height % 2)) {
        rows = Math.ceil((area.area_height - atom.atom_height) / (2 * atom.atom_height)) * 2 + 1;
    }

    const y_pos = Math.floor((area.area_height - rows * atom.atom_height) / 2);

    return [rows, gap, y_pos];
}

export function logBranch(arrangement, canvas_config, children_configs) {
    console.log("branching due to " + (arrangement.atom? (arrangement.atom.id + " "): "") + arrangement.behavior.caption + ", from " + canvas_config.area.area_width + "x" + canvas_config.area.area_height +
    " at (" + canvas_config.area.x_pos + "," + canvas_config.area.y_pos + ") to :");
    if(children_configs) {
      for(var child of children_configs) {
        if(child) {
            console.log("-- " + child.area.area_width + "x" + child.area.area_height +
            " at (" + child.area.x_pos + "," + child.area.y_pos + ")");
        }
      }
    }
}

export function logDraw(arrangement, canvas_config) {
    // draw arrangement on canvas config
    if(arrangement.atom) {
      console.log("drawing " + arrangement.atom.id +
                  " " + arrangement.behavior.caption +
                  " in " + canvas_config.area.area_width + "x" + canvas_config.area.area_height +
                  " at (" + canvas_config.area.x_pos + "," + canvas_config.area.y_pos + ")");
    }
}

export function defaultMaskForChild(i, atom, parent_canvas_config, area) {
    return parent_canvas_config.getCroppedMask(
        area.x_pos - parent_canvas_config.area.x_pos,
        area.y_pos - parent_canvas_config.area.y_pos,
        area.area_width, area.area_height);
}

export function isRotated(behavior) {
 return (behavior.id == VEE_ID || behavior.id == ROTATED_FRAME_ID || behavior.id == ROTATED_CORNER_ID);
}

/*
export function gaussian(mean, std) {
    const standard_gaussian =
        Math.sqrt(-2.0 * Math.log(1 - Math.random())) * Math.cos(2.0 * Math.PI * (1 - Math.random()));
    return std * standard_gaussian + mean;

}
*/