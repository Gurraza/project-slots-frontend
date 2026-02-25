import type { GameController } from "../GameController"
import { type TimelineEvent } from "../types"

export class Feature {
    public type: string
    protected game: GameController
    constructor(game: GameController, type: string) {
        this.game = game
        this.type = type
    }

    async onEvent(event: TimelineEvent) {
        console.log(`Feature event of ${this.type} happened data: `, event)
    }

    init() {
        console.log(`Init on feature: ${this.type}`)
    }
}
