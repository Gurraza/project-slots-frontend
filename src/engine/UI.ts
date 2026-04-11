import { Assets, Container, Sprite, Texture } from "pixi.js";
import { getPos, type Asset, type GameConfig, type GameState, type Position, type UIElement } from "./types";

export class UI {
    private stage: Container
    public config: GameConfig
    private gameState: GameState
    private uiContainer: Container
    public handleSpinPress: () => Promise<void>

    private uiElements: Container[] = []

    constructor(gameState: GameState, handleSpinPress: () => Promise<void>) {
        this.stage = gameState.stage
        this.gameState = gameState
        this.config = this.gameState.config
        this.uiContainer = new Container()
        this.uiContainer.zIndex = 100
        this.stage.addChild(this.uiContainer)
        this.handleSpinPress = handleSpinPress
    }
    async PlaceAsset(config: {
        asset: Asset,
        position: Position,
        fullscreen?: boolean,
        action?: any,
        zIndex?: number,
        anchor?: number | { x: number, y: number },
        width?: number,
        height?: number,
        scale?: number,
        muted?: boolean,
    }): Promise<Sprite> {
        const { asset, fullscreen, action, position, zIndex, width, height, scale, anchor, muted = true } = config

        const texture: Texture = await Assets.load(asset)
        const sprite = new Sprite(texture)
        if (action) {
            sprite.eventMode = "static"
            sprite.cursor = "pointer"
            sprite.on("pointerdown", (event) => action(event))
        }
        if (asset.src.includes(".mp4")) {
            const videoSource = texture.source.resource as HTMLVideoElement
            videoSource.muted = muted
            videoSource.loop = true
            videoSource.play().catch(err => {
                console.warn("Video autoplay failed. User interaction may be required.", err)
            });
        }
        if (fullscreen) {
            const scaleX = this.config.width / sprite.texture.width;
            const scaleY = this.config.height / sprite.texture.height;
            sprite.scale.set(Math.max(scaleX, scaleY))
        }
        const pos = getPos(position, this.config)
        // console.log("position", position, "pos", pos)
        sprite.position.set(pos.x, pos.y)
        this.stage.addChild(sprite)
        sprite.zIndex = zIndex || 0
        sprite.anchor = anchor || 0
        if (width && height) {
            sprite.setSize(width, height)
        }
        else if (scale) {
            sprite.scale.set(scale)
        }
        return sprite
    }

    // New generic element placement function
    public PlaceElement<T extends Container>(
        element: T,
        config: {
            position: Position,
            fullscreen?: boolean,
            action?: any,
            zIndex?: number,
            anchor?: number | { x: number, y: number },
            width?: number,
            height?: number,
            scale?: number
        }
    ): T {
        const { position, fullscreen, action, zIndex, width, height, scale, anchor } = config;

        if (action) {
            element.onclick = (event) => action(event);
            element.eventMode = "static";
            element.cursor = "pointer";
        }

        if (fullscreen && element.width > 0 && element.height > 0) {
            const scaleX = this.config.width / element.width;
            const scaleY = this.config.height / element.height;
            element.scale.set(Math.max(scaleX, scaleY));
        }

        const pos = getPos(position, this.config);
        element.position.set(pos.x, pos.y);

        this.stage.addChild(element);

        element.zIndex = zIndex || 0;

        // Anchor only exists on Sprites and Text, not base Containers or Graphics
        if (anchor !== undefined && 'anchor' in element) {
            (element as any).anchor = anchor;
        }

        if (width !== undefined && height !== undefined) {
            element.width = width;
            element.height = height;
        } else if (scale !== undefined) {
            element.scale.set(scale);
        }

        return element;
    }
}