import { Application } from 'pixi.js';
import { GameController } from './GameController.ts';
import type { GameConfig } from "./types"

export class GameWrapper {
    public app: Application;
    private container: HTMLElement;
    private config: GameConfig
    public game: GameController | undefined
    constructor(container: HTMLElement, config: GameConfig) {
        this.container = container;
        this.config = config
        this.app = new Application();
    }

    public async init() {
        await this.app.init({
            width: this.config.width,
            height: this.config.height,
            backgroundColor: 0x111111,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        this.container.appendChild(this.app.canvas);

        window.addEventListener('resize', () => this.resize());

        this.resize()

        this.game = new GameController(this.app, this.config);
        this.app.ticker.add((ticker) => {
            this.game!.update(ticker.deltaTime)
        })
        window.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                // Prevent default behavior (like page scrolling)
                event.preventDefault();
                this.game!.spaceBtnPressed();
            }
        });
        await this.game.boot();
    }

    private resize() {
        const parent = this.container;
        const screenWidth = parent.clientWidth;
        const screenHeight = parent.clientHeight;

        // Calculate scale to fit while maintaining aspect ratio
        const scale = Math.min(screenWidth / this.config.width, screenHeight / this.config.height);

        const newWidth = Math.floor(this.config.width * scale);
        const newHeight = Math.floor(this.config.height * scale);

        // Scale CSS bounds, Pixi handles internal resolution via autoDensity
        this.app.canvas.style.width = `${newWidth}px`;
        this.app.canvas.style.height = `${newHeight}px`;

        // Center the canvas in the container
        this.app.canvas.style.position = 'absolute';
        this.app.canvas.style.left = `${(screenWidth - newWidth) / 2}px`;
        this.app.canvas.style.top = `${(screenHeight - newHeight) / 2}px`;
    }
}