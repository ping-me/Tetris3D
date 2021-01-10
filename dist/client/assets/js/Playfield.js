export class Playfield {
    constructor(data, col, row) {
        this.data = data;
        this.cols = col + 2;
        this.rows = row + 10;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if ((col === 0) || (col === (this.cols - 1)) || (row === (this.rows - 1))) {
                    this.data.push(8);
                }
                else {
                    this.data.push(0);
                }
            }
        }
    }
}
//# sourceMappingURL=Playfield.js.map