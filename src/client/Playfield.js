"use strict";
exports.__esModule = true;
exports.Playfield = void 0;
var Playfield = /** @class */ (function () {
    /**
     * Initialise le terrain de jeu avec des murs extérieur et l'intérieur vide.
     * @param data Le tableau décrivant le contenu de chaque bloc
     * @param col Le nombre de colonnes du terrain de jeu
     * @param row Le nombre de lignes du terrain de jeu
     */
    function Playfield(data, col, row) {
        this.data = data;
        this.cols = col;
        this.rows = row;
        // Initialisation du tableau principal
        this.data = [];
        // On rajoute 1 bloc de chaque côté pour délimiter le terrain de jeu
        this.cols = col + 2;
        // On rajoute 10 lignes pour la zone cachée nécessaire pour stocker les pièces empilées au dessus de la zone de jeu visible.
        // Lorsqu'une ligne ou plusieurs lignes sont réalisées, elle réapparaitront quand les pièces tomberont.
        this.rows = row + 10;
        // Boucle de génération d'un terrain de jeu vide
        for (var row_1 = 0; row_1 < this.rows; row_1++) {
            for (var col_1 = 0; col_1 < this.cols; col_1++) {
                if ((col_1 === 0) || (col_1 === (this.cols - 1)) || (row_1 === (this.rows - 1))) {
                    // On met des tetromino incassables sur les bords et le bas
                    // pour délimiter le terrain de jeu.
                    this.data.push(8);
                }
                else {
                    // On laisse l'espace vide pour le reste.
                    this.data.push(0);
                }
            }
        }
    }
    return Playfield;
}());
exports.Playfield = Playfield;
