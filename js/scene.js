// Canvas
const canvas = document.querySelector('canvas.scene');

// Sizes
const sizes = {
    width: window.innerWidth * 0.65,
    height: window.innerHeight * 0.85
};

// Scene
const scene = new THREE.Scene();

// Lights
const light = new THREE.DirectionalLight(0xffffff, 0.1);
light.position.set(0, 2, 20);
light.lookAt(0, 0, 0);
scene.add(light);

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.set(0, 2, 20);
camera.lookAt(0, 0, 0);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width / 1.8, sizes.height / 1.8);
renderer.setClearColor(0xF2F3F4);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Orbit Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = false;
controls.minDistance = 0;
controls.maxDistance = 200;

window.addEventListener('resize', () => {
    // Update Camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update Renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animate
const animate = () => {
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};

animate();