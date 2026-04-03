import { Container, Graphics, Text, TextStyle } from "pixi.js";
import gsap from "gsap";
import type { GameController } from "../GameController";
import { Feature } from "./feature";
import { type TimelineEvent } from "../types";

export class BonusGameBeginFeature extends Feature {
    private overlay: Container;
    private backdrop: Graphics;
    private titleText: Text;
    private promptText: Text;
    private resolveSpin: (() => void) | null = null;

    private get app() {
        return (this.game as any).app;
    }

    constructor(game: GameController) {
        super(game, "BONUS_GAME_BEGIN");

        this.overlay = new Container();
        this.overlay.visible = false;
        this.overlay.zIndex = 100;

        const width = this.game.config.width;
        const height = this.game.config.height;

        this.backdrop = new Graphics()
            .rect(0, 0, width, height)
            .fill({ color: 0x000000, alpha: 0.85 });

        this.backdrop.eventMode = 'static';
        this.backdrop.cursor = 'pointer';
        this.backdrop.on('pointerdown', this.handleProceed.bind(this));

        const titleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 80,
            fontWeight: 'bold',
            fill: "white",//['#ffaa00', '#ffd700'],
            stroke: { color: 0x000000, width: 6 },
            dropShadow: { color: 0x000000, blur: 5, distance: 5 },
            align: 'center'
        });

        this.titleText = new Text({ text: "FREE SPINS\nSTARTED", style: titleStyle });
        this.titleText.anchor.set(0.5);
        this.titleText.x = width / 2;
        this.titleText.y = height / 2 - 50;

        const promptStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: 0xffffff,
        });

        this.promptText = new Text({ text: "CLICK TO START", style: promptStyle });
        this.promptText.anchor.set(0.5);
        this.promptText.x = width / 2;
        this.promptText.y = height / 2 + 80;

        this.overlay.addChild(this.backdrop);
        this.overlay.addChild(this.titleText);
        this.overlay.addChild(this.promptText);

        this.app.stage.addChild(this.overlay);
    }

    async onEvent(event: TimelineEvent): Promise<void> {
        return new Promise((resolve) => {
            this.resolveSpin = resolve;
            this.startPresentation();
        });
    }

    private startPresentation(): void {
        this.overlay.visible = true;
        this.overlay.alpha = 1;
        this.backdrop.eventMode = 'static';

        this.titleText.scale.set(0);
        this.promptText.alpha = 0;

        const tl = gsap.timeline();

        tl.to(this.titleText.scale, {
            x: 1,
            y: 1,
            duration: 0.6,
            ease: "back.out(1.5)"
        });

        tl.to(this.promptText, {
            alpha: 1,
            duration: 0.4
        }, "-=0.2");

        gsap.to(this.promptText.scale, {
            x: 1.05,
            y: 1.05,
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            id: "promptPulseBegin"
        });
    }

    private handleProceed(): void {
        if (!this.resolveSpin) return;

        this.backdrop.eventMode = 'none';
        gsap.killTweensOf(this.promptText.scale);

        gsap.to(this.overlay, {
            alpha: 0,
            duration: 0.4,
            onComplete: () => {
                this.overlay.visible = false;
                if (this.resolveSpin) {
                    this.resolveSpin();
                    this.resolveSpin = null;
                }
            }
        });
    }
}