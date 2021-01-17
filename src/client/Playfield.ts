export class Playfield {
    // Données du terrain de jeu
    public data: number[];
    public block: any[];

    // Taille du terrain de jeu
    public cols: number;
    public rows: number;

    /**
     * Initialise le terrain de jeu avec les largeur et hauteur données.
     * @param col Le nombre de colonnes du terrain de jeu.
     * @param row Le nombre de lignes du terrain de jeu.
     */
    public constructor(col: number, row: number) {
        this.data = [];
        this.block = [];
        // On rajoute 1 bloc de chaque côté pour délimiter le terrain de jeu
        this.cols = col + 2;
        // On rajoute 10 lignes pour la zone cachée nécessaire pour stocker les pièces empilées au dessus de la zone de jeu visible.
        // Lorsqu'une ligne ou plusieurs lignes sont réalisées, elle réapparaitront quand les pièces tomberont.
        this.rows = row + 10;
    }
}
