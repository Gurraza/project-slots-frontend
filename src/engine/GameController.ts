// src/engine/GameController.ts
import { Application, Container, Assets, Sprite } from 'pixi.js';
import { getPos, type Asset, type GameConfig, type GameState, type Grid, type Position, type Timeline } from './types.ts';
import { Reel, ReelSymbol } from './Reel.ts';
import { UI } from './UI.ts';
import { featureRegistry } from './features/FeatureRegistry.ts';

export class GameController {
    public config: GameConfig
    public gameContainer: Container
    public stage: Container
    public reels: Reel[] = []

    private gameState: GameState
    private ui: UI
    private bg: Sprite
    constructor(app: Application, config: GameConfig) {
        this.config = config;

        this.gameContainer = new Container()
        this.bg = new Sprite()
        app.stage.addChild(this.bg)
        this.stage = app.stage
        this.gameState = {
            config: config,
            grid: this.getInitialGrid(),
            app: app,
            stage: app.stage,
            state: "IDLE",
            features: config.features.map((type) => {
                const key = type as keyof typeof featureRegistry
                const f = featureRegistry[key]
                return new f(this)
            }),
            timeline: null
        }
        this.ui = new UI(this.gameState, this.handleSpinPress)
    }

    public async boot() {
        // Now reads dynamically from injected config
        console.log(`Booting Game Engine for: ${this.gameState.config.gameTitle}`)
        this.gameState.features.forEach(f => f.init())
        await this.loadAssets()
        this.setBackground()
        this.buildGrid()
        this.ui.setup()

        // playAnimation(.2, this.stage, "/games/clashofreels/animations/meteor.json", { x: 100, y: 100 })
    }

    private async loadAssets() {
        const toLoad: string[] = []
        this.config.symbols.forEach(s => {
            Assets.add(s.asset)
            toLoad.push(s.asset.alias)
        })
        const extraAssets: Asset[] = [
            this.config.ui.spinButton.asset,
            this.config.background.asset,
        ]
        this.config.symbolBg && extraAssets.push(this.config.symbolBg)
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

        // --- VIDEO CONFIGURATION START ---
        // Compatible with both PixiJS v7 (baseTexture) and v8 (source)
        const baseSource = texture.source || texture.baseTexture;
        const videoElement = baseSource?.resource?.source || baseSource?.resource;

        if (videoElement instanceof HTMLVideoElement) {
            videoElement.loop = true;
            videoElement.muted = true;       // Mandatory for browser autoplay
            videoElement.playsInline = true; // Prevents iOS fullscreen takeover
            videoElement.playbackRate = 1
            videoElement.play().catch((e) => {
                console.warn("Video autoplay blocked by browser:", e);
            });
        }
        // --- VIDEO CONFIGURATION END ---

        // 1. Calculate scale ratios
        const scaleX = this.config.width / texture.width;
        const scaleY = this.config.height / texture.height;

        // 2. Use the larger scale to ensure the entire area is covered
        const scale = Math.max(scaleX, scaleY);
        this.bg.scale.set(scale);
        this.bg.zIndex = -10

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
            const reel: Reel = new Reel(this.config, { left: i * (this.config.symbolWidth + this.config.gapX), top: 0, }, i, this.stage)
            this.reels.push(reel)
            this.gameContainer.addChild(reel.container)
        }
    }

    async fetchTimeline(): Promise<Timeline | undefined> {
        const currentParams = new URLSearchParams(window.location.search);
        const seed = currentParams.get('seed');
        const url = new URL(this.config.endpoints.spin, "http://localhost:8080")
        // const url = new URL(this.config.endpoints.spin, "http://192.168.68.102:8080")
        url.searchParams.append("gameId", this.config.gameId)
        if (seed) {
            url.searchParams.set('seed', seed);
        }
        const endpoint = url.toString();
        console.log(`endpoint ${endpoint}`)
        try {
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error. Status: ${response.status}`);
            }

            const rawData = await response.json();
            return rawData

        } catch (error) {
            console.error('Failed to fetch timeline data:', error);
        }
    }

    private getInitialGrid(): Grid {
        const g: Grid = Array.from({ length: this.config.cols }, () =>
            Array.from({ length: this.config.rows }, () => 0)
        );
        return g
    }

    update(delta: number) {
        this.reels.forEach(r => r.update(delta));
    }

    public async play() {
        const timeline = await this.fetchTimeline()
        if (!timeline) {
            throw new Error("Something with the api didn't work");
        }
        this.gameState.timeline = timeline
        if (this.gameState.state == "ACTIVE") return
        this.gameState.state = "ACTIVE"
        // this.reels.forEach((r) => r.spin([0, 0, 0, 0, 0, 0, 0]))
        console.log("Symbols", this.config.symbols.map(s => ({ id: s.id, name: s.asset.alias })))
        console.log("Timeline", timeline)

        for (const f of this.gameState.features) {
            f.onSpinStart()
        }

        for (let i = 0; i < timeline.length; i++) {
            const event = timeline[i]
            if (event.type === "SPIN_START") {
                await this.spinReels(event.grid)
            }
            const featurePromises: Promise<void>[] = [];

            for (const feature of this.gameState.features) {
                if (feature.eventType === event.type) {
                    // Push the promise without awaiting it immediately
                    featurePromises.push(feature.onEvent(event));
                }
            }

            // Await all matching features concurrently
            if (featurePromises.length > 0) {
                await Promise.all(featurePromises);
            }
        }

        for (const f of this.gameState.features) {
            f.onSpinEnd()
        }
        this.gameState.state = "IDLE"
    }

    private async spinReels(g: Grid) {
        const promises: Promise<void>[] = []
        this.reels.forEach((r, i) => {
            if (!this.gameState.timeline) {
                throw new Error("No timeline in spinReels");

            }
            promises.push(r.spin(g[i]))
        })
        await Promise.all(promises)
    }

    private handleSpinPress = async (): Promise<void> => { this.play() }

    public getSymbol(col: number, row: number): ReelSymbol {
        const res = this.reels[col].getSorted()[row + 1]
        if (res) {
            return res
        }
        else {
            throw new Error(`Error in getSymbol in game controller, tried to get a symbol that doesn't exists col: ${col} row: ${row}`);
        }
    }

    public async place(src: string, position: Position): Promise<Container> {
        const texture = await Assets.load(src)
        const sprite = new Sprite(texture)
        sprite.anchor.set(.5)
        const pos = getPos(position, this.config)
        sprite.position.set(pos.x, pos.y)
        this.stage.addChild(sprite)
        return sprite
    }

    public spaceBtnPressed() {
        this.handleSpinPress()
    }
}