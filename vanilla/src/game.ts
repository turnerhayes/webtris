import { addMinoToBoard, type GameBoard } from "./game-state";
import { rotateMino, Tetrominos } from "./minos";
import type { Mino } from "./minos";

import "./game.css";


export const SCORECHANGED_EVENT = "scorechanged";

export const PAUSETOGGLE_EVENT = "pausetoggle";

type MinoOffsets = [number, number];

export interface GameConfig {
    board: {
        width: number;
        height: number;
    };
}

enum MinoColor {
    LIGHTGREY = 'lightgrey',
    GREEN = 'green',
    RED = 'red',
    BLUE = 'blue',
    YELLOW = 'yellow',
    ORANGE = 'orange',
    PURPLE = 'purple',
}

const COLORS: MinoColor[] = [
    MinoColor.LIGHTGREY,
    MinoColor.GREEN,
    MinoColor.RED,
    MinoColor.BLUE,
    MinoColor.YELLOW,
    MinoColor.ORANGE,
    MinoColor.PURPLE,
];

const DEFAULT_CONFIG: GameConfig = {
    board: {
        width: 15,
        height: 30,
    },
}

const generateEmptyBoardRow = (columns: number) => {
    return [...new Array(columns)].fill({
        isOn: false,
        color: null,
    });
};

const generateEmptyBoard = (rows: number, columns: number): GameBoard => {
    return [...new Array(rows)].map(
        () => generateEmptyBoardRow(columns)
    );
};

const generateBoardTable = (board: GameBoard): HTMLTableElement => {
    const table: HTMLTableElement = document.createElement("table");
    table.classList.add("game-table");
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    for (let row = 0; row < board.length; row++) {
        const rowEl = document.createElement("tr");

        for (let column = 0; column < board[0].length; column++) {
            const td = document.createElement("td");
            rowEl.appendChild(td);
        }
        tbody.appendChild(rowEl);
    }

    return table;
};

const getColorForMino = (
    mino: Mino,
    minoSet: readonly Mino[] = Tetrominos
): MinoColor => {
    const index = minoSet.indexOf(mino);
    if (index < 0) {
        throw new Error(`No color found for mino ${mino}`);
    }
    return COLORS[index];
};

export class Game extends EventTarget {
    private container: HTMLElement;

    private board: GameBoard;

    private tableEl: HTMLTableElement;

    private minoSet: readonly Mino[] = Tetrominos;

    private currentMino!: Mino;

    private currentMinoColor!: MinoColor;

    private currentMinoOffsets!: MinoOffsets;

    private lastMoveInteractionTimestamp = 0;

    private movePeriodMs = 1000;

    private intervalId: number|undefined;

    private rafId: number|undefined;

    private lastVisualChangeTimestamp = 0;

    private isPaused = true;

    private currentScore = 0;

    constructor(container: HTMLElement, config: GameConfig = DEFAULT_CONFIG) {
        super();
        this.container = container;
        this.board = generateEmptyBoard(config.board.height, config.board.width);

        this.changeMino();
        
        this.tableEl = generateBoardTable(this.board);
        this.container.appendChild(this.tableEl);

        const keyHandler = (event: KeyboardEvent) => {
            this.handleKeyPress(event.key);
        };

        window.addEventListener("keydown", keyHandler);
    }

    get paused() {
        return this.isPaused;
    }

    get score() {
        return this.currentScore;
    }

    pause() {
        this.isPaused = true;

        if (this.rafId !== undefined) {
            cancelAnimationFrame(this.rafId);
            this.rafId = undefined;
        }

        if (this.intervalId !== undefined) {
            window.clearInterval(this.intervalId);
            this.intervalId = undefined;
        }

        this.dispatchEvent(new CustomEvent(PAUSETOGGLE_EVENT, {
            detail: true,
        }));
    }

    start() {
        this.isPaused = false;

        this.rafId = requestAnimationFrame(() => this.drawLoop());

        this.intervalId = window.setInterval(() => {
            this.processInterval();
        }, this.movePeriodMs);

        this.dispatchEvent(new CustomEvent(PAUSETOGGLE_EVENT, {
            detail: false,
        }));
    }

    private changeScore(addedScore: number) {
        this.currentScore += addedScore;
        this.dispatchEvent(new CustomEvent(SCORECHANGED_EVENT, {
            detail: this.currentScore,
        }));
    }

    private getInitialMinoOffsets(): [number, number] {
        return [
            Math.floor((this.board[0].length - this.currentMino[0].length) / 2),
            0
        ];
    }

    private setXOffset(x: number) {
        this.currentMinoOffsets = [
            x,
            this.currentMinoOffsets[1]
        ];
        this.lastVisualChangeTimestamp = Date.now();
    }

    private setYOffset(y: number) {
        this.currentMinoOffsets = [
            this.currentMinoOffsets[0],
            y
        ];
        this.lastVisualChangeTimestamp = Date.now();
    }

    private setOffsets([x, y]: [number, number]) {
        this.currentMinoOffsets = [x, y];
        this.lastVisualChangeTimestamp = Date.now();
    }

    private handleKeyPress(key: string) {
        const [x, y] = this.currentMinoOffsets;

        
        if (!this.isPaused) {
            if (key === "ArrowLeft") {
                const nextXOffset = Math.max(x - 1, 0);
                if (!this.checkMinoPlacement([
                    nextXOffset,
                    y,
                ])) {
                    return;
                }
    
                this.setXOffset(nextXOffset);
                this.lastMoveInteractionTimestamp = Date.now();
            }
            else if (key === "ArrowRight") {
                const nextXOffset = Math.min(
                    x + 1, this.board[0].length - this.currentMino[0].length
                );
                if (!this.checkMinoPlacement([
                    nextXOffset,
                    y,
                ])) {
                    return;
                }
    
                this.setXOffset(nextXOffset);
                this.lastMoveInteractionTimestamp = Date.now();
            }
            else if (key === "ArrowUp") {
                this.currentMino = rotateMino(this.currentMino, true);
                this.lastMoveInteractionTimestamp = Date.now();
            }
            else if (key === "ArrowDown") {
                this.currentMino = rotateMino(this.currentMino, false);
                this.lastMoveInteractionTimestamp = Date.now();
            }
            else if (key === " ") {
                const nextYOffset = y + 1;
                if (!this.checkMinoPlacement([x, nextYOffset])) {
                    return;
                }
                this.setYOffset(nextYOffset);
                this.lastMoveInteractionTimestamp = Date.now();
            }
        }
        if (key === "p") {
            if (this.paused) {
                this.start();
            }
            else {
                this.pause();
            }
        }
    }

    private getCompleteLines(): number[] {
        const numbers: number[] = [];

        for (let row = 0; row < this.board.length; row++) {
            if (!this.board[row].some(({isOn}) => !isOn)) {
                numbers.push(row);
            }
        }

        return numbers;
    }

    private removeCompleteLines() {
        const completeLines = this.getCompleteLines();
        if (completeLines.length > 0) {
            const tempBoard = [
                ...this.board,
            ];
            for (const row of completeLines) {
                tempBoard.splice(row, 1);
                tempBoard.unshift(generateEmptyBoardRow(this.board[0].length));
            }
            this.changeScore(completeLines.length * this.board[0].length);
            return tempBoard;
        }

        return this.board;
    }

    private changeMino(mino: Mino|undefined = undefined) {
        if (!mino) {
            mino = this.chooseMino();
        }
        this.setMino(mino);
        this.currentMinoColor = getColorForMino(this.currentMino, this.minoSet);
        this.setOffsets(this.getInitialMinoOffsets());
        this.lastVisualChangeTimestamp = Date.now();
    }

    private setMino(mino: Mino) {
        this.currentMino = mino;
        this.lastVisualChangeTimestamp = Date.now();
    }

    private processInterval() {
        const [x, y] = this.currentMinoOffsets;
        const nextYOffset = y + 1;
        if (this.checkMinoPlacement([x, nextYOffset])) {
            this.setYOffset(nextYOffset);
        }
        else {
            if (Date.now() - this.lastMoveInteractionTimestamp < this.movePeriodMs) {
                return;
            }
            this.board = addMinoToBoard({
                board: this.board,
                mino: this.currentMino,
                color: this.currentMinoColor,
                offset: this.currentMinoOffsets,
            });
            this.board = this.removeCompleteLines();
            this.changeMino();
            let rowsAvailable = 0;
            for (let row of this.board) {
                if (row.some(cell => cell.isOn)) {
                    break;
                }
                rowsAvailable += 1;
            }
            if (rowsAvailable <= this.currentMino.length) {
                console.log("GAME OVER");
                if (this.intervalId !== undefined) {
                    window.clearTimeout(this.intervalId);
                    this.intervalId = undefined;
                }
                if (this.rafId !== undefined) {
                    window.cancelAnimationFrame(this.rafId);
                    this.rafId = undefined;
                }
            }
        }
    }

    private chooseMino() {
        const minoIndex = Math.floor(Math.random() * this.minoSet.length);
        return this.minoSet[minoIndex];
    }

    private checkMinoPlacement(nextOffset: [number, number]): boolean {
        const [nextX, nextY] = nextOffset;

        if (nextX < 0) {
            return false;
        }

        if (nextX >= this.board[0].length) {
            return false;
        }

        if (nextY >= this.board.length) {
            return false;
        }

        for (let y = 0; y < this.currentMino.length; y++) {
            const boardRow = y + nextY;
            if (boardRow >= this.board.length) {
                return false;
            }
            for  (let x = 0; x < this.currentMino[0].length; x++) {
                const boardCol = x + nextX;

                if (boardCol >= this.board[boardRow].length) {
                    return false;
                }
                if (!this.currentMino[y][x]) {
                    continue;
                }


                if (this.board[boardRow][boardCol].isOn) {
                    return false;
                }
            }
        }

        return true;
    }

    private drawLoop() {
        if (Date.now() > this.lastVisualChangeTimestamp) {
            this.drawBoardWithCurrentMino();
        }

        requestAnimationFrame(() => this.drawLoop());
    }

    private drawBoardWithCurrentMino() {
        const [x, y] = this.currentMinoOffsets;
        const withMino = addMinoToBoard({
            board: this.board,
            mino: this.currentMino,
            color: this.currentMinoColor,
            offset: this.currentMinoOffsets,
        });
        for (let boardRow = 0; boardRow < withMino.length; boardRow++) {
            const rowEl = this.tableEl.querySelector<HTMLTableRowElement>(
                `tbody > tr:nth-child(${boardRow + 1})`
            );
            if (!rowEl) {
                throw new Error(`Board row ${boardRow} not found`);
            }
            for (let boardCol = 0; boardCol < withMino[boardRow].length; boardCol++) {
                const cell = withMino[boardRow][boardCol];
                const el = rowEl.querySelector<HTMLTableCellElement>(`td:nth-child(${boardCol + 1})`);
                if (!el) {
                    throw new Error(`Board cell (${boardCol}, ${boardRow}) not found`);
                }
                if (cell.isOn) {
                    if (el.classList.contains("is-on")) {
                        const currentColor = el.style.getPropertyValue("--color");
                        if (currentColor !== cell.color) {
                            el.style.setProperty("--color", cell.color);
                        }
                    }
                    else {
                        el.classList.add("is-on");
                        el.style.setProperty("--color", cell.color);
                    }
                }
                else {
                    if (el.classList.contains("is-on")) {
                        el.classList.remove("is-on");
                        el.style.removeProperty("--color");
                    }
                }
            }
        }
    }
}