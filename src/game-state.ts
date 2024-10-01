import type {Mino} from "./minos";


export type GameBoardCell = {
    isOn: true;
    color: string;
} | {
    isOn: false;
    color: null;
}

export type GameBoard = Array<GameBoardCell[]>;

export const addMinoToBoard = (
    {
        mino,
        color,
        board,
        offset,
    }: {
        mino: Mino;
        color: string;
        board: GameBoard;
        offset: [number, number];
    }
) => {
    const newBoard: GameBoard = [
        ...board,
    ];

    const [x, y] = offset;

    if (y < 0) {
        throw new Error(
            `y offset must be greater than or equal to 0 (was ${y})`
        );
    }

    if (y >= board.length - mino.length) {
        throw new Error(
            `y offset must be less than ${
                board.length - mino.length
            } (was ${y})`
        );
    }

    if (x < 0) {
        throw new Error(
            `x offset must be greater than or equal to 0 (was ${x})`
        );
    }

    if (x >= board[0].length - mino[0].length) {
        throw new Error(
            `x offset must be less than ${
                board[0].length - mino[0].length
            } (was ${x})`
        );
    }

    for (
        let rowInMino = 0;
        rowInMino < mino.length;
        rowInMino++
    ) {
        const rowInBoard = y + rowInMino;
        const minoRow = mino[rowInMino];
        newBoard[rowInBoard] = board[rowInBoard].slice(0, x).concat(
            minoRow.map((isOn: boolean, index: number) => {
                if (isOn) {
                    if (board[rowInBoard][index + x].isOn) {
                        throw new Error(
                            `Cannot place mino over existing filled cell at [${
                                index + x
                            }, ${
                                rowInBoard
                            }]`
                        );
                    }
                    return {
                        isOn: true,
                        color,
                    };
                }
                else {
                    return board[rowInBoard][x + index];
                }
            }),
            board[rowInBoard].slice(x + minoRow.length)
        );
    }

    return newBoard;
};

export const clearCompleteLines = (board: GameBoard) => {
    const updatedBoard = [
        ...board,
    ];
    for (let row = 0; row < board.length; row++) {
        if (updatedBoard[row].some(({isOn}) => !isOn)) {
            continue;
        }

        const width = updatedBoard[row].length;

        updatedBoard.splice(row, 1);
        updatedBoard.unshift([...new Array(width)].map(() => ({
            isOn: false,
            color: null,
        })));
    }

    return updatedBoard;
};
