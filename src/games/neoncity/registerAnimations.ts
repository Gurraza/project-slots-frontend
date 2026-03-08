import { AnimationRegistry } from "../../engine/AnimationRegistry"
import gsap from "gsap";
import { playAnimation } from "../../engine/Animations";
import type { Container, Sprite } from "pixi.js";

export function registerAnimations() {

    AnimationRegistry.register("glowGold", (target) => {
        return new Promise(resolve => {
            gsap.to(target, {
                scale: target.scale.x * 1.2,
                duration: 0.2,
                yoyo: true,
                repeat: 3,
                onComplete: resolve
            });
        });
    });

    AnimationRegistry.register("explode", async (target: Sprite, stage: Container) => {
        if (!target || !target.parent) return
        const global = target.parent.toGlobal(target.position);

        await playAnimation(
            0.4,
            stage,
            "/games/clashofreels/animations/explosion.json",
            { x: global.x, y: global.y }
        );
    });

    AnimationRegistry.register("fire_highlight", async (target: Sprite, stage: Container) => {
        // if (!target || !target.parent) return
        // const global = target.parent.toGlobal(target.position);

        // await playAnimation(
        //     0.4,
        //     stage,
        //     "/games/clashofreels/animations/explosion.json",
        //     { x: global.x, y: global.y }
        // );
        return new Promise(resolve => {
            gsap.to(target, {
                alpha: 0.6,
                duration: 0.1,
                yoyo: true,
                repeat: 3,
                onComplete: resolve
            });
        });
    });
}