"use strict";

function Box(x, y, w, h) {
  this.x = x || 0;
  this.y = y || 0;
  this.w = w || 1;
  this.h = h || 1;

  this.fill = this.toggle_color.colors[0];
}


Box.prototype.toggle_color = function(ctx) {
  var n_colors = Box.prototype.toggle_color.colors.length;
  var i = Box.prototype.toggle_color.colors.indexOf(this.fill);

  this.fill = Box.prototype.toggle_color.colors[(i+1) % n_colors];
  this.draw(ctx);
  return this.fill;
};
// Box.prototype.toggle_color.colors = ["#EEEEEE", "#D6E685", "#8CC665", "#44A340", "#1E6823"]; // these are when a box is selected
Box.prototype.toggle_color.colors = ["#F6F6F6", "#EAF2C1", "#C5E2B1", "#A1D09F", "#8EB390"];


Box.prototype.set_color = function(color, ctx) {
  this.fill = color;
  this.draw(ctx);
};


Box.prototype.draw = function(ctx) {
  ctx.fillStyle = this.fill;
  ctx.fillRect(this.x, this.y, this.w, this.h);
};
