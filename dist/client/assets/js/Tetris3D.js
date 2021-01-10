import * as THREE from '/three.module.js';
import { HTMLView } from "./HTMLView.js";
import { Playfield } from "./Playfield.js";
class Tetris3D {
    constructor(fc = 10, fr = 24) {
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
        this.view = new HTMLView();
        this.playfield = new Playfield([], fc, fr);
        this.nextTetro = Math.floor(Math.random() * 7) + 1;
        this.currentTetro = 0;
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }
    setView(nextTetro, scoreDiv, linesDiv, levelDiv) {
        this.view.nextTetro = nextTetro;
        this.view.nextTetro.style.position = 'relative';
        this.view.score = scoreDiv;
        this.view.lines = linesDiv;
        this.view.level = levelDiv;
    }
    setControl(lBtn, lrBtn, rBtn, rrBtn, dBtn) {
        var _a, _b, _c, _d, _e;
        this.view.leftBtn = lBtn;
        this.view.leftRotBtn = lrBtn;
        this.view.rightBtn = rBtn;
        this.view.rightRotBtn = rrBtn;
        this.view.downBtn = dBtn;
        (_a = this.view.leftBtn) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.moveTetro('left', null);
        });
        (_b = this.view.leftRotBtn) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            this.moveTetro('rotleft', null);
        });
        (_c = this.view.rightBtn) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            this.moveTetro('right', null);
        });
        (_d = this.view.rightRotBtn) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.moveTetro('rotright', null);
        });
        (_e = this.view.downBtn) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
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
        this.newTetro();
        this.placeTetro();
        this.fallCallback = window.setInterval(() => this.tetroFall(), this.tetroFallDelay);
        this.render();
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
                        this.view.scorePoints(10);
                        window.clearInterval(this.fallCallback);
                        this.fallCallback = window.setInterval(() => this.tetroFall(), this.tetroFallDelay);
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
                    this.view.scorePoints(50);
                    this.checkLines();
                    this.newTetro();
                }
                else {
                    this.placeTetro();
                }
            }
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
    placeTetro(show = true) {
        let tetroArray = Tetris3D.rotate(this.tetro[this.currentTetro - 1], this.currentTetroRot);
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (tetroArray[x + y * 4] !== 0) {
                    this.playfield.data[this.currentTetroX + x + (this.currentTetroY + y) * this.playfield.cols] = show ? this.currentTetro : 0;
                }
            }
        }
        this.view.updateNextTetro(this.tetro, this.nextTetro);
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
            let pointsScored = ((50 + (50 * parseInt(this.view.level.textContent))) * rowsToRemove.length) * rowsToRemove.length;
            let hasPassedLevel = false;
            for (let rowToRemove of rowsToRemove) {
                for (let x = 1; x < this.playfield.cols - 1; x++) {
                    this.playfield.data[x + rowToRemove * this.playfield.cols] = 0;
                    for (let y = rowToRemove - 1; y >= 0; y--) {
                        this.playfield.data[x + (y + 1) * this.playfield.cols] = this.playfield.data[x + y * this.playfield.cols];
                    }
                }
                this.view.lines.textContent = parseInt(this.view.lines.textContent) + 1;
                if (!(parseInt(this.view.lines.textContent) % 10)) {
                    hasPassedLevel = true;
                }
            }
            this.view.scorePoints(pointsScored);
            if (hasPassedLevel) {
                this.view.level.textContent = parseInt(this.view.level.textContent) + 1;
                this.tetroFallDelay = this.tetroFallDelay * 0.95;
                window.clearInterval(this.fallCallback);
                this.fallCallback = window.setInterval(this.tetroFall, this.tetroFallDelay);
            }
        }
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
            this.view.nextTetro.innerHTML = 'GAME OVER';
        }
    }
    tetroFall() {
        this.moveTetro('down', null, true);
    }
    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    render(time = Date.now()) {
        for (let row = 0; row < this.playfield.rows; row++) {
            for (let col = 0; col < this.playfield.cols; col++) {
                if (row > 9) {
                }
            }
        }
        window.requestAnimationFrame((time) => this.render(time));
    }
}
export { Tetris3D };
//# sourceMappingURL=Tetris3D.js.map