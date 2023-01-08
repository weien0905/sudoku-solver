import Sudoku from './sudoku.js';

const N = null;

let s = new Sudoku(
    [
        [N, N, N, N, N, N, N, N, N],
        [N, N, N, N, N, 3, N, 8, 5],
        [N, N, 1, N, 2, N, N, N, N],
        [N, N, N, 5, N, 7, N, N, N],
        [N, N, 4, N, N, N, 1, N, N],
        [N, 9, N, N, N, N, N, N, N],
        [5, N, N, N, N, N, N, 7, 3],
        [N, N, 2, N, 1, N, N, N, N],
        [N, N, N, N, 4, N, N, N, 9]
    ]
);

console.log(s.solve());