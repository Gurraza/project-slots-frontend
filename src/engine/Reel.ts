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

        // gsap.to(this, {
        //     speed: this.config.spinSpeed,
        //     duration: .4,//this.config.spinAcceleration,
        //     delay: this.config.staggerTime * this.index,
        //     ease: "back.in(3)",
        //     onStart: () => { this.state = "SPINNING"; }
        // })
        gsap.to(this.symbols, {
            y: `-=${this.config.windup.pixels}`,
            duration: this.config.windup.time,
            delay: this.config.staggerTime * this.index,
            ease: this.config.windup.ease,
            onComplete: () => {
                this.state = "SPINNING";

                // 2. Acceleration Phase (ramp up speed)
                gsap.to(this, {
                    speed: this.config.spinSpeed,
                    duration: this.config.spinAcceleration,
                    ease: "power2.in"
                });
            }
        });

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

            const tl = gsap.timeline({
                onComplete: () => {
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
            })

            // 1. Deceleration Phase (slow down to target)
            tl.to(symbol, {
                y: destY + this.config.bounce.pixels,
                duration: this.config.spinDeacceleration,
                ease: "power1.out"
            })
                // 3. Bounce Up Phase (return to resting position)
                .to(symbol, {
                    y: destY,
                    duration: 0.15, // Short duration for snap back
                    ease: "power1.in"
                });
        });
    }

    private getSorted(): ReelSymbol[] {
        return [...this.symbols].sort((a, b) => a.y - b.y)
    }

    public async explodeAndCascade(indecies: number[], replaceIds: number[]): Promise<void> {
        // 1. Sort ascending (top to bottom) to map physical rows to array indices
        const sorted = this.getSorted();

        const exploded: ReelSymbol[] = []
        const surviving: ReelSymbol[] = []

        for (let i = 0; i < this.config.rows + 1; i++) {
            if (indecies.includes(i)) {
                exploded.push(sorted[i + 1])
            }
            else {
                surviving.push(sorted[i + 1])
            }
        }

        // 3. (Optional) Await explosion visual effects here
        // await this.playExplodeEffects(exploded);

        // 4. Update data and pre-position the exploded symbols at the top
        exploded.forEach((symbol, i) => {
            symbol.changeSymbolState(replaceIds[i]);
            // Move above the top visible slot
            symbol.y = -this.slotHeight * (i + 1) + (this.config.symbolHeight / 2);
        });

        // 5. Combine new top symbols with surviving symbols for the final grid layout
        // New symbols drop to the top rows; surviving symbols keep their relative order
        const newGridLayout = [...exploded.reverse(), ...surviving]

        // 6. Tween all symbols to their new calculated resting Y positions
        const dropPromises = newGridLayout.map((symbol, rowIndex) => {
            const destY = ((rowIndex) * this.slotHeight) + this.config.symbolHeight / 2
            const distance = Math.abs(destY - symbol.y);

            // Skip animation for symbols that are already in their correct position
            if (distance === 0) {
                return Promise.resolve();
            }

            // Time = Distance / Speed
            const calculatedDuration = distance / this.config.dropSpeed!

            return new Promise<void>(resolve => {
                gsap.to(symbol, {
                    y: destY,
                    duration: calculatedDuration,
                    ease: "linear",
                    delay: .5,
                    onComplete: resolve
                });
            });
        });

        await Promise.all(dropPromises);
        this.snapToGrid();
    }
}