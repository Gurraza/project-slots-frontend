import { GameWrapper } from '../../engine/GameWrapper.ts';
import config from './config.ts';

async function bootstrap() {
    const container = document.querySelector<HTMLDivElement>('#game-container');

    if (!container) {
        throw new Error("Game container not found. Check your index.html.");
    }

    const engine = new GameWrapper(container, config);
    await engine.init();
}

bootstrap();