import { FeatureRegistry } from '../../engine/FeatureRegistry.ts';
import { GameWrapper } from '../../engine/GameWrapper.ts';
import config from './config.ts';
import { registerAnimations } from './registerAnimations.ts';
import { SpinButtonFeature } from "../../engine/features/spinbutton.ts"

async function bootstrap() {
    const container = document.querySelector<HTMLDivElement>('#game-container');

    if (!container) {
        throw new Error("Game container not found. Check your index.html.");
    }
    await init()
    registerAnimations()
    const engine = new GameWrapper(container, config);
    await engine.init();
}

bootstrap();

async function init() {
    FeatureRegistry.register("SPIN_BUTTON_FEATURE", SpinButtonFeature)
}