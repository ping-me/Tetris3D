export class Playfield {
    // Données du terrain de jeu
    public data: number[];

    // Taille du terrain de jeu
    public cols: number;
    public rows: number;

    /**
     * Initialise le terrain de jeu avec des murs extérieur et l'intérieur vide.
     * @param data Le tableau décrivant le contenu de chaque bloc
     * @param col Le nombre de colonnes du terrain de jeu
     * @param row Le nombre de lignes du terrain de jeu
     */
    public constructor(data: [], col: number, row: number) {
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
        for (let row: number = 0; row < this.rows; row++) {
            for (let col: number = 0; col < this.cols; col++) {
                if ((col === 0) || (col === (this.cols - 1)) || (row === (this.rows - 1))) {
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
}
