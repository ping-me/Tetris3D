import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls'
import { Playfield } from "./Playfield";

export class GraphicEngine {
    // Composants de base THREE.js
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;

    private readonly playFieldGroup: THREE.Group;

    // Le terrain de jeu
    private readonly canvas: HTMLCanvasElement;
    private playfield: Playfield;
    private origin: THREE.Vector3;
    private readonly ground: THREE.Mesh;

    private readonly tetroWidth: number;
    private cubeColor: number[] = [
        0x008080,
        0x000080,
        0xff4000,
        0xffff00,
        0x008000,
        0x800000,
        0x800080,
        0xffffff
    ];

    // Geometry, textures et materials
    private readonly cubeGeometry: THREE.Geometry;
    private texture: THREE.Texture[] = [];
    private material: THREE.Material[] = [];

    private frameDelta: number = 0;

    /**
     * Initialise le terrain de jeu et les composants de base THREE.
     * @param canvas Le canvas 3D
     * @param pf Le terrain de jeu.
     */
    public constructor(canvas: HTMLCanvasElement, pf: Playfield) {
        this.canvas = canvas;
        this.playfield = pf;

        // Calcul de la taille d'un cube et création du sol
        // Si le terrain est plus large que haut
        let groundY = -1;
        if (this.playfield.cols > this.playfield.rows) {
            // On adapte le terrain pour prendre toute la largeur
            this.tetroWidth = 2 / this.playfield.cols;
            this.origin = new THREE.Vector3(-1, this.playfield.rows * this.tetroWidth / 2, 0);
            groundY = -(this.playfield.rows * this.tetroWidth / 2);
        }
        else {
            // Sinon on adapte le terrain pour prendre toute la hauteur
            this.tetroWidth = 2 / this.playfield.rows;
            this.origin = new THREE.Vector3(-(this.playfield.cols * this.tetroWidth / 2), 1, 0);
        }

        this.cubeGeometry = new THREE.BoxGeometry(this.tetroWidth, this.tetroWidth, this.tetroWidth);

        // Initialisation THREE
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.5);

        this.camera = new THREE.PerspectiveCamera(75, document.body.clientWidth / document.body.clientHeight, 0.01, 100);
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true
        });
        this.renderer.setPixelRatio( window.devicePixelRatio );

        this.camera.position.z = 1.5;

        this.playFieldGroup = new THREE.Group();
        this.scene.add(this.playFieldGroup);

        // Initialisation du control caméra
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.maxAzimuthAngle = Math.PI / 2;
        this.controls.maxDistance = 2;

        // Placement des lumières
        for (let x: number = -1; x <= 1; x += 0.5) {
            for (let y: number = -1; y <= 1; y += 0.5) {
                let light = new THREE.DirectionalLight(0xffffff, 0.1);
                light.position.set(x, y, -1);
                light.position.set(x, y, 1);
                this.playFieldGroup.add(light);
            }
        }

        // Chargement des textures
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

        // Création du sol
        let groundGeometry = new THREE.PlaneGeometry(3, 3);
        this.ground = new THREE.Mesh(groundGeometry, this.material[9]);
        this.ground.rotateX(-Math.PI / 2);
        this.ground.translateZ(groundY);
        this.scene.add(this.ground);

        // Dimensionnement initial du terrain de jeu
        this.resize();
        window.addEventListener('resize', () => this.resize());

    }

    /**
     * Place un cube dans la scène.
     * @param cube Le cube à placer.
     * @param col La colonne sur laquelle se trouve le cube.
     * @param row La ligne sur laquelle se trouve le cube.
     */
    public placeCube(cube: THREE.Mesh, col: number, row: number) {
        cube.position.set(this.origin.x + col * this.tetroWidth, this.origin.y - row * this.tetroWidth, 0);
    }

    /**
     * Créé un cube à l'indice du tableau donné.
     * @param indice L'indice du tableau où créer le cube.
     * @param color La couleur du cube à créer.
     */
    public createCube(indice: number, color: number) {
        this.playfield.block[indice] = new THREE.Mesh(this.cubeGeometry, this.material[color]);
        this.playFieldGroup.add(this.playfield.block[indice]);
    }

    /**
     * Retire le cube à l'indice donné.
     * @param indice L'indice du cube à supprimer.
     */
    public removeCube(indice: number) {
        this.playFieldGroup.remove(this.playfield.block[indice]);
        if (indice < this.playfield.block.length) {
            delete this.playfield.block[indice];
        }
    }

    /**
     * Callback pour le redimensionnement de la fenêtre.
     * Met à jour le ratio de l'écran pour la caméra,
     * redimensionne la taille du rendu,
     * et met à jour les coordonnées du centre de l'écran.
     */
    public resize() {
        // @ts-ignore
        this.camera.aspect = this.canvas.parentElement.clientWidth / this.canvas.parentElement.clientHeight;
        this.camera.updateProjectionMatrix();
        // @ts-ignore
        this.renderer.setSize(this.canvas.parentElement.clientWidth, this.canvas.parentElement.clientHeight);
    }

    /**
     * Dessine la scène 3D.
     * @param time Le delta temps.
     */
    public animate(time: number = Date.now()) {
        window.requestAnimationFrame((time: number) => this.animate(time));
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}
