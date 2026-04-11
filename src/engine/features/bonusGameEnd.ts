import { Container, Graphics, Text, TextStyle } from "pixi.js";
import gsap from "gsap";
import type { GameController } from "../GameController";
import { Feature } from "./feature";
import { type TimelineEvent } from "../types";

export class BonusGameEndFeature extends Feature {
    private overlay: Container;
    private backdrop: Graphics;
    private titleText: Text;
    private winText: Text;
    private promptText: Text;
    private resolveSpin: (() => void) | null = null;

    private get app() {
        return (this.game as any).app;
    }

    constructor(game: GameController) {
        super(game, "BONUS_GAME_END");

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
            fontSize: 60,
            fontWeight: 'bold',
            fill: 0xffffff,
            align: 'center'
        });

        this.titleText = new Text({ text: "FREE SPINS COMPLETE", style: titleStyle });
        this.titleText.anchor.set(0.5);
        this.titleText.x = width / 2;
        this.titleText.y = height / 2 - 100;

        const winStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 90,
            fontWeight: 'bold',
            fill: "white",//['#ffaa00', '#ffd700'],
            stroke: { color: 0x000000, width: 6 },
            dropShadow: { color: 0x000000, blur: 5, distance: 5 },
            align: 'center'
        });

        this.winText = new Text({ text: "0", style: winStyle });
        this.winText.anchor.set(0.5);
        this.winText.x = width / 2;
        this.winText.y = height / 2;

        const promptStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fontWeight: 'bold',
            fill: 0xffffff,
        });

        this.promptText = new Text({ text: "CLICK TO CONTINUE", style: promptStyle });
        this.promptText.anchor.set(0.5);
        this.promptText.x = width / 2;
        this.promptText.y = height / 2 + 100;

        this.overlay.addChild(this.backdrop);
        this.overlay.addChild(this.titleText);
        this.overlay.addChild(this.winText);
        this.overlay.addChild(this.promptText);

        this.app.stage.addChild(this.overlay);
    }

    async onEvent(event: TimelineEvent): Promise<void> {
        const totalWin = event.totalWin || 0;
        this.winText.text = totalWin > 0 ? `${totalWin.toFixed(2)} KR` : "NO WIN";

        return new Promise((resolve) => {
            this.resolveSpin = resolve;
            this.startPresentation();
        });
    }

    private startPresentation(): void {
        this.overlay.visible = true;
        this.overlay.alpha = 1;
        this.backdrop.eventMode = 'static';

        this.titleText.alpha = 0;
        this.winText.scale.set(0);
        this.promptText.alpha = 0;

        const tl = gsap.timeline();

        tl.to(this.titleText, { alpha: 1, duration: 0.4 });

        tl.to(this.winText.scale, {
            x: 1,
            y: 1,
            duration: 0.6,
            ease: "back.out(1.5)"
        }, "-=0.2");

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
            id: "promptPulseEnd"
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