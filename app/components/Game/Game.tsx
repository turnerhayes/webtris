"use client";

import { Mino, rotateMino, Tetrominos } from "@/app/minos";
import styles from "./Game.module.css";
import { CSSProperties, useCallback, useEffect, useMemo, useState } from "react";
import { addMinoToBoard, clearCompleteLines, GameBoard } from "./game-state";


const COLORS = [
    'lightgrey',
    'green',
    'red',
    'blue',
    'yellow',
    'orange',
];

const BoardRow = (
    {
        row,
    }: {
        row: GameBoard[number];
    }
) => {
    return (
        <tr>
            {
                row.map(({isOn, color}, index) => (
                    <td
                        key={index}
                        className={
                            [
                                styles.boardBlock,
                                ...(
                                    isOn ? [
                                        styles.isFilled
                                    ] : []
                                )
                            ].join(" ")
                        }
                        style={{
                            "--color": color,
                        } as CSSProperties}
                    >
                    </td>
                ))
            }
        </tr>
    );
};

const generateEmptyBoard = (rows: number, columns: number): GameBoard => {
    return [...new Array(rows)].map(
        () => [...new Array(columns)].fill({
            isOn: false,
            color: null,
        })
    );
};

const NUM_ROWS = 30;
const NUM_COLUMNS = 15;

const MOVEMENT_DELAY_MS = 1000;

const chooseMino = (minoSet: readonly Mino[] = Tetrominos) => {
    const minoIndex = Math.floor(Math.random() * minoSet.length);
    return minoSet[minoIndex];
};

const getColorForMino = (
    mino: Mino,
    minoSet: readonly Mino[] = Tetrominos
) => {
    return COLORS[minoSet.indexOf(mino)];
};

export const Game = (
    {
        movementDelayMs = MOVEMENT_DELAY_MS,
        numRows = NUM_ROWS,
        numColumns = NUM_COLUMNS,
    }: {
        movementDelayMs?: number;
        numRows?: number;
        numColumns?: number;
    }
) => {
    const [currentMino, setCurrentMino] = useState<Mino>(chooseMino());
    const [
        commitDelayTimestamp,
        setCommitDelayTimestamp
    ] = useState<number|null>(null);
    const [currentMinoColor, setCurrentMinoColor] = useState<string>(
        getColorForMino(currentMino)
    );
    const [
        currentYOffset,
        setCurrentYOffset
    ] = useState<number>(0);
    const [board, setBoard] = useState<GameBoard>(generateEmptyBoard(numRows, numColumns));
    const [
        currentXOffset,
        setCurrentXOffset
    ] = useState<number>(Math.floor((board[0].length - currentMino[0].length) / 2));

    const modifiedBoard = useMemo(() => {
        return addMinoToBoard({
            board,
            color: currentMinoColor,
            mino: currentMino,
            offset: [currentXOffset, currentYOffset],
        });
    }, [
        board,
        currentMino,
        currentMinoColor,
        currentXOffset,
        currentYOffset,
    ]);

    const checkMinoPlacement = useCallback(
        (nextOffset: [number, number]): boolean => {
            const [nextX, nextY] = nextOffset;

            if (nextX < 0) {
                return false;
            }

            if (nextX >= board[0].length) {
                return false;
            }

            if (nextY >= board.length) {
                return false;
            }

            for (let y = 0; y < currentMino.length; y++) {
                for  (let x = 0; x < currentMino[0].length; x++) {
                    if (y + nextY >= board.length) {
                        return false;
                    }

                    if (x + nextX >= board[0].length) {
                        return false;
                    }
                    if (!currentMino[y][x]) {
                        continue;
                    }


                    if (board[y + nextY][x + nextX].isOn) {
                        return false;
                    }
                }
            }

            return true;
        },
        [
            currentMino,
            board,
        ]
    );

    const handleKey = useCallback((key: string) => {
        if (key === "ArrowLeft") {
            const nextXOffset = Math.max(currentXOffset - 1, 0);
            if (!checkMinoPlacement([
                nextXOffset,
                currentYOffset,
            ])) {
                return;
            }

            setCurrentXOffset(nextXOffset);
        }
        else if (key === "ArrowRight") {
            const nextXOffset = Math.min(
                currentXOffset + 1, board[0].length - currentMino[0].length
            );
            if (!checkMinoPlacement([
                nextXOffset,
                currentYOffset,
            ])) {
                return;
            }

            setCurrentXOffset(nextXOffset);
        }
        else if (key === "ArrowUp") {
            setCurrentMino(rotateMino(currentMino, true));
        }
        else if (key === "ArrowDown") {
            setCurrentMino(rotateMino(currentMino, false));
        }
        else if (key === " ") {
            const nextYOffset = Math.min(
                currentYOffset + 1,
                board.length - currentMino.length
            );
            if (!checkMinoPlacement([currentXOffset, nextYOffset])) {
                setCommitDelayTimestamp(Date.now());
                return;
            }
            setCurrentYOffset(nextYOffset);
        }
    }, [
        currentXOffset,
        setCurrentXOffset,
        currentYOffset,
        setCurrentYOffset,
        setCommitDelayTimestamp,
        currentMino,
        setCurrentMino,
        board,
        checkMinoPlacement,
    ]);

    useEffect(() => {
        const keyListener = (event: KeyboardEvent) => {
            handleKey(event.key);
        };

        window.addEventListener("keydown", keyListener);

        return () => window.removeEventListener("keydown", keyListener);
    }, [
        handleKey,
    ]);

    const commitMino = useCallback(() => {
        let updatedBoard = addMinoToBoard({
            board,
            mino: currentMino,
            color: currentMinoColor,
            offset: [currentXOffset, currentYOffset],
        });
        updatedBoard = clearCompleteLines(updatedBoard);
        setBoard(updatedBoard);
        const nextMino = chooseMino();
        setCurrentMino(nextMino);
        setCurrentMinoColor(getColorForMino(nextMino));
        setCurrentYOffset(0);
        setCurrentXOffset(Math.floor((board[0].length - nextMino[0].length) / 2));
        setCommitDelayTimestamp(null);
    }, [
        board,
        currentMino,
        setCurrentMino,
        currentMinoColor,
        setCurrentMinoColor,
        currentXOffset,
        setCurrentXOffset,
        currentYOffset,
        setCurrentYOffset,
        setCommitDelayTimestamp,
    ]);

    // const timeoutCallback = useCallback(() => {
    //     const nextYOffset = Math.min(
    //         currentYOffset + 1,
    //         board.length - currentMino.length
    //     );

    //     setCurrentYOffset((currentY) => {
    //         const nextYOffset = Math.min(
    //             currentY + 1,
    //             board.length - currentMino.length
    //         );
    //         if (checkMinoPlacement([
    //             currentXOffset,
    //             nextYOffset
    //         ])) {
    //             setTimeout(timeoutCallback, movementDelayMs);
    //         }
    //     });
    //     else {
    //         setTimeout(() => {
    //             commitMino();
    //             setTimeout(timeoutCallback, movementDelayMs);
    //         }, movementDelayMs);
    //     }
    // }, [
    //     currentYOffset,
    //     setCurrentYOffset,
    //     currentXOffset,
    //     board,
    //     currentMino,
    // ]);

    // useEffect(() => {
    //     let timeoutId = setTimeout(
    //         timeoutCallback,
    //         movementDelayMs
    //     );

    //     return () => {
    //         if(timeoutId) {
    //             clearTimeout(timeoutId);
    //         }
    //     };
    // }, [
    //     movementDelayMs,
    //     currentYOffset,
    //     setCurrentYOffset,
    //     board,
    //     currentMino,
    // ]);

    useEffect(() => {
        const intervalId = setInterval(
            () => {
                setCurrentYOffset((y) => {
                    const nextY = Math.min(
                        y + 1,
                        board.length - currentMino.length
                    );
                    if (!checkMinoPlacement([
                        currentXOffset,
                        nextY
                    ])) {
                        return y;
                    }
                    return nextY;
                });
            },
            movementDelayMs
        );

        return () => {
            clearInterval(intervalId);
        };
    }, [
        checkMinoPlacement,
        currentYOffset,
        currentXOffset,
        currentMino.length,
        board.length,
        movementDelayMs,
    ]);

    useEffect(() => {
        if (commitDelayTimestamp !== null) {
            if (Date.now() - commitDelayTimestamp >= 1000) {
                commitMino();
            }
            return;
        }

        const nextYOffset = currentYOffset + 1;
        if (!checkMinoPlacement([currentXOffset, nextYOffset])) {
            setCommitDelayTimestamp(Date.now());
            setTimeout(commitMino, 1000);
        }
    }, [
        checkMinoPlacement,
        setBoard,
        currentXOffset,
        setCurrentXOffset,
        currentYOffset,
        setCurrentYOffset,
        currentMino,
        setCurrentMino,
        currentMinoColor,
        setCurrentMinoColor,
        commitDelayTimestamp,
        board,
        commitMino,
    ]);

    useEffect(() => {
        addMinoToBoard({
            board,
            mino: currentMino,
            color: currentMinoColor,
            offset: [currentXOffset, currentYOffset],
        });
    }, [
        board,
        currentMino,
        currentMinoColor,
        currentXOffset,
        currentYOffset,
    ]);

    return (
        <div className={styles.root}>
            <table
            className={styles.boardTable}
        >
            <tbody>
                {
                    modifiedBoard.map((row, index) => (
                        <BoardRow
                            key={index}
                            row={row}
                        />
                    ))
                }
            </tbody>
        </table>
        </div>
    );
};
