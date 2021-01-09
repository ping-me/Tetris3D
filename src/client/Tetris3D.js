"use strict";
exports.__esModule = true;
exports.Tetris3D = void 0;
var THREE = require("/three.module.js");
var Tetris3D = /** @class */ (function () {
    function Tetris3D() {
        // Initialisation générale
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, document.body.clientWidth / document.body.clientHeight, 0.5, 100);
        this.renderer = new THREE.WebGLRenderer();
        // Création du canvas
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
    }
    Tetris3D.prototype.startGame = function () {
    };
    return Tetris3D;
}());
exports.Tetris3D = Tetris3D;
