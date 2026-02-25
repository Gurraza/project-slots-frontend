// src/engine/GameController.ts
import { Application, Container, Assets, Sprite } from 'pixi.js';
import { getPos, type Asset, type GameConfig, type GameState, type Grid, type Timeline } from './types.ts';
import { Reel, ReelSymbol } from './Reel.ts';
import { UI } from './UI.ts';
import { featureRegistry } from './features/FeatureRegistry.ts';


export class GameController {
    public config: GameConfig
    private gameState: GameState
    public gameContainer: Container
    private reels: Reel[] = []
    private ui: UI
    private bg: Sprite
    public stage: Container
    constructor(app: Application, config: GameConfig) {
        this.config = config;

        this.gameContainer = new Container()
        this.bg = new Sprite()
        app.stage.addChild(this.bg)
        this.stage = app.stage
        this.gameState = {
            config: config,
            grid: this.getInitialGrid(),
            timeline: [{ "type": "SPIN_START", "grid": [[2, 4, 6], [6, 7, 4], [5, 6, 7], [5, 7, 1], [6, 1, 6]], "win": 0, "totalWin": 0, "meta": null }, { "type": "TRANSFORM_FEATURE", "grid": [[2, 4, 6], [7, 7, 7], [7, 7, 7], [7, 7, 7], [6, 1, 6]], "win": 0, "totalWin": 0, "meta": { "newId": 7, "positions": [{ "x": 1, "y": 0 }, { "x": 1, "y": 2 }, { "x": 2, "y": 0 }, { "x": 2, "y": 1 }, { "x": 3, "y": 0 }, { "x": 3, "y": 2 }] } }, { "type": "PAYLINES_FEATURE", "grid": [[2, 4, 6], [7, 7, 7], [7, 7, 7], [7, 7, 7], [6, 1, 6]], "win": 35, "totalWin": 35, "meta": [{ "lineId": 2, "coords": [{ "x": 0, "y": 0 }, { "x": 1, "y": 0 }, { "x": 2, "y": 0 }, { "x": 3, "y": 0 }], "payout": 5, "symbol": "Strawberry", "symbolId": 2, "fullPath": [0, 0, 0, 0, 0] }, { "lineId": 4, "coords": [{ "x": 0, "y": 1 }, { "x": 1, "y": 1 }, { "x": 2, "y": 1 }, { "x": 3, "y": 1 }], "payout": 5, "symbol": "Orange", "symbolId": 4, "fullPath": [1, 1, 1, 1, 1] }, { "lineId": 6, "coords": [{ "x": 0, "y": 2 }, { "x": 1, "y": 2 }, { "x": 2, "y": 2 }, { "x": 3, "y": 2 }, { "x": 4, "y": 2 }], "payout": 10, "symbol": "Bar1", "symbolId": 6, "fullPath": [2, 2, 2, 2, 2] }, { "lineId": 2, "coords": [{ "x": 0, "y": 0 }, { "x": 1, "y": 1 }, { "x": 2, "y": 2 }, { "x": 3, "y": 1 }], "payout": 5, "symbol": "Strawberry", "symbolId": 2, "fullPath": [0, 1, 2, 1, 0] }, { "lineId": 6, "coords": [{ "x": 0, "y": 2 }, { "x": 1, "y": 1 }, { "x": 2, "y": 0 }, { "x": 3, "y": 1 }, { "x": 4, "y": 2 }], "payout": 10, "symbol": "Bar1", "symbolId": 6, "fullPath": [2, 1, 0, 1, 2] }] }],
            // timeline: [
            //     { "type": "SPIN_START", "grid": [[6, 7, 3], [6, 4, 3], [4, 4, 1], [1, 2, 7], [2, 1, 2]], "win": 0, "totalWin": 0, "meta": null },
            //     { "type": "PAYLINES_FEATURE", "grid": [[6, 7, 3], [6, 4, 3], [4, 4, 1], [1, 2, 7], [2, 1, 2]], "win": 2.5, "totalWin": 2.5, "meta": [{ "lineId": 4, "coords": [{ "X": 0, "Y": 1 }, { "X": 1, "Y": 1 }, { "X": 2, "Y": 1 }], "payout": 2.5, "symbol": "Orange", "symbolId": 4, "fullPath": [1, 1, 1, 1, 1] }] }],
            app: app,
            stage: app.stage,
            state: "IDLE",
            features: config.features.map((type) => {
                const key = type as keyof typeof featureRegistry
                const f = featureRegistry[key]
                return new f(this)
            })
        }
        this.ui = new UI(this.gameState, this.handleSpinPress)
    }

    public async boot() {
        // Now reads dynamically from injected config
        console.log(`Booting Game Engine for: ${this.gameState.config.title}`)
        this.gameState.features.forEach(f => f.init())
        await this.loadAssets()
        this.setBackground()
        this.buildGrid()
        this.initializeNetwork()
        this.ui.setup()
    }

    private async loadAssets() {
        const toLoad: string[] = []
        this.config.symbols.forEach(s => {
            Assets.add(s.asset)
            toLoad.push(s.asset.alias)
        })
        const extraAssets: Asset[] = [
            this.config.ui.spinButton.asset,
            this.config.background.asset
        ]
        extraAssets.forEach(a => {
            Assets.add(a)
            toLoad.push(a.alias)
        })
        await Assets.load(toLoad)
        console.log(`Loaded ${toLoad}`)
    }

    private setBackground(bg: string = "bg") {
        const texture = Assets.get(bg);
        this.bg.texture = texture;

        // 1. Calculate scale ratios
        const scaleX = this.config.width / texture.width;
        const scaleY = this.config.height / texture.height;

        // 2. Use the larger scale to ensure the entire area is covered
        const scale = Math.max(scaleX, scaleY);
        this.bg.scale.set(scale);

        // 3. Center the sprite
        // Set anchor to 0.5 to rotate/scale from center
        this.bg.anchor.set(0.5);
        this.bg.x = this.config.width / 2;
        this.bg.y = this.config.height / 2;
    }

    private buildGrid() {
        const pos = getPos(this.config.position, this.config)
        this.gameContainer.position.set(pos.x - ((this.config.symbolWidth * this.config.cols + this.config.gapX * (this.config.cols - 1)) / 2), pos.y - (this.config.symbolHeight + this.config.gapY) * this.config.rows / 2)
        this.gameState.stage.addChild(this.gameContainer);

        for (let i = 0; i < this.config.cols; i++) {
            const reel: Reel = new Reel(this.config, { left: i * (this.config.symbolWidth + this.config.gapX), top: 0, }, i)
            this.reels.push(reel)
            this.gameContainer.addChild(reel.container)
        }
    }

    private initializeNetwork() {
        // Implementation
    }

    private getInitialGrid(): Grid {
        const g: Grid = Array.from({ length: this.config.cols }, () =>
            Array.from({ length: this.config.rows }, () => 0)
        );
        return g
    }

    // private spin(timeline: Timeline) {

    // }

    update(delta: number) {
        this.reels.forEach(r => r.update(delta));
    }

    public async play(timeline: Timeline) {
        if (this.gameState.state == "ACTIVE") return
        this.gameState.state = "ACTIVE"
        // this.reels.forEach((r) => r.spin([0, 0, 0, 0, 0, 0, 0]))
        console.log("Symbols", this.config.symbols)
        console.log("Timeline", timeline)
        await this.spinReels()

        for (let i = 1; i < timeline.length; i++) {
            const event = timeline[i]
            for (const feature of this.gameState.features) {
                if (feature.type === event.type) {
                    await feature.onEvent(event);
                    break;
                }
            }
        }
        this.gameState.state = "IDLE"
    }

    private async spinReels() {
        const promises: Promise<void>[] = []
        this.reels.forEach((r, i) => {
            promises.push(r.spin(this.gameState.timeline[0].grid[i]))
        })
        await Promise.all(promises)
    }

    private handleSpinPress = async (): Promise<void> => { this.play(this.gameState.timeline) }


    public getSymbol(col: number, row: number): ReelSymbol {
        console.log(`col:${col} row:${row}`)
        const reel = this.reels[col];
        // Find the symbol closest to the expected Y position
        // This assumes row 0 is at y=0, row 1 is at y=slotHeight, etc.
        // Adjust logic if your grid is centered differently.
        const targetY = (row * reel.slotHeight) + (this.config.symbolHeight / 2);

        // Allow a small margin of error for floating point positions
        const res = reel.symbols.find(s => Math.abs(s.y - targetY) < 15);
        if (res) {
            return res
        }
        else {
            throw new Error(`Error in getSymbol in game controller, tried to get a symbol that doesn't exists col: ${col} row: ${row}`);
        }
    }
}