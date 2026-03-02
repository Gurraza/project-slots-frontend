import type { ReelSymbol } from "./Reel";
import { AnimationRegistry } from "./AnimationRegistry";
import type { SymbolVisualState } from "./types";
import type { Container } from "pixi.js";

export class AnimationController {
    static async play(symbol: ReelSymbol, stage: Container, state: SymbolVisualState): Promise<void> {
        const def = symbol.getDefinition();

        const animationKey = def.animations?.[state] ?? this.getDefaultForState(state);
        AnimationRegistry.registerDefaultAnimations()
        // 2️⃣ Get factory from registry
        const factory = AnimationRegistry.get(animationKey) ?? AnimationRegistry.get("none");

        if (!factory) return;

        await factory(symbol.symbolSprite, stage);
    }

    private static getDefaultForState(state: SymbolVisualState): string {
        const defaults: Record<SymbolVisualState, string> = {
            idle: "none",
            land: "bounce",
            win: "glow",
            remove: "explode",
            highlight: "glow"
        };

        return defaults[state];
    }
}