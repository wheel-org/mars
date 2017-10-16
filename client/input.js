
var keyState = [];

$(document).ready(function () {
	$(document).keydown(function (e) {
		var code = e.keyCode || e.which;
		keyState[code] = 1;
		console.log(keyState);
	});
	$(document).keyup(function (e) {
		var code = e.keyCode || e.which;
		keyState[code] = 0;
	});
	$(document).mousedown(function (e) {
		
	});
	$(document).mousemove(function (e) { 
		
	});
	$(document).mouseup(function (e) {
		
	});
});
