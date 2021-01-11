import { HTMLView } from "./HTMLView.js";
import { Playfield } from "./Playfield.js";
import { GraphicEngine } from "./GraphicEngine.js";

class Tetris3D {
    // Vue HTML du jeu
    private view: HTMLView;

    // Données du jeu
    private readonly playfield : Playfield;

    // Moteur graphique
    private engine: GraphicEngine;

    // Contrôle du jeu
    private isGameOver: boolean = false;
    private tetroFallDelay: number = 1000;
    private isRotKeyDown: boolean = false;

    // ID du timer pour faire tomber les pièces
    private fallCallback?: number;

    // Pièce en cours
    private currentTetro: number;
    private nextTetro: number;
    private currentTetroX?: number;
    private currentTetroY?: number;
    private currentTetroRot?: number;

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
     * @param fc Le nombre de colonnes du terrain de jeu
     * @param fr Le nombre de lignes du terrain de jeu
     */
    public constructor(fc: number = 10, fr: number = 24) {
        // Création de l'objet pour la vue HTML
        this.view = new HTMLView();

        // Initialisation des données du terrain de jeu
        this.playfield = new Playfield(fc, fr);

        // Création du moteur graphique
        this.engine = new GraphicEngine(this.playfield);

        // Choix du prochain tetro
        this.nextTetro = Math.floor(Math.random() * 7) + 1;
        this.currentTetro = 0;

        // Création des murs extérieurs du terrain de jeu
        for (let row: number = 0; row < this.playfield.rows; row++) {
            for (let col: number = 0; col < this.playfield.cols; col++) {
                // On n'affiche pas les 10 premières lignes
                if (row > 9) {
                    if ((col == 0) || (col == this.playfield.cols - 1) || (row == this.playfield.rows - 1)) {
                        // On met des tetromino incassables sur les bords et le bas
                        // pour délimiter le terrain de jeu.
                        this.playfield.data.push(8);
                        this.engine.createCube(col + this.playfield.cols * row, 8);
                        this.engine.placeCube(this.playfield.block[col + this.playfield.cols * row], col, row);
                    }
                    else {
                        // On laisse l'espace vide pour le reste.
                        this.playfield.data.push(0);
                    }
                }
            }
        }
    }

    /**
     * Permet de renseigner les div qui contiendront le score et le niveau actuel
     * DOIT être appelé.
     * @param nextTetro Le div qui doit afficher le prochain tetro
     * @param scoreDiv L'élément DOM contenant le score : son textContent sera remplacé
     * @param linesDiv L'élément où doit apparître le nombre de lignes réalisées
     * @param levelDiv L'élément DOM contenant le niveau en cours : son textContent sera remplacé
     */
    public setView(nextTetro: HTMLElement, scoreDiv: HTMLElement, linesDiv: HTMLElement, levelDiv: HTMLElement) {
        // Assignation des div pour le prochain tetro
        this.view.nextTetro = nextTetro;
        this.view.nextTetro.style.position = 'relative';
        this.view.score = scoreDiv;
        this.view.lines = linesDiv;
        this.view.level = levelDiv;
    }

    /**
     * Permet de renseigner les boutons de commande.
     * DOIT être appelé, mais si aucun argument, seul les touches du claviers seront disponibles.
     * @param lBtn Le bouton Gauche
     * @param lrBtn Le bouton pour tourner la pièce vers la gauche
     * @param rBtn Le bouton Droit
     * @param rrBtn Le bouton pour tourner la pièce vers la droite
     * @param dBtn Le bouton Bas
     */
    public setControl(lBtn?: HTMLElement, lrBtn?: HTMLElement, rBtn?: HTMLElement, rrBtn?: HTMLElement, dBtn?: HTMLElement) {
        this.view.leftBtn = lBtn;
        this.view.leftRotBtn = lrBtn;
        this.view.rightBtn = rBtn;
        this.view.rightRotBtn = rrBtn;
        this.view.downBtn = dBtn;
        // Ajout des listener
        this.view.leftBtn?.addEventListener('click', () => {
            this.moveTetro('left', <KeyboardEvent><unknown>null);
        });
        this.view.leftRotBtn?.addEventListener('click', () => {
            this.moveTetro('rotleft', <KeyboardEvent><unknown>null);
        });
        this.view.rightBtn?.addEventListener('click', () => {
            this.moveTetro('right', <KeyboardEvent><unknown>null);
        });
        this.view.rightRotBtn?.addEventListener('click', () => {
            this.moveTetro('rotright', <KeyboardEvent><unknown>null);
        });
        this.view.downBtn?.addEventListener('click', () => {
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
        //  Mise en place des pièces de départ
        this.newTetro();
        // Envoi du timer de chute des pièces
        this.fallCallback = window.setInterval(() => this.tetroFall(), this.tetroFallDelay);
        this.engine.animate();
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
                        this.view.scorePoints(10);
                        window.clearInterval(this.fallCallback);
                        this.fallCallback = window.setInterval(() => this.tetroFall(), this.tetroFallDelay);
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
                                this.fallCallback = window.setInterval(() => this.tetroFall(), this.tetroFallDelay);
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
                            this.view.scorePoints(10);
                            window.clearInterval(this.fallCallback);
                            this.fallCallback = window.setInterval(() => this.tetroFall(), this.tetroFallDelay);
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
                    this.view.scorePoints(50);
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
                    let indice = this.currentTetroX + x + (this.currentTetroY + y) * this.playfield.cols;
                    this.playfield.data[indice] = show ? this.currentTetro : 0;
                    if (show) {
                        this.engine.createCube(indice, this.currentTetro);
                        // @ts-ignore
                        this.engine.placeCube(this.playfield.block[indice], this.currentTetroX + x, this.currentTetroY + y);
                    }
                    else {
                        if (this.playfield.block[indice]) {
                            this.engine.removeCube(indice);
                        }
                    }
                }
            }
        }
        // Mets aussi à jour le nouveau tetro
        this.view.updateNextTetro(this.tetro, this.nextTetro);
    }

    /**
     * Permet de vérifier si des lignes ont été réalisées.
     */
    private checkLines() {
        // On recherche d'abord les lignes
        let rowsToRemove = [];
        for (let row: number = 10; row < this.playfield.rows - 1; row++) {
            let hasLine = true;
            for (let col: number = 1; col < this.playfield.cols - 1; col++) {
                if (this.playfield.data[col + row * this.playfield.cols] === 0) {
                    hasLine = false;
                }
            }
            if (hasLine) {
                rowsToRemove.push(row);
            }
        }
        // Si il y a des lignes à enlever, on le fait
        if (rowsToRemove.length) {
            // On calcule d'abord le bonus
            // @ts-ignore
            let pointsScored = ((50 + (50 * parseInt(this.view.level.textContent))) * rowsToRemove.length) * rowsToRemove.length;
            let hasPassedLevel = false;
            for (let rowToRemove of rowsToRemove) {
                for (let col: number = 1; col < this.playfield.cols - 1; col++) {
                    // On met la case à zéro
                    this.playfield.data[col + rowToRemove * this.playfield.cols] = 0;
                    this.engine.removeCube(col + rowToRemove * this.playfield.cols);
                    // Et on fait tomber les blocs
                    for (let row: number = rowToRemove - 1; row >= 0; row--) {
                        this.playfield.data[col + (row + 1) * this.playfield.cols] = this.playfield.data[col + row * this.playfield.cols];
                        if (this.playfield.data[col + (row + 1) * this.playfield.cols]) {
                            this.engine.createCube(col + (row + 1) * this.playfield.cols, this.playfield.data[col + row * this.playfield.cols]);
                            this.engine.removeCube(col + row * this.playfield.cols);
                            this.engine.placeCube(this.playfield.block[col + (row + 1) * this.playfield.cols], col, row + 1);
                        }
                    }
                }
                // @ts-ignore
                this.view.lines.textContent = parseInt(this.view.lines.textContent) + 1;
                // On monte d'un niveau toute les 10 lignes
                // @ts-ignore
                if (!(parseInt(this.view.lines.textContent) % 10)) {
                    hasPassedLevel = true;
                }
            }
            this.view.scorePoints(pointsScored);
            // On monte d'un niveau toute les 10 lignes
            if (hasPassedLevel) {
                // @ts-ignore
                this.view.level.textContent = <string><unknown>parseInt(this.view.level.textContent) + 1;
                // Et on diminue le delai de chute des pièces de 5%
                this.tetroFallDelay = this.tetroFallDelay * 0.95;
                // On arrête et relance le timer avec le nouveau delai
                window.clearInterval(this.fallCallback);
                this.fallCallback = window.setInterval(this.tetroFall, this.tetroFallDelay);
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
            this.view.nextTetro.innerHTML = 'GAME OVER';
        }
    }

    /**
     * Fonction callback qui fait tomber naturellement la pièce.
     */
    private tetroFall() {
        this.moveTetro('down', <KeyboardEvent><unknown>null, true);
    }
}

export { Tetris3D };
