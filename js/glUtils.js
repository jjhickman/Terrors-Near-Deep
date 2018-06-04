//------- utility functions

// pass modelview and projection matrices to shaders
function setLighthouseMatrixUniforms(gContext) {
	var pUniform = gl.getUniformLocation(gContext.shaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(gContext.perspectiveMatrix.flatten()));

	var mvUniform = gl.getUniformLocation(gContext.shaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(gContext.mvMatrix.flatten()));

}

function setSkyboxMatrixUniforms(gContext) {

	var pUniformSB = gl.getUniformLocation(gContext.SBShaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniformSB, false, new Float32Array(gContext.perspectiveMatrix.flatten()));

	var mvUniformSB = gl.getUniformLocation(gContext.SBShaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniformSB, false, new Float32Array(gContext.mvMatrix.flatten()));

}

function setHeadMatrixUniforms(gContext) {

	var pUniformHead = gl.getUniformLocation(gContext.headshaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniformHead, false, new Float32Array(gContext.perspectiveMatrix.flatten()));

	var mvUniformHead = gl.getUniformLocation(gContext.headshaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniformHead, false, new Float32Array(gContext.mvMatrix.flatten()));

}

function setTentacleMatrixUniforms(gContext) {

	var pUniformTentacle = gl.getUniformLocation(gContext.tentshaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniformTentacle, false, new Float32Array(gContext.perspectiveMatrix.flatten()));

	var mvUniformTentacle = gl.getUniformLocation(gContext.tentshaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniformTentacle, false, new Float32Array(gContext.mvMatrix.flatten()));

}

function setShipMatrixUniforms(gContext) {

	var pUniformship = gl.getUniformLocation(gContext.shipshaderProgram, "uPMatrix");
	gl.uniformMatrix4fv(pUniformship, false, new Float32Array(gContext.perspectiveMatrix.flatten()));

	var mvUniformship = gl.getUniformLocation(gContext.shipshaderProgram, "uMVMatrix");
	gl.uniformMatrix4fv(mvUniformship, false, new Float32Array(gContext.mvMatrix.flatten()));

}


// similar to glLoadIdentity, only affects modelViewMatrix
function mvLoadIdentity(gContext) {GC
	gContext.mvMatrix = Matrix.I(4);
}

// similar to glMultMatrix, only affects modelViewMatrix
function mvMultMatrix(m,gContext) {
	gContext.mvMatrix = gContext.mvMatrix.x(m);
}

// similar to glTransform, only affects modelViewMatrix
function mvTranslate(v,gContext) {
	mvMultMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4(),gContext);
}

// similar to glPushMatrix, only affects modelViewMatrix stack
function mvPushMatrix(m,gContext) {
	if (m) {
		gContext.mvMatrixStack.push(m.dup());
		gContext.mvMatrix = m.dup();
	} else {
		gContext.mvMatrixStack.push(gContext.mvMatrix.dup());
	}
}

// similar to glPopMatrix, only affects modelViewMatrix stack
function mvPopMatrix(gContext) {
	if (!gContext.mvMatrixStack.length) {
		throw("Can't pop from an empty matrix stack.");
	}

	gContext.mvMatrix = gContext.mvMatrixStack.pop();
	return gContext.mvMatrix;
}


// similar to glRotate, only affects modelViewMatrix
function mvRotate(angle, v, gContext) {
	var inRadians = angle * Math.PI / 180.0;

	var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
	mvMultMatrix(m,gContext);
}
																					// gluLookAt
function makeLookAt(ex, ey, ez,
		cx, cy, cz,
		ux, uy, uz)
{
	var eye = $V([ex, ey, ez]);
	var center = $V([cx, cy, cz]);
	var up = $V([ux, uy, uz]);

	var mag;

	var z = eye.subtract(center).toUnitVector();
	var x = up.cross(z).toUnitVector();
	var y = z.cross(x).toUnitVector();

	var m = $M([[x.e(1), x.e(2), x.e(3), 0],
			[y.e(1), y.e(2), y.e(3), 0],
			[z.e(1), z.e(2), z.e(3), 0],
			[0, 0, 0, 1]]);

	var t = $M([[1, 0, 0, -ex],
			[0, 1, 0, -ey],
			[0, 0, 1, -ez],
			[0, 0, 0, 1]]);
	return m.x(t);
}


// glOrtho
function makeOrtho(left, right,
		bottom, top,
		znear, zfar)
{
	var tx = -(right+left)/(right-left);
	var ty = -(top+bottom)/(top-bottom);
	var tz = -(zfar+znear)/(zfar-znear);

	return $M([[2/(right-left), 0, 0, tx],
			[0, 2/(top-bottom), 0, ty],
			[0, 0, -2/(zfar-znear), tz],
			[0, 0, 0, 1]]);
}


// gluPerspective
function makePerspective(fovy, aspect, znear, zfar)
{
	var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
	var ymin = -ymax;
	var xmin = ymin * aspect;
	var xmax = ymax * aspect;

	return makeFrustum(xmin, xmax, ymin, ymax, znear, zfar);
}


// glFrustum
function makeFrustum(left, right,
		bottom, top,
		znear, zfar)
{
	var X = 2*znear/(right-left);
	var Y = 2*znear/(top-bottom);
	var A = (right+left)/(right-left);
	var B = (top+bottom)/(top-bottom);
	var C = -(zfar+znear)/(zfar-znear);
	var D = -2*zfar*znear/(zfar-znear);

	return $M([[X, 0, A, 0],
			[0, Y, B, 0],
			[0, 0, C, D],
			[0, 0, -1, 0]]);
}


// glOrtho
function makeOrtho(left, right, bottom, top, znear, zfar)
{
	var tx = - (right + left) / (right - left);
	var ty = - (top + bottom) / (top - bottom);
	var tz = - (zfar + znear) / (zfar - znear);

	return $M([[2 / (right - left), 0, 0, tx],
			[0, 2 / (top - bottom), 0, ty],
			[0, 0, -2 / (zfar - znear), tz],
			[0, 0, 0, 1]]);
}

// scaling
function Scale(num, GC) {
	var m = Matrix.I(4).x(num);
	m.elements[3][3] = 1.0;
	mvMultMatrix(m, GC);
}

// convert degree to radians for Math library
function toRadians (angle) {
	return angle * (Math.PI / 180);
}
