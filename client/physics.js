var TIME_BETWEEN_FRAMES = 1;
var DELTA_TIME = 1000 / TIME_BETWEEN_FRAMES;
var PREV_TIME = Date.now();
var DRAG = 0.95;

var mouseDown = false;
var mouseDownLocation;
var mouseLocation;

function updatePlayerPosition(player) { 
	player.position.x += (player.delta.x * 100) / DELTA_TIME;	
	player.position.y += (player.delta.y * 100) / DELTA_TIME;
}

function checkInput() { 
	if (keyState[KEY_LEFT]) { 
		state.player.delta.x = -1;
	}
	if (keyState[KEY_RIGHT]) { 
		state.player.delta.x = 1;
	}
	if (keyState[KEY_UP]) { 
		state.player.delta.y = -1;
	}
	if (keyState[KEY_DOWN]) { 
		state.player.delta.y = 1;
	}
}

function update() { 
	var now = Date.now();
	DELTA_TIME = 1000 / (now - PREV_TIME);
	checkInput();
	updatePlayerPosition(state.player);
	state.player.delta.x *= DRAG;
	state.player.delta.y *= DRAG;	
	PREV_TIME = now;
}

setInterval(update, TIME_BETWEEN_FRAMES);