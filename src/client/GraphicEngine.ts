import * as THREE from '/three.module.js';
import {Playfield} from "./Playfield";

export class GraphicEngine {
    // Composants de base THREE.js
    private readonly scene: THREE.Scene;
    private readonly camera: THREE.PerspectiveCamera;
    private readonly light: THREE.DirectionalLight;
    private renderer: THREE.WebGLRenderer;

    // Le terrain de jeu
    private playfield: Playfield;
    private origin: THREE.Vector3;

    private readonly tetroWidth: number;
    private cubeColor: number[] = [
        0x008080,
        0x000080,
        0xff8000,
        0xffff00,
        0x008000,
        0x800000,
        0x800080,
        0x010101
    ];

    /**
     * Initialise le terrain de jeu et les composants de base THREE.
     * @param pf Le terrain de jeu.
     */
    public constructor(pf: Playfield) {
        this.playfield = pf;

        // Initialisation THREE
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, document.body.clientWidth / document.body.clientHeight, 0.5, 100);
        this.renderer = new THREE.WebGLRenderer();

        this.light = new THREE.DirectionalLight(0xffffff, 10);
        this.light.position.set(0, 0, 3);
        this.scene.add(this.light);

        this.camera.position.z = 2;
        this.camera.position.y = -0.5;

        // Ajout de la zone de jeu au DOM
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '-1';
        document.body.appendChild(this.renderer.domElement);


        // Dimensionnement initial du terrain de jeu
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Si le terrain est plus large que haut
        if (this.playfield.cols > this.playfield.rows) {
            // On adapte le terrain pour prendre toute la largeur
            this.tetroWidth = 2 / this.playfield.cols;
            this.origin = new THREE.Vector3(-1, this.playfield.rows * this.tetroWidth / 2, 0);
        }
        else {
            // Sinon on adapte le terrain pour prendre toute la hauteur
            this.tetroWidth = 2 / this.playfield.rows;
            this.origin = new THREE.Vector3(-(this.playfield.cols * this.tetroWidth / 2), 1, 0);
        }
    }

    /**
     * Place un cube dans la scène.
     * @param cube Le cube à placer.
     * @param col La colonne sur laquelle se trouve le cube.
     * @param row La ligne sur laquelle se trouve le cube.
     */
    public placeCube(cube: THREE.Mesh, col: number, row: number) {
        cube.position.set(this.origin.x + col * this.tetroWidth, this.origin.y - row * this.tetroWidth, 0);
        this.scene.add(cube);
    }

    /**
     * Créé un cube à l'indice du tableau donné.
     * @param indice L'indice du tableau où créer le cube.
     * @param color La couleur du cube à créer.
     */
    public createCube(indice: number, color: number) {
        let geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.tetroWidth, this.tetroWidth, this.tetroWidth);
        let material: THREE.MeshStandardMaterial = new THREE.MeshStandardMaterial({
            color: this.cubeColor[color - 1],
            emissive: 0x202020,
            roughness: 0.2,
            metalness: 1
        });
        this.playfield.block[indice] = new THREE.Mesh(geometry, material);
    }

    /**
     * Retire le cube à l'indice donné.
     * @param indice L'indice du cube à supprimer.
     */
    public removeCube(indice: number) {
        this.scene.remove(this.playfield.block[indice]);
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
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Dessine la scène 3D.
     * @param time Le delta temps.
     */
    public animate(time: number = Date.now()) {
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame((time: number) => this.animate(time));
    }
}
