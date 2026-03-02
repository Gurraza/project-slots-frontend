import { GameWrapper } from '../../engine/GameWrapper.ts';
import config from './config.ts';
import { registerClashOfReelsAnimations } from './registerAnimations.ts';

async function bootstrap() {
    const container = document.querySelector<HTMLDivElement>('#game-container');

    if (!container) {
        throw new Error("Game container not found. Check your index.html.");
    }
    registerClashOfReelsAnimations()
    const engine = new GameWrapper(container, config);
    await engine.init();
}

bootstrap();