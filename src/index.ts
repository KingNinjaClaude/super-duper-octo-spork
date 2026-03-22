// src/index.ts

import GameEngine from './GameEngine';
import Renderer from './Renderer';
import UI from './UI';
import InputHandler from './InputHandler';

class Main {
    private gameEngine: GameEngine;
    private renderer: Renderer;
    private ui: UI;
    private inputHandler: InputHandler;
    private isPaused: boolean = false;

    constructor() {
        this.gameEngine = new GameEngine();
        this.renderer = new Renderer();
        this.ui = new UI();
        this.inputHandler = new InputHandler();

        this.setup();
    }

    private setup(): void {
        this.renderer.initialize();
        this.ui.setup();
        this.inputHandler.setup();

        this.startGameLoop();
    }

    private startGameLoop(): void {
        const loop = () => {
            if (!this.isPaused) {
                this.gameEngine.update();
                this.renderer.render();
            }
            requestAnimationFrame(loop);
        };
        loop();
    }

    public pauseGame(): void {
        this.isPaused = true;
    }

    public resumeGame(): void {
        this.isPaused = false;
    }
}

// Start the game
const main = new Main();