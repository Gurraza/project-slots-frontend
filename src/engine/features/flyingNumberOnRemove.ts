import { Text } from "pixi.js";
import type { GameController } from "../GameController";
import { Feature } from "./feature";
import gsap from "gsap";
import { type Point, type TimelineEvent } from "../types";

export class FlyingNumberOnRemove extends Feature {
    constructor(game: GameController) {
        super(game, "FLYING_NUMBER_FEATURE", "EXPLODE_AND_CASCADE_FEATURE");
    }

    async onEvent(event: TimelineEvent): Promise<void> {
        const { explosions } = event.meta;
        await new Promise(r => setTimeout(r, 400));

        const targetX = this.game.config.width / 2;
        const targetY = this.game.config.height / 2 - this.game.config.symbolHeight! / 2;

        const centralText = new Text({
            text: "0.00kr",
            style: {
                fontSize: 48,
                fill: 0xffffff,
                fontFamily: 'Arial Black',
                fontWeight: 'bold',
                // stroke: { color: 0x000000, width: 4 },
                dropShadow: { color: 0x000000, blur: 10, distance: 3 }
            }
        });

        centralText.anchor.set(0.5);
        centralText.position.set(targetX, targetY);
        centralText.alpha = 0; // Remains 0 until first impact
        centralText.scale.set(1);
        this.game.stage.addChild(centralText);

        let currentTotal = this.game.gameState.win || 0;
        const valuePerParticle = event.win / explosions.length;

        const flightPromises = explosions.map((explosion: Point) => {
            return this.placeWin(explosion, valuePerParticle, centralText, () => {
                currentTotal += valuePerParticle;
                centralText.text = currentTotal.toFixed(2) + "kr";
                centralText.alpha = 1; // Becomes visible on impact

                gsap.killTweensOf(centralText.scale);
                gsap.fromTo(centralText.scale,
                    { x: 1.3, y: 1.3 },
                    { x: 1, y: 1, duration: 0.2, ease: "back.out(2)" }
                );
            });
        });

        await Promise.all(flightPromises);

        centralText.text = event.win.toFixed(2) + "kr";

        const finalTl = gsap.timeline({
            onComplete: () => centralText.destroy()
        });

        finalTl.to(centralText.scale, { x: 1.4, y: 1.4, duration: 0.3, ease: "power2.out" })
            .to(centralText.scale, { x: 1, y: 1, duration: 0.2, ease: "power2.in" })
            .to(centralText, { y: "-=100", alpha: 0, duration: 0.3, ease: "power2.in" }, "+=0.2");

        await finalTl;
        this.game.gameState.win = event.totalWin;
    }
    placeWin(point: Point, multiplier: number, centralText: Text, onImpact: () => void): Promise<void> {
        return new Promise((resolve) => {
            const text = new Text({
                text: multiplier.toFixed(2) + "kr",
                style: {
                    fontSize: 20,
                    fill: 0xffffff,
                    fontFamily: 'Arial Black',
                    fontWeight: 'bold',
                    stroke: { color: 0x000000, width: 2 },
                    dropShadow: { color: 0x000000, blur: 4, distance: 2 }
                }
            });
            this.game.gameState.win = multiplier

            const symbol = this.game.getSymbol(point.x, point.y);
            const pos = this.game.stage.toLocal(symbol.getGlobalPosition());

            const x = pos.x;
            const y = pos.y//(point.y + 2) * (this.game.config.symbolHeight! + this.game.config.gapY)
            text.position.set(x, y);
            text.anchor.set(0.5);
            text.scale.set(.7);
            text.alpha = 0;
            this.game.stage.addChild(text);

            const tl = gsap.timeline({
                onComplete: () => {
                    text.destroy();
                    onImpact();
                    resolve();
                }
            });

            tl.to(text, {
                alpha: 1,
                duration: .75,
                ease: "power1.in"
            });

            tl.to(text.scale, {
                x: 1,
                y: 1,
                duration: .75,
                ease: "power1.in"
            }, "<");

            tl.to(text.position, {
                x: centralText.position.x,
                y: centralText.position.y,
                duration: .75,
                ease: "power4.in"
            }, "<");
        });
    }
}