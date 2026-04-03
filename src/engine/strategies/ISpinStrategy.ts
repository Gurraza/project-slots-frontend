// src/engine/strategies/ISpinStrategy.ts
import type { Reel } from "../Reel";

export interface ISpinStrategy {
    spin(reel: Reel): Promise<void>;
    commandStop(reel: Reel, stopSymbols: number[]): Promise<void>;
    update(reel: Reel, delta: number): void;
}