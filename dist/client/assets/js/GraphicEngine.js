import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
export class GraphicEngine {
    constructor(canvas, pf) {
        this.cubeColor = [
            0x008080,
            0x000080,
            0xff8000,
            0xffff00,
            0x008000,
            0x800000,
            0x800080,
            0x010101
        ];
        this.canvas = canvas;
        this.playfield = pf;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, document.body.clientWidth / document.body.clientHeight, 0.5, 100);
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.playFieldGroup = new THREE.Group();
        this.scene.add(this.playFieldGroup);
        this.controls = new OrbitControls(this.camera, this.canvas);
        for (let x = -1; x <= 1; x += 0.5) {
            for (let y = -1; y <= 1; y += 0.5) {
                for (let z = 0; z <= 1; z += 0.5) {
                    let light = new THREE.DirectionalLight(0xffffff, 3);
                    light.position.set(x, y, z);
                    this.playFieldGroup.add(light);
                }
            }
        }
        this.camera.position.z = 2;
        this.camera.position.y = -1;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        if (this.playfield.cols > this.playfield.rows) {
            this.tetroWidth = 2 / this.playfield.cols;
            this.origin = new THREE.Vector3(-1, this.playfield.rows * this.tetroWidth / 2, 0);
        }
        else {
            this.tetroWidth = 2 / this.playfield.rows;
            this.origin = new THREE.Vector3(-(this.playfield.cols * this.tetroWidth / 2), 1, 0);
        }
    }
    placeCube(cube, col, row) {
        cube.position.set(this.origin.x + col * this.tetroWidth, this.origin.y - row * this.tetroWidth, 0);
        this.playFieldGroup.add(cube);
    }
    createCube(indice, color) {
        let geometry = new THREE.BoxGeometry(this.tetroWidth, this.tetroWidth, this.tetroWidth);
        let material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(this.cubeColor[color - 1]),
            emissive: new THREE.Color(0x202020),
            roughness: 0.2,
            metalness: 1.0
        });
        this.playfield.block[indice] = new THREE.Mesh(geometry, material);
    }
    removeCube(indice) {
        this.playFieldGroup.remove(this.playfield.block[indice]);
        if (indice < this.playfield.block.length) {
            delete this.playfield.block[indice];
        }
    }
    resize() {
        this.camera.aspect = this.canvas.parentElement.clientWidth / this.canvas.parentElement.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.parentElement.clientWidth, this.canvas.parentElement.clientHeight);
    }
    animate(time = Date.now()) {
        window.requestAnimationFrame((time) => this.animate(time));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
//# sourceMappingURL=GraphicEngine.js.map