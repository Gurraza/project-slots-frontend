import type { GameController } from "../GameController";
import { Feature } from "./feature";

export class ClusterFeature extends Feature {
    constructor(game: GameController) {
        super(game, "CLUSTER_FEATURE")
    }
}