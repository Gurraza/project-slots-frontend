import { Assets, Container, Sprite, Graphics, Texture } from "pixi.js";
import { getPos, type GameConfig, type Position, type SymbolDef, type SymbolVisualState } from "./types";
import gsap from "gsap"
import { AnimationController } from "./AnimationController";

export class ReelSymbol extends Container {
    public symbolId: number = -1
    private config: GameConfig
    private stage: Container

    private bgSprite: Sprite
    public symbolSprite: Sprite
    constructor(symbolId: number, config: GameConfig, stage: Container) {
        super()
        this.config = config
        this.stage = stage

        this.bgSprite = new Sprite()
        this.bgSprite.anchor.set(0.5)
        this.addChild(this.bgSprite)

        this.symbolSprite = new Sprite()
        this.symbolSprite.anchor.set(0.5)
        this.addChild(this.symbolSprite)

        this.x = this.config.symbolWidth / 2

        this.changeSymbolState(symbolId)
    }

    public changeSymbolState(newStateId: number) {
        const s: SymbolDef | undefined = this.config.symbols.find(s => s.id == newStateId);
        if (!s) throw new Error(`Bad id in changeSymbolState, tried: ${newStateId}`);

        this.symbolId = s.id;

        // Update textures independently
        this.symbolSprite.texture = Assets.get(s.asset.alias);

        // Assuming your SymbolDef has background logic. 
        // If not, add a bgAlias to the definition or assign programmatically.
        if (this.config.symbolBg && this.config.symbolBg.alias) {
            this.bgSprite.texture = Assets.get(this.config.symbolBg.alias);
            this.bgSprite.visible = true;
        } else {
            this.bgSprite.visible = false;
        }

        // Handle scaling on the container or individual sprites as needed
        this.scale.set(1);
        const ratioX = this.config.symbolWidth / this.symbolSprite.texture.width;
        const ratioY = this.config.symbolHeight / this.symbolSprite.texture.height;
        const baseScale = Math.min(ratioX, ratioY);
        const finalScale = baseScale * s.scale;

        // Apply scale to the symbol sprite, allowing the background to scale differently if needed
        this.symbolSprite.scale.set(finalScale);

        // Example: Make background fill the slot area
        this.bgSprite.width = this.config.symbolWidth;
        this.bgSprite.height = this.config.symbolHeight;
    }

    // public cchangeSymbolState(newStateId: number) {
    //     const s: SymbolDef | undefined = this.config.symbols.find(s => s.id == newStateId)
    //     if (!s) throw new Error("Bad id in changeSymbolState, tried: " + newStateId);
    //     this.texture = Assets.get(s.asset.alias)
    //     this.symbolId = s.id

    //     this.scale.set(1);

    //     const ratioX = this.config.symbolWidth / this.texture.width;
    //     const ratioY = this.config.symbolHeight / this.texture.height;
    //     const baseScale = Math.min(ratioX, ratioY);

    //     const finalScale = baseScale * s.scale;

    //     this.scale.set(finalScale);

    //     this.anchor.set(0.5);
    //     this.x = this.config.symbolWidth / 2;
    // }
    public getDefinition(): SymbolDef {
        const def = this.config.symbols.find(s => s.id === this.symbolId);
        if (!def) throw new Error("Missing symbol definition");
        return def;
    }

    public async play(state: SymbolVisualState) {
        await AnimationController.play(this, this.stage, state);
    }

    // get y(): number {
    //     return this.position.y;
    // }

    // set y(value: number) {
    //     this.position.y = value;
    //     // Higher on screen (lower Y) gets a higher zIndex
    //     this.zIndex = -value;
    // }
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
    private stage: Container
    // private symbolZIndex: number = 0

    constructor(config: GameConfig, position: Position, index: number, stage: Container) {
        this.config = config
        this.container = new Container()
        // this.container.sortableChildren = true;
        const containerPos = getPos(position, config)
        this.container.position.set(containerPos.x, containerPos.y)
        this.slotHeight = this.config.symbolHeight + this.config.gapY
        this.totalHeight = this.slotHeight * (this.config.rows + 2)
        this.viewBottom = (this.config.rows + 1) * this.slotHeight + this.slotHeight / 2
        this.index = index
        this.stage = stage
        this.initSymbols()
    }

    initSymbols(): void {

        for (let i = 0; i < this.config.rows + 2; i++) {
            const symbol = new ReelSymbol(this.getRandomSymbolId(), this.config, this.stage)

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


                        if (this.symbolsRotated >= this.config.symbolsBeforeStop + (this.config.staggerTime.end * this.index)) {
                            const targetId = this.stopSymbols[this.stopSymbols.length - 1 - (this.symbolsRotated - (this.config.symbolsBeforeStop + (this.config.staggerTime.end * this.index)))]
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

                        if (this.symbolsRotated - (this.config.symbolsBeforeStop + (this.config.staggerTime.end * this.index)) == this.config.rows) {
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
            delay: this.config.staggerTime.start * this.index,
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

    public getSorted(): ReelSymbol[] {
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
        const matchPromises: Promise<void>[] = []
        exploded.forEach((s: ReelSymbol, i) => {
            //const global = this.stage.toLocal(s.getGlobalPosition());

            matchPromises.push(s.play("highlight"))
        });

        await Promise.all(matchPromises)

        const promises: Promise<void>[] = []
        exploded.forEach((s: ReelSymbol, i) => {
            //const global = this.stage.toLocal(s.getGlobalPosition());

            promises.push(s.play("remove")) //playAnimation(.3, this.stage, '/games/clashofreels/animations/explosion.json', { x: global.x, y: global.y }))
            s.changeSymbolState(replaceIds[i]);
            // Move above the top visible slot
            s.y = -this.slotHeight * (exploded.length - i) + (this.config.symbolHeight / 2);
        });

        await Promise.all(promises)

        // 5. Combine new top symbols with surviving symbols for the final grid layout
        // New symbols drop to the top rows; surviving symbols keep their relative order
        const newGridLayout = [...exploded, ...surviving]

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