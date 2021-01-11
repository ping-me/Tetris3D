export class HTMLView {
    // Divs container pour les données de jeu
    public nextTetro?: HTMLElement;
    public score?: HTMLElement;
    public lines?: HTMLElement;
    public level?: HTMLElement;

    // Boutons pour les contrôles
    public leftBtn?: HTMLElement;
    public leftRotBtn?: HTMLElement;
    public rightBtn?: HTMLElement;
    public rightRotBtn?: HTMLElement;
    public downBtn?: HTMLElement;

    /**
     * Rajoute des points au score du joueur
     * @param {int} points Points à rajouter au score
     */
    public scorePoints(points: number) {
        // @ts-ignore
        this.score.textContent = (parseInt(this.score.textContent) + points);
    }

    /**
     * Dessine le tetromino suivant dans sa fenêtre dédiée.
     */
    public updateNextTetro(tetro: number[][], nextTetroType: number) {
        // @ts-ignore
        this.nextTetro.innerHTML = '';
        let nextTetroSize: number;
        // @ts-ignore
        if (this.nextTetro.clientHeight < this.nextTetro.clientWidth) {
            // @ts-ignore
            nextTetroSize = this.nextTetro.clientHeight * 0.75;
        }
        else {
            // @ts-ignore
            nextTetroSize = this.nextTetro.clientWidth * 0.75;
        }
        let nextTetroBloc: number = nextTetroSize / 4;
        // @ts-ignore
        let nextTetroDivTop: number = this.nextTetro.clientHeight / 2 - nextTetroBloc * 2;
        // @ts-ignore
        let nextTetroDivLeft: number = this.nextTetro.clientWidth / 2 - nextTetroBloc * 2;
        // Rendu du tetro
        let nextTetroData: number[] = tetro[nextTetroType - 1];
        for (let row: number = 0; row < 4; row++) {
            for (let col: number = 0; col < 4; col++) {
                if (nextTetroData[col + row * 4] !== 0) {
                    // Création du bloc
                    let block: HTMLElement = document.createElement('div');
                    block.style.position = 'absolute';
                    block.style.width = nextTetroBloc + 'px';
                    block.style.height = nextTetroBloc + 'px';
                    block.style.top = (nextTetroDivTop + nextTetroBloc * row) + 'px';
                    block.style.left = (nextTetroDivLeft + nextTetroBloc * col) + 'px';
                    block.classList.add('tetromino')

                    // Sélection de la pièce à afficher
                    block.classList.add('tetromino' + nextTetroType);

                    // Dessin du bloc
                    // @ts-ignore
                    this.nextTetro.appendChild(block);
                }
            }
        }
    }
}
