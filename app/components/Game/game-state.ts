import { Mino } from "@/app/minos";

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

    for (
        let rowInMino = 0;
        rowInMino < mino.length;
        rowInMino++
    ) {
        if (y + rowInMino >= board.length) {
            throw new Error(`Trying to add a mino to the board at (${
                x
            }, ${y}) but it extends past the bottom`);
        }
        const rowInBoard = Math.max(y + rowInMino, 0);
        const minoRow = mino[rowInMino];
        newBoard[rowInBoard] = board[rowInBoard].slice(0, x).concat(
            minoRow.map((isOn, index) => {
                if (isOn) {
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
    for (let row = board.length - 1; row >= 0; row--) {
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
