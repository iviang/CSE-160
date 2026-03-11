import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

function main() {

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // PerspectiveCamera
    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    // camera.position.z = 2;
	camera.position.set( 0, 10, 20 );
	const controls = new OrbitControls( camera, canvas );
	controls.target.set( 0, 5, 0 );
	controls.update();

    //Scene
    const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );

    //BoxGeometry
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    // solid color:
    // const loader = new THREE.TextureLoader();
    // const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue
    // const cube = new THREE.Mesh(geometry, material);
    const cubes = [];

    // //Texture Loader
    // const loader = new THREE.TextureLoader();
    // loader.load('textures/cheese.jpg', (texture) => {
    //     texture.colorSpace = THREE.SRGBColorSpace;
    //     const material = new THREE.MeshBasicMaterial({
    //         map: texture,
    //     });
    //     const cube = new THREE.Mesh(geometry, material);
    //     scene.add(cube);
    //     cubes.push(cube);  // add to our list of cubes to rotate
    // });

    //MULTI TEXTURE FACES:
    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);

    const materials = [
        new THREE.MeshBasicMaterial({map: loader.load('textures/flower-1.jpg')}),
        new THREE.MeshBasicMaterial({map: loader.load('textures/flower-2.jpg')}),
        new THREE.MeshBasicMaterial({map: loader.load('textures/flower-3.jpg')}),
        new THREE.MeshBasicMaterial({map: loader.load('textures/flower-4.jpg')}),
        new THREE.MeshBasicMaterial({map: loader.load('textures/flower-5.jpg')}),
        new THREE.MeshBasicMaterial({map: loader.load('textures/flower-6.jpg')}),
    ];

    const loadingElem = document.querySelector('#loading');
    const progressBarElem = loadingElem.querySelector('.progressbar');

    loadManager.onLoad = () => {
        loadingElem.style.display = 'none';
        const cube = new THREE.Mesh(geometry, materials);
        scene.add(cube);
        cubes.push(cube);  // add to our list of cubes to rotate
    };

    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
        const progress = itemsLoaded / itemsTotal;
        progressBarElem.style.transform = `scaleX(${progress})`;
    };

    // const cube = new THREE.Mesh(geometry, materials);

    // function loadColorTexture( path ) {
    //     const texture = loader.load( path );
    //     texture.colorSpace = THREE.SRGBColorSpace;
    //     return texture;
    // }

    
    // scene.add(cube); //add to scene

    // renderer.render(scene, camera);
	{

		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
		const repeats = planeSize / 2;
		texture.repeat.set( repeats, repeats );

		const planeGeo = new THREE.PlaneGeometry( planeSize, planeSize );
		const planeMat = new THREE.MeshPhongMaterial( {
			map: texture,
			side: THREE.DoubleSide,
		} );
		const mesh = new THREE.Mesh( planeGeo, planeMat );
		mesh.rotation.x = Math.PI * - .5;
		scene.add( mesh );

	}

	{

		const skyColor = 0xB1E1FF; // light blue
		const groundColor = 0xB97A20; // brownish orange
		const intensity = 2;
		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		scene.add( light );

	}

	{

		const color = 0xFFFFFF;
		const intensity = 3;
		const light = new THREE.DirectionalLight( color, intensity );
		light.position.set( 5, 10, 2 );
		scene.add( light );
		scene.add( light.target );
	}
    {
    const mtlLoader = new MTLLoader();
    mtlLoader.load('obj/materials.mtl', (mtl) => {
        mtl.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load('obj/model.obj', (root) => {
        root.position.set(0, 1.6, 0);
        root.scale.set(1, 1, 1); 
        scene.add(root);
        });
    });

	}

	// {

	// 	const objLoader = new OBJLoader();
	// 	objLoader.load( 'https://threejs.org/manual/examples/resources/models/windmill/windmill.obj', ( root ) => {

	// 		scene.add( root );

	// 	} );

	// }

	function resizeRendererToDisplaySize( renderer ) {

		const canvas = renderer.domElement;
		const width = canvas.clientWidth;
		const height = canvas.clientHeight;
		const needResize = canvas.width !== width || canvas.height !== height;
		if ( needResize ) {

			renderer.setSize( width, height, false );

		}

		return needResize;

	}

    // //animate
    // function render(time) {
    //     time *= 0.001;  // convert time to seconds
        
    //     // cubes.forEach((cube, ndx) => {
    //     //     const speed = 1 + ndx * .1;
    //     //     const rot = time * speed;
    //     //     cube.rotation.x = rot;
    //     //     cube.rotation.y = rot;
    //     // });
    //     // const rot = time;
    //     // cubes.forEach((cube) => {
    //     //     cube.rotation.x = rot;
    //     //     cube.rotation.y = rot;
    //     // });

    //     // cube.rotation.x = time;
    //     // cube.rotation.y = time;
    //     if ( resizeRendererToDisplaySize( renderer ) ) {

	// 		const canvas = renderer.domElement;
	// 		camera.aspect = canvas.clientWidth / canvas.clientHeight;
	// 		camera.updateProjectionMatrix();

	// 	}
    //     renderer.render(scene, camera);
        
    //     requestAnimationFrame(render);
    // }

    // requestAnimationFrame(render);

    // //directional light
    // const color = 0xFFFFFF;
    // const intensity = 3;
    // const light = new THREE.DirectionalLight(color, intensity);
    // light.position.set(-1, 2, 4);
    // scene.add(light);

    // //create new material
    // function makeInstance(geometry, color, x) {
    //     const material = new THREE.MeshPhongMaterial({color});
        
    //     const cube = new THREE.Mesh(geometry, material);
    //     scene.add(cube);
        
    //     cube.position.x = x;
        
    //     return cube;
    // }

    // // const cubes = [
    // //     makeInstance(geometry, 0x44aa88,  0),
    // //     makeInstance(geometry, 0x8844aa, -2),
    // //     makeInstance(geometry, 0xaa8844,  2),
    // // ];
    function render() {

		if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}

		renderer.render( scene, camera );

		requestAnimationFrame( render );

	}

	requestAnimationFrame( render );
}

main();