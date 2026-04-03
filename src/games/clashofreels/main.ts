import { FeatureRegistry } from '../../engine/FeatureRegistry.ts';
import { GameWrapper } from '../../engine/GameWrapper.ts';
import config from './config.ts';
import { registerClashOfReelsAnimations } from './registerAnimations.ts';
import { SpinButtonFeature } from "../../engine/features/spinbutton.ts"
import { uiInit } from './ui.ts';

async function bootstrap() {
    const container = document.querySelector<HTMLDivElement>('#game-container');

    if (!container) {
        throw new Error("Game container not found. Check your index.html.");
    }
    await init()
    registerClashOfReelsAnimations()
    const engine = new GameWrapper(container, config);
    const game = await engine.init();
    uiInit(game.ui)
}

bootstrap();

async function init() {
    FeatureRegistry.register("SPIN_BUTTON_FEATURE", SpinButtonFeature)
    FeatureRegistry.register("BONUS_GAME", SpinButtonFeature)
}