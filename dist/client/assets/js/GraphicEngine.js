import * as THREE from '/three.module.js';
export class GraphicEngine {
    constructor(pf) {
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
        this.playfield = pf;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, document.body.clientWidth / document.body.clientHeight, 0.5, 100);
        this.renderer = new THREE.WebGLRenderer();
        this.light = new THREE.DirectionalLight(0xffffff, 10);
        this.light.position.set(0, 0, 3);
        this.scene.add(this.light);
        this.camera.position.z = 2;
        this.camera.position.y = -0.5;
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '-1';
        document.body.appendChild(this.renderer.domElement);
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
        this.scene.add(cube);
    }
    createCube(indice, color) {
        let geometry = new THREE.BoxGeometry(this.tetroWidth, this.tetroWidth, this.tetroWidth);
        let material = new THREE.MeshStandardMaterial({
            color: this.cubeColor[color - 1],
            emissive: 0x202020,
            roughness: 0.2,
            metalness: 1
        });
        this.playfield.block[indice] = new THREE.Mesh(geometry, material);
    }
    removeCube(indice) {
        this.scene.remove(this.playfield.block[indice]);
        if (indice < this.playfield.block.length) {
            delete this.playfield.block[indice];
        }
    }
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    animate(time = Date.now()) {
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame((time) => this.animate(time));
    }
}
//# sourceMappingURL=GraphicEngine.js.map