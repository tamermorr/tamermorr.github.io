import { CANVAS_WIDTH, CANVAS_HEIGHT, CROSS_WIDTH, CROSS_HEIGHT, ATOMS_SRC_FOLDER, DEBUG } from './specs.mjs';
import { TatreezGenerator } from './tatreez_generator.mjs';
import { TatreezDrawer } from './tatreez_drawer.mjs';

// Constants
const SQRT_TWO = Math.sqrt(2);

// TODO replace atom_width, area_width etc with just width

// TODO add atom.gap, mainly for grid but possibly for all behaviors

// let tatreez_factory;
let tatreez_generator;
let tatreez_drawer;

window.preload = function() {
  if(DEBUG) console.log("loading...");
  var url = new URL(window.location.href);
  var hash = url.searchParams.get("hash");
  console.log('generating Tatreez for ', hash);
  Math.seedrandom(hash);
  // tatreez_factory = new TatreezFactory(ATOMS_SRC_FOLDER);
  tatreez_generator = new TatreezGenerator(ATOMS_SRC_FOLDER);
  tatreez_drawer = new TatreezDrawer(ATOMS_SRC_FOLDER);
}

window.setup = function() {
  if(DEBUG) console.log("setup...");
  var mainCanvas = createCanvas(CANVAS_WIDTH * CROSS_WIDTH,
               CANVAS_HEIGHT * CROSS_HEIGHT);
  mainCanvas.parent("canvas-container");
}

window.draw = function() {
  background(0);
  // tatreez_factory.drawTatreez();

  const encoding = tatreez_generator.generateTatreez();
  // const encoding = "4.4.113.113;C#20:4.4.113.113;W#12:7.4.107.113;0;U#9+Z#32:7.4.107.113;Z#11+U#4:24.21.73.79;0";
  tatreez_drawer.drawTatreez(encoding);
  document.getElementById("encoding").textContent = encoding;
  noLoop();
}