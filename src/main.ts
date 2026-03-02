import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #111; color: white; font-family: sans-serif;">
    
    <h1 style="font-size: 3rem; margin-bottom: 10px;">Game Lobby</h1>
    <p style="margin-bottom: 40px; color: #aaa;">Select an instance to initialize the engine</p>
    
    <div style="display: flex; gap: 20px;">
      <a href="/games/clashofreels/" 
         style="padding: 20px 40px; background: #2a2a2a; border: 1px solid #444; color: white; text-decoration: none; border-radius: 8px; font-size: 1.2rem; transition: background 0.2s;">
        Clash of Reels
      </a>

      <a href="/games/lines/" 
         style="padding: 20px 40px; background: #2a2a2a; border: 1px solid #444; color: white; text-decoration: none; border-radius: 8px; font-size: 1.2rem; transition: background 0.2s;">
        Lines Game
      </a>
    </div>

  </div>
`;