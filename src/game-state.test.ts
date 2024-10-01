import { addMinoToBoard, clearCompleteLines, GameBoard } from "./game-state";
import { Tetrominos } from "./minos";


const generateEmptyBoard = (width: number, height: number): GameBoard => {
    return [...(new Array(height))].map(() => [...(new Array(width))].map(() => ({
        isOn: false,
        color: null,
    })));
};

const toBoard = (s: string, colorMap: {[key: string]: string}): GameBoard => {
    return s.split("\n").filter(
        (line) => !!(line.trim())
    ).map(
        (rowStr) => rowStr.trim().split(/\s/g).map(
            (c) => {
                c = c.trim();
                return c && c in colorMap ? {
                        isOn: true,
                        color: colorMap[c]
                    } :
                    {
                        isOn: false,
                        color: null,
                    };
            }
        )
    );
};

const fromBoard = (board: GameBoard) => {
    return board.map(
        (row) => row.map(
            ({isOn, color}) => isOn ? color[0].toLowerCase() : "_"
        ).join(" ")
    ).join("\n");
};


describe("game-state", () => {
    describe("addMinoToBoard", () => {
        it("should add a mino to an empty board", () => {
            const color = "grey";

            const newBoard = addMinoToBoard({
                mino: Tetrominos[5],
                board: generateEmptyBoard(4, 4),
                offset: [0, 0],
                color,
            });

            const expectedBoard = toBoard(
                `
g _ _ _
g _ _ _
g g _ _  
_ _ _ _
                `,
                {
                    g: "grey",
                }
            );
            expect(newBoard).toMatchBoard(expectedBoard);
        });

        it("should fail to place a mino over an existing mino", () => {
            expect(
                () => addMinoToBoard({
                    mino: Tetrominos[5],
                    board: toBoard(
                        `
    _ _ _ _
    _ _ _ _
    _ _ _ _
    r r _ _
    r r _ _
                        `,
                        {
                            r: "red",
                        }
                    ),
                    offset: [0, 1],
                    color: "grey",
                })
            ).toThrow("Cannot place mino over existing filled cell at [0, 3]");
        });

        it("should fail to place above the top edge of the board", () => {
            const color = "grey";

            expect(
                () => addMinoToBoard({
                    mino: Tetrominos[5],
                    board: toBoard(
                        `
    _ _ _ _
    _ _ _ _
    _ _ _ _
    _ _ _ _
    _ _ _ _
                        `,
                        {
                            r: "red",
                        }
                    ),
                    offset: [0, -2],
                    color,
                })
            ).toThrow("y offset must be greater than or equal to 0 (was -2)");
        });

        it("should fail to place below the bottom edge of the board", () => {
            const color = "grey";

            expect(
                () => addMinoToBoard({
                    mino: Tetrominos[5],
                    board: toBoard(
                        `
    _ _ _ _
    _ _ _ _
    _ _ _ _
    _ _ _ _
    _ _ _ _
                        `,
                        {
                            r: "red",
                        }
                    ),
                    offset: [0, 3],
                    color,
                })
            ).toThrow("y offset must be less than 2 (was 3)");
        });

        it("should fail to place beyond the left edge of the board", () => {
            const color = "grey";

            expect(
                () => addMinoToBoard({
                    mino: Tetrominos[5],
                    board: toBoard(
                        `
    _ _ _ _
    _ _ _ _
    _ _ _ _
    _ _ _ _
    _ _ _ _
                        `,
                        {
                            r: "red",
                        }
                    ),
                    offset: [-1, 0],
                    color,
                })
            ).toThrow("x offset must be greater than or equal to 0 (was -1)");
        });

        it("should fail to place beyond the right edge of the board", () => {
            const color = "grey";

            expect(
                () => addMinoToBoard({
                    mino: Tetrominos[5],
                    board: toBoard(
                        `
    _ _ _ _
    _ _ _ _
    _ _ _ _
    _ _ _ _
    _ _ _ _
                        `,
                        {
                            r: "red",
                        }
                    ),
                    offset: [6, 0],
                    color,
                })
            ).toThrow("x offset must be less than 2 (was 6)");
        });
    });

    describe("clearCompleteLines", () => {
        it("should not change the board if there are no complete lines", () => {
            const board = toBoard(
                `
                _ _ _ _ _
                _ _ _ _ _
                b _ g g g
                b b _ _ g
                _ b _ _ b
                `,
                {
                    b: "blue",
                    g: "green",
                }
            );

            expect(clearCompleteLines(board)).toMatchBoard(board);
        });

        it("should remove a complete line", () => {
            const board = toBoard(
                `
                _ _ _ _ _
                _ _ _ _ _
                b g g g g
                b b _ _ _
                _ b _ _ _
                `,
                {
                    b: "blue",
                    g: "green",
                }
            );

            expect(clearCompleteLines(board)).toMatchBoard(toBoard(
                `
                _ _ _ _ _
                _ _ _ _ _
                _ _ _ _ _
                b b _ _ _
                _ b _ _ _
                `,
                {
                    b: "blue",
                    g: "green",
                }
            ));
        });

        it("should remove multiple consecutive complete lines", () => {
            const board = toBoard(
                `
                _ _ _ _ _
                _ _ _ _ _
                b g g g g
                b b b b b
                g b g g g
                `,
                {
                    b: "blue",
                    g: "green",
                }
            );

            const cleared = clearCompleteLines(board);

            expect(cleared).toMatchBoard(toBoard(
                `
                _ _ _ _ _
                _ _ _ _ _
                _ _ _ _ _
                _ _ _ _ _
                _ _ _ _ _
                `,
                {
                    b: "blue",
                    g: "green",
                }
            ));
        });

        it("should move down incomplete lines above complete lines", () => {
            const board = toBoard(
                `
                _ _ _ _ _
                g g g g _
                b g g g g
                b b _ _ _
                _ b _ _ _
                `,
                {
                    b: "blue",
                    g: "green",
                }
            );

            const cleared = clearCompleteLines(board);

            expect(cleared).toMatchBoard(toBoard(
                `
                _ _ _ _ _
                _ _ _ _ _
                g g g g _
                b b _ _ _
                _ b _ _ _
                `,
                {
                    b: "blue",
                    g: "green",
                }
            ));
        });
    });
});