import { Graphics } from "pixi.js";
import gsap from "gsap";
import type { GameController } from "../GameController";
import type { Point, TimelineEvent } from "../types";
import { Feature } from "./feature";
import { SFX } from "../SoundManager";

interface TributeHarvestMeta {
    resourcesToSuck: Point[],
    source: Point
}

export class TributeHarvestFeature extends Feature {
    constructor(game: GameController) {
        super(game, "TRIBUTE_HARVEST");
    }

    async onEvent(event: TimelineEvent): Promise<void> {
        const meta: TributeHarvestMeta = event.meta;
        const config = this.game.config; // Assuming config is accessible here

        const sourceX = meta.source.x * config.symbolWidth! + config.symbolWidth! / 2;
        const sourceY = meta.source.y * config.symbolHeight! + config.symbolHeight! / 2;

        await this.game.getSymbol(meta.source.x, meta.source.y).play("land")
        this.game.sfx.play(SFX.Laser)
        const promises = meta.resourcesToSuck.map(r => {
            const startX = r.x * config.symbolWidth! + config.symbolWidth! / 2;
            const startY = r.y * config.symbolHeight! + config.symbolHeight! / 2;

            return this.createBeam(sourceX, sourceY, startX, startY);
        });

        await Promise.all(promises);

        // const ps: Promise<void>[] = meta.resourcesToSuck.map(r => this.game.getSymbol(r.x, r.y).play("highlight"))
        // await Promise.all(ps)
    }

    private createBeam(x1: number, y1: number, x2: number, y2: number): Promise<void> {
        const beam = new Graphics();
        this.game.gameContainer.addChild(beam); // Or relevant container

        const animationData = { progress: 0 };

        return new Promise((resolve) => {
            gsap.to(animationData, {
                progress: 1,
                duration: 0.6,
                ease: "power2.out",
                onUpdate: () => {
                    const currentX = x1 + (x2 - x1) * animationData.progress;
                    const currentY = y1 + (y2 - y1) * animationData.progress;

                    beam.clear();

                    // Outer Glow
                    beam.context
                        .setStrokeStyle({ width: 8, color: 0x00ffff, alpha: 0.3, cap: 'round' })
                        .moveTo(x1, y1)
                        .lineTo(currentX, currentY)
                        .stroke();

                    // Core Beam
                    beam.context
                        .setStrokeStyle({ width: 2, color: 0xffffff, alpha: 1, cap: 'round' })
                        .moveTo(x1, y1)
                        .lineTo(currentX, currentY)
                        .stroke();
                },
                onComplete: () => {
                    // Fade out and cleanup
                    gsap.to(beam, {
                        alpha: 0,
                        duration: 0.3,
                        onComplete: () => {
                            beam.destroy();
                            resolve();
                        }
                    });
                }
            });
        });
    }
}