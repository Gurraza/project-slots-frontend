import './style.css';
import { Application } from 'pixi.js';
import { GameController } from './engine/GameController';

// Importera dina spel-configs
import clashConfig from './games/clashofreels/config';
import linesConfig from './games/lines/config';
import neonConfig from './games/neoncity/config';

const appElement = document.querySelector<HTMLDivElement>('#app')!;

// Kolla om vi redan har en parameter i URL:en (t.ex. ?game=clashofreels)
const params = new URLSearchParams(window.location.search);
const selectedGame = params.get('game');

if (selectedGame) {
  // Rensa lobbyn och starta spelet
  appElement.innerHTML = '';

  const app = new Application();
  // Här väljer vi config baserat på URL
  let config = clashConfig;
  if (selectedGame === 'lines') config = linesConfig;
  if (selectedGame === 'neoncity') config = neonConfig;

  const game = new GameController(app, config);
  // Kör initiering
  app.init({ width: config.width, height: config.height }).then(() => {
    document.body.appendChild(app.canvas);
    game.boot();
  });

} else {
  // Visa lobbyn om inget spel är valt
  appElement.innerHTML = `
      <div class="lobby">
        <h1>Game Lobby</h1>
        <div class="buttons">
          <a href="?game=clashofreels">Clash of Reels</a>
          <a href="?game=lines">Lines Game</a>
          <a href="?game=neoncity">Neon City</a>
        </div>
      </div>
    `;
}