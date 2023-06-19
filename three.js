import * as THREE from 'three';
import { OrbitControls } from 'https://unpkg.com/three@0.151.3/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.151.3/examples/jsm/loaders/GLTFLoader.js';

const scene =  new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000)
camera.position.set(5, 5, 2.5);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(4, 4, 1)
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
pointLight.shadow.camera.visible = true;
pointLight.castShadow = true;

scene.add(pointLight);


const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
pointLightHelper.visible = true;
scene.add(pointLightHelper);

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50, 1, 1),
    new THREE.MeshStandardMaterial({
        color: 0xFFFFFF
    }));
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0,0,0);
controls.update();

const vertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec3 vNormal;
  void main() {
    gl_FragColor = vec4(vNormal + 0.6, 1.0);
  }
`;

const material = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
});

const loader = new GLTFLoader();
loader.load('/Teapot.glb', function(gltf){
    const model = gltf.scene;
    model.position.set(0, 2, 0);
    model.scale.set(200, 200, 200);
    model.children[0].children[0].traverse(function( node ){
        if ( node.isMesh ) {
          node.castShadow = true;
          node.material = material;
        }
    });
    scene.add(model);
}, undefined, function (error) {
    console.error(error);
});

const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath( 'cubeTexture/' );

const textureCube = cubeTextureLoader.load( [
    'posx.jpg', 'negx.jpg',
    'posy.jpg', 'negy.jpg',
    'posz.jpg', 'negz.jpg'
] );
scene.background = textureCube;


function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

render();