"use strict";
function CanvasState(canvas) {
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;
  this.ctx = canvas.getContext('2d');

  // save padding/border info for getMouse()
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingLeft, 10)      || 0;
    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingTop, 10)       || 0;
    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null).borderLeftWidth, 10)  || 0;
    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null).borderTopWidth, 10)   || 0;
  }

  // Save html offset info for getMouse() (if fixed-position bars are present)
  this.htmlTop = document.body.parentNode.offsetTop;
  this.htmlLeft = document.body.parentNode.offsetLeft;

  // state and options
  this.boxes = new Array(52);
  for (var i = 0; i < 52; i++) {
    this.boxes[i] = new Array(7);
  }
  this.dragging = false;
  this.next_color_id = 0;

  this.box_width = 12;
  this.box_height = 12;

  // populate boxes
  this.initialize_boxes();


  // event handlers
  var state = this;
  
  canvas.addEventListener('mousedown', function(evt) {
    var box = state.getBox(evt);
    if (box) {
      state.next_color_id = box.toggle_color(state.ctx);
      state.dragging = true;
    }
  }, true);

  canvas.addEventListener('mousemove', function(evt) {
    if (state.dragging){
      var box = state.getBox(evt);
      if (box) {
        box.set_color_id(state.next_color_id, state.ctx);
      }
    }
  }, true);

  canvas.addEventListener('mouseup', function(evt) {
    state.dragging = false;
    state.next_color_id = null;
    state.validate_state();
  }, true);
};


CanvasState.prototype.initialize_boxes = function() {
  for (var i = 0; i < 52; i++)
    for (var j = 0; j < 7; j++)
      this.boxes[i][j] = new Box(i*this.box_width, j*this.box_height, 
                                 this.box_width, this.box_height);
  this.draw_all();
};


CanvasState.prototype.getBox = function(evt) {
  var mouse = this.getMouse(evt);

  var i = parseInt(mouse.x / this.box_width);
  var j = parseInt(mouse.y / this.box_height);

  var box_col = this.boxes[i];
  if (box_col) // this is just to mask a console warning if out of bounds on x
    return this.boxes[i][j];
  else return null;
};


CanvasState.prototype.hotkeys = function(event) {
  if (event.key.toLowerCase() == 'r') {
    this.initialize_boxes();
  }
};


CanvasState.prototype.draw_all = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);

  // draw all boxes
  for (var i = 0; i < this.boxes.length; i++)
    for (var j = 0; j < this.boxes[i].length; j++)
      this.boxes[i][j].draw(this.ctx);
};

CanvasState.prototype.validate_state = function() {
  return true;
};

CanvasState.prototype.getMouse = function(evt) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
  
  // Compute the total offset
  do {
    offsetX += element.offsetLeft;
    offsetY += element.offsetTop;
  } while (element = element.offsetParent);

  // Add padding and border style widths to offset
  // Also add the html offsets in case there's a position:fixed bar
  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  mx = evt.pageX - offsetX;
  my = evt.pageY - offsetY;
  
  return {x: mx, y: my};
};
