var canvas, context, screenWidth, screenHeight, screenPoints;

const RESOURCE_CHARACTER = "resources/character.png";
var resourcesToLoad = [RESOURCE_CHARACTER];
var resources = {};
var DRAW_BARRIER = true;
var DRAW_NORMALS = false;
var fov = 130;
var fpsFilterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;


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

function drawUIPolygon(polygon, fillStyle) { 
	context.fillStyle = fillStyle;
	context.beginPath();
	context.moveTo(polygon.points[0].x, polygon.points[0].y);
	for (var i = 0; i < polygon.points.length; i++) {
		context.lineTo(polygon.points[i].x, polygon.points[i].y);
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
		player.position.y, player.rotation + toRadians(90));
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
	context.font = "30px Arial";
	context.fillStyle = "black";
	context.textAlign = "right";
	context.fillText(parseInt(1000 / frameTime) + " fps", screenWidth - 10, 40);
}

function segmentIntersect(a1, a2, b1, b2) { 
	var alg = function (a, b, c, d, p, q, r, s) {
		var det, gamma, lambda;
		det = (c - a) * (s - q) - (r - p) * (d - b);
		if (det === 0) {
			return false;
		} else {
			lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
			gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
			return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
		}
	};
	return alg(a1.x, a1.y, a2.x, a2.y, b1.x, b1.y, b2.x, b2.y);
}

function angleDifference(a, b) {
	return ((a - b) + toRadians(180 + 360)) % toRadians(360) - toRadians(180);
}

function angleDifferencePos(a, b) { 
	return ((a - b) + toRadians(360)) % toRadians(360);
}

// Given a line defined by playerPos to p1, give the coordinates on screen of
//   the edge that the ray hits
function rayEdgePoint(p1) {
	var angle = Math.atan2(p1.y - screenHeight / 2, p1.x - screenWidth / 2);
	return angleEdgePoint(angle);
}

function angleBetween(a, b) { 
	return Math.atan2(a.y - b.y, a.x - b.x);
}

function angleEdgePoint(angle) { 
	var bottomRight = Math.atan2(screenHeight / 2, screenWidth / 2);
	var topRight = -bottomRight;
	var topLeft = toRadians(-180) + bottomRight;
	var bottomLeft = toRadians(180) - bottomRight;
	if (angle > topRight && angle < bottomRight) { 
		//   x + r0 = screenWidth
		var r = (screenWidth / 2) / Math.cos(angle);
		var y = (screenHeight / 2) + r * Math.sin(angle);
		return { edge: 0, point: createTuple(screenWidth, y) };
	}
	else if (angle < topLeft || angle > bottomLeft) { 
		//   x + r0 = 0
		var r = (-screenWidth / 2) / Math.cos(angle);
		var y = (screenHeight / 2) + r * Math.sin(angle);
		return { edge: 1, point: createTuple(0, y) };
	}
	else if (angle < topRight && angle > topLeft) { 
		//   y + r0 = 0
		var r = (-screenHeight / 2) / Math.sin(angle);
		var x = (screenWidth / 2) + r * Math.cos(angle);
		return { edge: 2, point: createTuple(x, 0) };
	}
	else if (angle > bottomRight && angle < bottomLeft) { 
		//   y + r0 = screenHeight
		var r = (screenHeight / 2) / Math.sin(angle);
		var x = (screenWidth / 2) + r * Math.cos(angle);
		return { edge: 4, point: createTuple(x, screenHeight) };
	}
	return{ edge: 0, point: createTuple(0, 0) };
}

function drawMask() { 
	var fovAngleLeft = state.player.rotation - toRadians(fov / 2);
	var fovAngleRight = state.player.rotation + toRadians(fov / 2);
	while (fovAngleRight < fovAngleLeft) { 
		// Just so we're nice and within the ranges
		fovAngleRight += toRadians(360);
	}
	var r = 100;
	var x1 = screenWidth / 2;
	var y1 = screenHeight / 2;
	
	// context.beginPath(); 
	// context.strokeStyle = "black";
	// context.moveTo(x1, y1);
	// context.lineTo(x1 + r * Math.cos(fovAngleLeft), y1 + r * Math.sin(fovAngleLeft));
	// context.stroke();

	// context.beginPath(); 
	// context.strokeStyle = "red";
	// context.moveTo(x1, y1);
	// context.lineTo(x1 + r * Math.cos(fovAngleRight), y1 + r * Math.sin(fovAngleRight));
	// context.stroke();
	// Calculate Large FOV Mask
	var mask = [createTuple(0, 0), createTuple(screenWidth, 0), createTuple(0, screenHeight), createTuple(screenWidth, screenHeight)];
	
	mask = mask.filter(function (x) {
		var angleDiff = angleDifference(angleBetween(x, createTuple(x1, y1)), 				state.player.rotation);
		return !(angleDiff > - toRadians(fov / 2) && angleDiff < toRadians(fov / 2));
	});
	mask.push(angleEdgePoint(fovAngleLeft).point);
	mask.push(angleEdgePoint(fovAngleRight).point);
	mask.sort(function (a, b) {
		return angleDifferencePos(angleBetween(a, createTuple(x1, y1)), state.player.rotation) <
		angleDifferencePos(angleBetween(b, createTuple(x1, y1)), state.player.rotation);
	});
	console.log(mask);
	mask.unshift(createTuple(x1, y1));
	drawUIPolygon(createPolygon(mask), "black");

	for (var i = 0; i < state.map.objects.length; i++) { 
		var polygonPoints = state.map.objects[i].polygon.points;
		var pointCount = polygonPoints.length;
		var workingPoints = [];
		for (var j = 0; j < pointCount; j++) {
			var angle = Math.atan2(polygonPoints[j].y - state.player.position.y,
				polygonPoints[j].x - state.player.position.x);
			var blocked = false;
			var angleDiff = angleDifference(angle, state.player.rotation)
			
		//	if (angleDiff > - toRadians(fov / 2) && angleDiff < toRadians(fov / 2)) {
				for (var k = 0; k < pointCount; k++) {
					// Check for segment intersection with every edge of polygon
					// a is (player -> point), b represents the edge
					if (segmentIntersect(state.player.position, polygonPoints[j],
						polygonPoints[k], polygonPoints[(k + 1) % pointCount])) {
						blocked = true;
					}
				}
				workingPoints.push({
					point: toCameraCoord(polygonPoints[j]),
					isBlocked: blocked,
					angle: angle
				});
			//}	
		}
		workingPoints.sort(function (a, b) {
			return angleDifference(a.angle, state.player.rotation) >
				angleDifference(b.angle, state.player.rotation);
		});
		var maskPolygon = [];
		var edgePoint;
		for (var j = 0; j < workingPoints.length; j++) { 
			var pointLoc = workingPoints[j].point;
			if (!workingPoints[j].isBlocked) {
				context.beginPath(); 
				context.strokeStyle = "blue";

				if (j == 0 || j == workingPoints.length - 1) {
					context.strokeStyle = "green";
				}
			
				context.moveTo(x1, y1);
				context.lineTo(pointLoc.x, pointLoc.y);
				context.stroke();
			}	
			if (j == 0) {
				edgePoint = rayEdgePoint(pointLoc);
				maskPolygon.push(edgePoint.point);
				maskPolygon.push(pointLoc);
			}
			else if (j == workingPoints.length - 1) {
				var otherEdgePoint = rayEdgePoint(pointLoc);
				maskPolygon.push(pointLoc);
				maskPolygon.push(otherEdgePoint.point);
				if (otherEdgePoint.edge != edgePoint.edge) { 
					switch (otherEdgePoint.edge + edgePoint.edge) { 
						case 1: // Right + Left
							var avgY = (edgePoint.y + otherEdgePoint.y) / 2;
							if (state.player.position.y > avgY) {
								// Player is Above
								maskPolygon.push(screenPoints.bl);
								maskPolygon.push(screenPoints.br);
							}
							else { 
								maskPolygon.push(screenPoints.tr);
								maskPolygon.push(screenPoints.tl);
							}
							break;	
						case 2: // Top + Right
							maskPolygon.push(screenPoints.tr);
							break;
						case 3: // Top + Left
							maskPolygon.push(screenPoints.tl);
							break;
						case 4: // Bottom + Right
							maskPolygon.push(screenPoints.br);
							break;
						case 5: // Bottom + Left
							maskPolygon.push(screenPoints.bl);
							break;	
						case 6: // Top and Bottom
							var avgX = (edgePoint.x + otherEdgePoint.x) / 2;
							if (state.player.position.x > avgX) {
								// Player is Right of object
								maskPolygon.push(screenPoints.tl);
								maskPolygon.push(screenPoints.bl);
							}
							else { 
								maskPolygon.push(screenPoints.br);
								maskPolygon.push(screenPoints.tr);
							}
							break;	
					}
				}
			}
			else if (!workingPoints[j].isBlocked) { 
				maskPolygon.push(pointLoc);
			}
		}
		if (maskPolygon.length > 0) {
			drawUIPolygon(createPolygon(maskPolygon), "black");
		}
	}
}

function drawState() { 
	drawMap(state.map);
	drawPlayer(state.player);
	drawOtherPlayers();
	drawMask();
	drawUI();
	var mousePosWorld = toWorldCoord(mouseState.position);
	state.player.rotation = Math.atan2(mousePosWorld.y - state.player.position.y,
		mousePosWorld.x - state.player.position.x);
	
	var thisFrameTime = (thisLoop = new Date) - lastLoop;
	frameTime += (thisFrameTime - frameTime) / fpsFilterStrength;
	lastLoop = thisLoop;
}

function draw() { 
	screenWidth = window.innerWidth;
	screenHeight = window.innerHeight;
	context.canvas.width = screenWidth;
	context.canvas.height = screenHeight;
	screenPoints = {
		tl: createTuple(0, 0),
		tr: createTuple(screenWidth, 0),
		bl: createTuple(0, screenHeight),
		br: createTuple(screenWidth, screenHeight)
	};
	drawState();
}