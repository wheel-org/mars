// State Handler
var state = {
	camera: createCamera(),
	player: createPlayer("Felix", 500, 500),
	map: createMap(),
	players: []
};

function createPlayer(name, x, y) { 
	return {
		name: name,
		position: createTuple(x, y),
		delta: createTuple(0, 0),
		inventory: [],
		selectedItem: 0,
		skin: 0
	};
}

function createPolygon(points) { 
	return { points: points };
}
function createCamera() { 
	return { };
}

function createTuple(x, y) { 
	return { x: x, y: y };
}

function createMap() { 
	return {
		size: createTuple(10000, 10000),
		objects: [createObject(createRectanglePolygon(200, 200, 50, 50))]
	};
}

function createRectanglePolygon(x, y, width, height) { 
	return createPolygon([createTuple(x, y), createTuple(x + width, y),
		createTuple(x + width, y + height), createTuple(x, y + height)]);
}

function createObject(polygon) { 
	return { polygon: polygon };
} 