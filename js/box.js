"use strict";

function Box(x, y, w, h) {
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;

  this.color_id = 0;
}
// Box.colors = ["#EEEEEE", "#D6E685", "#8CC665", "#44A340", "#1E6823"]; // these are when a box is selected
Box.colors = ["#F6F6F6", "#EAF2C1", "#C5E2B1", "#A1D09F", "#8EB390"];


Box.prototype.toggle_color = function(ctx) {
  var n_colors = Box.colors.length;

  this.color_id = (this.color_id + 1) % n_colors;
  this.draw(ctx);
  return this.color_id;
};


Box.prototype.set_color_id = function(color_id, ctx) {
  this.color_id = color_id;
  this.draw(ctx);
};


Box.prototype.draw = function(ctx) {
  ctx.clearRect(this.x, this.y, this.w, this.h);
  ctx.fillStyle = Box.colors[this.color_id];
  ctx.fillRect(this.x, this.y, this.w, this.h);
};
