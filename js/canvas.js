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
  this.edit_row = false;
  this.edit_col = false;
  this.border_loops = false;

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
  this.initialize_boxes(this.boxes);
  this.initialize_boxes(this.saved); // allows swap before save

  // event handlers
  var state = this;
  
  canvas.addEventListener('mousedown', function(evt) {
    if (evt.button == 2)
      return;
    var index = state.getBoxIndex(evt);
    if (index) {
      var old_color = state.boxes[index.x][index.y];
      var new_color = (old_color + 1) % state.colors.length;

      state.next_color_id = state.set_color(index.x, index.y, new_color);
      state.dragging = true;
    }
  }, true);

  canvas.addEventListener('mousemove', function(evt) {
    if (state.dragging) {
      var index = state.getBoxIndex(evt);
      if (index)
        state.set_color(index.x, index.y, state.next_color_id);
    }
  }, true);

  canvas.addEventListener('mouseup', function(evt) {
    state.dragging = false;
    state.next_color_id = 0;
    state.update_state();
  }, true);
};


CanvasState.prototype.set_color = function(x, y, new_color) {
  if (this.edit_col)
    for (var i = 0; i < this.boxes[x].length; i++)
      this.draw_box(x, i, new_color);
  else if (this.edit_row)
    for (var i = 0; i < this.boxes.length; i++)
      this.draw_box(i, y, new_color);
  else
    this.draw_box(x, y, new_color);
  return new_color;
};


CanvasState.prototype.initialize_boxes = function(arr) {
  for (var i = 0; i < arr.length; i++)
    for (var j = 0; j < arr[i].length; j++) {
      arr[i][j] = 0;
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


CanvasState.prototype.toggle_border_loop = function() {
  this.border_loops = !this.border_loops;
  this.canvas.classList.toggle("border-loops");
};


CanvasState.prototype.shift_left = function() {
  var last_index = this.boxes.length-1;
  var first_col = this.boxes[0];
  for (var i = 0; i < last_index; i++)
    this.boxes[i] = this.boxes[i+1];
  if (this.border_loops) {
    this.boxes[last_index] = first_col;
  } else {
    this.boxes[last_index] = new Array(this.boxes[last_index].length)
    for (var j = 0; j < this.boxes[last_index].length; j++)
      this.boxes[last_index][j] = 0;
  }
  this.draw_all();
};


CanvasState.prototype.shift_right = function() {
  var last_col = this.boxes[this.boxes.length-1];
  for (var i = this.boxes.length-1; i > 0; i--) {
    this.boxes[i] = this.boxes[i-1];
  }
  if (this.border_loops) {
    this.boxes[0] = last_col;
  } else {
    this.boxes[0] = new Array(this.boxes[0].length)
    for (var j = 0; j < this.boxes[0].length; j++)
      this.boxes[0][j] = 0;
  }
  this.draw_all();
};


CanvasState.prototype.toggle_col = function() {
  if (!this.edit_col) {
    this.edit_row = false;
    this.canvas.classList.remove("edit-row");
  }
  this.edit_col = !this.edit_col
  this.canvas.classList.toggle("edit-col");
};


CanvasState.prototype.toggle_row = function() {
  if (!this.edit_row) {
    this.edit_col = false;
    this.canvas.classList.remove("edit-col");
  }
  this.edit_row = !this.edit_row
  this.canvas.classList.toggle("edit-row");
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
  // console.log(key);
  if (key == '?') {
    $('#help-screen').modal('toggle');
  } else if (key == 'escape') {
    $('#help-screen').modal('hide');
  } else if (key == '1') {
    this.import_state(preset_1);
  } else if (key == 'e') {
    this.export_state();
  } else if (key == 'r') {
    this.initialize_boxes(this.boxes);
  } else if (key == 's') {
    this.save_state();
  } else if (key == 'l') {
    this.load_state();
  } else if (key == 'w') {
    this.swap_state();
  } else if (key == 'j' || key == "arrowleft") {
    this.shift_left();
  } else if (key == 'k' || key == "arrowright") {
    this.shift_right();
  } else if (key == 'q' || key == "arrowup") {
    this.toggle_col();
  } else if (key == 'a' || key == "arrowdown") {
    this.toggle_row();
  } else if (key == '+') {
    this.toggle_border_loop();
  }
};


CanvasState.prototype.draw_box = function(i, j, new_color) {
  if (new_color !== undefined)
    if (this.boxes[i][j] == new_color)
      return;
    else
      this.boxes[i][j] = new_color;
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
