import type { GameController } from "../GameController";
import type { Reel } from "../Reel";
import type { TimelineEvent } from "../types";
import { Feature } from "./feature";

interface ExplosionPoint {
    x: number;
    y: number;
    replacementId: number;
}

interface ClusterMeta {
    explosions: ExplosionPoint[];
}
export class ExplodeAndCascadeFeature extends Feature {
    constructor(game: GameController) {
        super(game, "EXPLODE_AND_CASCADE_FEATURE")
    }

    async onEvent(event: TimelineEvent): Promise<void> {
        const meta: ClusterMeta = event.meta
        const promises: Promise<void>[] = [new Promise(res => setTimeout(() => res(), 500))]

        this.game.reels.forEach((reel: Reel, index: number) => {
            const indices: number[] = []
            const replacements: number[] = []
            // Filter explosions belonging to the current reel
            meta.explosions.forEach((exp: ExplosionPoint) => {
                if (exp.x === index) {
                    indices.push(exp.y);
                    replacements.push(exp.replacementId);
                }
            });

            if (indices.length > 0) {
                promises.push(reel.explodeAndCascade(indices, replacements));
            }
        })
        await Promise.all(promises)
    }
}