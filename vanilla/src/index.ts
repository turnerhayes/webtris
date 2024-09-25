import {Game, PAUSETOGGLE_EVENT, SCORECHANGED_EVENT} from "./game";

import "./main.css";

const init = () => {
    const gameContainer = document.getElementById("game");

    if (!gameContainer) {
        throw new Error("No game container (with ID #game) found");
    }

    const game = new Game(gameContainer);

    game.start();

    const scoreEl = document.getElementById("score");

    game.addEventListener(SCORECHANGED_EVENT, ((event: CustomEvent<number>) => {
        if (scoreEl) {
            scoreEl.textContent = `${event.detail}`;
        }
    }) as EventListener);
    
    const pauseButton = document.getElementById("pause-button") as HTMLButtonElement|undefined;
    
    if (!pauseButton) {
        throw new Error("No pause button found");
    }

    game.addEventListener(PAUSETOGGLE_EVENT, ((event: CustomEvent<boolean>) => {
        const isPaused = event.detail;

        if (isPaused) {
            pauseButton.textContent = "Start";
        }
        else {
            pauseButton.textContent = "Pause";
        }
    }) as EventListener);


    const toggleGamePause = (pause: boolean|undefined = undefined) => {
        if (pause === undefined) {
            pause = !game.paused;
        }
        if (pause) {
            game.pause();
        }
        else {
            game.start();
        }
    };

    pauseButton.addEventListener("click", () => {
        toggleGamePause();
    });

    let pausedByVisibilityChange = false;

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (!game.paused) {
                pausedByVisibilityChange = true;
            }
            toggleGamePause(true);
        }
        else {
            if (pausedByVisibilityChange) {
                toggleGamePause(false);
            }
            pausedByVisibilityChange = false;
        }
    });
};

if (document.readyState === "complete") {
    init();
}
else {
    const handler = () => {
        init();
        window.removeEventListener("DOMContentLoaded", handler);
    };
    window.addEventListener("DOMContentLoaded", handler);
}
