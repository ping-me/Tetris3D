import * as THREE from '/three.module.js';
class Tetris3D {
    /**
     * Initialisation de THREE.js et création du canvas
     */
    constructor() {
        // Initialisation générale
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, document.body.clientWidth / document.body.clientHeight, 0.5, 100);
        this.renderer = new THREE.WebGLRenderer();
        // Création du canvas
        document.body.appendChild(this.renderer.domElement);
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    /**
     * Callback pour le redimensionnement de la fenêtre.
     * Met à jour le ratio de l'écran pour la caméra,
     * redimensionne la taille du rendu,
     * et met à jour les coordonnées du centre de l'écran.
     */
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    /**
     * Démarre le jeu
     */
    startGame() {
    }
}
export { Tetris3D };
