if (typeof String.prototype.startsWith !== 'function') {
	String.prototype.startsWith = function (str){
		return this.slice(0, str.length) === str;
	};
}
var modelLoader = {};

modelLoader.Mesh = function( objectData ){

	var verts = [];
	var norm = [];
	var tex = [];

	// unpacking stuff
	var packed = {};
	packed.indices = [];

	// array of lines separated by the newline
	var lines = objectData.split( '\n' )
		for( var i=0; i<lines.length; i++ ){

			lines[i] = lines[i].replace(/\s{2,}/g, " "); // remove double spaces

			// if this is a vertex
			if( lines[ i ].startsWith( 'v ' ) ){
				line = lines[ i ].slice( 2 ).split( " " );
				verts.push( line[ 0 ] );
				verts.push( line[ 1 ] );
				verts.push( line[ 2 ] );
			}
			// if this is a vertex normal
			else if( lines[ i ].startsWith( 'vn' ) ){
				line = lines[ i ].slice( 2 ).split( " " );
				norm.push( line[ 0 ] );
				norm.push( line[ 1 ] );
				norm.push( line[ 2 ] );
			}
			// if this is a texture
			else if( lines[ i ].startsWith( 'vt' ) ){
				line = lines[ i ].slice( 2 ).split( " " );
				tex.push( line[ 0 ] );
				tex.push( line[ 1 ] );
				tex.push( line[ 2 ] );
			}
			// if this is a face
			else if( lines[ i ].startsWith( 'f ' ) ){
				line = lines[ i ].slice( 2 ).split( " " );
				for(var j=1; j <= line.length-2; j++){
					var i1 = line[0].split('/')[0] - 1;
					var i2 = line[j].split('/')[0] - 1;
					var i3 = line[j+1].split('/')[0] - 1;
					packed.indices.push(i1,i2,i3);
				}
			}
		}
	this.vertices = verts;
	this.indices = packed.indices;
}

function computeNormals(mesh) {
	mesh.vertnorm = new Array(mesh.vertices.length);

	mesh.vertnorm.fill(0);

	for(var i = 0; i < mesh.indices.length; i += 3){

		// for ease of indexing
		var v1 = mesh.indices[i];
		var v2 = mesh.indices[i+1];
		var v3 = mesh.indices[i+2];

		var x1 = mesh.vertices[v1*3];
		var x2 = mesh.vertices[v2*3];
		var x3 = mesh.vertices[v3*3];
		var y1 = mesh.vertices[v1*3+1];
		var y2 = mesh.vertices[v2*3+1];
		var y3 = mesh.vertices[v3*3+1];
		var z1 = mesh.vertices[v1*3+2];
		var z2 = mesh.vertices[v2*3+2];
		var z3 = mesh.vertices[v3*3+2];

		// set up intermediate vectors to calculate triangle norm
		var Ux = x2-x1;
		var Uy = y2-y1;
		var Uz = z2-z1;
		var Vx = x3-x1;
		var Vy = y3-y1;
		var Vz = z3-z1;

		// calculate triangle face norm from U and V
		var Nx = Uy*Vz - Uz*Vy;
		var Ny = Uz*Vx - Ux*Vz;
		var Nz = Ux*Vy - Uy*Vx;

		var mag = Math.sqrt(Nx*Nx + Ny*Ny + Nz*Nz);

		// assign face
		mesh.vertnorm[v1*3] += Nx;
		mesh.vertnorm[v1*3+1] += Ny;
		mesh.vertnorm[v1*3+2] += Nz;
		mesh.vertnorm[v2*3] += Nx;
		mesh.vertnorm[v2*3+1] += Ny;
		mesh.vertnorm[v2*3+2] += Nz;
		mesh.vertnorm[v3*3] += Nx;
		mesh.vertnorm[v3*3+1] += Ny;
		mesh.vertnorm[v3*3+2] += Nz;
	}

	// normalize to unit length normal vector

	for(var i = 0; i < mesh.vertnorm.length; i += 3){

		var a = mesh.vertnorm[i];
		var b = mesh.vertnorm[i+1];
		var c = mesh.vertnorm[i+2];

		var mag = Math.sqrt(a*a + b*b + c*c);

		mesh.vertnorm[i] = a/mag;
		mesh.vertnorm[i+1] = b/mag;
		mesh.vertnorm[i+2] = c/mag;
	}
}

