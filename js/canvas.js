"use strict";
function CanvasState(canvas) {
  // **** First some setup! ****
  this.canvas = canvas;
  this.width = canvas.width;
  this.height = canvas.height;
  this.ctx = canvas.getContext('2d');

  // when there's a border or padding. See getMouse for more detail
  // var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
  if (document.defaultView && document.defaultView.getComputedStyle) {
    this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingLeft, 10)      || 0;
    this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null).paddingTop, 10)       || 0;
    this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null).borderLeftWidth, 10)  || 0;
    this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null).borderTopWidth, 10)   || 0;
  }

  // Some pages have fixed-position bars at the top or left of the page
  // They will mess up mouse coordinates and this fixes that
  var html = document.body.parentNode;
  this.htmlTop = html.offsetTop;
  this.htmlLeft = html.offsetLeft;

  // **** Keep track of state! ****
  this.boxes = new Array(52);
  for (var i = 0; i < 52; i++) {
    this.boxes[i] = new Array(7);
  }
  this.dragging = false;
  this.next_color = null;

  this.box_width = 12;
  this.box_height = 12;

  // populate boxes
  this.initialize_boxes();

  // **** Then events! ****
  // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
  // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
  // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
  var myState = this;
  
  canvas.addEventListener('mousedown', function(evt) {
    var box = myState.getBox(evt);
    if (box) {
      myState.next_color = box.toggle_color(myState.ctx);

      myState.dragging = true;
    }
  }, true);

  canvas.addEventListener('mousemove', function(evt) {
    if (myState.dragging){
      var box = myState.getBox(evt);
      if (box) {
        box.set_color(myState.next_color, myState.ctx);
      }
    }
  }, true);

  canvas.addEventListener('mouseup', function(evt) {
    myState.dragging = false;
    this.next_color = null;
  }, true);
};


CanvasState.prototype.initialize_boxes = function() {
  for (var i = 0; i < 52; i++) {
    for (var j = 0; j < 7; j++) {
      this.boxes[i][j] = new Box(i*this.box_width, j*this.box_height, 
                                 this.box_width, this.box_height);
    }
  }
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
  for (var i = 0; i < this.boxes.length; i++) {
    for (var j = 0; j < this.boxes[i].length; j++) {
      var box = this.boxes[i];
      this.boxes[i][j].draw(this.ctx);
    }
  }
};


// Creates an object with x and y defined,
// set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky,
// we have to worry about padding and borders
CanvasState.prototype.getMouse = function(evt) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
  
  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  // Add padding and border style widths to offset
  // Also add the html offsets in case there's a position:fixed bar
  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  mx = evt.pageX - offsetX;
  my = evt.pageY - offsetY;
  
  // We return a simple javascript object (a hash) with x and y defined
  return {x: mx, y: my};
};
