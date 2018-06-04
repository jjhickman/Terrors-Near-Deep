var gl = null; //our OpenGL handler

var GC = {};   //the graphics context

//initialize the graphics context variables
GC.shaderProgram = null;          //our GLSL program

////Shader Programs
GC.SBShaderProgram = null;
GC.shipshaderProgram= null;
GC.headshaderProgram = null;
GC.tentshaderProgram = null;
GC.perspectiveMatrix = null;      //the Perspective matrix
GC.mvMatrix = null;               //the ModelView matrix
GC.mvMatrixStack = [];            //the ModelView matrix stack
GC.mouseDown = null;              //boolean check for mouseDown
GC.width = 1080;                   //render area width
GC.height = 640;                 //render area height
GC.texBuffer = null;
GC.texAttribute = null;

// meshes 
GC.lighthouseMesh = null;
GC.skyBoxMesh = null;
GC.shipMesh = null;
GC.headMesh = null;
GC.tentacleMesh = null;

// timing and animation variables
GC.moveTent = 0.0;
GC.moveDir = 0.0;
GC.moveShip = 0.0;
GC.moveShipDir = 0.0;
GC.rock = 0.0;
GC.rockDir = 0.0;

var camera = new ArcBall();              //create a new arcball camera
camera.setBounds(GC.width,GC.height);    //initialize camera with screen dimensions

// demo constructor
function demo(canvasName) {
	this.canvasName = canvasName;

	// assign meshes from mesh array for skybox and lighthouse
	GC.lighthouseMesh = GC.meshes["lighthouse.obj"];
	GC.skyBoxMesh = GC.meshes["skybox.obj"];
	GC.shipMesh = GC.meshes["ship.obj"];
	GC.headMesh = GC.meshes["head.obj"];
	GC.tentacleMesh = GC.meshes["tentacles.obj"];
}

//initialize webgl, populate all buffers, load shader programs, and start drawing
demo.prototype.init = function(){
	this.canvas = document.getElementById(this.canvasName);
	this.canvas.width = GC.width;
	this.canvas.height = GC.height;

	console.log("WEBGL INITIATED");
	//Here we check to see if WebGL is supported 
	this.initWebGL(this.canvas);

	gl.clearColor(0.0,0.0,0.0,1.0);     //background to black
	gl.clearDepth(1.0);                 //set depth to yon plane
	gl.enable(gl.DEPTH_TEST);           //enable depth test
	gl.depthFunc(gl.LEQUAL);            //change depth test to use LEQUAL

	//set mouse event callbacks
	this.setMouseEventCallbacks();
	//set keyboard event callbacks
	this.setKeyboardEventCallbacks();
	//Get opengl derivative extension -- enables using fwidth in shader
	gl.getExtension("OES_standard_derivatives");

	//init the shader programs
	this.initShaders();
	console.log("SHADERS INITIATED");
	// build geometric buffers for skybox mesh

	this.initGeometryBuffers(GC.skyBoxMesh);
	console.log("SKYBOX GEOMETRY LOADED");
	// initialize skybox cubemap with box textures from source images
	this.initCubeMap();

	// initialize geometric lighthouse buffers
	this.initGeometryBuffers(GC.lighthouseMesh);
	console.log("LIGHTHOUSE GEOMETRY LOADED");
	// initialize geometric sea monster head buffers
	this.initGeometryBuffers(GC.headMesh);
	console.log("MONSTER HEAD GEOMETRY LOADED");
	// initialize geometric sea monster tentacle buffers
	this.initGeometryBuffers(GC.tentacleMesh);
	console.log("TENTACLE GEOMETRY LOADED");
	// initialize geometric ship buffers
	this.initGeometryBuffers(GC.shipMesh);
	console.log("SHIP GEOMETRY LOADED");

	// begin drawing skybox and lighthouse
	drawScene();
}


// animations for objects in water (ship, monster parts)
function move(){
	// animate tentacles
	if (GC.moveTent <= -15.0) GC.moveDir = 0;
	else if (GC.moveTent >= 15.0) GC.moveDir = 1;
	if (!GC.moveDir) GC.moveTent += 0.1;		
	else GC.moveTent -= 0.1;			
	
	// animate water bob for ship and monster
	if (GC.moveShip <= -2.5) GC.moveShipDir = 0;
	else if (GC.moveShip >= 2.5) GC.moveShipDir = 1;
	if (!GC.moveShipDir) GC.moveShip += 0.02;		
	else GC.moveShip -= 0.02;			
	
	// animate water rocking for ship
	if (GC.rock <= -5.0) GC.rockDir = 0;
	else if(GC.rock >= 5.0) GC.rockDir = 1;
	if(GC.rockDir == 0) GC.rock += 0.03;
	else GC.rock -= 0.03;
		
	// does magic
	requestAnimationFrame(demo.prototype.MainLoop);
}

demo.prototype.MainLoop = function(){
	// just keep rendering
	drawScene();
	move();
}

demo.prototype.setMouseEventCallbacks = function(){
	//-------- set callback functions
	this.canvas.onmousedown = this.mouseDown;
	this.canvas.onmousewheel = this.mouseWheel;

	//--Why set these to callbacks for the document object?
	document.onmouseup = this.mouseUp;          
	document.onmousemove = this.mouseMove;

	//--touch event callbacks
	this.canvas.ontouchstart = this.touchDown;
	this.canvas.ontouchend = this.touchUp;
	this.canvas.ontouchmove = this.touchMove;
	//-------- end set callback functions
}

demo.prototype.setKeyboardEventCallbacks = function(){
	//--Why set these to callbacks for the document object?
	document.onkeydown = this.keyDown;          
}

//initialize the shaders and grab the shader variable attributes
demo.prototype.initShaders = function(){

	/* SKYBOX SHADERS*/
	var SBFrag = this.getShader("SBfrag");
	var SBVert = this.getShader("SBvert");
	// compile shader
	this.SBShaderProgram = gl.createProgram();
	gl.attachShader(this.SBShaderProgram, SBVert);
	gl.attachShader(this.SBShaderProgram, SBFrag);
	gl.linkProgram(this.SBShaderProgram);

	if(!gl.getProgramParameter(this.SBShaderProgram, gl.LINK_STATUS)){
		console.log(gl.getProgramInfoLog(this.SBShaderProgram));
		console.log("unable to init skybox shader program");
	}

	gl.useProgram(this.SBShaderProgram);
	// pass attributes and uniforms to skybox shader
	GC.SBVertexPositionAttribute = gl.getAttribLocation(this.SBShaderProgram, "vPos");
	gl.enableVertexAttribArray(GC.SBVertexPositionAttribute);
	// pass camera location to shader
	GC.cameraLocation = gl.getUniformLocation(this.SBShaderProgram, "u_camPos");
	gl.activeTexture(gl.TEXTURE0);
	gl.uniform1i(gl.getUniformLocation(this.SBShaderProgram, "uCubeMap"), 0);
	GC.SBShaderProgram = this.SBShaderProgram;


	/* LIGHTHOUSE SHADERS */
	var lighthousefrag = this.getShader("FragmentShader1");
	var lighthousevert = this.getShader("VertexShader1");
	//Compile shader
	this.shaderProgram = gl.createProgram();
	gl.attachShader(this.shaderProgram, lighthousevert);
	gl.attachShader(this.shaderProgram, lighthousefrag);
	gl.linkProgram(this.shaderProgram);

	if(!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)){
		console.log(gl.getProgramInfoLog(this.shaderProgram));
		console.log("unable to init lighthouse shader program");
	}

	gl.useProgram(this.shaderProgram);
	// pass attributes for environment-mapped lighthouse
	GC.lighthouseVertexPositionAttribute = gl.getAttribLocation(this.shaderProgram, "vPos");
	gl.enableVertexAttribArray(GC.lighthouseVertexPositionAttribute);
	GC.lighthouseVertexNormalAttribute = gl.getAttribLocation(this.shaderProgram, "norms");
	gl.enableVertexAttribArray(GC.lighthouseVertexNormalAttribute);
	GC.cameraLocation = gl.getUniformLocation(this.shaderProgram, "u_camPos");
	GC.shaderProgram = this.shaderProgram;


	/* MONSTER HEAD SHADERS */
	var headfrag = this.getShader("FragmentShader3");
	var headvert = this.getShader("VertexShader3");

	//Compile shader
	this.headshaderProgram = gl.createProgram();
	gl.attachShader(this.headshaderProgram, headvert);
	gl.attachShader(this.headshaderProgram, headfrag);
	gl.linkProgram(this.headshaderProgram);

	if(!gl.getProgramParameter(this.headshaderProgram, gl.LINK_STATUS)){
		console.log(gl.getProgramInfoLog(this.headshaderProgram));
		console.log("unable to init sea monster head shader program");
	}

	gl.useProgram(this.headshaderProgram);
	// pass attributes for environment-mapped lighthouse
	headVertexPositionAttribute = gl.getAttribLocation(this.headshaderProgram, "vPos");
	gl.enableVertexAttribArray(headVertexPositionAttribute);
	GC.headVertexNormalAttribute = gl.getAttribLocation(this.headshaderProgram, "norms");
	gl.enableVertexAttribArray(GC.headVertexNormalAttribute);
	GC.cameraLocation = gl.getUniformLocation(this.headshaderProgram, "u_camPos");
	gl.activeTexture(gl.TEXTURE0);
	gl.uniform1i(gl.getUniformLocation(this.headshaderProgram, "uCubeMap"), 0);
	GC.headshaderProgram = this.headshaderProgram;


	/* MONSTER TENTACLE SHADERS */
	var tentfrag = this.getShader("FragmentShader4");
	var tentvert = this.getShader("VertexShader4");
	//Compile shader
	this.tentshaderProgram = gl.createProgram();
	gl.attachShader(this.tentshaderProgram, tentvert);
	gl.attachShader(this.tentshaderProgram, tentfrag);
	gl.linkProgram(this.tentshaderProgram);

	if(!gl.getProgramParameter(this.tentshaderProgram, gl.LINK_STATUS)){
		console.log(gl.getProgramInfoLog(this.tentshaderProgram));
		console.log("unable to init sea monster shader program");
	}

	gl.useProgram(this.monstertentshaderProgram);
	// pass attributes for environment-mapped lighthouse
	GC.tentVertexPositionAttribute = gl.getAttribLocation(this.tentshaderProgram, "vPos");
	gl.enableVertexAttribArray(GC.tentVertexPositionAttribute);
	GC.tentVertexNormalAttribute = gl.getAttribLocation(this.tentshaderProgram, "norms");
	gl.enableVertexAttribArray(GC.tentVertexNormalAttribute);
	GC.cameraLocation = gl.getUniformLocation(this.tentshaderProgram, "u_camPos");
	gl.activeTexture(gl.TEXTURE0);
	gl.uniform1i(gl.getUniformLocation(this.tentshaderProgram, "uCubeMap"), 0);
	GC.tentshaderProgram = this.tentshaderProgram;


	/* SHIP SHADERS*/
	var shipfrag = this.getShader("FragmentShader2");
	var shipvert = this.getShader("VertexShader2");
	//Compile shader
	this.shipshaderProgram = gl.createProgram();
	gl.attachShader(this.shipshaderProgram, shipvert);
	gl.attachShader(this.shipshaderProgram, shipfrag);
	gl.linkProgram(this.shipshaderProgram);

	if(!gl.getProgramParameter(this.shipshaderProgram, gl.LINK_STATUS)){
		console.log(gl.getProgramInfoLog(this.shipshaderProgram));
		console.log("unable to init lighthouse shader program");
	}

	gl.useProgram(this.shipshaderProgram);
	// pass attributes for environment-mapped lighthouse
	GC.shipVertexPositionAttribute = gl.getAttribLocation(this.shipshaderProgram, "vPos");
	gl.enableVertexAttribArray(GC.shipVertexPositionAttribute);
	GC.shipVertexNormalAttribute = gl.getAttribLocation(this.shipshaderProgram, "norms");
	gl.enableVertexAttribArray(GC.shipVertexNormalAttribute);
	gl.texAttribute = gl.getAttribLocation(this.shipshaderProgram, "tex");
	gl.enableVertexAttribArray(GC.texAttribute);
	GC.cameraLocation = gl.getUniformLocation(this.shipshaderProgram, "u_camPos");
	GC.shipshaderProgram = this.shipshaderProgram;
}


//Initialize all values and buffers associated with the cubemap that will be used
demo.prototype.initCubeMap = function(){

	// initialize texture parameters for cubemap
	GC.cubemapTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, GC.cubemapTexture);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	// texture images to define skybox
	var urls = [
		"hw_lagoon/lagoon_rt.png",
		"hw_lagoon/lagoon_lf.png",
		"hw_lagoon/lagoon_up.png",
		"hw_lagoon/lagoon_dn.png",
		"hw_lagoon/lagoon_bk.png",
		"hw_lagoon/lagoon_ft.png"];

	var sides = [
		gl.TEXTURE_CUBE_MAP_POSITIVE_X,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
		gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
		gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]

			// bind each images and draw to skybox
			for (var i = 0; i < 6; i++){
				var img = new Image();
				var side = sides[i];
				img.onload = function(cubemapTexture, urls, img, side){
					return function(){
						gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubemapTexture);
						gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
						gl.texImage2D(side, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
						drawScene();
					}
				} (GC.cubemapTexture, urls, img, side)
				img.src = urls[i];
			}
}

//initialize the buffers for drawing and the edge highlights
demo.prototype.initGeometryBuffers = function(mesh){
	var m = mesh.model;  
	var verts = []; //array to hold vertices laid out according to indices
	var bary = [];  //array of 1s and 0s passed to GLSL to draw wireframe
	var norm = [];
	var min = [90000,90000,90000];    //used for bounding box calculations
	var max = [-90000,-90000,-90000]; //used for bounding box calculations

	// Loop through the indices array (triangles)
	m.indices.forEach(function(d,i){
			//grab the x,y,z values for the current vertex
			vx = parseFloat(m.vertices[d*3]);
			vy = parseFloat(m.vertices[d*3+1]);
			vz = parseFloat(m.vertices[d*3+2]);

			nx = parseFloat(m.vertnorm[d*3]);
			ny = parseFloat(m.vertnorm[d*3+1]);
			nz = parseFloat(m.vertnorm[d*3+2]);


			//add this vertex to our array
			verts.push(vx,vy,vz);
			norm.push(nx, ny, nz);

			//check to see if we need to update the min/max
			if(vx < min[0]) min[0] = vx;
			if(vy < min[1]) min[1] = vy;
			if(vz < min[2]) min[2] = vz;
			if(vx > max[0]) max[0] = vx;
			if(vy > max[1]) max[1] = vy;
			if(vz > max[2]) max[2] = vz;

			//What does this do?
			if(i%3 == 0){
				bary.push(1,0,0);
			} else if(i % 3 == 1){
				bary.push(0,1,0);
			} else if(i % 3 == 2){
				bary.push(0,0,1);
			}
	});

	//set the min/max variables
	m.minX = min[0]; m.minY = min[1]; m.minZ = min[2];
	m.maxX = max[0]; m.maxY = max[1]; m.maxZ = max[2];

	//calculate the largest range in x,y,z
	var s = Math.max( Math.abs(min[0]-max[0]),
			Math.abs(min[1]-max[1]),
			Math.abs(min[2]-max[2]));

	//calculate the distance to place camera from model
	var d = (s/2.0)/Math.tan(45/2.0);

	camera.position[0] = -100.0;
	camera.position[1] = -20.0;
	camera.position[2] = -110.0;

	//orient the camera to look at the center of the lighthouse/box
	camera.lookAt = [0.0,-35.0,0.0];

	m.vertexBuffer = gl.createBuffer();
	//bind the data we placed in the verts array to an OpenGL buffer
	gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	m.normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, m.normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norm), gl.STATIC_DRAW);

}

//the initial drawing function that starts the chain
function drawScene(){

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	drawSkybox(GC);
	drawlighthouse(GC);
	drawMonsterHead(GC);
	drawMonsterTentacles(GC);
	drawShip(GC);
}

//initialize webgl
demo.prototype.initWebGL = function(){
	gl = null;
	//
	try {
		gl = this.canvas.getContext("experimental-webgl");
	}
	catch(e) {
		//pass through
	}

	// If we don't have a GL context, give up now
	if (!gl) {
		alert("Unable to initialize WebGL. Your browser may not support it.");
	}
}

//compile shader located within a script tag
demo.prototype.getShader = function(id){
	var shaderScript, theSource, currentChild, shader;

	shaderScript = document.getElementById(id);
	if(!shaderScript){
		return null;
	}

	//init the source code variable
	theSource = "";

	//begin reading the shader source from the beginning
	currentChild = shaderScript.firstChild;

	//read the shader source as text
	while(currentChild){
		if(currentChild.nodeType == currentChild.TEXT_NODE){
			theSource += currentChild.textContent;
		}
		currentChild = currentChild.nextSibling;
	}

	//check type of shader to give openGL the correct hint
	if(shaderScript.type == "x-shader/x-fragment"){
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if(shaderScript.type == "x-shader/x-vertex"){
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	//add the shader source code to the created shader object
	gl.shaderSource(shader, theSource);

	//compile the shader
	gl.compileShader(shader);

	if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
		console.log("error compiling shaders -- " + gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}


//handle mousedown
demo.prototype.mouseDown = function(event){
	GC.mouseDown = true;

	//update the base rotation so model doesn't jerk around upon new clicks
	camera.LastRot = camera.ThisRot;
	camera.click(event.clientX,event.clientY);

	return false;
}

//handle mouseup
demo.prototype.mouseUp = function(event){
	GC.mouseDown = false;
	return false;
}

//handle mouse movement
demo.prototype.mouseMove = function(event){
	if(GC.mouseDown == true){
		X = event.clientX;
		Y = event.clientY;

		//call camera function for handling mouse movement
		camera.move(X,Y)

			drawScene();
	}
	return false;
}

//handle mouse scroll event
demo.prototype.mouseWheel = function(event){
	camera.zoomScale -= event.wheelDeltaY*0.0005;
	camera.Transform.elements[3][3] = camera.zoomScale;

	drawScene();
	return false;
}


//--------- handle keyboard events
demo.prototype.keyDown = function(e){
	camera.LastRot = camera.ThisRot;
	var center = {x: GC.width/2, y:GC.height/2}; 
	var delta = 8;

	switch(e.keyCode){
		case 37: //Left arrow
			camera.click(center.x, center.y);
			camera.move(center.x - delta, center.y);
			break;
		case 38: //Up arrow
			camera.click(center.x, center.y);
			camera.move(center.x, center.y - delta);
			break;
		case 39: //Right arrow
			camera.click(center.x, center.y);
			camera.move(center.x + delta, center.y);
			break;
		case 40: //Down arrow
			camera.click(center.x, center.y);
			camera.move(center.x, center.y + delta);
			break;
	}

	//redraw
	drawScene();
}


// --------- handle touch events
demo.prototype.touchDown = function(event){
	GC.mouseDown = true;

	//update the base rotation so model doesn't jerk around upon new clicks
	camera.LastRot = camera.ThisRot;

	//tell the camera where the touch event happened
	camera.click(event.changedTouches[0].pageX,event.changedTouches[0].pageY);

	return false;
}

//handle touchEnd
demo.prototype.touchUp = function(event){
	GC.mouseDown = false;
	return false;
}

//handle touch movement
demo.prototype.touchMove = function(event){
	if(GC.mouseDown == true){
		X = event.changedTouches[0].pageX;
		Y = event.changedTouches[0].pageY;

		//call camera function for handling mouse movement
		camera.move(X,Y)

			drawScene();
	}
	return false;
}
// --------- end handle touch events


