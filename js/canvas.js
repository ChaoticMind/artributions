"use strict";
function CanvasState(canvas, valid_div) {
  this.canvas = canvas;
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
  this.dragging = false;
  this.next_color_id = 0;

  var boxes_cols = 52;
  var boxes_rows = 7;
  this.box_width = 11;
  this.box_height = 11;
  this.box_margin = 2;
  this.colors = ["#F6F6F6", "#EAF2C1", "#C5E2B1", "#A1D09F", "#8EB390"];

  this.width = boxes_cols * (this.box_width + this.box_margin);
  this.height = boxes_rows * (this.box_height + this.box_margin);
  canvas.setAttribute("width", this.width);
  canvas.setAttribute("height", this.height);

  this.boxes = new Array(boxes_cols);
  this.saved = new Array(boxes_cols);
  for (var i = 0; i < boxes_cols; i++) {
    this.boxes[i] = new Array(boxes_rows);
    this.saved[i] = new Array(boxes_rows);
  }

  // valid div
  this.valid_div = valid_div;
  this.success_string_0 = "Click on the canvas below";
  this.success_string_1 = "This pattern can be generated";
  this.success_string_2 = "This pattern can be generated, but possibly with a different color";
  this.fail_string_0 = "Can't generate pattern. Requires at least one time use of the lowest and highest color";

  // populate boxes
  this.initialize_boxes();

  // event handlers
  var state = this;
  
  canvas.addEventListener('mousedown', function(evt) {
    if (evt.button == 2)
      return;
    var index = state.getBoxIndex(evt);
    if (index) {
      var old_color = state.boxes[index.x][index.y];
      var new_color = (old_color + 1) % state.colors.length;
      state.boxes[index.x][index.y] = new_color;
      state.draw_box(index.x, index.y);

      state.next_color_id = new_color;
      state.dragging = true;
    }
  }, true);

  canvas.addEventListener('mousemove', function(evt) {
    if (state.dragging) {
      var index = state.getBoxIndex(evt);
      if (index) {
        var old_color = state.boxes[index.x][index.y];
        if (old_color != state.next_color_id) {
          state.boxes[index.x][index.y] = state.next_color_id;
          state.draw_box(index.x, index.y);
        }
      }
    }
  }, true);

  canvas.addEventListener('mouseup', function(evt) {
    state.dragging = false;
    state.next_color_id = 0;
    state.update_state();
  }, true);
};


CanvasState.prototype.initialize_boxes = function() {
  for (var i = 0; i < this.boxes.length; i++)
    for (var j = 0; j < this.boxes[i].length; j++) {
      this.boxes[i][j] = 0;
    }
  this.draw_all();
};


CanvasState.prototype.save_state = function() {
  for (var i = 0; i < this.boxes.length; i++)
    for (var j = 0; j < this.boxes[i].length; j++) {
      this.saved[i][j] = this.boxes[i][j];
    }
};


CanvasState.prototype.load_state = function() {
  for (var i = 0; i < this.boxes.length; i++)
    for (var j = 0; j < this.boxes[i].length; j++) {
      this.boxes[i][j] = this.saved[i][j];
    }
  this.draw_all();
};


CanvasState.prototype.swap_state = function() {
  [this.boxes, this.saved] = [this.saved, this.boxes];
  this.draw_all();
};


CanvasState.prototype.import_state = function(boxes) {
  var new_boxes = new Array(this.boxes.length);
  for (var i = 0; i < new_boxes.length; i++) {
    new_boxes[i] = new Array(this.boxes[i].length);
  }

  var parsed_boxes = JSON.parse(boxes);
  if (parsed_boxes.length != this.boxes.length) {
    console.log('Error: could not import state');
    return;
  }
  for (var i = 0; i < parsed_boxes.length; i++) {
    if (parsed_boxes[i].length != this.boxes[i].length) {
      console.log('Error: could not import state at column ' + i);
      console.log(parsed_boxes[i].length + ' vs ' + this.boxes[i].length);
      return;
    }
    for (var j = 0; j < parsed_boxes[i].length; j++) {
      var color_id = parsed_boxes[i][j];
      if (color_id < 0 || color_id > this.colors.length-1) {
        console.log('invalid color id at [' + i + '][' + j + ']');
        return;
      }
      new_boxes[i][j] = color_id;
    }
  }
  this.boxes = new_boxes;  // commit on success
  this.draw_all();
};


CanvasState.prototype.export_state = function() {
  // var json_dump = JSON.stringify(this.boxes, null, '\t');
  var json_dump = JSON.stringify(this.boxes);
  console.log(json_dump);
  // console.log(canvas.toDataURL());
};


CanvasState.prototype.getBoxIndex = function(evt) {
  var mouse = this.getMouse(evt);

  var i = parseInt(mouse.x / (this.box_width + this.box_margin));
  var j = parseInt(mouse.y / (this.box_height + this.box_margin));

  if (i >= 0 && i < this.boxes.length && j >= 0 && j < this.boxes[i].length)
    return {x: i, y: j}
  else
    return null;
};


CanvasState.prototype.hotkeys = function(evt) {
  var key = evt.key.toLowerCase();
  if (key == '?') {
    $('#help-screen').modal();
  } else if (key == '1') {
    this.import_state(preset_1);
  } else if (key == 'e') {
    this.export_state();
  } else if (key == 'r') {
    this.initialize_boxes();
  } else if (key == 's') {
    this.save_state();
  } else if (key == 'l') {
    this.load_state();
  } else if (key == 'w') {
    this.swap_state();
  }
};


CanvasState.prototype.draw_box = function(i, j) {
  var x = i * (this.box_width + this.box_margin);
  var y = j * (this.box_height + this.box_margin);
  this.ctx.clearRect(x, y, this.box_width, this.box_height);
  this.ctx.fillStyle = this.colors[this.boxes[i][j]];
  this.ctx.fillRect(x, y, this.box_width, this.box_height);
}


CanvasState.prototype.draw_all = function() {
  this.ctx.clearRect(0, 0, this.width, this.height);

  // draw all boxes
  for (var i = 0; i < this.boxes.length; i++)
    for (var j = 0; j < this.boxes[i].length; j++) {
      this.draw_box(i, j);
    }
  this.update_state();
};


CanvasState.prototype.update_state = function() {
  switch (this.validate_state()) {
    case 0:
      this.valid_div.innerHTML = this.success_string_0;
      this.valid_div.className = "text-info";
      break;
    case 1:
      this.valid_div.innerHTML = this.success_string_1;
      this.valid_div.className = "text-success";
      break;
    case 2:
      this.valid_div.innerHTML = this.success_string_2;
      this.valid_div.className = "text-warning";
      break;
    case 3:
      this.valid_div.innerHTML = this.fail_string_0;
      this.valid_div.className = "text-danger";
      break;
    default:
      this.valid_div.innerHTML = "unknown-state";
      this.valid_div.className = "text-danger";
  }
};


CanvasState.prototype.validate_state = function() {
  var low_color = undefined;
  var high_color = 0;
  for (var i = 0; i < this.boxes.length; i++)
    for (var j = 0; j < this.boxes[i].length; j++) {
      var color = this.boxes[i][j];
      if (color > 0) {
        if (low_color === undefined)
          low_color = color;
        low_color = Math.min(low_color, color);
        high_color = Math.max(high_color, color);
      }
    }

  if (low_color === undefined) {
    return 0;
  } else if (low_color == 1 && high_color == this.colors.length-1) {
    return 1;
  } else if (low_color == high_color && high_color == 1) {
    return 1;
  } else if (low_color == high_color) {
    return 2;
  } else {
    return 3;
  }
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
