import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {

    const canvas = document.querySelector('#c');
    // const view1Elem = document.querySelector('#view1');
    // const view2Elem = document.querySelector('#view2');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // PerspectiveCamera
    const fov = 45;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set( 0, 10, 20 );

    // const cameraHelper = new THREE.CameraHelper(camera);        

    // MinMaxGUIHelper
    class MinMaxGUIHelper {
        constructor(obj, minProp, maxProp, minDif) {
            this.obj = obj;
            this.minProp = minProp;
            this.maxProp = maxProp;
            this.minDif = minDif;
        }
        get min() {
            return this.obj[this.minProp];
        }
        set min(v) {
            this.obj[this.minProp] = v;
            this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
        }
        get max() {
            return this.obj[this.maxProp];
        }
        set max(v) {
            this.obj[this.maxProp] = v;
            this.min = this.min;  // this will call the min setter
        }
    }

    function updateCamera() {
        camera.updateProjectionMatrix();
    }
    
    const gui = new GUI();

    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(camera, 'fov', 1, 180).onChange(updateCamera);

    const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    cameraFolder.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    cameraFolder.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);
    
    //ORBIT CONTROLS
    const controls = new OrbitControls( camera, canvas );
    controls.target.set( 0, 5, 0 );
    controls.update();
    // const camera2 = new THREE.PerspectiveCamera(
	// 	60, // fov
	// 	2, // aspect
	// 	0.1, // near
	// 	500, // far
	// );
	// camera2.position.set( 40, 10, 30 );
	// camera2.lookAt( 0, 5, 0 );

	// const controls2 = new OrbitControls( camera2, view2Elem );
	// controls2.target.set( 0, 5, 0 );
	// controls2.update(); 


    //Scene
    const scene = new THREE.Scene();
	scene.background = new THREE.Color( 'black' );
    // scene.add(cameraHelper);

    
    //BoxGeometry
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const cubes = [];

    //create new material
    function makeInstance(geometry, material, x, y = 0, z = 0) {
        const cube = new THREE.Mesh(geometry, material);
        // const material = new THREE.MeshPhongMaterial({color});        
        cube.position.set(x, y, z);
        scene.add(cube);
        cubes.push(cube);
        return cube;
    }

    //rotating cubes
    // fundamentals: 3 rotating solid cubes
    makeInstance(geometry, new THREE.MeshPhongMaterial({ color: 0x44aa88 }),-4,1,0);
    makeInstance(geometry, new THREE.MeshPhongMaterial({ color: 0x8844aa }),-2,1,0);
    makeInstance(geometry, new THREE.MeshPhongMaterial({ color: 0xaa8844 }), 0,1,0);

    //single Texture Loader
    {
        const loader = new THREE.TextureLoader();
        const texture = loader.load('textures/cheese.jpg');
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.MeshPhongMaterial({
            map: texture,
        });
        makeInstance(geometry, material, 2, 1, 0);
    }

    //MULTI TEXTURE FACES:
    {
        const loadManager = new THREE.LoadingManager();
        const loader = new THREE.TextureLoader(loadManager);

        function loadColorTexture(path) {
            const texture = loader.load(path);
            texture.colorSpace = THREE.SRGBColorSpace;
            return texture;
        }

        const materials = [
            new THREE.MeshBasicMaterial({map: loadColorTexture('textures/flower-1.jpg')}),
            new THREE.MeshBasicMaterial({map: loadColorTexture('textures/flower-2.jpg')}),
            new THREE.MeshBasicMaterial({map: loadColorTexture('textures/flower-3.jpg')}),
            new THREE.MeshBasicMaterial({map: loadColorTexture('textures/flower-4.jpg')}),
            new THREE.MeshBasicMaterial({map: loadColorTexture('textures/flower-5.jpg')}),
            new THREE.MeshBasicMaterial({map: loadColorTexture('textures/flower-6.jpg')}),
        ];


        const loadingElem = document.querySelector('#loading');
        const progressBarElem = loadingElem.querySelector('.progressbar');

        loadManager.onLoad = () => {
            loadingElem.style.display = 'none';
            const cube = new THREE.Mesh(geometry, materials);
            cube.position.set(8,1,0);
            scene.add(cube);
            cubes.push(cube);  // add to our list of cubes to rotate
        };

        
        loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
            const progress = itemsLoaded / itemsTotal;
            progressBarElem.style.transform = `scaleX(${progress})`;
        };
    }


    function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
    }
    
    //plane
	{

		const planeSize = 40;

		const loader = new THREE.TextureLoader();
		const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.magFilter = THREE.NearestFilter;
   		texture.colorSpace = THREE.SRGBColorSpace;

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

    //more shapes
    //CUBES
    {
		const cubeSize = 4;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( cubeSize + 1, cubeSize / 2, 0 );
		scene.add( mesh );

	}
    //SPHERES
	{

		const sphereRadius = 3;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( { color: '#CA8' } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( - sphereRadius - 1, sphereRadius + 2, 0 );
		scene.add( mesh );

	}

    //LIGHTS
    
    class ColorGUIHelper {
        constructor(object, prop) {
            this.object = object;
            this.prop = prop;
        }
        get value() {
            return '#' + this.object[this.prop].getHexString();
        }
        set value(hexString) {
            this.object[this.prop].set(hexString);
        }
    }


    //AMBIENT LIGHT
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.AmbientLight(color, intensity);
        scene.add(light);

        const ambientFolder = gui.addFolder('Ambient Light');
		ambientFolder.addColor( new ColorGUIHelper( light, 'color' ), 'value' ).name( 'color' );
		ambientFolder.add( light, 'intensity', 0, 5, 0.01 );
    }

    //HEMISPHERE LIGHT
	{
		const skyColor = 0xB1E1FF; // light blue
		const groundColor = 0xB97A20; // brownish orange
		const intensity = 1;
		const light = new THREE.HemisphereLight( skyColor, groundColor, intensity );
		scene.add( light );

        const hemisphereFolder = gui.addFolder('Hemisphere Light');
        hemisphereFolder.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
        hemisphereFolder.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
		hemisphereFolder.add( light, 'intensity', 0, 5, 0.01 );
	}

    //DIRECTIONAL LIGHT
	{
        const color = 0xFFFFFF;
        const intensity = 3;
        const light = new THREE.DirectionalLight( color, intensity );
        light.position.set( 5, 10, 2 );
   		light.target.position.set( - 5, 0, 0 );
        scene.add( light );
        scene.add( light.target );

        const directionalFolder = gui.addFolder('Directional Light');
        directionalFolder.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
        directionalFolder.add(light, 'intensity', 0, 5, 0.01);
        directionalFolder.add(light.target.position, 'x', -10, 10);
        directionalFolder.add(light.target.position, 'z', -10, 10);
        directionalFolder.add(light.target.position, 'y', 0, 10);

	}

    //OBJ MTL 

    //windmill example
    {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('obj/windmill/windmill_001.mtl', (mtl) => {
            mtl.preload();
            for (const material of Object.values(mtl.materials)) {
                material.side = THREE.DoubleSide;
            }
            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('obj/windmill/windmill_001.obj', (root) => {
            root.position.set(-10, 0, -7);
            root.scale.set(2, 2, 2); 
            scene.add(root);
            });
        });
	}

    //my obj: moped
    {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('obj/moped/materials.mtl', (mtl) => {
            mtl.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('obj/moped/model.obj', (root) => {
            root.position.set(-2, 1.6, 5);
            root.scale.set(1, 1, 1); 
            scene.add(root);
            });
        });
	}
    

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

    // function setScissorForElement( elem ) {

	// 	const canvasRect = canvas.getBoundingClientRect();
	// 	const elemRect = elem.getBoundingClientRect();

	// 	// compute a canvas relative rectangle
	// 	const right = Math.min( elemRect.right, canvasRect.right ) - canvasRect.left;
	// 	const left = Math.max( 0, elemRect.left - canvasRect.left );
	// 	const bottom = Math.min( elemRect.bottom, canvasRect.bottom ) - canvasRect.top;
	// 	const top = Math.max( 0, elemRect.top - canvasRect.top );

	// 	const width = Math.min( canvasRect.width, right - left );
	// 	const height = Math.min( canvasRect.height, bottom - top );

	// 	// setup the scissor to only render to that part of the canvas
	// 	const positiveYUpBottom = canvasRect.height - bottom;
	// 	renderer.setScissor( left, positiveYUpBottom, width, height );
	// 	renderer.setViewport( left, positiveYUpBottom, width, height );

	// 	// return the aspect
	// 	return width / height;

	// }

    //animate
    function render(time) {
        time *= 0.001;  // convert time to seconds
        
        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });

        if ( resizeRendererToDisplaySize( renderer ) ) {

			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();

		}
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();