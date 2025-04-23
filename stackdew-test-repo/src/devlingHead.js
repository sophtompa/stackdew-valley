export default class DevlingHead extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, devling) {
    super(scene, x, y, devling.name);

    //refs to which scene and what devling
    this.scene = scene;
    this.devling = devling;

    scene.add.existing(this);

    const spriteKey = devling.name;
    const spriteIMG = devling.sprite;

    if (!scene.textures.exists(spriteKey)) {
      scene.load.spritesheet(spriteKey, spriteIMG, {
        frameWidth: 64,
        frameHeight: 64,
        endFrame: 30,
      });

      scene.load.once("complete", () => {
        this.createAnimations();
        this.playAnimation("idle");
      });

      scene.load.start();
    } else {
      this.createAnimations();
      this.playAnimation("idle");

      this.scene.time.addEvent({
        delay: 10000,
        loop: true,
        callback: () => {
          this.playAnimation("idle");
        },
      });
    }
  }

  //curr animations
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

      if (!this.scene.anims.exists(fullKey)) {
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

    if (!this.anims.currentAnim || this.anims.currentAnim.key !== animKey) {
      this.play(animKey, true);

      if (type) {
        this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          this.stop();
          this.setFrame(0);
        });
      }
    }
  }
}
