var canvas, context, screenWidth, screenHeight;

const RESOURCE_CHARACTER = "resources/character.png";
var resourcesToLoad = [RESOURCE_CHARACTER];
var resources = {};
var DRAW_BARRIER = true;
var DRAW_NORMALS = false;

function loadResource(url, deferArr) { 
	console.log("Loading Resource: " + url);
	var deferred = new $.Deferred();
	resources[url] = new Image();
	resources[url].onload = function () { 
		console.log("Resource loaded: " + url);
		deferred.resolve();
	};
	resources[url].onerror = function () { 
		console.log("Couldn't load resource: " + url);
	};
	resources[url].src = url;
	deferArr.push(deferred);
}

function loadResources(deferArr) { 
	for (var i = 0; i < resourcesToLoad.length; i++) { 
		loadResource(resourcesToLoad[i], deferArr);
	}
}

$(document).ready(function () {
	canvas = $("canvas")[0];
	context = canvas.getContext("2d");
	var deferArr = [];
	loadResources(deferArr);
	// LOL Not sure if this spread operator is even allowed zzz
	$.when(...deferArr).then(function () {
		console.log("Deferred Arr is Resolved");
		console.log(deferArr);
		// Start Graphics Loop When All Resources Loaded
		setInterval(draw, 16.6666666);
	});
});

function drawPolygon(polygon, fillStyle) { 
	context.fillStyle = fillStyle;
	context.beginPath();
	var drawPos = toCameraCoord(polygon.points[0]);
	context.moveTo(drawPos.x, drawPos.y);
	for (var i = 0; i < polygon.points.length; i++) {
		drawPos = toCameraCoord(polygon.points[i]);
		context.lineTo(drawPos.x, drawPos.y);
	}
	context.closePath();
	context.fill();
}

function createGradient(x, y, width, height, color1, color2) { 
	var grd = context.createLinearGradient(x, y, width, height);
	grd.addColorStop(0, color1);
	grd.addColorStop(1, color2);
	return grd;
}

function drawImage(img, x, y, angle = 0) {
	var drawPos = toCameraCoord(createTuple(x, y));
	context.translate(drawPos.x, drawPos.y);
	context.rotate(angle);
	context.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
	context.rotate(-angle);
	context.translate(-drawPos.x, -drawPos.y);
}

function drawPlayer(player) { 
	drawImage(resources[RESOURCE_CHARACTER],
		player.position.x,
		player.position.y, player.rotation);
}

function drawMap(map) { 
	context.fillStyle = createGradient(0, 0, screenWidth,
		screenHeight, "#73d216", "#8ae234");
	var drawPos = toCameraCoord(createTuple(0, 0));
	context.fillRect(drawPos.x, drawPos.y, map.size.x, map.size.y);
	for (var i = 0; i < map.objects.length; i++) { 
		drawPolygon(map.objects[i].polygon, "#000");
	}
}

function drawOtherPlayers() { 

}

function drawUI() { 

}

function drawState() { 
	drawMap(state.map);
	drawPlayer(state.player);
	drawOtherPlayers();
	drawUI();
}

function draw() { 
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;
	context.canvas.width = screenWidth;
	context.canvas.height = screenHeight;
	drawState();
}