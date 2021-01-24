import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
export class GraphicEngine {
    constructor(canvas, pf) {
        this.cubeColor = [
            0x008080,
            0x000080,
            0xff4000,
            0xffff00,
            0x008000,
            0x800000,
            0x800080,
            0xffffff
        ];
        this.texture = [];
        this.material = [];
        this.frameDelta = 0;
        this.canvas = canvas;
        this.playfield = pf;
        let groundY = -1;
        if (this.playfield.cols > this.playfield.rows) {
            this.tetroWidth = 2 / this.playfield.cols;
            this.origin = new THREE.Vector3(-1, this.playfield.rows * this.tetroWidth / 2, 0);
            groundY = -(this.playfield.rows * this.tetroWidth / 2);
        }
        else {
            this.tetroWidth = 2 / this.playfield.rows;
            this.origin = new THREE.Vector3(-(this.playfield.cols * this.tetroWidth / 2), 1, 0);
        }
        this.cubeGeometry = new THREE.BoxGeometry(this.tetroWidth, this.tetroWidth, this.tetroWidth);
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.5);
        this.camera = new THREE.PerspectiveCamera(75, document.body.clientWidth / document.body.clientHeight, 0.01, 100);
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.position.z = 1.5;
        this.playFieldGroup = new THREE.Group();
        this.scene.add(this.playFieldGroup);
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.maxAzimuthAngle = Math.PI / 2;
        this.controls.maxDistance = 2;
        for (let x = -1; x <= 1; x += 0.5) {
            for (let y = -1; y <= 1; y += 0.5) {
                let light = new THREE.DirectionalLight(0xffffff, 0.1);
                light.position.set(x, y, -1);
                light.position.set(x, y, 1);
                this.playFieldGroup.add(light);
            }
        }
        this.texture[0] = new THREE.TextureLoader().load('/assets/tex/cube.jpg');
        this.texture[1] = new THREE.TextureLoader().load('/assets/tex/wall.jpg');
        this.texture[2] = new THREE.TextureLoader().load('/assets/tex/cube-bump.jpg');
        this.texture[3] = new THREE.TextureLoader().load('/assets/tex/wall-bump.jpg');
        this.texture[4] = new THREE.TextureLoader().load('/assets/tex/ground.jpg');
        this.texture[5] = new THREE.TextureLoader().load('/assets/tex/ground-bump.jpg');
        for (let color = 0; color < 9; color++) {
            this.material[color] = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(this.cubeColor[color - 1]),
                map: (color < 8) ? this.texture[0] : this.texture[1],
                bumpMap: (color < 8) ? this.texture[2] : this.texture[3],
                bumpScale: 0.025
            });
        }
        this.texture[4].wrapS = THREE.RepeatWrapping;
        this.texture[4].wrapT = THREE.RepeatWrapping;
        this.texture[5].wrapS = THREE.RepeatWrapping;
        this.texture[5].wrapT = THREE.RepeatWrapping;
        this.texture[4].repeat.set(20, 20);
        this.texture[5].repeat.set(20, 20);
        this.material[9] = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0xffffff),
            map: this.texture[4],
            bumpMap: this.texture[5],
            bumpScale: 0.025,
            side: THREE.DoubleSide
        });
        let groundGeometry = new THREE.PlaneGeometry(3, 3);
        this.ground = new THREE.Mesh(groundGeometry, this.material[9]);
        this.ground.rotateX(-Math.PI / 2);
        this.ground.translateZ(groundY);
        this.scene.add(this.ground);
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    placeCube(cube, col, row) {
        cube.position.set(this.origin.x + col * this.tetroWidth, this.origin.y - row * this.tetroWidth, 0);
    }
    createCube(indice, color) {
        this.playfield.block[indice] = new THREE.Mesh(this.cubeGeometry, this.material[color]);
        this.playFieldGroup.add(this.playfield.block[indice]);
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