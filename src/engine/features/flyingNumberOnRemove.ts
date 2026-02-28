import { Sprite, Text, type Container, type ContainerChild } from "pixi.js";
import type { GameController } from "../GameController";
import { Feature } from "./feature";
import gsap from "gsap"
import { getPos, type Point, type TimelineEvent } from "../types";

export class FlyingNumberOnRemove extends Feature {
    constructor(game: GameController) {
        super(game, "FLYING_NUMBER_FEATURE", "EXPLODE_AND_CASCADE_FEATURE")
    }

    init(): void {
        super.init()
        console.log(this.eventType)
    }

    onEvent(event: TimelineEvent): Promise<void> {
        const { explosions } = event.meta
        explosions.forEach((explosion: Point) => {
            this.placeWin({ x: explosion.x, y: explosion.y }, event.win / explosions.length)
        })
        return new Promise(r => r())
    }

    placeWin(point: Point, multiplier: number) {
        const text = new Text({
            text: multiplier.toFixed(2),
            style: {
                fontSize: 24, // Start slightly larger
                fill: 0xffffff, // Yellow/Gold usually looks better for "wins" than pure red
                fontFamily: 'Arial Black',
                fontWeight: 'bold',
                stroke: { color: 0x000000, width: 4 },
                dropShadow: { color: 0x000000, blur: 4, distance: 2 }
            }
        });

        const symbol = this.game.getSymbol(point.x, point.y);
        const pos = this.game.stage.toLocal(symbol.getGlobalPosition());

        text.position.set(pos.x, pos.y);
        text.anchor.set(0.5);
        text.scale.set(0); // Start at 0 for a "pop" effect
        this.game.stage.addChild(text);

        const tl = gsap.timeline({
            onComplete: () => text.destroy()
        });

        // 1. The "Pop" In - Quick scale up with an overshoot (Back ease)
        tl.to(text.scale, {
            x: 1.2,
            y: 1.2,
            duration: 0.3,
            ease: "back.out(1.7)"
        });

        // 2. The Float & Fade - Move upward smoothly
        tl.to(text, {
            y: "-=80", // Move UP, not down
            duration: 0.8,
            ease: "power1.out"
        }, "-=0.1"); // Start slightly before pop finishes

        // 3. The Exit - Fade out at the very end
        tl.to(text, {
            alpha: 0,
            duration: 0.3,
        }, "-=0.3");
    }
}