export default class DevlingHead extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, devling) {
    super(scene, x, y, devling.name);

    // Refs to which scene and what devling
    this.scene = scene;
    this.devling = devling;

    scene.add.existing(this);

    const spriteKey = devling.name;
    const spriteIMG = devling.sprite;

    // Load the spritesheet only once
    if (!scene.textures.exists(spriteKey)) {
      scene.load.spritesheet(spriteKey, spriteIMG, {
        frameWidth: 64,
        frameHeight: 64,
        endFrame: 30,
      });

      // Once the spritesheet is loaded, create animations and play
      scene.load.once("complete", () => {
        this.createAnimations();
        this.playAnimation("idle");
      });

      // Start loading the spritesheet
      scene.load.start();
    } else {
      // If spritesheet already loaded, directly create animations and play
      this.createAnimations();
      this.playAnimation("idle");
    }
  }

  createAnimations() {
    const name = this.devling.name;

    const animationsToCreate = [
      { key: "idle", start: 0, end: 3 },
      { key: "talk", start: 0, end: 9 },
      { key: "win", start: 10, end: 19 },
      { key: "lose", start: 20, end: 29 },
    ];

    animationsToCreate.forEach((anim) => {
      const fullKey = `${name}-${anim.key}`;

      // Ensure animation is created only if it doesn't already exist
      if (!this.scene.anims.exists(fullKey)) {
        const totalFrames = this.scene.textures.get(name).frameTotal;
        if (anim.end > totalFrames - 1) {
          console.error(`End frame (${anim.end}) exceeds total frames.`);
          return;
        }

        this.scene.anims.create({
          key: fullKey,
          frames: this.scene.anims.generateFrameNumbers(name, {
            start: anim.start,
            end: anim.end,
          }),
          frameRate: 10,
          repeat: 0,
        });
      }
    });
  }

  playAnimation(type) {
    const animKey = `${this.devling.name}-${type}`;

    // Only play if animation is not already playing
    if (!this.anims.currentAnim || this.anims.currentAnim.key !== animKey) {
      this.play(animKey, true);

      // Ensure animation resets after completion
      if (type) {
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          this.stop();
          this.setFrame(0);
        });
      }
    }
  }
}
