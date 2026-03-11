import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {

    const canvas = document.querySelector('#c');
    // const view1Elem = document.querySelector('#view1');
    // const view2Elem = document.querySelector('#view2');
    // const renderer = new THREE.WebGLRenderer({
    //     canvas,
    //     antialias: true,
    //     alpha: true,
    // });
	const renderer = new THREE.WebGLRenderer( { antialias: true, canvas } );



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
	// scene.background = new THREE.Color( 'black' );
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
    // makeInstance(geometry, new THREE.MeshPhongMaterial({ color: 0x44aa88 }),-4,1,0);
    // makeInstance(geometry, new THREE.MeshPhongMaterial({ color: 0x8844aa }),-2,1,0);
    // makeInstance(geometry, new THREE.MeshPhongMaterial({ color: 0xaa8844 }), 0,1,0);

    //single Texture Loader
    // {
    //     const loader = new THREE.TextureLoader();
    //     const texture = loader.load('textures/cheese.jpg');
    //     texture.colorSpace = THREE.SRGBColorSpace;
    //     const material = new THREE.MeshPhongMaterial({
    //         map: texture,
    //     });
    //     makeInstance(geometry, material, 2, 1, 0);
    // }

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
            cube.position.set(0,4,-14);
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
		// const texture = loader.load( 'https://threejs.org/manual/examples/resources/images/checker.png' );
		const texture = loader.load( 'textures/grass.png' );

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
    //CUBES =====================================================

    //turf
    {
		const cubeSize = 4;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: 'rgb(2, 60, 16)' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( 4, -1.9, -9 );
		scene.add( mesh );

	}
    {
		const cubeSize = 4;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: 'rgb(2, 60, 16)' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( 8, -1.8, -9 );
		scene.add( mesh );

	}
    {
		const cubeSize = 4;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: 'rgb(2, 60, 16)' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( 8, -1.9, -5 );
		scene.add( mesh );

	}
    {
		const cubeSize = 4;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: 'rgb(2, 60, 16)' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( 8, -1.9, -1 );
		scene.add( mesh );

	}
    {
		const cubeSize = 4;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: 'rgb(2, 60, 16)' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( 0, -1.9, -9.2 );
		scene.add( mesh );

	}

    {
		const cubeSize = 4;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: 'rgb(2, 60, 16)' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( -4, -1.9, -8 );
		scene.add( mesh );

	}
    //lane boundaries
    {
		const cubeSize = 0.5;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( 4, cubeSize / 2, -11 );
		scene.add( mesh );

	}
    {
		const cubeSize = 0.5;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( 3.5, cubeSize / 2, -11.5 );
		scene.add( mesh );

	}

    {
		const cubeSize = 0.5;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( -4, cubeSize / 2, -11 );
		scene.add( mesh );

	}
    {
		const cubeSize = 0.5;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( -3.5, cubeSize / 2, -11.5 );
		scene.add( mesh );

	}
        {
		const cubeSize = 0.5;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( -3, cubeSize / 2, -11.5 );
		scene.add( mesh );

	}
    {
		const cubeSize = 0.5;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( 1, cubeSize / 2, -6.5 );
		scene.add( mesh );

	}
    {
		const cubeSize = 0.5;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( 1.5, cubeSize / 2, -6.5 );
		scene.add( mesh );

	}
    {
		const cubeSize = 0.5;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( 2, cubeSize / 2, -7 );
		scene.add( mesh );

	}
    {
		const cubeSize = 0.5;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( 2.5, cubeSize / 2, -6.5 );
		scene.add( mesh );

	}

    {
		const cubeSize = 0.5;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( -4, cubeSize / 2, -5 );
		scene.add( mesh );

	}
    {
		const cubeSize = 0.5;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: '#8AC' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( -3.5, cubeSize / 2, -5.5 );
		scene.add( mesh );

	}

    //"opening" to the windmill where the ball comes out
    {

        const loader = new THREE.TextureLoader();
        const texture = loader.load('textures/brick.jpg');
        texture.colorSpace = THREE.SRGBColorSpace;

		const cubeSize = 2;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( {map: texture} );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( -7, cubeSize / 2, -7 );
		scene.add( mesh );

	}

    {
		const cubeSize = .8;
		const cubeGeo = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
		const cubeMat = new THREE.MeshPhongMaterial( { color: 'rgb(0, 0, 0)' } );
		const mesh = new THREE.Mesh( cubeGeo, cubeMat );
		mesh.position.set( -6, cubeSize / 2, -7 );
		scene.add( mesh );

	}


    //CYLINDERS ===============================

    //parking bound
    {
    const radiusTop = 0.3;
    const radiusBottom = 0.3;
    const height = 3;
    const radialSegments = 32;

    const cylinderGeo = new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments
    );

    const cylinderMat = new THREE.MeshPhongMaterial( { color: 'rgb(255, 217, 0)' } );

    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);

    cylinder.position.set(-11, height / 2, 4); // height/2 keeps it on the ground

    scene.add(cylinder);
    }

    //stem
    {

    const radiusTop = 0.1;
    const radiusBottom = 0.1;
    const height = 4;
    const radialSegments = 32;

    const cylinderGeo = new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments
    );

    const cylinderMat = new THREE.MeshPhongMaterial( { color: 'rgb(2, 66, 11)' } );

    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);

    cylinder.position.set(0, height / 2, -14); // height/2 keeps it on the ground

    scene.add(cylinder);
    }

    //flag pole
    {
    const radiusTop = 0.1;
    const radiusBottom = 0.1;
    const height = 5;
    const radialSegments = 32;

    const cylinderGeo = new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments
    );

    const cylinderMat = new THREE.MeshPhongMaterial( { color: 'rgb(202, 250, 253)' } );

    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);

    cylinder.position.set(8, height / 2, -2); // height/2 keeps it on the ground

    scene.add(cylinder);
    }

    {
    const radiusTop = 0.4;
    const radiusBottom = 0.4;
    const height = 0.1;
    const radialSegments = 32;

    const cylinderGeo = new THREE.CylinderGeometry(
        radiusTop,
        radiusBottom,
        height,
        radialSegments
    );

    const cylinderMat = new THREE.MeshPhongMaterial( { color: 'rgb(0, 0, 0)' } );

    const cylinder = new THREE.Mesh(cylinderGeo, cylinderMat);

    cylinder.position.set(8, .1, -2); // height/2 keeps it on the ground

    scene.add(cylinder);
    }

    //SPHERES ===============================================

    //golf balls
	{

        const loader = new THREE.TextureLoader();
        const texture = loader.load('textures/gball.jpeg');
        texture.colorSpace = THREE.SRGBColorSpace;
		const sphereRadius = .2;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( {  map: texture} );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( - sphereRadius + 5, sphereRadius, 2 );
		scene.add( mesh );

	}

    {

        const loader = new THREE.TextureLoader();
        const texture = loader.load('textures/gball.jpeg');
        texture.colorSpace = THREE.SRGBColorSpace;
		const sphereRadius = .2;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( {  map: texture} );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( - sphereRadius + 6, sphereRadius, 3 );
		scene.add( mesh );

	}

    {

        const loader = new THREE.TextureLoader();
        const texture = loader.load('textures/gball.jpeg');
        texture.colorSpace = THREE.SRGBColorSpace;
		const sphereRadius = .2;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( {  map: texture} );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( - sphereRadius + 7, sphereRadius+.1, -4 );
		scene.add( mesh );

	}

    {

        const loader = new THREE.TextureLoader();
        const texture = loader.load('textures/gball.jpeg');
        texture.colorSpace = THREE.SRGBColorSpace;
		const sphereRadius = .2;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( {  map: texture} );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( - sphereRadius + 11, sphereRadius, -3 );
		scene.add( mesh );

	}
	{
        const loader = new THREE.TextureLoader();
        const texture = loader.load('textures/gball.jpeg');
        texture.colorSpace = THREE.SRGBColorSpace;
		const sphereRadius = .2;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( {  map: texture} );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( - sphereRadius + 10, sphereRadius+.1, 0 );
		scene.add( mesh );

	}

    //marker of hole
	{

		const sphereRadius = .3;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( { color: 'rgb(255, 0, 0)' } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( 8, 5, -2);
		scene.add( mesh );

	}
    //bushes
    {
 
		const sphereRadius = 1;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( { color: 'rgb(14, 116, 31)' } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( 8, sphereRadius, -14);
		scene.add( mesh );

	}
    {

		const sphereRadius = 0.8;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( { color: 'rgb(14, 116, 31)' } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( 7, sphereRadius, -14);
		scene.add( mesh );

	}

    {
 
		const sphereRadius = 0.8;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( { color: 'rgb(14, 116, 31)' } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( 9, sphereRadius, -14);
		scene.add( mesh );

	}

    {

		const sphereRadius = 0.6;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( { color: 'rgb(14, 116, 31)' } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( 7, sphereRadius, -13);
		scene.add( mesh );

	}

        {
 
		const sphereRadius = 1;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( { color: 'rgb(14, 116, 31)' } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( 1, sphereRadius, -14);
		scene.add( mesh );

	}
    {

		const sphereRadius = 0.8;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( { color: 'rgb(14, 116, 31)' } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( 0, sphereRadius, -14);
		scene.add( mesh );

	}

    {

		const sphereRadius = 0.8;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( { color: 'rgb(14, 116, 31)' } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( 2, sphereRadius, -14);
		scene.add( mesh );

	}

    {

		const sphereRadius = 0.6;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( { color: 'rgb(14, 116, 31)' } );
		const mesh = new THREE.Mesh( sphereGeo, sphereMat );
		mesh.position.set( 0, sphereRadius, -13);
		scene.add( mesh );

	}

    //animated spheres

    let sphere;
    let rollsphere;
    const rollsphereRad = 0.2;
    const sphereBaseY = 0.3;

    //bounce
	{
        const loader = new THREE.TextureLoader();
        const texture = loader.load('textures/gball.jpeg');
        texture.colorSpace = THREE.SRGBColorSpace;

		const sphereRadius = .2;
		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
        
		const sphereGeo = new THREE.SphereGeometry( sphereRadius, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( {  map: texture} );

		sphere = new THREE.Mesh( sphereGeo, sphereMat );
		sphere.position.set( - sphereRadius + 7, sphereBaseY, 0 );
		scene.add( sphere );

	}
    //roll
    {
        const loader = new THREE.TextureLoader();
        const texture = loader.load('textures/gball.jpeg');
        texture.colorSpace = THREE.SRGBColorSpace;

		const sphereWidthDivisions = 32;
		const sphereHeightDivisions = 16;
        
		const sphereGeo = new THREE.SphereGeometry( rollsphereRad, sphereWidthDivisions, sphereHeightDivisions );
		const sphereMat = new THREE.MeshPhongMaterial( {  map: texture} );

		rollsphere = new THREE.Mesh( sphereGeo, sphereMat );
		rollsphere.position.set( 8, sphereBaseY, -8);
		scene.add( rollsphere );

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

    //OBJ MTL =============================================================

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

    // moped
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

    // cart
    {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('obj/golfcart/materials.mtl', (mtl) => {
            mtl.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('obj/golfcart/model.obj', (root) => {
            root.position.set(-11, 2.2, 10);
            root.scale.set(2.5, 2.5, 2.5); 
            scene.add(root);
            });
        });
	}

    //bridge
    {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('obj/bridge/Bridge.mtl', (mtl) => {
            mtl.preload();

            const objLoader = new OBJLoader();
            objLoader.setMaterials(mtl);
            objLoader.load('obj/bridge/Bridge.obj', (root) => {
            root.position.set(-8, 0.3, -8.5);
            root.scale.set(0.1, 0.1, 0.1); 
            scene.add(root);
            });
        });
	}
    
    
    //SKYBOX - EQUIRECTANGULAR METHOD
	{

		const loader = new THREE.TextureLoader();
		const texture = loader.load(`textures/equisky.jpg`,
			// 'https://threejs.org/manual/examples/resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg',

			() => {

				texture.mapping = THREE.EquirectangularReflectionMapping;
				texture.colorSpace = THREE.SRGBColorSpace;
				scene.background = texture;

			} );

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
        
        // cubes.forEach((cube, ndx) => {
        //     const speed = 1 + ndx * .1;
        //     const rot = time * speed;
        //     cube.rotation.x = rot;
        //     cube.rotation.y = rot;
        // });

        const bounceHeight = 1;
        const bounceSpeed = 3;
        
        sphere.position.y = sphereBaseY + Math.abs(Math.sin(time * bounceSpeed)) * bounceHeight;
        
        sphere.rotation.y = -time;

        rollsphere.position.x = Math.sin(time) * 3;
        rollsphere.position.y = rollsphereRad;
        rollsphere.rotation.z = -time * 2;

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