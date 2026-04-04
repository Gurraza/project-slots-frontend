import { ReelSymbol } from "./ReelSymbol";
import { getPos, type GameConfig, type Position } from "./types";
import { Container, Graphics, BlurFilter } from "pixi.js";
import * as PIXI from "pixi.js"
import { PixiPlugin } from "gsap/PixiPlugin"
import { gsap } from "gsap"
import { DropInOutSpinStrategy } from "./strategies/DropInOutSpinStrategy";
import { ContinuousSpinStrategy } from "./strategies/ContinuousSpinStrategy";
import type { ISpinStrategy } from "./strategies/ISpinStrategy";

gsap.registerPlugin(PixiPlugin)
PixiPlugin.registerPIXI(PIXI)


export class Reel {
    public container: Container
    public state: "IDLE" | "SPINNING" | "CASCADING" | "LANDING" | "STOPPING" = "IDLE"
    public slotHeight: number
    public symbols: ReelSymbol[] = []

    public speed: number = 0
    public speedMultiplier: number = 1
    public config: GameConfig
    public totalHeight: number
    public viewBottom: number
    public symbolsInjected: number = 0
    public stopSymbols: number[] = []
    public resolveSpin: (() => void) | null = null
    public index: number
    public stage: Container
    public border: Graphics
    public blurFilter: BlurFilter;
    public blurMultiplier: number
    public spinStrategy: ISpinStrategy;

    constructor(config: GameConfig, position: Position, index: number, stage: Container, gameContainer: Container) {
        this.config = config
        this.container = new Container()
        // this.container.sortableChildren = true;
        const containerPos = getPos(position, config)
        this.container.position.set(containerPos.x, containerPos.y)
        this.slotHeight = this.config.symbolHeight! + this.config.gapY
        this.totalHeight = this.slotHeight * (this.config.rows + 2)
        this.viewBottom = (this.config.rows + 1) * this.slotHeight + this.slotHeight / 2
        this.index = index
        this.stage = stage

        this.border = new Graphics()
        this.border
            .setStrokeStyle({ width: 4, color: 0xFFD700, alignment: 0 }) // Golden color
            .rect(containerPos.x, containerPos.y, this.config.symbolWidth!, (this.config.symbolHeight! + this.config.gapY) * this.config.rows)
            .stroke();

        this.border.alpha = 0;
        gameContainer.addChild(this.border);
        this.blurFilter = new BlurFilter();
        this.blurMultiplier = this.config.motionBlurStrength
        this.blurFilter.strengthX = 0;
        this.blurFilter.strengthY = 0;
        this.blurFilter.resolution = 2
        // PixiJS v8 applies filters as an array
        this.container.filters = [this.blurFilter];
        if (this.config.reelSpinMode === "DROP_IN_DROP_OUT") {
            this.spinStrategy = new DropInOutSpinStrategy();
        } else {
            this.spinStrategy = new ContinuousSpinStrategy();
        }
        this.initSymbols()
    }

    initSymbols(): void {

        for (let i = 0; i < this.config.rows + 2; i++) {
            const symbol = new ReelSymbol(this.getRandomSymbolId(), this.config, this.stage)

            symbol.y = (i - 1) * this.slotHeight + (this.config.symbolHeight! / 2);

            this.symbols.push(symbol);
            this.container.addChild(symbol);
        }

        const mask = new Graphics()
            .rect(0, 0, this.config.symbolWidth!, (this.config.symbolHeight! + this.config.gapY) * this.config.rows)
            .fill("white")

        mask.x = 0;
        mask.y = 0;
        mask.alpha = .7
        this.container.addChild(mask)
        this.container.mask = mask
    }

    update(delta: number): void {
        this.spinStrategy.update(this, delta);
    }

    getRandomSymbolId(): number {
        return this.config.symbols[Math.floor(Math.random() * this.config.symbols.length)].id
    }

    async spin(): Promise<void> {
        return this.spinStrategy.spin(this);
    }

    public commandStop(stopSymbols: number[]): Promise<void> {
        return this.spinStrategy.commandStop(this, stopSymbols);
    }

    private triggerLanding(): void {
        this.state = "LANDING";
        this.blurFilter.strengthY = 0; // Remove blur for the bounce sequence
        const sortedSymbols = this.getSorted();

        sortedSymbols.forEach((symbol, index) => {
            const destY = ((index - 1) * this.slotHeight) + (this.config.symbolHeight! / 2);

            const tl = gsap.timeline({
                onComplete: () => {
                    if (index === sortedSymbols.length - 1) {
                        this.state = "IDLE";
                        this.snapToGrid();
                        this.speed = 0;
                        if (this.resolveSpin) {
                            this.resolveSpin();
                            this.resolveSpin = null;
                        }
                    }
                }
            });

            tl.to(symbol, {
                y: destY + this.config.bounce.pixels,
                duration: this.config.spinDeacceleration,
                ease: "power1.out"
            }).to(symbol, {
                y: destY,
                duration: 0.15,
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
        const matchPromises: Promise<void>[] = []
        exploded.forEach((s: ReelSymbol) => {
            matchPromises.push(s.play("highlight"))
        });

        await Promise.all(matchPromises)

        const promises: Promise<void>[] = []
        exploded.forEach((s: ReelSymbol, i) => {
            promises.push(s.play("remove"))
            s.changeSymbolState(replaceIds[i]);
            // Move above the top visible slot
            s.y = -this.slotHeight * (exploded.length - i) + (this.config.symbolHeight! / 2);
        });

        await Promise.all(promises)
        // await new Promise(r => setTimeout(r, 1000))
        // 5. Combine new top symbols with surviving symbols for the final grid layout
        // New symbols drop to the top rows; surviving symbols keep their relative order
        const newGridLayout = [...exploded, ...surviving]

        // 6. Tween all symbols to their new calculated resting Y positions
        const dropPromises = newGridLayout.map((symbol, rowIndex) => {
            const destY = ((rowIndex) * this.slotHeight) + this.config.symbolHeight! / 2
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

    public snapToGrid(): void {
        this.getSorted().forEach((symbol, i) => {
            symbol.y = (i - 1) * this.slotHeight + ((this.config.symbolHeight!) / 2);
        });
    }

    public dimReel(): void {
        this.symbols.forEach((symbol: ReelSymbol) => {
            gsap.to(symbol.symbolSprite, {
                pixi: { tint: 0x666666 },
                duration: 0.2,
                ease: "none"
            })
            // if (symbol.bgSprite) {
            //     symbol.bgSprite.tint = 0x666666;
            // }
        });
    }

    public removeDim(): void {
        this.symbols.forEach(symbol => {
            gsap.to(symbol.symbolSprite, {
                pixi: { tint: 0xffffff },
                duration: 0.2,
                ease: "none"
            })
            // if (symbol.bgSprite) {
            //     symbol.bgSprite.tint = 0xFFFFFF;
            // }
            gsap.killTweensOf(symbol.symbolSprite.scale);
            gsap.to(symbol.symbolSprite.scale, {
                x: symbol.symbolScale,
                y: symbol.symbolScale,
                duration: 0.2,
                ease: "power2.out"
            });
        });
    }

    // Call this specifically for the target symbols you want to highlight
    public highlightSymbol(rowIndex: number): void {
        const sorted = this.getSorted();
        // +1 because your index 0 is the hidden top symbol
        const target = sorted[rowIndex + 1];
        if (target) {
            // target.symbolSprite.tint = 0xFFFFFF; // Keep it bright

            gsap.to(target.symbolSprite, {
                pixi: { tint: 0xffffff },
                duration: 0.2,
                ease: "none"
            })
            gsap.to(target.symbolSprite.scale, {
                x: target.symbolScale * 1.15,
                y: target.symbolScale * 1.15,
                duration: 0.6,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                id: `highlight_scale_${target.uid}` // Assuming ReelSymbol has a unique ID
            });
            // if (target.bgSprite) target.bgSprite.tint = 0xFFFFFF;
            // Optionally play an animation state here
            // target.play("anticipation_highlight"); 
        }
    }

    public slowDownForAnticipation(): void {
        // Decrease speed to create tension. 
        // e.g., Drop to 40% of standard speed
        gsap.to(this, {
            speedMultiplier: .4,
            duration: 0.2,
            ease: "none"
        });
    }

    public restoreSpeed(): void {
        gsap.to(this, {
            speedMultiplier: 1,
            duration: 0.2,
            ease: "none"
        });
    }

    public showAnticipationBorder(): void {
        gsap.to(this.border, {
            alpha: 1,
            duration: 0.3,
            ease: "power2.out"
        });

        // Optional: Add a "pulse" effect for more impact
        gsap.to(this.border, {
            alpha: 0.5,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }

    public hideBorder(): void {
        gsap.killTweensOf(this.border);
        gsap.to(this.border, { alpha: 0, duration: 0.2 });
    }
}