import type { GameController } from "../GameController";
import type { Reel } from "../Reel";
import type { TimelineEvent } from "../types";
import { Feature } from "./feature";

export class FlameOutlineFeature extends Feature {
    constructor(game: GameController) {
        super(game, "FLAME_OUTLINE_FEATURE", "*")
    }

    async onEvent(event: TimelineEvent): Promise<void> {

    }
}