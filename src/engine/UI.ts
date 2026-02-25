import { Assets, Container, Sprite } from "pixi.js";
import { getPos, type GameConfig, type GameState } from "./types";

export class UI {
    private stage: Container
    private config: GameConfig
    private gameState: GameState
    private uiContainer: Container
    private handleSpinPress: () => Promise<void>
    constructor(gameState: GameState, handleSpinPress: () => Promise<void>) {
        this.stage = gameState.stage
        this.gameState = gameState
        this.config = this.gameState.config
        this.uiContainer = new Container()
        this.uiContainer.zIndex = 100
        this.stage.addChild(this.uiContainer)
        this.handleSpinPress = handleSpinPress
    }

    public setup() {
        this.setupSpinBtn()
    }

    private setupSpinBtn() {
        const conf = this.config.ui.spinButton
        if (!conf) {
            console.error("NO SPIN BUTTON")
            return
        }
        const texture = Assets.get(conf.asset.alias)
        const spinBtn = new Sprite(texture)
        const pos = getPos(conf.position, this.config)
        spinBtn.position.set(pos.x, pos.y)

        spinBtn.eventMode = "static";
        spinBtn.cursor = "pointer";
        spinBtn.on("pointertap", () => this.handleSpinPress());
        spinBtn.anchor.set(.5)
        spinBtn.scale.set(conf.asset.scale)

        this.stage.addChild(spinBtn);
    }


}