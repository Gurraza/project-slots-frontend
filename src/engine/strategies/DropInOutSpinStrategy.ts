// src/engine/strategies/DropInOutSpinStrategy.ts
import type { ISpinStrategy } from "./ISpinStrategy";
import type { Reel } from "../Reel";
import { gsap } from "gsap";

const dropoutStagger = .1
const dropinStagger = .1

export class DropInOutSpinStrategy implements ISpinStrategy {
    public async spin(reel: Reel): Promise<void> {
        reel.state = "SPINNING";
        const allSymbols = reel.getSorted();

        // Extract only the visible symbols (skip index 0, take up to config.rows)
        const visibleSymbols = allSymbols.slice(1, reel.config.rows + 1);

        // Drop out from bottom to top. Reverse the array to start with the bottom-most visible symbol.
        const dropOutPromises = [...visibleSymbols].reverse().map((symbol, index) => {
            return gsap.to(symbol, {
                y: reel.viewBottom + reel.slotHeight, // Move below view
                duration: 0.2,
                delay: index * dropoutStagger + (reel.config.staggerTime.start / 1000) * reel.index, // Staggered drop out
                ease: "back.in(0.5)"
            });
        });

        await Promise.all(dropOutPromises);

        // Move visible symbols above view to prepare for drop-in
        visibleSymbols.forEach(symbol => {
            symbol.y = -reel.slotHeight;
        });
    }

    public async commandStop(reel: Reel, stopSymbols: number[]): Promise<void> {
        reel.state = "STOPPING";
        const allSymbols = reel.getSorted();

        // 1. Handle Buffers: Update textures but enforce static off-screen Y positions
        const topBuffer = allSymbols[0];
        const bottomBuffer = allSymbols[allSymbols.length - 1];

        topBuffer.changeSymbolState(reel.getRandomSymbolId());
        topBuffer.y = -reel.slotHeight + (reel.config.symbolHeight! / 2);

        bottomBuffer.changeSymbolState(reel.getRandomSymbolId());
        bottomBuffer.y = (reel.config.rows) * reel.slotHeight + (reel.config.symbolHeight! / 2);

        // 2. Handle Visible Symbols
        const visibleSymbols = allSymbols.slice(1, reel.config.rows + 1);

        // Assign new IDs from the stop command and stack them above the screen
        visibleSymbols.forEach((symbol, index) => {
            symbol.changeSymbolState(stopSymbols[index]);
            symbol.y = -reel.slotHeight * (reel.config.rows - index); // Stack above
        });

        // Drop in staggered from top to bottom
        const dropInPromises = visibleSymbols.map((symbol, index) => {
            // Calculate final resting position based on grid row
            const destY = (index * reel.slotHeight) + (reel.config.symbolHeight! / 2);
            const tl = gsap.timeline()
            tl.to(symbol, {
                y: destY,
                duration: 0.2,
                delay: ((reel.config.rows - 1 - index) + reel.index) * dropinStagger, // Staggered drop in
                ease: "back.out(0.1)"
            })
                // Squash on landing
                .to(symbol.scale, {
                    x: 1.25,
                    y: 0.75,
                    duration: 0.2,
                    ease: "power2.out"
                }, "<")
                // Recover to original proportions with a slight wobble
                .to(symbol.scale, {
                    x: 1.0,
                    y: 1.0,
                    duration: 0.1,
                    ease: "power2.out"
                });
            return tl
        });

        await Promise.all(dropInPromises);

        reel.state = "IDLE";
        reel.snapToGrid(); // Failsafe to ensure exact mathematical alignment
    }

    public update(reel: Reel, delta: number): void {
        // Empty. GSAP handles the motion entirely.
    }
}