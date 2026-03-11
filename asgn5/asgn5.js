import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

function main() {

    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});

    // PerspectiveCamera
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    //Scene
    const scene = new THREE.Scene();

    //BoxGeometry
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const material = new THREE.MeshPhongMaterial({color: 0x44aa88});  // greenish blue

    //Mesh
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube); //add to scene

    // renderer.render(scene, camera);

    //animate
    function render(time) {
        time *= 0.001;  // convert time to seconds
        
        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;
        });

        cube.rotation.x = time;
        cube.rotation.y = time;
        
        renderer.render(scene, camera);
        
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    //directional light
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    //create new material
    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({color});
        
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        
        cube.position.x = x;
        
        return cube;
    }

    const cubes = [
    makeInstance(geometry, 0x44aa88,  0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844,  2),
    ];

}

main();