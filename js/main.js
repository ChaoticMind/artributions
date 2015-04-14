"use strict";
window.onload = initialize;


function initialize() {
  var canvas = document.getElementById('canvas');
  var valid_div = document.getElementById('valid');
  var s = new CanvasState(canvas, valid_div);

  document.body.onkeydown = function(event) {
    if (document.activeElement == document.body) {
      s.hotkeys(event);
    }
  }
}
