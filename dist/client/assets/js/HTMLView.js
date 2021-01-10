export class HTMLView {
    scorePoints(points) {
        this.score.textContent = (parseInt(this.score.textContent) + points);
    }
    updateNextTetro(tetro, nextTetroType) {
        this.nextTetro.innerHTML = '';
        let nextTetroSize;
        if (this.nextTetro.clientHeight < this.nextTetro.clientWidth) {
            nextTetroSize = this.nextTetro.clientHeight * 0.75;
        }
        else {
            nextTetroSize = this.nextTetro.clientWidth * 0.75;
        }
        let nextTetroBloc = nextTetroSize / 4;
        let nextTetroDivTop = this.nextTetro.clientHeight / 2 - nextTetroBloc * 2;
        let nextTetroDivLeft = this.nextTetro.clientWidth / 2 - nextTetroBloc * 2;
        let nextTetroData = tetro[nextTetroType - 1];
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
                    block.classList.add('tetromino' + nextTetroType);
                    this.nextTetro.appendChild(block);
                }
            }
        }
    }
}
//# sourceMappingURL=HTMLView.js.map