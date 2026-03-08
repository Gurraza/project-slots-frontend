import { Container, Graphics, Text, TextStyle, Ticker } from "pixi.js";
import gsap from "gsap";
import type { GameController } from "../GameController";
import { Feature } from "./feature";
import { type TimelineEvent } from "../types";

type WinTier = "REGULAR" | "BIG" | "MEGA" | "EPIC";

interface Particle {
    sprite: Graphics;
    vx: number;
    vy: number;
    life: number;
}

export class TotalWinFeature extends Feature {
    private overlay: Container;
    private backdrop: Graphics;
    private winText: Text;
    private particleContainer: Container;

    private targetValue: number = 0;
    private currentTier: WinTier = "REGULAR";
    private betAmount: number = 1;

    private tallyTween: gsap.core.Tween | null = null;
    private particles: Particle[] = [];

    // PixiJS v8 Context assumption
    private get app() {
        return (this.game as any).app;
    }

    constructor(game: GameController) {
        super(game, "TOTAL_WIN", "GAME_OVER");
        this.overlay = new Container();
        this.overlay.visible = false;
        this.overlay.zIndex = 100

        // 1. Backdrop
        this.backdrop = new Graphics()
            .rect(0, 0, this.game.config.width, this.game.config.height)
            .fill({ color: 0x000000, alpha: 0.8 });

        this.backdrop.eventMode = 'static';
        this.backdrop.cursor = 'pointer';
        this.backdrop.on('pointerdown', this.skipPresentation.bind(this));

        // 2. Particle Container
        this.particleContainer = new Container();

        // 3. Text Display
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 72,
            fontWeight: 'bold',
            fill: 0xffd700,
            stroke: { color: 0x000000, width: 5 },
            dropShadow: { color: 0x000000, blur: 4, distance: 5 },
        });

        this.winText = new Text({ text: "0", style });
        this.winText.anchor.set(1);
        this.winText.x = window.innerWidth / 2;
        this.winText.y = window.innerHeight / 2;

        this.overlay.addChild(this.backdrop);
        this.overlay.addChild(this.particleContainer);
        this.overlay.addChild(this.winText);

        // Add to main stage (adjust based on your actual display list hierarchy)
        this.app.stage.addChild(this.overlay);

        // Bind particle loop
        this.app.ticker.add(this.updateParticles.bind(this));
    }

    async onEvent(event: TimelineEvent): Promise<void> {
        const totalWin = event.totalWin;
        this.betAmount = 1 //event.meta?.betAmount || event.betAmount || 1;

        if (!totalWin || totalWin <= 0) {
            return;
        }

        this.targetValue = totalWin;
        this.currentTier = "REGULAR";

        await this.startPresentation();
    }

    private startPresentation(): Promise<void> {
        return new Promise((resolve) => {
            this.overlay.visible = true;
            this.winText.text = "0";
            this.winText.scale.set(1);

            // Proxy object for GSAP to tween
            const tallyProxy = { value: 0 };

            this.tallyTween = gsap.to(tallyProxy, {
                value: this.targetValue,
                duration: 4,
                ease: "power3.out",
                onUpdate: () => {
                    this.winText.text = Math.floor(tallyProxy.value).toString();
                    this.checkTierEscalation(tallyProxy.value);
                },
                onComplete: () => {
                    this.finalizePresentation(resolve);
                }
            });
        });
    }

    private checkTierEscalation(currentValue: number): void {
        const multiplier = currentValue / this.betAmount;
        const newTier = this.getWinTier(multiplier);

        if (newTier !== this.currentTier) {
            this.currentTier = newTier;
            this.triggerEscalationEffects(newTier);
        }
    }

    private getWinTier(multiplier: number): WinTier {
        if (multiplier >= 100) return "EPIC";
        if (multiplier >= 50) return "MEGA";
        if (multiplier >= 20) return "BIG";
        return "REGULAR";
    }

    private triggerEscalationEffects(tier: WinTier): void {
        const intensities = { REGULAR: 0, BIG: 5, MEGA: 10, EPIC: 15 };
        const particleCounts = { REGULAR: 0, BIG: 50, MEGA: 100, EPIC: 200 };
        const scales = { REGULAR: 1, BIG: 1.2, MEGA: 1.5, EPIC: 2 };

        // 1. Screen Shake via GSAP
        if (intensities[tier] > 0) {
            gsap.fromTo(this.overlay,
                { x: -intensities[tier], y: -intensities[tier] },
                { x: 0, y: 0, duration: 0.1, yoyo: true, repeat: 5, ease: "sine.inOut" }
            );
        }

        // 2. Text Pop
        gsap.fromTo(this.winText.scale,
            { x: scales[tier] * 1.2, y: scales[tier] * 1.2 },
            { x: scales[tier], y: scales[tier], duration: 0.5, ease: "back.out(1.7)" }
        );

        // 3. Particles
        if (particleCounts[tier] > 0) {
            this.emitParticles(particleCounts[tier]);
        }

        // 4. Audio Hook
        // this.game.audio?.playSound(`tier_upgrade_${tier}`);
    }

    private emitParticles(count: number): void {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        for (let i = 0; i < count; i++) {
            const pGraphic = new Graphics()
                .circle(0, 0, 5 + Math.random() * 10)
                .fill({ color: Math.random() > 0.5 ? 0xffd700 : 0xffaa00 });

            pGraphic.x = centerX;
            pGraphic.y = centerY;

            const angle = Math.random() * Math.PI * 2;
            const velocity = 5 + Math.random() * 15;

            this.particleContainer.addChild(pGraphic);
            this.particles.push({
                sprite: pGraphic,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 10, // Initial upward burst
                life: 1.0
            });
        }
    }

    private updateParticles(ticker: Ticker): void {
        if (this.particles.length === 0) return;

        const gravity = 0.5; // Downward acceleration per frame
        const drag = 0.98;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.vx *= drag;
            p.vy += gravity;

            p.sprite.x += p.vx * ticker.deltaTime;
            p.sprite.y += p.vy * ticker.deltaTime;

            p.life -= 0.01 * ticker.deltaTime;
            p.sprite.alpha = p.life;

            if (p.life <= 0 || p.sprite.y > window.innerHeight + 50) {
                p.sprite.destroy();
                this.particles.splice(i, 1);
            }
        }
    }

    private skipPresentation(): void {
        if (!this.tallyTween?.isActive()) return;

        // Force tween to end
        this.tallyTween.progress(1);

        // Ensure final state and max effects trigger
        const finalTier = this.getWinTier(this.targetValue / this.betAmount);
        this.triggerEscalationEffects(finalTier);

        // this.game.audio?.playSound("slam_impact");
    }

    private finalizePresentation(resolve: () => void): void {
        // Hold state, then cleanup
        gsap.delayedCall(2, () => {
            gsap.to(this.overlay, {
                alpha: 0,
                duration: 0.5,
                onComplete: () => {
                    this.overlay.visible = false;
                    this.overlay.alpha = 1;

                    // Clear remaining particles
                    this.particles.forEach(p => p.sprite.destroy());
                    this.particles = [];

                    resolve();
                }
            });
        });
    }
}