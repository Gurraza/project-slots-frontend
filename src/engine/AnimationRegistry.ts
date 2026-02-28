import type { Container, Sprite } from "pixi.js";
import gsap from "gsap";

export type AnimationFactory =
    (target: Sprite, stage: Container, options?: any) => Promise<void>;

export class AnimationRegistry {
    constructor() {
        registerDefaultAnimations()
    }
    private static animations = new Map<string, AnimationFactory>();

    static register(key: string, factory: AnimationFactory) {
        this.animations.set(key, factory);
    }

    static get(key: string): AnimationFactory | undefined {
        return this.animations.get(key);
    }
}

function registerDefaultAnimations() {

    AnimationRegistry.register("bounce", (target) => {
        return new Promise(resolve => {
            gsap.timeline({ onComplete: resolve })
                .to(target, { y: target.y - 20, duration: 0.15, ease: "power2.out" })
                .to(target, { y: "+=20", duration: 0.15, ease: "power2.in" });
        });
    });

    AnimationRegistry.register("glow", (target) => {
        return new Promise(resolve => {
            gsap.to(target, {
                alpha: 0.6,
                duration: 0.2,
                yoyo: true,
                repeat: 3,
                onComplete: resolve
            });
        });
    });

    AnimationRegistry.register("fadeOut", (target) => {
        return new Promise(resolve => {
            gsap.to(target, {
                alpha: 0,
                duration: 0.3,
                onComplete: resolve
            });
        });
    });

    // 🔥 Fallback animation
    AnimationRegistry.register("none", async () => { });
}