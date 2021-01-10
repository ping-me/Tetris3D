import { HTMLView } from "./HTMLView.js";
import { Playfield } from "./Playfield.js";
import { GraphicEngine } from "./GraphicEngine.js";
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
        this.view = new HTMLView();
        this.playfield = new Playfield(fc, fr);
        this.engine = new GraphicEngine(this.playfield);
        this.nextTetro = Math.floor(Math.random() * 7) + 1;
        this.currentTetro = 0;
        for (let row = 0; row < this.playfield.rows; row++) {
            for (let col = 0; col < this.playfield.cols; col++) {
                if (row > 9) {
                    if ((col == 0) || (col == this.playfield.cols - 1) || (row == this.playfield.rows - 1)) {
                        this.playfield.data.push(8);
                        this.engine.createCube(col + this.playfield.cols * row, 7);
                        this.engine.placeCube(this.playfield.block[col + this.playfield.cols * row], col, row);
                    }
                    else {
                        this.playfield.data.push(0);
                    }
                }
            }
        }
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
        this.fallCallback = window.setInterval(() => this.tetroFall(), this.tetroFallDelay);
        this.engine.animate();
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
                    let indice = this.currentTetroX + x + (this.currentTetroY + y) * this.playfield.cols;
                    this.playfield.data[indice] = show ? this.currentTetro : 0;
                    if (show) {
                        this.engine.createCube(indice, this.currentTetro);
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
        this.view.updateNextTetro(this.tetro, this.nextTetro);
    }
    checkLines() {
        let rowsToRemove = [];
        for (let row = 10; row < this.playfield.rows - 1; row++) {
            let hasLine = true;
            for (let col = 1; col < this.playfield.cols - 1; col++) {
                if (this.playfield.data[col + row * this.playfield.cols] === 0) {
                    hasLine = false;
                }
            }
            if (hasLine) {
                rowsToRemove.push(row);
            }
        }
        if (rowsToRemove.length) {
            let pointsScored = ((50 + (50 * parseInt(this.view.level.textContent))) * rowsToRemove.length) * rowsToRemove.length;
            let hasPassedLevel = false;
            for (let rowToRemove of rowsToRemove) {
                for (let col = 1; col < this.playfield.cols - 1; col++) {
                    this.playfield.data[col + rowToRemove * this.playfield.cols] = 0;
                    this.engine.removeCube(col + rowToRemove * this.playfield.cols);
                    for (let row = rowToRemove - 1; row >= 0; row--) {
                        this.playfield.data[col + (row + 1) * this.playfield.cols] = this.playfield.data[col + row * this.playfield.cols];
                        if (this.playfield.data[col + (row + 1) * this.playfield.cols]) {
                            this.engine.createCube(col + (row + 1) * this.playfield.cols, this.playfield.data[col + row * this.playfield.cols]);
                            this.engine.removeCube(col + row * this.playfield.cols);
                            this.engine.placeCube(this.playfield.block[col + (row + 1) * this.playfield.cols], col, row + 1);
                        }
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
}
export { Tetris3D };
//# sourceMappingURL=Tetris3D.js.map