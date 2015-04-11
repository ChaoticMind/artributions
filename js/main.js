"use strict";
window.onload = initialize;


function initialize() {
  canvas = document.getElementById('canvas');
  var s = new CanvasState(canvas);

  document.body.onkeydown = function(event) {
  	if (document.activeElement == document.body) {
  		s.hotkeys(event);
  	}
  }
}
