import type { GameController } from "../GameController";
import type { Point, TimelineEvent } from "../types";
import { Feature } from "./feature";
import gsap from "gsap"

export class TransformFeature extends Feature {
    private replaceTime: number = .2
    private sequential: boolean = false
    constructor(game: GameController) {
        super(game, "TRANSFORM_FEATURE")
    }

    async onEvent(event: TimelineEvent): Promise<void> {
        const meta: { positions: Point[], newId: number } = event.meta;
        // Map each position to a function that returns a Promise-wrapped timeline
        const tasks = meta.positions.map(pos => () => {
            return new Promise<void>((resolve) => {
                const symbolContainer = this.game.getSymbol(pos.x, pos.y);
                let targetScale = 1

                const tl = gsap.timeline({ onComplete: resolve });

                tl.to(symbolContainer.symbolSprite.scale, {
                    x: 0,
                    y: 0,
                    duration: this.replaceTime,
                    ease: "back.in(2)"
                });

                tl.call(() => {
                    symbolContainer.changeSymbolState(meta.newId);
                    targetScale = symbolContainer.symbolSprite.scale.x;
                    symbolContainer.symbolSprite.scale.set(0);
                });

                tl.to(symbolContainer.symbolSprite.scale, {
                    x: () => targetScale,
                    y: () => targetScale,
                    onComplete: () => {
                        symbolContainer.symbolScale = targetScale
                    },
                    duration: 0.35,
                    ease: "back.out(2)"
                });
            });
        });

        if (this.sequential) {
            for (const task of tasks) {
                await task();
            }
        } else {
            await Promise.all(tasks.map(task => task()));
        }
    }
}