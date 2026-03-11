import * as THREE from 'three';
// import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

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
    const material = new THREE.MeshBasicMaterial({color: 0x44aa88});

    //Mesh
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube); //add to scene

    renderer.render(scene, camera);

}

main();