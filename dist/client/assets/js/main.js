import { Tetris3D } from './Tetris3D.js';

let tetris = new Tetris3D(document.getElementById('next-tetro'));

tetris.setStatBoard(document.getElementById('scorefield'), document.getElementById('linesfield'), document.getElementById('levelfield'));
tetris.setControls(document.getElementById('leftMove'),
                   document.getElementById('leftRot'),
                   document.getElementById('rightMove'),
                   document.getElementById('rightRot'),
                   document.getElementById('downMove'),);
tetris.start();