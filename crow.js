import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

let camera, scene, renderer, controls, crowhead, composer;

init();
animate();

function init() {
  // ----- CAMERA -----
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(2, 2, 2);

  // ----- SCENE -----
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // ----- LIGHTS -----
  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(5, 5, 5);
  scene.add(directional);

  const ambient = new THREE.AmbientLight(0x404040);
  scene.add(ambient);

  // ----- RENDERER -----
  const container = document.getElementById("container");
  renderer = new THREE.WebGLRenderer({ antialias: true });
  container.appendChild(renderer.domElement);

  // ----- CONTROLS -----
  controls = new OrbitControls(camera, renderer.domElement);

  // ----- POSTPROCESSING COMPOSER -----
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(container.offsetWidth, container.offsetHeight),
    1.5, // strength
    0.4, // radius
    0.75 // threshold
  );
  composer.addPass(bloomPass);

  // ----- LOAD GLB -----
  const loader = new GLTFLoader();
  loader.load(
    "assets/snoozeHeadWHeadphones.glb",
    (gltf) => {
      crowhead = gltf.scene;

      crowhead.traverse((child) => {
        if (child.isMesh && !child.userData.isOutline) {
          const matName = child.material.name;

          // Assign toon/standard materials
          switch (matName) {
            case "grey":
              child.material = new THREE.MeshToonMaterial({ color: 0x525252 });
              break;
            case "black":
              child.material = new THREE.MeshToonMaterial({ color: 0x000000 });
              break;
            case "white":
              child.material = new THREE.MeshToonMaterial({ color: 0x000000 });
              break;
            case "emission":
              child.material = new THREE.MeshStandardMaterial({
                color: 0x000000,
                emissive: 0xffffff,
                emissiveIntensity: 1,
              });
              break;
            default:
              child.material = new THREE.MeshToonMaterial({ color: 0xffffff });
          }

          // Add cartoon-style outline
          const outlineMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff, // outline color
            side: THREE.BackSide,
          });

          const outlineMesh = new THREE.Mesh(child.geometry, outlineMat);
          outlineMesh.scale.multiplyScalar(1.02); // slightly bigger
          outlineMesh.userData.isOutline = true; // mark as outline to avoid recursion
          child.add(outlineMesh);
        }
      });

      scene.add(crowhead);
    },
    undefined,
    (error) => console.error("Error loading GLB:", error)
  );

  // ----- PARTICLE WHISPS -----

  const whispCount = 50;
  const whispGeometry = new THREE.BufferGeometry();
  const whispPositions = [];

  for (let i = 0; i < whispCount; i++) {
    const radius = Math.random() * 2 + 0.5; // distance from center
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    whispPositions.push(x, y, z);
  }

  whispGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(whispPositions, 3)
  );

  const whispMaterial = new THREE.PointsMaterial({
    color: 0xffffff, // bright white
    size: 0.05, // particle size
    sizeAttenuation: true,
  });

  const whisps = new THREE.Points(whispGeometry, whispMaterial);
  scene.add(whisps);

  // store for animation
  scene.userData.whisps = whisps;

  // ----- INITIAL RESIZE -----
  onWindowResize();
}

// ----- HANDLE RESIZE -----
window.addEventListener("resize", onWindowResize);

function onWindowResize() {
  const container = document.getElementById("container");
  const w = container.offsetWidth;
  const h = container.offsetHeight;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();

  renderer.setSize(w, h);
  composer.setSize(w, h);
}

function animate() {
  requestAnimationFrame(animate);

  if (crowhead) crowhead.rotation.y += 0.002; // slow spin

  // Animate whisps

  if (scene.userData.whisps) {
    const positions = scene.userData.whisps.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += 0.002; // move upward
      if (positions[i + 1] > 2.5) positions[i + 1] = -2; // reset when too high
    }
    scene.userData.whisps.geometry.attributes.position.needsUpdate = true;
  }

  controls.update();
  composer.render(); // render via composer with bloom
}
