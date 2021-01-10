import * as THREE from '/three.module.js';
import { Playfield } from "./Playfield.js";

class Tetris3D {
    // Composants de base THREE.js
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;

    // Divs container pour les données de jeu
    private nextTetroField?: HTMLElement | undefined;
    private scoreField?: HTMLElement | undefined;
    private linesField?: HTMLElement | undefined;
    private levelField?: HTMLElement | undefined;

    // Boutons pour les contrôles
    private leftButton?: HTMLElement;
    private leftRotButton?: HTMLElement;
    private rightButton?: HTMLElement;
    private rightRotButton?: HTMLElement;
    private downButton?: HTMLElement;

    // Contrôle du jeu
    private playfield : Playfield;
    private isGameOver: boolean = false;
    private tetroFallDelay: number = 1000;
    private isRotKeyDown: boolean = false;

    // ID du timer pour faire tomber les pièces
    private fallCallback?: number;

    // Pièce en cours
    private currentTetro: number;
    private nextTetro: number;
    private currentTetroX: number | undefined;
    private currentTetroY: number | undefined;
    private currentTetroRot: number | undefined;

    // Définition des tetrominos.
    // Dans l'ordre : I, J, L, O, S, Z, T
    private readonly tetro = [
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0]
    ];

    /**
     * Initialisation de THREE.js et création du canvas.
     * @param nextTetroDiv Le div qui doit afficher le prochain tetro
     * @param fc Le nombre de colonnes du terrain de jeu
     * @param fr Le nombre de lignes du terrain de jeu
     */
    public constructor(nextTetroDiv: HTMLElement, fc: number = 10, fr: number = 24) {
        // Initialisation THREE.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, document.body.clientWidth / document.body.clientHeight, 0.5, 100);
        this.renderer = new THREE.WebGLRenderer();

        // Ajout de la zone de jeu au DOM
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '-1';
        document.body.appendChild(this.renderer.domElement);

        // Assignation des div pour le score
        this.nextTetroField = nextTetroDiv;
        this.nextTetroField.style.position = 'relative';

        // Initialisation des données du terrain de jeu
        this.playfield = new Playfield([], fc, fr);

        // Choix du prochain tetro
        this.nextTetro = Math.floor(Math.random() * 7) + 1;
        this.currentTetro = 0;

        // Dimensionnement initial du terrain de jeu
        this.resize();
        window.addEventListener('resize', () => this.resize());

        //  Mise en place des pièces de départ
        this.newTetro();
        this.placeTetro();
    }

    /**
     * Permet de renseigner les div qui contiendront le score et le niveau actuel
     * DOIT être appelé.
     * @param scoreDiv L'élément DOM contenant le score : son textContent sera remplacé
     * @param linesDiv L'élément où doit apparître le nombre de lignes réalisées
     * @param levelDiv L'élément DOM contenant le niveau en cours : son textContent sera remplacé
     */
    public setStatBoard(scoreDiv: HTMLElement, linesDiv: HTMLElement, levelDiv: HTMLElement) {
        this.scoreField = scoreDiv;
        this.linesField = linesDiv;
        this.levelField = levelDiv;
    }

    /**
     * Permet de renseigner les boutons de commande
     * DOIT être appelé.
     * @param lBtn Le bouton Gauche
     * @param lrBtn Le bouton pour tourner la pièce vers la gauche
     * @param rBtn Le bouton Droit
     * @param rrBtn Le bouton pour tourner la pièce vers la droite
     * @param dBtn Le bouton Bas
     */
    public setControls(lBtn: HTMLElement, lrBtn: HTMLElement, rBtn: HTMLElement, rrBtn: HTMLElement, dBtn: HTMLElement) {
        this.leftButton = lBtn;
        this.leftRotButton = lrBtn;
        this.rightButton = rBtn;
        this.rightRotButton = rrBtn;
        this.downButton = dBtn;
        // Ajout des listener
        this.leftButton.addEventListener('click', () => {
            this.moveTetro('left', <KeyboardEvent><unknown>null);
        });
        this.leftRotButton.addEventListener('click', () => {
            this.moveTetro('rotleft', <KeyboardEvent><unknown>null);
        });
        this.rightButton.addEventListener('click', () => {
            this.moveTetro('right', <KeyboardEvent><unknown>null);
        });
        this.rightRotButton.addEventListener('click', () => {
            this.moveTetro('rotright', <KeyboardEvent><unknown>null);
        });
        this.downButton.addEventListener('click', () => {
            this.moveTetro('down', <KeyboardEvent><unknown>null);
        });
        document.addEventListener('keydown', (event: KeyboardEvent) => {
            this.moveTetro('key', event);
        });
        document.addEventListener('keyup', () => {
            this.isRotKeyDown = false;
        });
    }

    /**
     * Démarre le jeu
     */
    public start() {
        // Envoi du timer de chute des pièces
        this.fallCallback = window.setInterval(() => this.tetroFall(), this.tetroFallDelay);
        this.render();
    }

    /**
     * Permet de faire tourner un tetromino selon une rotation donnée.
     * @param tetroToRotate Le tetromino à tourner, dans sa position par défaut
     * @param rotation Le type de rotation à effectuer
     * @returns Un tableau contenant le tetromino tourné
     */
    private static rotate(tetroToRotate: number[], rotation: number | undefined) {
        let rotatedTetro: number[] = [];
        for (let row: number = 0; row < 4; row++) {
            for (let col: number = 0; col < 4; col++) {
                switch (rotation) {
                    case 0:
                        // Aucune rotation
                        rotatedTetro[col + row * 4] = tetroToRotate[col + row * 4];
                        break;
                    case 1:
                        // 90° sens horaire
                        rotatedTetro[col + row * 4] = tetroToRotate[12 + row - (col * 4)];
                        break;
                    case 2:
                        // 180° sens horaire
                        rotatedTetro[col + row * 4] = tetroToRotate[15 - (row * 4) - col];
                        break;
                    case 3:
                        // 270° sens horaire
                        rotatedTetro[col + row * 4] = tetroToRotate[3 - row + (col * 4)];
                        break;
                    default:
                        break;
                }
            }
        }
        return rotatedTetro;
    }

    /**
     * Permet de déplacer un tetromino.
     * @param action L'action a effectuer.
     * @param keyEvent Si c'est une touche du clavier qui a été appuyé, permet de récupérer la touche appuyée.
     * @param isCallback Mise à true par le callback pour indiquer que la pièce tombe.
     */
    private moveTetro(action: string, keyEvent: KeyboardEvent, isCallback: boolean = false) {
        if (!this.isRotKeyDown && !this.isGameOver) {
            let nextTetroX: number;
            let nextTetroY: number;
            let nextTetroRot: number;
            nextTetroX = <number>this.currentTetroX;
            nextTetroY = <number>this.currentTetroY;
            nextTetroRot = <number>this.currentTetroRot;

            // Gestion boutons de l'interface
            switch (action) {
                case 'left':
                    nextTetroX--;
                    break;
                case 'rotleft':
                    nextTetroRot--;
                    if (nextTetroRot < 0) {
                        nextTetroRot = 3;
                    }
                    break;
                case 'right':
                    nextTetroX++;
                    break;
                case 'rotright':
                    nextTetroRot++;
                    if (nextTetroRot > 3) {
                        nextTetroRot = 0;
                    }
                    break;
                case 'down':
                    if (!isCallback) {
                        // Si on fait descendre la pièce et que ce n'est pas le callback
                        this.scorePoints(10);
                        window.clearInterval(this.fallCallback);
                        this.fallCallback = window.setInterval(this.tetroFall, this.tetroFallDelay);
                    }
                    nextTetroY++;
                    break;
                case 'key':
                    // Gestion touches du clavier
                    switch (keyEvent.key) {
                        case 'Escape':
                            if (this.fallCallback) {
                                window.clearInterval(this.fallCallback);
                            }
                            else {
                                this.fallCallback = window.setInterval(this.tetroFall, this.tetroFallDelay);
                            }
                            break;
                        case 'q':
                        case 'Q':
                            nextTetroX--;
                            break;
                        case 'a':
                        case 'A':
                            this.isRotKeyDown = true;
                            nextTetroRot--;
                            if (nextTetroRot < 0) {
                                nextTetroRot = 3;
                            }
                            break;
                        case 'd':
                        case 'D':
                            nextTetroX++;
                            break;
                        case 'e':
                        case 'E':
                            this.isRotKeyDown = true;
                            nextTetroRot++;
                            if (nextTetroRot > 3) {
                                nextTetroRot = 0;
                            }
                            break;
                        case 's':
                        case 'S':
                            // On rajoute 10 points par lignes quand on fait descendre volontairement la pièce
                            this.scorePoints(10);
                            window.clearInterval(this.fallCallback);
                            this.fallCallback = window.setInterval(this.tetroFall, this.tetroFallDelay);
                            nextTetroY++;
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }

            // Peut on placer ce tetro à cet endroit ?
            // On met d'abord des 0 à l'emplacement de la pièce
            this.placeTetro(false);
            // On teste
            if (this.canPlaceTetro(nextTetroX, nextTetroY, nextTetroRot)) {
                // On peut placer le tetro : le tetro descend
                this.currentTetroX = nextTetroX;
                this.currentTetroY = nextTetroY;
                this.currentTetroRot = nextTetroRot;
                this.placeTetro();
            }
            else {
                let willStick: boolean = false;
                // On vérifie si c'est le joueur qui fait descendre le tetro,
                // ou si c'est la chute normale du tetro
                if (keyEvent) {
                    if ((keyEvent.key === 's') || (keyEvent.key === 'S')) {
                        willStick = true;
                    }
                }
                else {
                    if (action === 'down') {
                        willStick = true;
                    }
                }
                if (willStick) {
                    // La pièce s'accroche
                    this.placeTetro();
                    // On rajoute 50 points pour avoir collé la pièce
                    this.scorePoints(50);
                    this.checkLines();
                    this.newTetro();
                }
                else {
                    // Movement droite/gauche
                    this.placeTetro();
                }
            }
        }
    }

    /**
     * Permet de vérifier si on peut placer le tetromino à cet endroit.
     * @param {int} xToCheck La position X du tetromino à vérifier
     * @param {int} yToCheck La position Y du tetromino à vérifier
     * @param {int} rotToCheck La rotation à appliquer au tetromino en cours de vérification
     * @returns {boolean} true si la pièce peut être placée, sinon false
     */
    private canPlaceTetro(xToCheck: number, yToCheck: number, rotToCheck: number) {
        let tetroArray: number[] = Tetris3D.rotate((this.tetro)[this.currentTetro - 1], rotToCheck);
        let canPlace: boolean = true;
        check:
            for (let row: number = 0; row < 4; row++) {
                for (let col: number = 0; col < 4; col++) {
                    if (tetroArray[col + row * 4] !== 0) {
                        if (this.playfield.data[xToCheck + col + (yToCheck + row) * this.playfield.cols] !== 0) {
                            canPlace = false;
                            break check;
                        }
                    }
                }
            }
        return canPlace;
    }

    /**
     * Permet d'afficher ou de masquer un tetromino.
     * @param show Toggle pour afficher ou cacher le tetromino.
     */
    private placeTetro(show: boolean = true) {
        let tetroArray = Tetris3D.rotate(this.tetro[this.currentTetro - 1], this.currentTetroRot);
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (tetroArray[x + y * 4] !== 0) {
                    // @ts-ignore
                    this.playfield.data[this.currentTetroX + x + (this.currentTetroY + y) * this.playfield.cols] = show ? this.currentTetro : 0;
                }
            }
        }
        // Mets aussi à jour le nouveau tetro
        this.updateNextTetro();
    }

    /**
     * Permet de vérifier si des lignes ont été réalisées.
     */
    private checkLines() {
        // On recherche d'abord les lignes
        let rowsToRemove = [];
        for (let y = 10; y < this.playfield.rows - 1; y++) {
            let hasLine = true;
            for (let x = 1; x < this.playfield.cols - 1; x++) {
                if (this.playfield.data[x + y * this.playfield.cols] === 0) {
                    hasLine = false;
                }
            }
            if (hasLine) {
                rowsToRemove.push(y);
            }
        }
        // Si il y a des lignes à enlever, on le fait
        if (rowsToRemove.length) {
            // On calcule d'abord le bonus
            // @ts-ignore
            let pointsScored = ((50 + (50 * parseInt(this.levelField.textContent))) * rowsToRemove.length) * rowsToRemove.length;
            let hasPassedLevel = false;
            for (let rowToRemove of rowsToRemove) {
                for (let x = 1; x < this.playfield.cols - 1; x++) {
                    // On met la case à zéro
                    this.playfield.data[x + rowToRemove * this.playfield.cols] = 0;
                    // Et on fait tomber les blocs
                    for (let y = rowToRemove - 1; y >= 0; y--) {
                        this.playfield.data[x + (y + 1) * this.playfield.cols] = this.playfield.data[x + y * this.playfield.cols];
                    }
                }
                // @ts-ignore
                this.linesField.textContent = parseInt(this.linesField.textContent) + 1;
                // On monte d'un niveau toute les 10 lignes
                // @ts-ignore
                if (!(parseInt(this.linesField.textContent) % 10)) {
                    hasPassedLevel = true;
                }
            }
            this.scorePoints(pointsScored);
            // On monte d'un niveau toute les 10 lignes
            if (hasPassedLevel) {
                // @ts-ignore
                this.levelField.textContent = parseInt(this.levelField.textContent) + 1;
                // Et on diminue le delai de chute des pièces de 5%
                this.tetroFallDelay = this.tetroFallDelay * 0.95;
                // On arrête et relance le timer avec le nouveau delai
                window.clearInterval(this.fallCallback);
                this.fallCallback = window.setInterval(this.tetroFall, this.tetroFallDelay);
            }
        }
    }

    /**
     * Dessine le tetromino suivant dans sa fenêtre dédiée.
     */
    private updateNextTetro() {
        // @ts-ignore
        this.nextTetroField.innerHTML = '';
        let nextTetroSize: number;
        // @ts-ignore
        if (this.nextTetroField.clientHeight < this.nextTetroField.clientWidth) {
            // @ts-ignore
            nextTetroSize = this.nextTetroField.clientHeight * 0.75;
        }
        else {
            // @ts-ignore
            nextTetroSize = this.nextTetroField.clientWidth * 0.75;
        }
        let nextTetroBloc: number = nextTetroSize / 4;
        // @ts-ignore
        let nextTetroDivTop: number = this.nextTetroField.clientHeight / 2 - nextTetroBloc * 2;
        // @ts-ignore
        let nextTetroDivLeft: number = this.nextTetroField.clientWidth / 2 - nextTetroBloc * 2;
        // Rendu du tetro
        let nextTetroData: number[] = (this.tetro)[this.nextTetro - 1];
        for (let row: number = 0; row < 4; row++) {
            for (let col: number = 0; col < 4; col++) {
                if (nextTetroData[col + row * 4] !== 0) {
                    // Création du bloc
                    let block: HTMLElement = document.createElement('div');
                    block.style.position = 'absolute';
                    block.style.width = nextTetroBloc + 'px';
                    block.style.height = nextTetroBloc + 'px';
                    block.style.top = (nextTetroDivTop + nextTetroBloc * row) + 'px';
                    block.style.left = (nextTetroDivLeft + nextTetroBloc * col) + 'px';
                    block.classList.add('tetromino')

                    // Sélection de la pièce à afficher
                    block.classList.add('tetromino' + this.nextTetro);

                    // Dessin du bloc
                    // @ts-ignore
                    this.nextTetroField.appendChild(block);
                }
            }
        }
    }

    /**
     * Fais du prochain tetromino le tetromino en cours, et crée le suivant.
     */
    private newTetro() {
        this.currentTetro = this.nextTetro;
        this.nextTetro = Math.floor(Math.random() * 7) + 1;
        this.currentTetroRot = Math.floor(Math.random() * 4);
        this.currentTetroX = this.playfield.cols / 2 - 2;
        this.currentTetroY = 9;
        if (this.canPlaceTetro(this.currentTetroX, this.currentTetroY, this.currentTetroRot)) {
            this.placeTetro();
        }
        else {
            // Impossible de placer le nouveau tetro : donc fin de jeu
            this.placeTetro();
            window.clearInterval(this.fallCallback);
            this.isGameOver = true;
            // @ts-ignore
            this.nextTetroField.innerHTML = 'GAME OVER';
        }
    }

    /**
     * Fonction callback qui fait tomber naturellement la pièce.
     */
    private tetroFall() {
        this.moveTetro('down', <KeyboardEvent><unknown>null, true);
    }

    /**
     * Permet de rajouter des points au score du joueur
     * @param {int} points Points à rajouter au score
     */
    private scorePoints(points: number) {
        // @ts-ignore
        this.scoreField.textContent = (parseInt(this.scoreField.textContent) + points);
    }

    /**
     * Callback pour le redimensionnement de la fenêtre.
     * Met à jour le ratio de l'écran pour la caméra,
     * redimensionne la taille du rendu,
     * et met à jour les coordonnées du centre de l'écran.
     */
    private resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Dessine la scène 3D.
     */
    private render() {
        // Début du parcours du tableau de jeu
        for (let row = 0; row < this.playfield.rows; row++) {
            for (let col = 0; col < this.playfield.cols; col++) {
                // On n'affiche pas les 10 premières lignes
                if (row > 9) {
                    // Création du bloc à afficher

                }
            }
        }
        window.requestAnimationFrame(() => this.render());
    }
}

export { Tetris3D };