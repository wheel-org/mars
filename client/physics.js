var TIME_BETWEEN_FRAMES = 32;
var DELTA_TIME = 1000 / TIME_BETWEEN_FRAMES;
var PREV_TIME = Date.now();
var DRAG = 0.95;

var mouseDown = false;
var mouseDownLocation;
var mouseLocation;

function updatePlayer(player) { 
	player.position.x += (player.delta.x * 100) / DELTA_TIME;	
	player.position.y += (player.delta.y * 100) / DELTA_TIME;
	player.delta.x *= DRAG;
	player.delta.y *= DRAG;	
}

function checkInput() { 
	if (keyState[KEY_A]) { 
		state.player.delta.x = -1;
	}
	if (keyState[KEY_D]) { 
		state.player.delta.x = 1;
	}
	if (keyState[KEY_W]) { 
		state.player.delta.y = -1;
	}
	if (keyState[KEY_S]) { 
		state.player.delta.y = 1;
	}
}

function update() { 
	var now = Date.now();
	DELTA_TIME = 1000 / (now - PREV_TIME);
	checkInput();
	updatePlayer(state.player);
	PREV_TIME = now;
}

setInterval(update, TIME_BETWEEN_FRAMES);