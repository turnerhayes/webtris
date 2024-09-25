export type Mino = Array<boolean[]>;

export const Tetrominos: readonly Mino[] = [
    [
        [true, false],
        [true, true],
        [false, true],
    ],
    [
        [false, true],
        [true, true],
        [true, false],
    ],
    [
        [true, true],
        [true, true],
    ],
    [
        [true],
        [true],
        [true],
        [true],
    ],
    [
        [false, true],
        [false, true],
        [true, true],
    ],
    [
        [true, false],
        [true, false],
        [true, true],
    ],
    [
        [true, false],
        [true, true],
        [true, false],
    ],
];

export const rotateMino = (mino: Mino, clockwise: boolean): Mino => {
    const width = mino[0].length;
    const height = mino.length;
    const rotated: Mino = [...new Array(width)].map(
        () => [...new Array(height)]
    );

    for (let row = 0; row < mino.length; row++) {
        for (let col = 0; col < mino[0].length; col++) {
            const rotCol = clockwise ? height - 1 - row : row;
            const rotRow = clockwise ? col : width - 1 - col;
            rotated[rotRow][rotCol] = mino[row][col];
        }
    }

    return rotated;
};
