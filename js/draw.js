// commence drawing objects for scene


function drawSkybox(GC){

	gl.useProgram(GC.SBShaderProgram);

	var m = GC.skyBoxMesh.model;

	//setup perspective and lookat matrices
	GC.perspectiveMatrix = makePerspective(85, GC.width/GC.height, 0.1, Math.max(6000.0,m.maxZ));
	var lookAtMatrix = makeLookAt(camera.position[0],camera.position[1],camera.position[2], camera.lookAt[0],camera.lookAt[1],camera.lookAt[2], 0,1,0);

	//set initial camera lookat matrix
	mvLoadIdentity(GC);

	//multiply by our lookAt matrix
	mvMultMatrix(lookAtMatrix,GC);

	mvMultMatrix(camera.Transform,GC);//multiply by the transformation

	//passes modelview and projection matrices to the vertex shader
	//setMatrixUniforms(GC);
	setSkyboxMatrixUniforms(GC);
	//pass the vertex buffer to the shader
	gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer);
	gl.vertexAttribPointer(GC.SBVertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	// pass camera position to vertex shader
	gl.uniform3f (GC.cameraLocation, camera.position[0], camera.position[1], camera.position[2]); 

	//draw everything for skybox
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, GC.cubemapTexture);
	gl.uniform1i(gl.getUniformLocation(GC.SBShaderProgram, "uCubeMap"), 0);
	gl.drawArrays(gl.TRIANGLES,0,m.indices.length);

}


function drawlighthouse(GC){

	gl.useProgram(GC.shaderProgram);

	var m = GC.lighthouseMesh.model;

	//setup perspective and lookat matrices
	GC.perspectiveMatrix = makePerspective(85, GC.width/GC.height, 0.1, Math.max(2000.0,m.maxZ));
	
	var lookAtMatrix = makeLookAt(camera.position[0],camera.position[1],camera.position[2], camera.lookAt[0],camera.lookAt[1],camera.lookAt[2],0,1,0);

	//set initial camera lookat matrix
	mvLoadIdentity(GC);

	//multiply by our lookAt matrix
	mvMultMatrix(lookAtMatrix,GC);

	mvMultMatrix(camera.Transform,GC);//multiply by the transformation

	mvTranslate([-145, -115, 145], GC);
	Scale(0.75 , GC);
	
	//passes modelview and projection matrices to the vertex shader
	setLighthouseMatrixUniforms(GC);
	//pass the vertex buffer to the shader
	gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer);
	gl.vertexAttribPointer(GC.lighthouseVertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

	//pass the normal buffer to teh shader
	gl.bindBuffer(gl.ARRAY_BUFFER, m.normalBuffer);
	gl.vertexAttribPointer(GC.lighthouseVertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

	//Pass camera position to vertex shader
	gl.uniform3f (GC.cameraLocation, camera.position[0], camera.position[1], camera.position[2]); 
	
	//draw everything for lighthouse
	gl.drawArrays(gl.TRIANGLES,0,m.indices.length);

}

function drawMonsterHead(GC){

	gl.useProgram(GC.headshaderProgram);

	var m = GC.headMesh.model;

	//setup perspective and lookat matrices
	GC.perspectiveMatrix = makePerspective(85, GC.width/GC.height, 0.1, Math.max(2000.0,m.maxZ));
	var lookAtMatrix = makeLookAt(camera.position[0],camera.position[1],camera.position[2], camera.lookAt[0],camera.lookAt[1],camera.lookAt[2], 0,1,0);

	//set initial camera lookat matrix
	mvLoadIdentity(GC);

	//multiply by our lookAt matrix
	mvMultMatrix(lookAtMatrix,GC);

	mvMultMatrix(camera.Transform,GC);//multiply by the transformation

	Scale(2.0, GC);
	mvRotate(90, [-1, 0, 0], GC);
	mvTranslate([-30.0, -80.0, (-93.0+GC.moveShip)], GC);
	
	//passes modelview and projection matrices to the vertex shader
	setHeadMatrixUniforms(GC);

	//pass the vertex buffer to the shader
	gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer);
	gl.vertexAttribPointer(GC.headVertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, m.normalBuffer);
	gl.vertexAttribPointer(GC.headVertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);


	// pass camera position to vertex shader
	gl.uniform3f (GC.cameraLocation, camera.position[0], camera.position[1], camera.position[2]); 

	//draw everything for skybox
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, GC.cubemapTexture);
	gl.uniform1i(gl.getUniformLocation(GC.headshaderProgram, "uCubeMap"), 0);
	gl.drawArrays(gl.TRIANGLES,0,m.indices.length);

}

function drawMonsterTentacles(GC){

	gl.useProgram(GC.tentshaderProgram);

	var m = GC.tentacleMesh.model;

	//setup perspective and lookat matrices
	GC.perspectiveMatrix = makePerspective(85, GC.width/GC.height, 0.1, Math.max(2000.0,m.maxZ));
	var lookAtMatrix = makeLookAt(camera.position[0],camera.position[1],camera.position[2], camera.lookAt[0],camera.lookAt[1],camera.lookAt[2], 0,1,0);

	//set initial camera lookat matrix
	mvLoadIdentity(GC);

	//multiply by our lookAt matrix
	mvMultMatrix(lookAtMatrix,GC);

	mvMultMatrix(camera.Transform,GC);//multiply by the transformation

	Scale(0.75, GC);
	mvRotate(90, [-1, 0, 0], GC);
	mvRotate(90, [0, 0, 1], GC);
	mvTranslate([(-20.0 + GC.moveTent), 110.0, (-132.0 + GC.moveShip)], GC);

	//passes modelview and projection matrices to the vertex shader
	setTentacleMatrixUniforms(GC);

	//pass the vertex buffer to the shader
	gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer);
	gl.vertexAttribPointer(GC.tentVertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, m.normalBuffer);
	gl.vertexAttribPointer(GC.tentVertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);


	// pass camera position to vertex shader
	gl.uniform3f (GC.cameraLocation, camera.position[0], camera.position[1], camera.position[2]); 

	//draw everything for skybox
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, GC.cubemapTexture);
	gl.uniform1i(gl.getUniformLocation(GC.tentshaderProgram, "uCubeMap"), 0);
	gl.drawArrays(gl.TRIANGLES,0,m.indices.length);
}

function drawShip(GC){

	gl.useProgram(GC.shipshaderProgram);

	var m = GC.shipMesh.model;

	//setup perspective and lookat matrices
	GC.perspectiveMatrix = makePerspective(85, GC.width/GC.height, 0.1, Math.max(2000.0,m.maxZ));
	var lookAtMatrix = makeLookAt(camera.position[0],camera.position[1],camera.position[2], camera.lookAt[0],camera.lookAt[1],camera.lookAt[2], 0,1,0);

	//set initial camera lookat matrix
	mvLoadIdentity(GC);

	//multiply by our lookAt matrix
	mvMultMatrix(lookAtMatrix,GC);

	mvMultMatrix(camera.Transform,GC);//multiply by the transformation
	mvTranslate([10,(-130 + GC.moveShip), 30], GC);
	mvRotate(GC.rock, [0, 0, 1], GC);

	Scale(4.0, GC);	
	//passes modelview and projection matrices to the vertex shader
	setShipMatrixUniforms(GC);

	//pass the vertex buffer to the shader
	gl.bindBuffer(gl.ARRAY_BUFFER, m.vertexBuffer);
	gl.vertexAttribPointer(GC.shipVertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, m.normalBuffer);
	gl.vertexAttribPointer(GC.shipVertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

	// pass camera position to vertex shader
	gl.uniform3f (GC.cameraLocation, camera.position[0], camera.position[1], camera.position[2]); 

	gl.drawArrays(gl.TRIANGLES,0,m.indices.length);
}

