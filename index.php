<!----AUTHORED AND OWNED JOSHUA HICKMAN SPRING 2018 ---->
<!----COSC456 FINAL PROJECT ---->


<html>
<head>
<meta charset="utf-8">
<title>Hickman Final Project</title>
<!-- include all javascript source files -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<script type="text/javascript" src="js/sylvester.js"></script>
<script type="text/javascript" src="js/math.js"></script>
<script type="text/javascript" src="js/glUtils.js"></script>
<script type="text/javascript" src="js/meshLoader.js"></script>
<script type="text/javascript" src="js/arcball.js"></script>
<script type="text/javascript" src="js/demo.js"></script>
<script type="text/javascript" src="js/draw.js"></script>
<script type="text/javascript" src="js/main.js"></script>
</head>
<body>
<div class="wrapper" style="margin:0 auto; width: 960px; height: 540px; position: fixed; top:2px; left:2px;">
	<canvas id="glcanvas">canvas not supported</canvas>
	<div style="border: none; position: fixed; top:2px ;left: 1085px; width:280px; height:540px;" align="left">
		<h2>Terrors Near & Deep</h2>
		
		<h3>Joshua Hickman</h3>
		<h3>FINAL PROJECT</h3>
		<h3>Please allow a moment for the scene to render (full screen is best)...</h3>
		<h3> Turn on speakers to hear scene.</h3>
		<h4>OBJECTS (EFFECTS):</h4>
		<ul>
			<li>LIGHTHOUSE (fog shading)</li>
			<li>SHIP (fog shading, animation, toon shading)</li>
			<li>MONSTER HEAD (fog shading, animation, reflect/environment mapping)</li>
			<li>MONSTER TENTACLES (fog shading, animation, reflect/environment mapping)</li>
			<li>SKYBOX (fog shading, texture mapping)</li>
		</ul>
	<audio controls id="waves" autoplay loop>
		<source src="waves.wav" type="audio/wav">
		  Your browser does not support the audio element.
	</audio>
	<audio controls id="monster" autoplay loop>
		<source src="monsterbreathe.mp3" type="audio/wav">
		  Your browser does not support the audio element.
	</audio>		
	<script>
		var audio = document.getElementById("waves");
		audio.volume = 0.3;
	</script>
	<script>
		var audio = document.getElementById("monster");
		audio.volume = 0.2;
	</script>
	</div>
</div>
<!---- LIGHTHOUSE (FOG SHADING + PHONG SHADING)---->
<script id="FragmentShader1" type="x-shader/x-fragment">
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision mediump float;
varying vec3 Normal;
varying vec3 v_Pos;
varying vec3 camPos;
varying mat4 MV;
varying mat4 P;
varying float fogz;

void main(void){
	vec3 Ka = vec3(0.0, 0.0, 0.0225);
	vec3 Kd = vec3(0.5038, 0.17048, 0.0428);
	vec3 Ks = vec3(0.255777, 0.136622, 0.085014);
	vec3 Il = vec3(0.2, 0.2, 0.5);
	float shine = 50.5;
	float LOG2 = 1.442695;
	float fogDensity;

	vec3 ambient, diffuse, specular;

	if(v_Pos.y < -10.0) discard;
	// transform position to eye space
	vec4 eye = MV * vec4(v_Pos, 1.0);
	if(v_Pos.y < 42.0) fogDensity = clamp((1.0 - (abs(v_Pos.y)/(abs(v_Pos.y) + 0.15))), 0.0, 1.0);
	else fogDensity = 0.0035;
	float fogFactor = clamp(exp2(-fogDensity * fogDensity * fogz * fogz * LOG2), 0.0, 1.0);
	vec4 fogColor = vec4(0.2, 0.2, 0.3, 1.0);

	// get direction vectors
	vec3 N = normalize(vec3(MV * vec4(Normal, 0.0))); // normal direction 
	vec3 L = normalize(vec3(MV * vec4(200.0,160.0,-200.0,1.0) - eye));
	vec3 R = reflect(-L, N);	// reflect direction
	vec3 V = normalize(vec3(vec4(camPos,1.0) - eye));


	ambient = Ka * Il;
	diffuse = Kd * clamp(dot(L, N), 0.0, 1.0);
	specular = Ks * pow(clamp(dot(R,V), 0.0, 1.0), shine);

	vec4 color = vec4(ambient + diffuse/* + specular*/, 1.0);
	gl_FragColor = mix(fogColor, color, fogFactor);
}
</script>

<script id="VertexShader1" type="x-shader/x-vertex">
attribute vec3 vPos; //vertex position
attribute vec3 norms;	// per-vertex normal vectors

varying vec3 Normal;	//Normal to be sent to Fragment Shader
varying vec3 v_Pos;			// vertex position
varying vec3 camPos;		// camera position
varying mat4 MV;	// ModelView Matrix
varying mat4 P;		// projection View Matrix
varying float fogz;
uniform mat4 uMVMatrix; // modelviewmatrix
uniform mat4 uPMatrix; // projection matrix
uniform vec3 u_camPos;	// camera position

void main(void) {
	Normal = norms;
	MV = uMVMatrix;
	P = uPMatrix;
	camPos = u_camPos;
	v_Pos = vPos;
	gl_Position = uPMatrix * uMVMatrix * vec4(vPos, 1.0);
	fogz = length(gl_Position.xyz);
}
</script>

<!----SHIP (FOG SHADING + TEXTURE MAPPING  + PHONG SHADING) ---->
<script id="FragmentShader2" type="x-shader/x-fragment">
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision mediump float;
varying vec3 Normal;
varying vec3 v_Pos;
varying vec3 camPos;
varying mat4 MV;
varying mat4 P;
varying float fogz;
void main(void){
	float shine = 100.0;
	float LOG2 = 1.442695;

	// transform position to eye space
	vec4 eye = MV * vec4(v_Pos, 1.0);
	if(v_Pos.y < 0.0) discard;
	
	float fogDensity;
	if(v_Pos.y < 100.0) fogDensity = clamp((1.0 - (abs(v_Pos.y)/(abs(v_Pos.y) + 0.011))), 0.0, 1.0);
	else fogDensity = 0.1135;
	
	float fogFactor = clamp(exp2(-fogDensity*fogDensity*fogz*fogz*LOG2), 0.0, 1.0);
	vec4 fogColor = vec4(0.3, 0.3, 0.4, 1.0);

	vec3 N = normalize(vec3(MV * vec4(Normal, 0.0))); // normal direction 
	vec3 L = normalize(vec3(MV * vec4(200.0,160.0,-200.0,1.0) - eye));
	
	vec4 color;
	float intensity = clamp(dot(L, N), 0.0, 1.0);
	if(intensity > 0.95) color = vec4(0.8, 0.5, 0.6, 1.0);
	else if(intensity > 0.70) color = vec4(0.6, 0.3, 0.5, 1.0);
	else if(intensity > 0.5) color = vec4(0.4, 0.2, 0.3, 1.0);
	else if(intensity > 0.25) color = vec4(0.3, 0.2, 0.275, 1.0);
	else color = vec4(0.1, 0.05, 0.075, 1.0);
	
	gl_FragColor = mix(fogColor, color, fogFactor);
}
</script>

<script id="VertexShader2" type="x-shader/x-vertex">
attribute vec3 vPos; //vertex position
attribute vec3 norms;	// per-vertex normal vectors
attribute vec3 tex;
varying vec3 Normal;	//Normal to be sent to Fragment Shader
varying vec3 v_Pos;			// vertex position
varying vec3 camPos;		// camera position
varying mat4 MV;	// ModelView Matrix
varying mat4 P;		// projection View Matrix
varying float fogz;
uniform mat4 uMVMatrix; // modelviewmatrix
uniform mat4 uPMatrix; // projection matrix
uniform vec3 u_camPos;	// camera position

void main(void) {
	Normal = norms;
	MV = uMVMatrix;
	P = uPMatrix;
	camPos = u_camPos;
	v_Pos = vPos;
	gl_Position = uPMatrix * uMVMatrix * vec4(vPos, 1.0);
	fogz = length(gl_Position.xyz);
}
</script>

<!----SEA MONSTER HEAD(FOG SHADING/ENVIRONMENT MAPPING/PHONG SHADING) ---->
<script id="FragmentShader3" type="x-shader/x-fragment">
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision highp float;
varying vec3 Normal;
varying vec3 v_Pos;
varying vec3 camPos;
varying mat4 MV;
varying mat4 P;
varying float fogz;
uniform samplerCube uCubeMap;	

// helper function for environment mapping
mat4 inverse(in mat4 m){
	mat4 inv = mat4(0.0);
	mat4 imvp = mat4(0.0);

	inv[0][0] = m[1][1]*m[2][2]*m[3][3] - m[1][1]*m[3][2]*m[2][3] - 
		m[1][2]*m[2][1]*m[3][3] + m[1][2]*m[3][1]*m[2][3] +
		m[1][3]*m[2][1]*m[3][2] - m[1][3]*m[3][1]*m[2][2];
	inv[0][1] = -m[0][1]*m[2][2]*m[3][3] + m[0][1]*m[3][2]*m[2][3] + 
		m[0][2]*m[2][1]*m[3][3] - m[0][2]*m[3][1]*m[2][3] - 
		m[0][3]*m[2][1]*m[3][2] + m[0][3]*m[3][1]*m[2][2];
	inv[0][2] = m[0][1]*m[1][2]*m[3][3] - m[0][1]*m[3][2]*m[1][3] - 
		m[0][2]*m[1][1]*m[3][3] + m[0][2]*m[3][1]*m[1][3] + 
		m[0][3]*m[1][1]*m[3][2] - m[0][3]*m[3][1]*m[1][2];
	inv[0][3] = -m[0][1]*m[1][2]*m[2][3] + m[0][1]*m[2][2]*m[1][3] +
		m[0][2]*m[1][1]*m[2][3] - m[0][2]*m[2][1]*m[1][3] - 
		m[0][3]*m[1][1]*m[2][2] + m[0][3]*m[2][1]*m[1][2];
	inv[1][0] = -m[1][0]  * m[2][2] * m[3][3] + m[1][0]*m[3][2]*m[2][3] + 
		m[1][2]*m[2][0]*m[3][3] - m[1][2]*m[3][0]*m[2][3] - 
		m[1][3]*m[2][0]*m[3][2] + m[1][3]*m[3][0]*m[2][2];
	inv[1][1] = m[0][0]*m[2][2]*m[3][3] - m[0][0]*m[3][2]*m[2][3] - 
		m[0][2]*m[2][0]*m[3][3] + m[0][2]*m[3][0]*m[2][3] + 
		m[0][3]*m[2][0]*m[3][2] - m[0][3]*m[3][0]*m[2][2];
	inv[1][2] = -m[0][0]*m[1][2]*m[3][3] + m[0][0]*m[3][2]*m[1][3] + 
		m[0][2]*m[1][0]*m[3][3] - m[0][2]*m[3][0]*m[1][3] - 
		m[0][3]*m[1][0]*m[3][2] + m[0][3]*m[3][0]*m[1][2];
	inv[1][3] = m[0][0]*m[1][2]*m[2][3] - m[0][0]*m[2][2]*m[1][3] - 
		m[0][2]*m[1][0]*m[2][3] + m[0][2]*m[2][0]*m[1][3] + 
		m[0][3]*m[1][0]*m[2][2] - m[0][3]*m[2][0]*m[1][2];
	inv[2][0] = m[1][0]*m[2][1]*m[3][3] - m[1][0]*m[3][1]*m[2][3] - 
		m[1][1]*m[2][0]*m[3][3] + m[1][1]*m[3][0]*m[2][3] + 
		m[1][3]*m[2][0]*m[3][1] - m[1][3]*m[3][0]*m[2][1];
	inv[2][1] = -m[0][0]*m[2][1]*m[3][3] + m[0][0]*m[3][1]*m[2][3] + 
		m[0][1]*m[2][0]*m[3][3] - m[0][1]*m[3][0]*m[2][3] - 
		m[0][3]*m[2][0]*m[3][1] + m[0][3]*m[3][0]*m[2][1];
	inv[2][2] = m[0][0]*m[1][1]*m[3][3] - m[0][0]*m[3][1]*m[1][3] - 
		m[0][1]*m[1][0]*m[3][3] + m[0][1]*m[3][0]*m[1][3] + 
		m[0][3]*m[1][0]*m[3][1] - m[0][3]*m[3][0]*m[1][1];
	inv[2][3] = -m[0][0]*m[1][1]*m[2][3] + m[0][0]*m[2][1]*m[1][3] + 
		m[0][1]*m[1][0]*m[2][3] - m[0][1]*m[2][0]*m[1][3] - 
		m[0][3]*m[1][0]*m[2][1] + m[0][3]*m[2][0]*m[1][1];
	inv[3][0] = -m[1][0]*m[2][1]*m[3][2] + m[1][0]*m[3][1]*m[2][2] + 
		m[1][1]*m[2][0]*m[3][2] - m[1][1]*m[3][0]*m[2][2] - 
		m[1][2]*m[2][0]*m[3][1] + m[1][2]*m[3][0]*m[2][1];
	inv[3][1] = m[0][0]*m[2][1]*m[3][2] - m[0][0]*m[3][1]*m[2][2] - 
		m[0][1]*m[2][0]*m[3][2] + m[0][1]*m[3][0]*m[2][2] + 
		m[0][2]*m[2][0]*m[3][1] - m[0][2]*m[3][0]*m[2][1];
	inv[3][2] = -m[0][0]*m[1][1]*m[3][2] + m[0][0]*m[3][1]*m[1][2] + 
		m[0][1]*m[1][0]*m[3][2] - m[0][1]*m[3][0]*m[1][2] - 
		m[0][2]*m[1][0]*m[3][1] + m[0][2]*m[3][0]*m[1][1];
	inv[3][3] = m[0][0]*m[1][1]*m[2][2] - m[0][0]*m[2][1]*m[1][2] - 
		m[0][1]*m[1][0]*m[2][2] + m[0][1]*m[2][0]*m[1][2] + 
		m[0][2]*m[1][0]*m[2][1] - m[0][2]*m[2][0]*m[1][1];

	float det = m[0][0]*inv[0][0] + m[1][0]*inv[0][1] + m[2][0]*inv[0][2] + m[3][0] * inv[0][3];

	det = 1.0 / det;
	for(int i = 0; i < 4; i++){
		for(int j = 0; j < 4; j++){
			imvp[i][j] = inv[i][j] * det;
		}   	
	}
	return imvp;
}

void main(void){
	vec3 Ka = vec3(0.2, 0.5, 0.2);
	vec3 Ks = vec3(7.0, 7.0, 9.0);
	vec3 Il = vec3(0.3, 0.3, 0.5);
	float shine = 25.5;
	float LOG2 = 1.442695;

	if(v_Pos.x < 65.0 || v_Pos.z < 30.0) discard;
	
	// transform position to eye space
	vec4 eye = MV * vec4(v_Pos, 1.0);
	float fogDensity = clamp(abs(v_Pos.x / (v_Pos.x - 0.46) - 1.0), 0.0, 1.0);
	float fogFactor = clamp(exp2(-fogDensity*fogDensity*fogz*fogz*LOG2), 0.0, 1.0);
	vec4 fogColor = vec4(0.2, 0.2, 0.3, 1.0);

	vec3 N = normalize(vec3(MV * vec4(Normal, 0.0))); // normal direction 
	vec3 L = normalize(vec3(MV * vec4(10.0,10.0,-10.0,0.0) - eye));
	vec3 R = normalize(reflect(-L, N));	// reflect direction
	vec3 V = normalize(vec3(MV * vec4(camPos,1.0) - eye));
	
	vec3 refl = normalize(reflect(V,R));	// reflect directio
	vec3 ambient, diffuse, specular;
	ambient = Ka * Il;
	diffuse = vec3(textureCube(uCubeMap, mat3(inverse(MV)) * -refl));

	specular = Ks * Il * pow(clamp(dot(R,V), 0.0, 1.0), shine);

	vec4 color = vec4(ambient + diffuse, 1.0);
	gl_FragColor = mix(fogColor, color, fogFactor);
}
</script>

<script id="VertexShader3" type="x-shader/x-vertex">
attribute vec3 vPos; //vertex position
attribute vec3 norms;	// per-vertex normal vectors

varying vec3 Normal;	//Normal to be sent to Fragment Shader
varying vec3 v_Pos;			// vertex position
varying vec3 camPos;		// camera position
varying mat4 MV;	// ModelView Matrix
varying mat4 P;		// projection View Matrix
varying float fogz;
uniform mat4 uMVMatrix; // modelviewmatrix
uniform mat4 uPMatrix; // projection matrix
uniform vec3 u_camPos;	// camera position

void main(void) {
	Normal = norms;
	MV = uMVMatrix;
	P = uPMatrix;
	camPos = u_camPos;
	v_Pos = vPos;
	gl_Position = uPMatrix * uMVMatrix * vec4(vPos, 1.0);
	fogz = length(gl_Position.xyz);
}
</script>

<!----SEA MONSTER TENTACLES (FOG SHADING/ENVIRONMENT MAPPING/PHONG SHADING) ---->
<script id="FragmentShader4" type="x-shader/x-fragment">
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

precision highp float;
varying vec3 Normal;
varying vec3 v_Pos;
varying vec3 camPos;
varying mat4 MV;
varying mat4 P;
varying float fogz;
uniform samplerCube uCubeMap;	

// Shader helper function for environment mapping
mat4 inverse(in mat4 m){
	mat4 inv = mat4(0.0);
	mat4 imvp = mat4(0.0);

	inv[0][0] = m[1][1]*m[2][2]*m[3][3] - m[1][1]*m[3][2]*m[2][3] - 
		m[1][2]*m[2][1]*m[3][3] + m[1][2]*m[3][1]*m[2][3] +
		m[1][3]*m[2][1]*m[3][2] - m[1][3]*m[3][1]*m[2][2];
	inv[0][1] = -m[0][1]*m[2][2]*m[3][3] + m[0][1]*m[3][2]*m[2][3] + 
		m[0][2]*m[2][1]*m[3][3] - m[0][2]*m[3][1]*m[2][3] - 
		m[0][3]*m[2][1]*m[3][2] + m[0][3]*m[3][1]*m[2][2];
	inv[0][2] = m[0][1]*m[1][2]*m[3][3] - m[0][1]*m[3][2]*m[1][3] - 
		m[0][2]*m[1][1]*m[3][3] + m[0][2]*m[3][1]*m[1][3] + 
		m[0][3]*m[1][1]*m[3][2] - m[0][3]*m[3][1]*m[1][2];
	inv[0][3] = -m[0][1]*m[1][2]*m[2][3] + m[0][1]*m[2][2]*m[1][3] +
		m[0][2]*m[1][1]*m[2][3] - m[0][2]*m[2][1]*m[1][3] - 
		m[0][3]*m[1][1]*m[2][2] + m[0][3]*m[2][1]*m[1][2];
	inv[1][0] = -m[1][0]  * m[2][2] * m[3][3] + m[1][0]*m[3][2]*m[2][3] + 
		m[1][2]*m[2][0]*m[3][3] - m[1][2]*m[3][0]*m[2][3] - 
		m[1][3]*m[2][0]*m[3][2] + m[1][3]*m[3][0]*m[2][2];
	inv[1][1] = m[0][0]*m[2][2]*m[3][3] - m[0][0]*m[3][2]*m[2][3] - 
		m[0][2]*m[2][0]*m[3][3] + m[0][2]*m[3][0]*m[2][3] + 
		m[0][3]*m[2][0]*m[3][2] - m[0][3]*m[3][0]*m[2][2];
	inv[1][2] = -m[0][0]*m[1][2]*m[3][3] + m[0][0]*m[3][2]*m[1][3] + 
		m[0][2]*m[1][0]*m[3][3] - m[0][2]*m[3][0]*m[1][3] - 
		m[0][3]*m[1][0]*m[3][2] + m[0][3]*m[3][0]*m[1][2];
	inv[1][3] = m[0][0]*m[1][2]*m[2][3] - m[0][0]*m[2][2]*m[1][3] - 
		m[0][2]*m[1][0]*m[2][3] + m[0][2]*m[2][0]*m[1][3] + 
		m[0][3]*m[1][0]*m[2][2] - m[0][3]*m[2][0]*m[1][2];
	inv[2][0] = m[1][0]*m[2][1]*m[3][3] - m[1][0]*m[3][1]*m[2][3] - 
		m[1][1]*m[2][0]*m[3][3] + m[1][1]*m[3][0]*m[2][3] + 
		m[1][3]*m[2][0]*m[3][1] - m[1][3]*m[3][0]*m[2][1];
	inv[2][1] = -m[0][0]*m[2][1]*m[3][3] + m[0][0]*m[3][1]*m[2][3] + 
		m[0][1]*m[2][0]*m[3][3] - m[0][1]*m[3][0]*m[2][3] - 
		m[0][3]*m[2][0]*m[3][1] + m[0][3]*m[3][0]*m[2][1];
	inv[2][2] = m[0][0]*m[1][1]*m[3][3] - m[0][0]*m[3][1]*m[1][3] - 
		m[0][1]*m[1][0]*m[3][3] + m[0][1]*m[3][0]*m[1][3] + 
		m[0][3]*m[1][0]*m[3][1] - m[0][3]*m[3][0]*m[1][1];
	inv[2][3] = -m[0][0]*m[1][1]*m[2][3] + m[0][0]*m[2][1]*m[1][3] + 
		m[0][1]*m[1][0]*m[2][3] - m[0][1]*m[2][0]*m[1][3] - 
		m[0][3]*m[1][0]*m[2][1] + m[0][3]*m[2][0]*m[1][1];
	inv[3][0] = -m[1][0]*m[2][1]*m[3][2] + m[1][0]*m[3][1]*m[2][2] + 
		m[1][1]*m[2][0]*m[3][2] - m[1][1]*m[3][0]*m[2][2] - 
		m[1][2]*m[2][0]*m[3][1] + m[1][2]*m[3][0]*m[2][1];
	inv[3][1] = m[0][0]*m[2][1]*m[3][2] - m[0][0]*m[3][1]*m[2][2] - 
		m[0][1]*m[2][0]*m[3][2] + m[0][1]*m[3][0]*m[2][2] + 
		m[0][2]*m[2][0]*m[3][1] - m[0][2]*m[3][0]*m[2][1];
	inv[3][2] = -m[0][0]*m[1][1]*m[3][2] + m[0][0]*m[3][1]*m[1][2] + 
		m[0][1]*m[1][0]*m[3][2] - m[0][1]*m[3][0]*m[1][2] - 
		m[0][2]*m[1][0]*m[3][1] + m[0][2]*m[3][0]*m[1][1];
	inv[3][3] = m[0][0]*m[1][1]*m[2][2] - m[0][0]*m[2][1]*m[1][2] - 
		m[0][1]*m[1][0]*m[2][2] + m[0][1]*m[2][0]*m[1][2] + 
		m[0][2]*m[1][0]*m[2][1] - m[0][2]*m[2][0]*m[1][1];

	float det = m[0][0]*inv[0][0] + m[1][0]*inv[0][1] + m[2][0]*inv[0][2] + m[3][0]*inv[0][3];

	det = 1.0 / det;
	for(int i = 0; i < 4; i++){
		for(int j = 0; j < 4; j++){
			imvp[i][j] = inv[i][j] * det;
		}   	
	}
	return imvp;
}

void main(void){
	vec3 Ka = vec3(0.0, 0.1, 0.0);
	vec3 Ks = vec3(1.0, 1.0, 1.0);
	vec3 Il = vec3(0.3, 0.3, 0.5);
	float shine = 25.5;
	float LOG2 = 1.442695;

	if(v_Pos.z < -39.5) discard;
	
	// transform position to eye space
	vec4 eye = MV * vec4(v_Pos, 1.0);
	float fogDensity = clamp(abs(v_Pos.x / (v_Pos.x - 0.2) - 1.0), 0.0, 1.0);
	float fogFactor = clamp(exp2(-fogDensity*fogDensity*fogz*fogz*LOG2), 0.0, 1.0);
	vec4 fogColor = vec4(0.2, 0.2, 0.3, 1.0);
	
	vec3 N = normalize(vec3(MV * vec4(Normal, 0.0))); // normal direction 
	vec3 L = normalize(vec3(MV * vec4(10.0,10.0,-10.0,0.0) - eye));
	vec3 R = normalize(reflect(-L, N));	// reflect direction
	vec3 V = normalize(vec3(MV * vec4(camPos,1.0) - eye));
	
	vec3 refl = normalize(reflect(V,R));	// reflect directio

	vec3 ambient, diffuse, specular;
	ambient = Ka * Il;
	diffuse = vec3(textureCube(uCubeMap, mat3(inverse(MV)) * -refl));
	specular = Ks * Il * pow(clamp(dot(R,V), 0.0, 1.0), shine);

	vec4 color = vec4(ambient + diffuse + specular, 1.0);
	gl_FragColor = mix(fogColor, color, fogFactor);
}
</script>

<script id="VertexShader4" type="x-shader/x-vertex">
attribute vec3 vPos; //vertex position
attribute vec3 norms;	// per-vertex normal vectors
varying vec3 Normal;	//Normal to be sent to Fragment Shader
varying vec3 v_Pos;			// vertex position
varying vec3 camPos;		// camera position
varying mat4 MV;	// ModelView Matrix
varying mat4 P;		// projection View Matrix
varying float fogz;
uniform mat4 uMVMatrix; // modelviewmatrix
uniform mat4 uPMatrix; // projection matrix
uniform vec3 u_camPos;	// camera position

void main(void) {
	Normal = norms;
	MV = uMVMatrix;
	P = uPMatrix;
	camPos = u_camPos;
	v_Pos = vPos;
	gl_Position = uPMatrix * uMVMatrix * vec4(vPos, 1.0);
	fogz = length(gl_Position.xyz);
}
</script>

<!---- SKYBOX (CUBE MAPPING AND FOG SHADING) ---->

<script id="SBfrag" type="x-shader/x-fragment">
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

#ifdef GL_ES
precision mediump float;
#endif

uniform samplerCube uCubeMap;
varying vec3 v_Pos;
varying vec3 camPos;
varying mat4 MV;
varying float fogz;

void main(void)
{
	float LOG2 = 1.442695;
	float fogDensity;

	if(v_Pos.y < -65.0){
		fogDensity = (v_Pos.y)*1.9 / 86000.0;
	} else{
		fogDensity = 0.0015;
	}

	float fogFactor = clamp(exp2(-fogDensity * fogDensity * fogz * fogz * LOG2), 0.0, 1.0);
	vec4 fogColor = vec4(0.3, 0.3, 0.4, 1.0);
	vec4 tex = textureCube(uCubeMap, v_Pos.xyz * 2.0);
	gl_FragColor = mix(fogColor, tex, fogFactor);
}
</script>

<script id="SBvert" type="x-shader/x-vertex">
attribute vec3 vPos;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;
uniform vec3 u_camPos;
varying vec3 v_Pos;
varying vec3 camPos;
varying float fogz;
varying mat4 MV;

void main(void)
{
	v_Pos = vPos;
	MV = uMVMatrix;
	gl_Position = uPMatrix * uMVMatrix * vec4(vPos, 1.0);
	fogz = length(gl_Position.xyz);
}
</script>

<script>
//grab the filename for the .obj we will first open
var filename = "lighthouse.obj";
setupLoadingCallbacks();
executeMainLoop(filename); // call main mesh loading function
</script>

</body>
</html>

