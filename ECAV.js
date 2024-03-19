
// GLOBALS
SCREEN_SIZE = 600;
GENERATION_COUNT = -1;
ROW_COUNT = -1;
let TEMP_ROW = null;

// CONFIGURABLES
FRAMERATE_CONFIG = 10;
FRAMERATE = FRAMERATE_CONFIG;
RULE = 101;
NUM_COLS = 50;
NUM_ROWS = NUM_COLS;
GRID_LINES = false;
NEIGHBOR_DISTANCE = 1;
RANDOM_START = false;
BACKGROUND_COLOR = (50, 50, 50);
VAL_TO_COLOR = new Map(
  [
    [-1, [0, 0, 0, 255]],
    [0, [255, 255, 255]],
    [1, [0, 0, 0]],
  ]
);


// STATES
ENDED = false;
PAUSED = true;
FAST_FORWARDED = false;
CONTINUOUS = false;

// CLASSES
class Cell {
  
  constructor(xpos, ypos, size) {
    this.xpos = xpos;
    this.ypos = ypos;
    this.size = size;
    
    this.value = -1;
    this.color = VAL_TO_COLOR.get(this.value);
  }
  
  getVal() {
    return this.value;
  }
  
  setVal(val) {
    this.value = val;
    this.color = VAL_TO_COLOR.get(this.value);
  }
  
  draw() {
    const c = color(...this.color);
    fill(c);
    GRID_LINES ? stroke(50, 50, 50, 50) : noStroke();
    return rect(this.xpos, this.ypos, this.size, this.size);
  }
  
}

class Row {
  
  constructor(ypos, numCells) {
    this.ypos = ypos;
    this.numCells = numCells;
    this.cells = [];
    this.createCells();
  }
  
  createCells() {
    const cellSize = SCREEN_SIZE / this.numCells;
    
    for (let i = 0; i < this.numCells; i++) {
      const c = new Cell(i * cellSize, this.ypos, cellSize, cellSize);
      c.setVal(-1);
      this.cells.push(c);
    }
    
  }
  
  initStartingState(doRandom=false) {
    if (doRandom) {
      for (let c of this.cells) {
        c.setVal(Math.floor(Math.random() * 2));
      }
      return
    }

    for (let c of this.cells) {
      c.setVal(0);
    }
    this.cells[Math.floor((this.numCells / 2))].setVal(1);
    return
  }
  
  draw() {
    for (let c of this.cells) {
      c.draw();
    }
  }
  
}

class Grid {
  
  constructor(numCols, numRows) {
    this.numCols = numCols;
    this.numRows = numRows;
    this.rows = []
    this.init();
  }
  
  init() {
    const cellHeight = SCREEN_SIZE / NUM_ROWS;
    for (let i = 0; i < this.numRows; i++) {
      this.rows.push(new Row(i * cellHeight, NUM_COLS));
    }
    this.rows[0].initStartingState(RANDOM_START);
  }
  
  reset() {
    for (let r of this.rows) {
      for (let c of r.cells) {
        c.setVal(-1);
      }
    }
    this.rows[0].initStartingState(RANDOM_START);
  }
  
  draw() {
    for (let i = 0; i < this.rows; i++) {
      this.rows[i].draw();
    }
  }
  
}

// UTILITY FUNCTIONS

function mod(n, m) {
  return ((n % m) + m) % m;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)
  ] : null;
}

// PLAYBACK BUTTONS

function startOver() {
  GENERATION_COUNT = -1;
  ROW_COUNT = -1;
  TEMP_ROW = new Row(0, NUM_COLS);
  TEMP_ROW.initStartingState(RANDOM_START);
  ENDED = false;
  GRID.reset();
}

function togglePause() {
  if (ENDED & !CONTINUOUS) {
    startOver();
  }
  if (PAUSED) {
    ENDED = false;
    PAUSED = false;
    $('#play').addClass('toggled');
    $('#stepForward').addClass('disabled');
  } 
  else {
    PAUSED = true;
    $('#play').removeClass('toggled');
    $('#stepForward').removeClass('disabled');
  }
}

function toggleFastForward() {
  if (FAST_FORWARDED) {
    FAST_FORWARDED = false;
    FRAMERATE = FRAMERATE_CONFIG;
    $('#fastForward').removeClass('toggled');
  } 
  else {
    FAST_FORWARDED = true;
    FRAMERATE = 60;
    $('#fastForward').addClass('toggled');
  }
  $("#framerate > span").html(FRAMERATE);
}

function toggleContinuous() {
  if (CONTINUOUS) {
    CONTINUOUS = false;
    $('#continuous').removeClass('toggled');
  } 
  else {
    CONTINUOUS = true;
    $('#continuous').addClass('toggled');
    if (PAUSED) $('#stepForward').removeClass('disabled');
  }
}

function stepForward() {
  if (PAUSED) {
    if (!ENDED || CONTINUOUS) {
      ROW_COUNT += 1;
      GENERATION_COUNT += 1;
    }
  }
  if (ROW_COUNT >= NUM_ROWS) ROW_COUNT = 0;
}

// SETTINGS INPUTS

function toggleGridLines() {
  const checkBox = document.getElementById("gridLines");
  GRID_LINES = checkBox.checked;
}

function changeSize() {
  const lower_bound = 3;
  const upper_bound = 200;

  let input_val = document.getElementById("sizeInput").value;

  input_val = Math.max(input_val, lower_bound);
  input_val = Math.min(input_val, upper_bound);

  document.getElementById("sizeInput").value = input_val;

  NUM_COLS = parseInt(input_val);
  NUM_ROWS = NUM_COLS;
  $("#size > span").html(NUM_COLS);

  document.getElementById("neighborDistanceInput").value = Math.min(NEIGHBOR_DISTANCE, Math.floor(NUM_COLS / 2));
  
  GRID.rows = [];
  GRID = new Grid(NUM_COLS, NUM_ROWS);

  startOver();
}

function changeFramerate() {
  const lower_bound = 1;
  const upper_bound = 60;

  let input_val = document.getElementById("framerateInput").value;

  input_val = Math.max(input_val, lower_bound);
  input_val = Math.min(input_val, upper_bound);
  
  document.getElementById("framerateInput").value = input_val;

  FRAMERATE_CONFIG = parseInt(input_val);
  if (!FAST_FORWARDED) {
    FRAMERATE = FRAMERATE_CONFIG;
    $("#framerate > span").html(FRAMERATE);
  }
  
}

function changeRule(doRandom=false, binary=false) {
  let rule = 0;
  let valid = false; 

  if (doRandom) {
    rule = Math.floor(Math.random() * 256);
    document.getElementById("ruleInput").value = rule;
    document.getElementById("ruleInputBinary").value = "00000000".substring(Number(rule).toString(2).length) + Number(rule).toString(2);

    valid = true;
  }
  else {
    // convert rule into decimal if in binary
    rule = binary ? parseInt(document.getElementById("ruleInputBinary").value, 2) : document.getElementById("ruleInput").value;

    // check bounds
    if (rule >= 0 && rule <= 255) {
      if (binary) document.getElementById("ruleInput").value = rule;
      else document.getElementById("ruleInputBinary").value = "00000000".substring(Number(rule).toString(2).length) + Number(rule).toString(2);

      valid = true;
    }
  }

  if (valid) {
    startOver();
    RULE = rule;
    $("#rule > span").html(RULE);

    return true;
  }

  return false;
}

function changeNeighborDistance() {
  const lower_bound = 1;
  const upper_bound = Math.floor(NUM_COLS / 2);

  let input_val = document.getElementById("neighborDistanceInput").value;

  input_val = Math.max(input_val, lower_bound);
  input_val = Math.min(input_val, upper_bound);
  
  document.getElementById("neighborDistanceInput").value = input_val;

  NEIGHBOR_DISTANCE = input_val;

  startOver();
}

function changeStartingCondition(doRandom=false) {
  RANDOM_START = doRandom;
  startOver();
}

// COLOR SETTINGS INPUTS

function changeBackgroundColor() {
  const hex = document.getElementById("backgroundColorInput").value;
  
  const rgb = hexToRgb(hex);
  if (rgb) BACKGROUND_COLOR = rgb;
}

function changeCellColor(isOn) {
  
  const hex = isOn ? document.getElementById("cellColorOnInput").value : document.getElementById("cellColorOffInput").value;
  
  const rgb = hexToRgb(hex);
  if (hex) {
    if (isOn) VAL_TO_COLOR.set(1, rgb);
    else VAL_TO_COLOR.set(0, rgb);
  }
}

// SIMULAION FUNCTION

function next_generation(cur, row_num) { 
  
  const next = new Row(row_num * (SCREEN_SIZE / NUM_ROWS), NUM_COLS);

  for (let i = 0; i < cur.cells.length; i++) {
    const left = cur.cells[mod(i-NEIGHBOR_DISTANCE, cur.cells.length)];
    const right = cur.cells[mod(i+NEIGHBOR_DISTANCE, cur.cells.length)];
    let three = left.getVal().toString() + cur.cells[i].getVal().toString() + right.getVal().toString();
    
    three = parseInt(three, 2);

    const rule = "00000000".substring(Number(RULE).toString(2).length) + Number(RULE).toString(2);

    if (rule.split("")[rule.length - 1 - three] == 1) {
      next.cells[i].setVal(1);
    } else {
      next.cells[i].setVal(0);
    }
  }

  return next;
}

// P5.js functions


function setup() {
  createCanvas(SCREEN_SIZE, SCREEN_SIZE, can);

  GRID = new Grid(NUM_COLS, NUM_ROWS);
  
  TEMP_ROW = new Row(0, NUM_COLS);
  TEMP_ROW.initStartingState();
    
  $("#size > span").html(NUM_COLS);
  $("#rule > span").html(RULE);
  $("#framerate > span").html(FRAMERATE_CONFIG);
}

function draw() {
  frameRate(FRAMERATE);
  background(BACKGROUND_COLOR);
  
  if (!PAUSED && !ENDED) {
    ROW_COUNT += 1;
    GENERATION_COUNT += 1;
  }
  if (ROW_COUNT >= NUM_ROWS) ROW_COUNT = 0;
  if (ROW_COUNT >= NUM_ROWS - 1 && !CONTINUOUS) {
    PAUSED = true;
    ENDED = true;
    $('#play').removeClass('toggled');
    $('#stepForward').addClass('disabled');
  }
  
  // draw grid
  for (let i = 0; i <= ROW_COUNT; i++) {
    
    if (ROW_COUNT == 0 && GRID.rows[mod(i+1, NUM_ROWS)] !== TEMP_ROW) GRID.rows[mod(i, NUM_ROWS)] = TEMP_ROW;
    
    // only need to simulate last drawn row
    if (i == ROW_COUNT) {
      TEMP_ROW = next_generation(GRID.rows[i], mod(i+1, NUM_ROWS));
      if ((!ENDED || CONTINUOUS) && ROW_COUNT < NUM_ROWS - 1) {
        GRID.rows[mod(i+1, NUM_ROWS)] = TEMP_ROW;
      }
    }
    
    // draw every row
    GRID.rows[mod(i, NUM_ROWS)].draw();
  }
  
  $("#generation > span").html(GENERATION_COUNT);
  
}