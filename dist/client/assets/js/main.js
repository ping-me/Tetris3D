import { Tetris3D } from './Tetris3D.js';

let tetris = new Tetris3D(document.getElementById('game-canvas'));
tetris.setView(document.getElementById('next-tetro'),
               document.getElementById('scorefield'),
               document.getElementById('linesfield'),
               document.getElementById('levelfield'));
tetris.setControl(document.getElementById('leftMove'),
                  document.getElementById('leftRot'),
                  document.getElementById('rightMove'),
                  document.getElementById('rightRot'),
                  document.getElementById('downMove'));
tetris.start();
