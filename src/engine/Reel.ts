import { Assets, Container, Sprite, Graphics } from "pixi.js";
import { getPos, type GameConfig, type Position, type SymbolDef } from "./types";
import gsap from "gsap"

export class ReelSymbol extends Sprite {
    public symbolId: number
    private config: GameConfig
    constructor(symbolId: number, config: GameConfig) {
        super()
        this.config = config
        this.symbolId = -1
        this.changeSymbolState(symbolId)
    }

    public changeSymbolState(newStateId: number) {
        const s: SymbolDef | undefined = this.config.symbols.find(s => s.id == newStateId)
        if (!s) throw new Error("Bad id in changeSymbolState, tried: " + newStateId);
        this.texture = Assets.get(s.asset.alias)
        this.symbolId = s.id

        this.scale.set(1);

        const ratioX = this.config.symbolWidth / this.texture.width;
        const ratioY = this.config.symbolHeight / this.texture.height;
        const baseScale = Math.min(ratioX, ratioY);

        const finalScale = baseScale * s.scale;

        this.scale.set(finalScale);

        this.anchor.set(0.5);
        this.x = this.config.symbolWidth / 2;
    }
}

export class Reel {
    public container: Container
    public state: "IDLE" | "SPINNING" | "CASCADING" | "LANDING" = "IDLE"
    public slotHeight: number
    public symbols: ReelSymbol[] = []
    private speed: number = 0

    private config: GameConfig
    private totalHeight: number
    private viewBottom: number
    private symbolsRotated: number = 0
    private stopSymbols: number[] = []
    private resolveSpin: (() => void) | null = null
    private index: number

    constructor(config: GameConfig, position: Position, index: number) {
        this.config = config
        this.container = new Container()
        const containerPos = getPos(position, config)
        this.container.position.set(containerPos.x, containerPos.y)
        this.slotHeight = this.config.symbolHeight + this.config.gapY
        this.totalHeight = this.slotHeight * (this.config.rows + 2)
        this.viewBottom = (this.config.rows + 1) * this.slotHeight + this.slotHeight / 2
        this.index = index
        this.initSymbols()
    }

    initSymbols(): void {

        for (let i = 0; i < this.config.rows + 2; i++) {
            const symbol = new ReelSymbol(this.getRandomSymbolId(), this.config)

            symbol.y = (i - 1) * this.slotHeight + (this.config.symbolHeight / 2);

            this.symbols.push(symbol);
            this.container.addChild(symbol);
        }

        const mask = new Graphics()
            .rect(0, 0, this.config.symbolWidth, (this.config.symbolHeight + this.config.gapY) * this.config.rows)
            .fill("white")

        mask.x = 0;
        mask.y = 0;
        mask.alpha = .7
        this.container.addChild(mask)
        this.container.mask = mask
    }

    update(delta: number): void {
        switch (this.state) {
            case "IDLE":
                break
            case "SPINNING":
                let readyToLand: boolean = false
                this.symbols.forEach((symbol) => {
                    symbol.y += delta * this.speed

                    if (symbol.y > this.viewBottom) {
                        symbol.y -= this.totalHeight


                        if (this.symbolsRotated >= this.config.symbolsBeforeStop) {
                            const targetId = this.stopSymbols[this.stopSymbols.length - 1 - this.symbolsRotated - this.config.symbolsBeforeStop]
                            if (targetId != undefined) {
                                symbol.changeSymbolState(targetId)
                            }
                            else {
                                symbol.changeSymbolState(this.getRandomSymbolId())
                            }
                        }
                        else {
                            symbol.changeSymbolState(this.getRandomSymbolId())
                        }

                        if (this.symbolsRotated - this.config.symbolsBeforeStop == this.config.rows) {
                            readyToLand = true
                        }

                        this.symbolsRotated++
                    }
                })
                if (readyToLand) {
                    this.triggerLanding()
                }
                break
            default:
                break
        }

    }

    getRandomSymbolId(): number {
        return this.config.symbols[Math.floor(Math.random() * this.config.symbols.length)].id
    }

    async spin(stopSymbols: number[]): Promise<void> {
        this.symbolsRotated = 0
        this.stopSymbols = stopSymbols

        gsap.to(this, {
            speed: this.config.spinSpeed,
            duration: this.config.spinAcceleration,
            delay: this.config.staggerTime * this.index,
            ease: "back.in(1.5)",
            onStart: () => { this.state = "SPINNING"; }
        })

        return new Promise((resolve) => {
            this.resolveSpin = resolve;
        });
    }

    private snapToGrid(): void {
        this.getSorted().forEach((symbol, i) => {
            symbol.y = (i - 1) * this.slotHeight + ((this.config.symbolHeight) / 2);
        });
    }

    private triggerLanding(): void {
        this.state = "LANDING";
        const sortedSymbols = this.getSorted();

        sortedSymbols.forEach((symbol, index) => {
            const destY = ((index - 1) * this.slotHeight) + (this.config.symbolHeight / 2);

            gsap.to(symbol, {
                y: destY,
                duration: this.config.spinDeacceleration, // Reduced duration for a heavier, more mechanical slot feel
                ease: "back.in", // Provides the overshoot and bounce
                onComplete: () => {
                    // Restrict resolution to the final symbol in the array to prevent multiple calls
                    if (index === sortedSymbols.length - 1) {
                        this.state = "IDLE";
                        this.snapToGrid()
                        this.speed = 0
                        if (this.resolveSpin) {
                            this.resolveSpin();
                            this.resolveSpin = null;
                        }
                    }
                }
            });
        });
    }

    private getSorted(): ReelSymbol[] {
        return [...this.symbols].sort((a, b) => a.y - b.y)
    }
}