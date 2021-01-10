import * as THREE from '/three.module.js';
import { Playfield } from "./Playfield.js";
class Tetris3D {
    constructor(nextTetroDiv, fc = 10, fr = 24) {
        this.isGameOver = false;
        this.tetroFallDelay = 1000;
        this.isRotKeyDown = false;
        this.tetro = [
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0]
        ];
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, document.body.clientWidth / document.body.clientHeight, 0.5, 100);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.domElement.style.position = 'fixed';
        this.renderer.domElement.style.top = '0';
        this.renderer.domElement.style.left = '0';
        this.renderer.domElement.style.zIndex = '-1';
        document.body.appendChild(this.renderer.domElement);
        this.nextTetroField = nextTetroDiv;
        this.nextTetroField.style.position = 'relative';
        this.playfield = new Playfield([], fc, fr);
        this.nextTetro = Math.floor(Math.random() * 7) + 1;
        this.currentTetro = 0;
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.newTetro();
        this.placeTetro();
    }
    setStatBoard(scoreDiv, linesDiv, levelDiv) {
        this.scoreField = scoreDiv;
        this.linesField = linesDiv;
        this.levelField = levelDiv;
    }
    setControls(lBtn, lrBtn, rBtn, rrBtn, dBtn) {
        this.leftButton = lBtn;
        this.leftRotButton = lrBtn;
        this.rightButton = rBtn;
        this.rightRotButton = rrBtn;
        this.downButton = dBtn;
        this.leftButton.addEventListener('click', () => {
            this.moveTetro('left', null);
        });
        this.leftRotButton.addEventListener('click', () => {
            this.moveTetro('rotleft', null);
        });
        this.rightButton.addEventListener('click', () => {
            this.moveTetro('right', null);
        });
        this.rightRotButton.addEventListener('click', () => {
            this.moveTetro('rotright', null);
        });
        this.downButton.addEventListener('click', () => {
            this.moveTetro('down', null);
        });
        document.addEventListener('keydown', (event) => {
            this.moveTetro('key', event);
        });
        document.addEventListener('keyup', () => {
            this.isRotKeyDown = false;
        });
    }
    start() {
        this.fallCallback = window.setInterval(() => this.tetroFall(), this.tetroFallDelay);
        this.render();
    }
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    moveTetro(action, keyEvent, isCallback = false) {
        if (!this.isRotKeyDown && !this.isGameOver) {
            let nextTetroX;
            let nextTetroY;
            let nextTetroRot;
            nextTetroX = this.currentTetroX;
            nextTetroY = this.currentTetroY;
            nextTetroRot = this.currentTetroRot;
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
                        this.scorePoints(10);
                        window.clearInterval(this.fallCallback);
                        this.fallCallback = window.setInterval(this.tetroFall, this.tetroFallDelay);
                    }
                    nextTetroY++;
                    break;
                case 'key':
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
            this.placeTetro(false);
            if (this.canPlaceTetro(nextTetroX, nextTetroY, nextTetroRot)) {
                this.currentTetroX = nextTetroX;
                this.currentTetroY = nextTetroY;
                this.currentTetroRot = nextTetroRot;
                this.placeTetro();
            }
            else {
                let willStick = false;
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
                    this.placeTetro();
                    this.scorePoints(50);
                    this.checkLines();
                    this.newTetro();
                }
                else {
                    this.placeTetro();
                }
            }
        }
    }
    checkLines() {
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
        if (rowsToRemove.length) {
            let pointsScored = ((50 + (50 * parseInt(this.levelField.textContent))) * rowsToRemove.length) * rowsToRemove.length;
            let hasPassedLevel = false;
            for (let rowToRemove of rowsToRemove) {
                for (let x = 1; x < this.playfield.cols - 1; x++) {
                    this.playfield.data[x + rowToRemove * this.playfield.cols] = 0;
                    for (let y = rowToRemove - 1; y >= 0; y--) {
                        this.playfield.data[x + (y + 1) * this.playfield.cols] = this.playfield.data[x + y * this.playfield.cols];
                    }
                }
                this.linesField.textContent = parseInt(this.linesField.textContent) + 1;
                if (!(parseInt(this.linesField.textContent) % 10)) {
                    hasPassedLevel = true;
                }
            }
            this.scorePoints(pointsScored);
            if (hasPassedLevel) {
                this.levelField.textContent = parseInt(this.levelField.textContent) + 1;
                this.tetroFallDelay = this.tetroFallDelay * 0.95;
                window.clearInterval(this.fallCallback);
                this.fallCallback = window.setInterval(this.tetroFall, this.tetroFallDelay);
            }
        }
    }
    placeTetro(show = true) {
        let tetroArray = Tetris3D.rotate(this.tetro[this.currentTetro - 1], this.currentTetroRot);
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (tetroArray[x + y * 4] !== 0) {
                    this.playfield.data[this.currentTetroX + x + (this.currentTetroY + y) * this.playfield.cols] = show ? this.currentTetro : 0;
                }
            }
        }
        this.updateNextTetro();
    }
    render() {
        for (let row = 0; row < this.playfield.rows; row++) {
            for (let col = 0; col < this.playfield.cols; col++) {
                if (row > 9) {
                }
            }
        }
        window.requestAnimationFrame(() => this.render());
    }
    updateNextTetro() {
        this.nextTetroField.innerHTML = '';
        let nextTetroSize;
        if (this.nextTetroField.clientHeight < this.nextTetroField.clientWidth) {
            nextTetroSize = this.nextTetroField.clientHeight * 0.75;
        }
        else {
            nextTetroSize = this.nextTetroField.clientWidth * 0.75;
        }
        let nextTetroBloc = nextTetroSize / 4;
        let nextTetroDivTop = this.nextTetroField.clientHeight / 2 - nextTetroBloc * 2;
        let nextTetroDivLeft = this.nextTetroField.clientWidth / 2 - nextTetroBloc * 2;
        let nextTetroData = (this.tetro)[this.nextTetro - 1];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                if (nextTetroData[col + row * 4] !== 0) {
                    let block = document.createElement('div');
                    block.style.position = 'absolute';
                    block.style.width = nextTetroBloc + 'px';
                    block.style.height = nextTetroBloc + 'px';
                    block.style.top = (nextTetroDivTop + nextTetroBloc * row) + 'px';
                    block.style.left = (nextTetroDivLeft + nextTetroBloc * col) + 'px';
                    block.classList.add('tetromino');
                    block.classList.add('tetromino' + this.nextTetro);
                    this.nextTetroField.appendChild(block);
                }
            }
        }
    }
    static rotate(tetroToRotate, rotation) {
        let rotatedTetro = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                switch (rotation) {
                    case 0:
                        rotatedTetro[col + row * 4] = tetroToRotate[col + row * 4];
                        break;
                    case 1:
                        rotatedTetro[col + row * 4] = tetroToRotate[12 + row - (col * 4)];
                        break;
                    case 2:
                        rotatedTetro[col + row * 4] = tetroToRotate[15 - (row * 4) - col];
                        break;
                    case 3:
                        rotatedTetro[col + row * 4] = tetroToRotate[3 - row + (col * 4)];
                        break;
                    default:
                        break;
                }
            }
        }
        return rotatedTetro;
    }
    tetroFall() {
        this.moveTetro('down', null, true);
    }
    scorePoints(points) {
        this.scoreField.textContent = (parseInt(this.scoreField.textContent) + points);
    }
    newTetro() {
        this.currentTetro = this.nextTetro;
        this.nextTetro = Math.floor(Math.random() * 7) + 1;
        this.currentTetroRot = Math.floor(Math.random() * 4);
        this.currentTetroX = this.playfield.cols / 2 - 2;
        this.currentTetroY = 9;
        if (this.canPlaceTetro(this.currentTetroX, this.currentTetroY, this.currentTetroRot)) {
            this.placeTetro();
        }
        else {
            this.placeTetro();
            window.clearInterval(this.fallCallback);
            this.isGameOver = true;
            this.nextTetroField.innerHTML = 'GAME OVER';
        }
    }
    canPlaceTetro(xToCheck, yToCheck, rotToCheck) {
        let tetroArray = Tetris3D.rotate((this.tetro)[this.currentTetro - 1], rotToCheck);
        let canPlace = true;
        check: for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
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
}
export { Tetris3D };
//# sourceMappingURL=Tetris3D.js.map