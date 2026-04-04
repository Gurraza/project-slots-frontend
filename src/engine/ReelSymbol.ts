import { Assets, Container, Sprite } from "pixi.js"
import type { GameConfig, SymbolDef, SymbolVisualState } from "./types"
import { AnimationController } from "./AnimationController"

export class ReelSymbol extends Container {
    public symbolId: number = -1
    public symbolSprite: Sprite
    public symbolScale: number = 1
    private stage: Container
    private config: GameConfig
    public bgSprite: Sprite
    private overlays: Map<string, Sprite> = new Map()

    constructor(symbolId: number, config: GameConfig, stage: Container) {
        super()
        this.config = config
        this.stage = stage

        this.bgSprite = new Sprite()
        this.bgSprite.anchor.set(0.5)
        this.addChild(this.bgSprite)

        this.symbolSprite = new Sprite()
        this.symbolSprite.anchor.set(0.5)
        this.addChild(this.symbolSprite)

        this.x = this.config.symbolWidth! / 2

        this.changeSymbolState(symbolId)
    }

    public changeSymbolState(newStateId: number) {
        const s: SymbolDef | undefined = this.config.symbols.find(s => s.id == newStateId);
        if (!s) throw new Error(`Bad id in changeSymbolState, tried: ${newStateId}`);

        this.symbolId = s.id;

        // Update textures independently
        this.symbolSprite.texture = Assets.get(s.asset.alias);

        // Assuming your SymbolDef has background logic. 
        // If not, add a bgAlias to the definition or assign programmatically.
        if (this.config.symbolBg && this.config.symbolBg.alias) {
            this.bgSprite.texture = Assets.get(this.config.symbolBg.alias);
            this.bgSprite.visible = true;
        } else {
            this.bgSprite.visible = false;
        }

        // Handle scaling on the container or individual sprites as needed
        this.scale.set(1);
        const ratioX = this.config.symbolWidth! / this.symbolSprite.texture.width;
        const ratioY = this.config.symbolHeight! / this.symbolSprite.texture.height;
        const baseScale = Math.min(ratioX, ratioY);
        const finalScale = baseScale * s.scale;
        this.symbolScale = finalScale
        // Apply scale to the symbol sprite, allowing the background to scale differently if needed
        this.symbolSprite.scale.set(finalScale);

        // Example: Make background fill the slot area
        this.bgSprite.setSize(this.config.symbolWidth!, this.config.symbolHeight!)
    }

    public getDefinition(): SymbolDef {
        const def = this.config.symbols.find(s => s.id === this.symbolId);
        if (!def) throw new Error("Missing symbol definition");
        return def;
    }

    public async play(state: SymbolVisualState) {
        await AnimationController.play(this, this.stage, state);
    }

    public addSprite(alias: string, zIndex: number): Sprite {
        if (this.overlays.has(alias)) {
            return this.overlays.get(alias)!; // Prevent duplicates
        }

        const texture = Assets.get(alias);
        if (!texture) {
            throw new Error(`Asset ${alias} not found. Ensure it is loaded before adding.`);
        }

        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5); // Match the anchor of your other sprites
        sprite.zIndex = zIndex
        this.overlays.set(alias, sprite);
        this.addChild(sprite);

        return sprite;
    }

    // Synchronous removal.
    public removeSprite(alias: string): void {
        const sprite = this.overlays.get(alias);
        if (sprite) {
            this.removeChild(sprite);
            sprite.destroy(); // Free GPU memory
            this.overlays.delete(alias);
        }
    }

    // Utility to clean up all effects (useful during reel spins or state resets)
    public clearEffects(): void {
        this.overlays.forEach((sprite) => {
            this.removeChild(sprite);
            sprite.destroy();
        });
        this.overlays.clear();
    }
}