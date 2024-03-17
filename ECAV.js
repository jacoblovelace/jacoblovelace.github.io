
// GLOBALS
SCREEN_SIZE = 600;
VAL_TO_COLOR = new Map(
  [
    [-1, [0, 0, 0, 255]],
    [0, [255, 255, 255]],
    [1, [0, 0, 0]],
  ]
);
COUNT = 0;
ROW_COUNT = -1;
TEMP_ROW = null;

// CONFIGURABLES
FRAMERATE_CONFIG = 10;
FRAMERATE = FRAMERATE_CONFIG;
RULE = "01100101";
NUM_COLS = 50;
NUM_ROWS = NUM_COLS;
BACKGROUND_COLOR = (50, 50, 50);

// STATES
ENDED = false;
PAUSED = true;
FAST_FORWARDED = false;
CONTINUOUS = false;


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
    noStroke();
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
  
  initStartingState() {
    for (let c of this.cells) {
      c.setVal(0);
    }
    this.cells[Math.floor((this.numCells / 2))].setVal(1);
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
    this.rows[0].initStartingState();
  }
  
  reset() {
    for (let r of this.rows) {
      for (let c of r.cells) {
        c.setVal(-1);
      }
    }
    this.rows[0].initStartingState();
  }
  
  draw() {
    for (let i = 0; i < this.rows; i++) {
      this.rows[i].draw();
    }
  }
  
}

function simulate(cur, row_num) { 
  
  const next = new Row(row_num * (SCREEN_SIZE / NUM_ROWS), NUM_COLS);

  for (let i = 0; i < cur.cells.length; i++) {
    const left = cur.cells[mod(i-1, cur.cells.length)];
    const right = cur.cells[mod(i+1, cur.cells.length)];
    let three = left.getVal().toString() + cur.cells[i].getVal().toString() + right.getVal().toString();
    
    three = parseInt(three, 2);

    if (RULE.split("")[RULE.length - 1 - three] == 1) {
      next.cells[i].setVal(1);
    } else {
      next.cells[i].setVal(0);
    }
  }

  return next;
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)
  ] : null;
}


// BUTTON FUNCTIONS

function startOver() {
  COUNT = 0;
  ROW_COUNT = -1;
  TEMP_ROW = new Row(0, NUM_COLS);
  TEMP_ROW.initStartingState();
  ENDED = false;
  GRID.reset();
  $('#stepForward').removeClass('disabled');
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
      COUNT += 1;
    }
  }
  if (ROW_COUNT >= NUM_ROWS) ROW_COUNT = 0;
}


// INPUT FUNCTIONS

function changeSize() {
  const size = document.getElementById("sizeInput").value;
  if (size >= 3 && size <= 150) {
    
    NUM_COLS = parseInt(size);
    NUM_ROWS = NUM_COLS;
    
    GRID.rows = [];
    GRID = new Grid(NUM_COLS, NUM_ROWS);
    startOver();
    
    $("#size > span").html(NUM_COLS);
    return true
  }
   
  console.log("size out of range");
  return false
}

function changeFramerate() {
  const framerate = document.getElementById("framerateInput").value;
  
  if (framerate >= 1 && framerate <= 60) {
    FRAMERATE_CONFIG = parseInt(framerate);
    FRAMERATE = FRAMERATE_CONFIG;
    $("#framerate > span").html(FRAMERATE_CONFIG);
    return true
  }
   
  console.log("framerate out of range");
  return false
}

function changeRule() {
  const rule = document.getElementById("ruleInput").value;
  
  if (rule >= 0 && rule <= 255) {
    
    r = Number(rule).toString(2);
    RULE = "00000000".substr(r.length) + r;
    
    startOver();
    
    $("#rule > span").html(RULE);
    return true
  }
   
  console.log("invalid rule");
  return false
}

function changeBackgroundColor() {
  const hex = document.getElementById("backgroundColorInput").value;
  
  const rgb = hexToRgb(hex);
  if (rgb) BACKGROUND_COLOR = rgb;
  else console.log("invalid color");
}

function changeCellColor(isOn) {
  
  const hex = isOn ? document.getElementById("cellColorOnInput").value : document.getElementById("cellColorOffInput").value;
  
  const rgb = hexToRgb(hex);
  if (hex) {
    if (isOn) VAL_TO_COLOR.set(1, rgb);
    else VAL_TO_COLOR.set(0, rgb);
  }
  else console.log("invalid color");
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
    COUNT += 1;
  }
  if (ROW_COUNT >= NUM_ROWS) ROW_COUNT = 0;
  if (ROW_COUNT >= NUM_ROWS - 1 && !CONTINUOUS) {
    PAUSED = true;
    ENDED = true;
    $('#play').removeClass('toggled');
    $('#stepForward').addClass('disabled');
  }
  
  for (let i = 0; i <= ROW_COUNT; i++) {
    
    if (ROW_COUNT == 0 && GRID.rows[mod(i+1, NUM_ROWS)] !== TEMP_ROW) GRID.rows[mod(i, NUM_ROWS)] = TEMP_ROW;
    
    TEMP_ROW = simulate(GRID.rows[i], mod(i+1, NUM_ROWS));
    if ((!ENDED || CONTINUOUS) && ROW_COUNT < NUM_ROWS - 1) {
      GRID.rows[mod(i+1, NUM_ROWS)] = TEMP_ROW;
    }
    
    GRID.rows[mod(i, NUM_ROWS)].draw();
  }
  
  $("#iteration > span").html(COUNT);
  
}