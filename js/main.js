function executeMainLoop(filename){
	//jQuery ajax call to load the .obj file from the local directory
	$.ajax({
		url:"./"+filename,
		success:function(data) {processMesh(data, filename);}
	});
}

// chain to load the meshes and setup rendering demo
function processMesh(data, filename){
	console.log("LIGHTHOUSE LOADING");
	if(data.target != undefined){
		var mesh = {model: new modelLoader.Mesh(data.target.result)}
	} else {
		var mesh = {model: new modelLoader.Mesh(data)}
	}

	computeNormals(mesh.model);
	GC.meshes = {};
	GC.meshes[filename] = mesh;
	console.log("LIGHTHOUSE LOADED");
	loadSkyBox("skybox.obj");
}

function loadSkyBox(filename)
{
	console.log("SKYBOX LOADING");
	$.ajax({
		url:"./" + filename,
		success: function (data){
			if(data.target != undefined){
				var mesh = {model: new modelLoader.Mesh(data.target.result)}
			} else {
				var mesh = {model: new modelLoader.Mesh(data)}
			}
			computeNormals(mesh.model);
			GC.meshes[filename] = mesh;
			console.log("SKYBOX LOADED");
			loadHead("head.obj");
		}
	});
}

function loadHead(filename)
{
	console.log("MONSTER HEAD LOADING");
	$.ajax({
		url:"./" + filename,
		success: function (data){
			if(data.target != undefined){
				var mesh = {model: new modelLoader.Mesh(data.target.result)}
			} else {
				var mesh = {model: new modelLoader.Mesh(data)}
			}
			computeNormals(mesh.model);
			GC.meshes[filename] = mesh;
			console.log("MONSTER HEAD LOADED");
			loadTentacles("tentacles.obj");
		}
	});
}

function loadTentacles(filename)
{
	console.log("TENTACLES LOADING");
	$.ajax({
		url:"./" + filename,
		success: function (data){
			if(data.target != undefined){
				var mesh = {model: new modelLoader.Mesh(data.target.result)}
			} else {
				var mesh = {model: new modelLoader.Mesh(data)}
			}
			computeNormals(mesh.model);
			GC.meshes[filename] = mesh;
			console.log("TENTACLES LOADED");
			loadShip("ship.obj");

		}
	});
}

function loadShip(filename)
{
	console.log("SHIP LOADING");
	$.ajax({
		url:"./" + filename,
		success: function (data){
			if(data.target != undefined){
				var mesh = {model: new modelLoader.Mesh(data.target.result)}
			} else {
				var mesh = {model: new modelLoader.Mesh(data)}
			}
			computeNormals(mesh.model);
			GC.meshes[filename] = mesh;
			console.log("SHIP LOADED");
			
			var myDemo = new demo("glcanvas", GC.meshes["ship.obj"]);

			myDemo.init();
			myDemo.MainLoop();

		}
	});
}

function setupLoadingCallbacks(){
	//handles when another mesh is selected via the dropdown
	$("#meshSelect").change(function(){
			$("select option:selected").each(function(){
				filename = $(this).text(); // grab the filename from the selection
				$.ajax({
					url:"./"+filename,
					success:processMesh// --- processMesh when the .obj is loaded
				});
			});
		});


//handles when user uploads a file
	$("#files").change(function(evt){
		var objFile = evt.target.files[0];
		var reader = new FileReader();

		//set a callback for when the file is finished uploading
		reader.onload = processMesh;

		//tell the reader to load the file as a text file
		reader.readAsText(objFile);
	});

}

