import type { Container } from "pixi.js";
import type { GameController } from "../../../engine/GameController";
import { Feature } from "../../../engine/features/feature"
import gsap from "gsap"
import type { TimelineEvent } from "../../../engine/types";

export class WheelFeature extends Feature {
    private sprite: Container | null = null
    private isSpinning: boolean = false;
    private speed: number = 0
    constructor(game: GameController) {
        super(game, "WHEEL")
    }

    init(): void {
        super.init()
        // this.game.ui.PlaceAsset("/games/neoncity/ui/wheel.png", { right: 172, top: this.game.config.height / 2 - 27 }).then((sprite: Container) => {
        //     sprite.zIndex = 5
        //     this.sprite = sprite
        //     sprite.scale = .70
        // })
    }

    async onEvent(event: TimelineEvent): Promise<void> {

    }
}