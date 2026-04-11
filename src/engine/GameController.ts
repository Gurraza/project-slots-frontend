// src/engine/GameController.ts
import { Application, Container, Assets, Sprite } from 'pixi.js';
import { getPos, type Asset, type GameConfig, type GameState, type Grid, type Position, type Timeline, type TimelineEvent } from './types.ts';
import { Reel } from './Reel.ts';
import { UI } from './UI.ts';
import { FeatureRegistry } from './FeatureRegistry.ts';
import type { ReelSymbol } from './ReelSymbol.ts';
import gsap from "gsap"
import precomputed_seeds from './precomputed_spins.json';
import { SFX, SFXManager } from './SoundManager.ts';


export class GameController {
    private precomputedData: Record<string, any> | null = null;
    public config: GameConfig
    public gameContainer: Container
    public stage: Container
    public reels: Reel[] = []
    public app: Application
    public gameState: GameState
    public ui: UI
    private bg: Sprite
    private currentSeed: string | null = null
    private survey_group: string = ""
    public sfx: SFXManager;
    constructor(app: Application, config: GameConfig) {
        this.app = app
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
            features: config.features.map((key) => {
                const FeatureClass = FeatureRegistry.get(key);

                if (!FeatureClass) {
                    throw new Error(`Feature "${key}" not found in FeatureRegistry. Did you forget to register it?`);
                }

                // FeatureClass is the constructor, 'this' is the GameController instance
                return new FeatureClass(this);
            }),
            timeline: null,
            betAmount: 60,
            win: 0,
            sfxEnabled: true
        }
        this.ui = new UI(this.gameState, this.handleSpinPress)
        this.sfx = new SFXManager(this.gameState);
        // for kexet
        // window.addEventListener('message', (event) => {
        //     if (event.data && event.data.type === 'SET_SEED') {
        //         this.currentSeed = event.data.seed.toString();
        //         // Låt användarens klick på spin-knappen (handleSpinPress) anropa this.play()
        //     }
        // });
        // for kexet
        window.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SET_SEED') {
                this.currentSeed = event.data.seed.toString();
                this.survey_group = event.data.group.toString();
                console.log("Spelmotor mottog nytt seed:", this.currentSeed); // Bekräftelse
            }
        });

        window.addEventListener("keydown", (e) => {
            let speed = 1
            if (e.key === "1") speed = 0.00001;
            if (e.key === "2") speed = 0.25;
            if (e.key === "3") speed = 0.5;
            if (e.key === "4") speed = 1;
            if (e.key === "5") speed = 2;
            if (e.key === "6") speed = 4;
            if (e.key === "7") speed = 8;
            if (e.key === "8") speed = 16;
            if (e.key === "9") speed = 32;

            gsap.globalTimeline.timeScale(speed);
            app.ticker.speed = speed;

            console.log("Speed:", speed);
        });
    }

    public async bboot() {
        // Now reads dynamically from injected config
        console.log(`Booting Game Engine for: ${this.gameState.config.gameTitle}`)
        this.gameState.features.forEach(f => f.init())
        await this.loadAssets()
        // this.setBackground()
        this.buildGrid()

        // playAnimation(.2, this.stage, "/games/clashofreels/animations/meteor.json", { x: 100, y: 100 })
    }
    public async bbboot() {
        console.log(`Booting Game Engine for: ${this.gameState.config.gameTitle}`)
        this.gameState.features.forEach(f => f.init())
        await this.loadAssets()
        // this.setBackground()
        this.buildGrid()

        // --- LÄGG TILL DETTA ---
        // Signalera till wrappern att spelet är redo att ta emot första seedet
        window.parent.postMessage({ type: 'GAME_READY' }, '*');
    }

    public async boot() {
        console.log(`Booting Game Engine for: ${this.gameState.config.gameTitle}`)
        this.gameState.features.forEach(f => f.init())

        // Load the static JSON file into memory
        this.precomputedData = precomputed_seeds


        await this.loadAssets()
        this.sfx.play(SFX.BackgroundTrack, { loop: true, volume: .5 })
        this.buildGrid()

        window.parent.postMessage({ type: 'GAME_READY' }, '*');
    }

    private async loadAssets() {
        const toLoad: string[] = []
        this.config.symbols.forEach(s => {
            Assets.add(s.asset)
            toLoad.push(s.asset.alias)
        })

        const extraAssets: Asset[] = [
            // this.config.ui.spinButton.asset,
            // this.config.background.asset,
        ]
        this.config.symbolBg && extraAssets.push(this.config.symbolBg)
        const audioAssets = [
            { alias: 'sfx_reel_spin', src: '/games/clashofreels/audio/spin.wav' },
            { alias: 'sfx_reel_land1', src: '/games/clashofreels/audio/drop1.mp3' },
            { alias: 'sfx_reel_land2', src: '/games/clashofreels/audio/drop2.mp3' },
            { alias: 'sfx_reel_land3', src: '/games/clashofreels/audio/drop3.mp3' },
            { alias: 'sfx_coin_fountain', src: '/games/clashofreels/audio/coins.mp3' },
            { alias: 'sfx_bonus_mode', src: '/games/clashofreels/audio/melody.mp3' },
            { alias: 'sfx_explosion', src: '/games/clashofreels/audio/explosion.wav' },
            { alias: 'sfx_laser', src: '/games/clashofreels/audio/laser.mp3' },
            { alias: 'sfx_background_track', src: '/games/clashofreels/audio/background_track.mp3' },
        ];
        audioAssets.forEach(a => {
            Assets.add(a);
            toLoad.push(a.alias);
        });
        extraAssets.forEach(a => {
            Assets.add(a)
            toLoad.push(a.alias)
        })
        await Assets.load(toLoad)
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
        this.gameContainer.position.set(pos.x - ((this.config.symbolWidth! * this.config.cols + this.config.gapX * (this.config.cols - 1)) / 2), pos.y - (this.config.symbolHeight! + this.config.gapY) * this.config.rows / 2)
        this.gameState.stage.addChild(this.gameContainer);

        for (let i = 0; i < this.config.cols; i++) {
            const reel: Reel = new Reel(this.config, { left: i * (this.config.symbolWidth! + this.config.gapX), top: 0, }, i, this.stage, this.gameContainer, this)
            this.reels.push(reel)
            this.gameContainer.addChild(reel.container)
        }
    }

    async fffetchTimeline(): Promise<Timeline | undefined> {
        const currentParams = new URLSearchParams(window.location.search);
        // const seed = currentParams.get('seed');
        const seed = this.currentSeed || currentParams.get('seed');
        const url = new URL(this.config.endpoints.spin, "http://localhost:8080")
        // const url = new URL(this.config.endpoints.spin, "http://192.168.68.102:8080")
        url.searchParams.append("gameId", this.config.gameId)
        if (seed) { //?seed=541252984671129
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
            return rawData.map((data: any, i: number) => {
                const eventData = { ...data, index: i };

                // Multiply the win variables by the bet amount.
                // Note: Adjust the property names (win, winAmount, TotalWinAmount) 
                // if your backend JSON uses different keys.
                if (typeof eventData.win === 'number') {
                    eventData.win *= this.gameState.betAmount;
                }
                if (typeof eventData.totalWin === 'number') {
                    eventData.totalWin *= this.gameState.betAmount;
                }

                return eventData;
            });

        } catch (error) {
            console.error('Failed to fetch timeline data:', error);
        }
    }

    async fetchTimeline(): Promise<Timeline | undefined> {
        const currentParams = new URLSearchParams(window.location.search);
        const seed = this.currentSeed || currentParams.get('seed');

        if (!seed) {
            throw new Error("No seed provided for spin.");
        }

        if (!this.precomputedData || !this.precomputedData[seed]) {
            throw new Error(`Timeline for seed ${seed} not found in precomputed data.`);
        }

        // Deep copy the cached timeline to prevent modifying the source data
        const rawData = JSON.parse(JSON.stringify(this.precomputedData[seed]));

        return rawData.map((data: any, i: number) => {
            const eventData = { ...data, index: i };

            // Apply bet amount multipliers
            if (typeof eventData.win === 'number') {
                eventData.win *= this.gameState.betAmount;
            }
            if (typeof eventData.totalWin === 'number') {
                eventData.totalWin *= this.gameState.betAmount;
            }

            return eventData;
        });
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
        let timeline: Timeline | undefined;

        try {
            timeline = await this.fetchTimeline()
        }
        catch (error) {
            timeline = await this.fffetchTimeline()
        }
        if (!timeline) {
            throw new Error("Something with the api didn't work");
        }
        this.gameState.timeline = timeline
        if (this.gameState.state == "ACTIVE") return
        this.gameState.state = "ACTIVE"
        this.gameState.win = 0
        console.log("Symbols", this.config.symbols.map(s => ({ id: s.id, name: s.asset.alias })))
        console.log("Timeline", timeline)

        for (const f of this.gameState.features) {
            if (f.id === "TOTAL_WIN" && this.survey_group === "B") continue
            f.onSpinStart()
        }

        for (let i = 0; i < timeline.length; i++) {
            const event = timeline[i]
            const featurePromises: Promise<void>[] = [];

            for (const feature of this.gameState.features) {
                if (feature.id === "TOTAL_WIN" && this.survey_group === "B") continue
                if (feature.eventType === event.type || feature.eventType === "*") {
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
            if (f.id === "TOTAL_WIN" && this.survey_group === "B") continue
            f.onSpinEnd()
        }
        this.gameState.state = "IDLE"
        window.parent.postMessage({ type: 'ROUND_COMPLETE' }, '*');
    }

    public getTimelineEvent(index: number): TimelineEvent | null {
        if (this.gameState.timeline == null || index >= this.gameState.timeline.length || index < 0) {
            return null
        }
        return this.gameState.timeline[index]
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