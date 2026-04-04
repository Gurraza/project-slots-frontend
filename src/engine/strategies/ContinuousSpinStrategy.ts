// src/engine/strategies/ContinuousSpinStrategy.ts
import { type ISpinStrategy } from "./ISpinStrategy";
import type { Reel } from "../Reel";
import { gsap } from "gsap";

export class ContinuousSpinStrategy implements ISpinStrategy {
    // Move the properties specific to continuous spinning here
    private speed: number = 0;
    private speedMultiplier: number = 1;
    private symbolsInjected: number = 0;
    private stopSymbols: number[] = [];
    private resolveSpin: (() => void) | null = null;

    public async sspin(reel: Reel): Promise<void> {
        this.symbolsInjected = 0;
        this.stopSymbols = [];

        gsap.to(reel.symbols, {
            y: `-=${reel.config.windup.pixels}`,
            duration: reel.config.windup.time,
            delay: (reel.config.staggerTime.start / 1000) * reel.index,
            ease: reel.config.windup.ease,
            onComplete: () => {
                reel.state = "SPINNING";
                gsap.to(this, {
                    speed: reel.config.spinSpeed,
                    duration: reel.config.spinAcceleration,
                    ease: "power2.in"
                });
            }
        });

        return new Promise((resolve) => {
            this.resolveSpin = resolve;
        });
    }
    public async spin(reel: Reel): Promise<void> {
        this.symbolsInjected = 0;
        this.stopSymbols = [];

        // Wrap the gsap windup in a Promise that resolves when the spin begins
        return new Promise((resolve) => {
            gsap.to(reel.symbols, {
                y: `-=${reel.config.windup.pixels}`,
                duration: reel.config.windup.time,
                delay: (reel.config.staggerTime.start / 1000) * reel.index,
                ease: reel.config.windup.ease,
                onComplete: () => {
                    reel.state = "SPINNING";
                    gsap.to(this, {
                        speed: reel.config.spinSpeed,
                        duration: reel.config.spinAcceleration,
                        ease: "power2.in"
                    });

                    // Resolve here so SpinFeature.ts can proceed to anticipation and stop logic
                    resolve();
                }
            });
        });
    }
    public commandStop(reel: Reel, stopSymbols: number[]): Promise<void> {
        this.stopSymbols = stopSymbols;
        this.symbolsInjected = 0;
        reel.state = "STOPPING";

        return new Promise((resolve) => {
            this.resolveSpin = resolve;
        });
    }

    public update(reel: Reel, delta: number): void {
        if (reel.state !== "SPINNING" && reel.state !== "STOPPING") return;

        reel.blurFilter.strengthY = this.speed * this.speedMultiplier * reel.blurMultiplier;
        let readyToLand = false;

        reel.symbols.forEach((symbol) => {
            symbol.y += delta * this.speed * this.speedMultiplier;

            if (symbol.y > reel.viewBottom) {
                symbol.y -= reel.totalHeight;

                if (reel.state === "SPINNING") {
                    symbol.changeSymbolState(reel.getRandomSymbolId());
                } else if (reel.state === "STOPPING") {
                    if (this.symbolsInjected < reel.config.rows) {
                        const targetId = this.stopSymbols[this.stopSymbols.length - 1 - this.symbolsInjected];
                        symbol.changeSymbolState(targetId !== undefined ? targetId : reel.getRandomSymbolId());
                    } else {
                        symbol.changeSymbolState(reel.getRandomSymbolId());
                    }

                    this.symbolsInjected++;

                    if (this.symbolsInjected >= reel.config.rows + 1) {
                        readyToLand = true;
                    }
                }
            }
        });

        if (readyToLand) {
            this.triggerLanding(reel);
        }
    }

    private triggerLanding(reel: Reel): void {
        reel.state = "LANDING";
        reel.blurFilter.strengthY = 0;
        const sortedSymbols = reel.getSorted();

        sortedSymbols.forEach((symbol, index) => {
            const destY = ((index - 1) * reel.slotHeight) + (reel.config.symbolHeight! / 2);

            const tl = gsap.timeline({
                onComplete: () => {
                    if (index === sortedSymbols.length - 1) {
                        reel.state = "IDLE";
                        reel.snapToGrid();
                        this.speed = 0;
                        if (this.resolveSpin) {
                            this.resolveSpin();
                            this.resolveSpin = null;
                        }
                    }
                }
            });

            tl.to(symbol, {
                y: destY + reel.config.bounce.pixels,
                duration: reel.config.spinDeacceleration,
                ease: "power1.out"
            }).to(symbol, {
                y: destY,
                duration: 0.15,
                ease: "power1.in"
            });
        });
    }
}