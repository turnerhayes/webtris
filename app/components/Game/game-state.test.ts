import { Tetrominos } from "@/app/minos";
import { addMinoToBoard, GameBoard } from "./game-state";


const printBoard = (board: GameBoard) => {
    console.log(
        board.map(
            (row) => "|" + row.map(
                ({isOn, color}) => isOn ? color[0].toUpperCase() : " "
            ).join("") + "|"
        ).join("\n") + "\n‾" +
        new Array(board[0].length).fill("‾").join("") + "‾"
    );
};

const generateEmptyBoard = (width = 8, height = 8) => {
    const emptyBoard: GameBoard = [
        ...new Array(height)
    ].map(
        () => [...new Array(width)].map(() => ({
            isOn: false,
            color: null,
        }))
    );

    return emptyBoard;
};

interface BoardMatchers<R = unknown> {
    toHaveCellOnAt(offset: [number, number]): R;
    toHaveCellOffAt(offset: [number, number]): R;
}

declare global {
    namespace jest {
        interface Expect extends BoardMatchers {}
        interface Matchers<R> extends BoardMatchers<R> {}
        interface InverseAsymmetricMatchers extends BoardMatchers {}
    }
}

expect.extend({
    toHaveCellOnAt(received: GameBoard, offset: [number, number]) {
        const [x, y] = offset;
        const pass = this.equals(received[y][x], {
            isOn: true,
            color: expect.any(String),
        });

        if (pass) {
            return {
                message: () => `Expected cell at [${x}, ${y}] to be on`,
                pass: true,
            }
        }
        return {
            message: () => `Expected cell at [${x}, ${y}] to be on; was off`,
            pass: false,
        }
    },

    toHaveCellOffAt(received: GameBoard, offset: [number, number]) {
        const [x, y] = offset;
        const pass = this.equals(received[y][x], {
            isOn: false,
            color: null,
        });

        if (pass) {
            return {
                message: () => `Expected cell at [${x}, ${y}] to be off`,
                pass: true,
            }
        }
        return {
            message: () => `Expected cell at [${x}, ${y}] to be off; was on`,
            pass: false,
        }
    },
});

describe("game-state", () => {
    describe("addMinoToBoard", () => {
        it("should place a mino on the board", () => {
            const color = "blue";
            const board = addMinoToBoard({
                mino: Tetrominos[4],
                board: generateEmptyBoard(),
                color,
                offset: [1, 3],
            });

            const ON_COORDS = [
                JSON.stringify([2, 3]),
                JSON.stringify([2, 4]),
                JSON.stringify([1, 5]),
                JSON.stringify([2, 5]),
            ]

            for (let row = 0; row < board.length; row++) {
                for (let col = 0; col < board[0].length; col++) {
                    if (ON_COORDS.includes(JSON.stringify([col, row]))) {
                        expect(board).toHaveCellOnAt([col, row]);
                    }
                    else {
                        expect(board).toHaveCellOffAt([col, row]);
                    }
                }
            }
        });

        it("should not overwrite existing minos", () => {
            const board = addMinoToBoard({
                mino: Tetrominos[0],
                color: "green",
                board: generateEmptyBoard(),
                offset: [1, 5],
            });

            const board2 = addMinoToBoard({
                mino: Tetrominos[1],
                color: "blue",
                board,
                offset: [0, 3],
            });

            expect(board2[5][1].isOn).toBe(true);
        });
    });
});
