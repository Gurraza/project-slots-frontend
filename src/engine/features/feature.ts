import type { GameController } from "../GameController"
import { type TimelineEvent } from "../types"

export class Feature {
    public id: string
    public eventType: string
    protected game: GameController
    constructor(game: GameController, id: string, eventType?: string) {
        this.game = game
        this.id = id
        this.eventType = eventType || id
    }

    async onEvent(event: TimelineEvent) {
        console.log(`Feature event of ${this.id} happened data: `, event)
    }

    init() {
        console.log(`Init on feature: ${this.id}`)
    }

    public onSpinStart() {

    }

    public onSpinEnd() {

    }
}
