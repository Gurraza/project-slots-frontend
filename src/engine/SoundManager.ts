// src/engine/SFXManager.ts
import { sound } from '@pixi/sound';
import type { GameState } from './types';
// Add audio assets to config.ts (inside an assets array or appended to your existing loaders)

// Ensure these are pushed to the `toLoad` array in GameController.loadAssets()
export const SFX = {
    ReelSpin: 'sfx_reel_spin',
    ReelLand1: 'sfx_reel_land1',
    ReelLand2: 'sfx_reel_land2',
    ReelLand3: 'sfx_reel_land3',
    CoinFountain: 'sfx_coin_fountain',
    BonusMode: 'sfx_bonus_mode',
    Explosion: 'sfx_explosion',
    BackgroundTrack: "sfx_background_track",
    Laser: 'sfx_laser',
} as const;

export type SFX = typeof SFX[keyof typeof SFX];

export class SFXManager {
    private gameState: GameState;

    constructor(gameState: GameState) {
        this.gameState = gameState;
    }

    public play(effect: SFX, options?: { loop?: boolean; volume?: number; speed?: number }) {
        if (!this.gameState.sfxEnabled) return;

        // Prevent fatal crash if the sound asset is missing
        if (!sound.exists(effect)) {
            console.warn(`[SFX] Sound missing or not loaded: ${effect}`);
            return;
        }

        sound.play(effect, options);
    }

    public stop(effect: SFX) {
        if (!sound.exists(effect)) return;
        sound.stop(effect);
    }

    public stopAll() {
        sound.stopAll();
    }

    public toggle(forceState?: boolean): boolean {
        this.gameState.sfxEnabled = forceState ?? !this.gameState.sfxEnabled;

        if (!this.gameState.sfxEnabled) {
            this.stopAll();
        }

        return this.gameState.sfxEnabled;
    }

    public setVolume(volume: number) {
        sound.volumeAll = Math.max(0, Math.min(1, volume));
    }
}