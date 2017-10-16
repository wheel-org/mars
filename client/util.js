const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_W = 87;
const KEY_A = 65;
const KEY_S = 83;
const KEY_D = 68;

function toCameraCoord(position) { 
	return {
		x: position.x - state.player.position.x + screenWidth / 2,
		y: position.y - state.player.position.y + screenHeight / 2
	};
}

function toWorldCoord(position) { 
	return {
		x: position.x + state.player.position.x - screenWidth / 2,
		y: position.y + state.player.position.y - screenHeight / 2
	};
}

function toRadians(angle) {
	return angle * (Math.PI / 180);
}

function toDegrees(angle) {
	return angle * (180 / Math.PI);
}
