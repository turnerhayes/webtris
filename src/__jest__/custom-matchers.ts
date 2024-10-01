import { GameBoard } from "../game-state";


expect.extend({
    toMatchBoard(actual: GameBoard, expected: GameBoard) {
        if (actual.length !== expected.length) {
            return {
                pass: false,
                message: () => `Boards have different heights: expected ${
                    expected.length
                } rows, was ${actual.length} rows`,
            };
        }

        const mismatchedRowIndex = actual.findIndex(
            (row, rowIndex) => row.length !== expected[rowIndex].length
        );

        if (mismatchedRowIndex >= 0) {
            return {
                pass: false,
                message: () => `Boards have different widths at row ${
                    mismatchedRowIndex
                }: expected ${
                    expected[mismatchedRowIndex].length
                } columns, was ${actual[mismatchedRowIndex].length} columns`,
            };
        }
        const mismatchedCells: Array<[number, number]> = [];

        for (let row = 0; row < actual.length; row++) {
            for (let col = 0; col < actual[row].length; col++) {
                const actualCell = actual[row][col];
                const expectedCell = expected[row][col];

                if (
                    actualCell.isOn !== expectedCell.isOn ||
                    actualCell.color !== expectedCell.color
                ) {
                    mismatchedCells.push([col, row]);
                }
            }
        }

        if (mismatchedCells.length > 0) {
            return {
                pass: false,
                message() {
                    return `Board has wrong cells at these coordinates:
    ${
        mismatchedCells.map(([col, row]) => {
            return `[${col}, ${row}]:
        Expected: ${expected[row][col].color ?? "Empty cell"}
        Actual: ${actual[row][col].color ?? "Empty cell"}`
        }).join("\n\t")
    }`;
                },
            };
        }

        return {
            pass: true,
            message: () => "Boards matched",
        };
    },
});

declare global {
    namespace jest {
        interface AsymmetricMatchers {
            toMatchBoard(expectedBoard: GameBoard): void;
        }
        interface Matchers<R> {
            toMatchBoard(expectedBoard: GameBoard): R;
        }
    }
}
