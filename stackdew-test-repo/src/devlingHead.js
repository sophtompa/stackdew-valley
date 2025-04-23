export default class DevlingHead extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, devling) {
    super(scene, x, y, devling.name);

    //refs to which scene and what devling
    this.scene = scene;
    this.devling = devling;

    scene.add.existing(this);

    //checking if spritesheet has been loaded
    const spriteKey = devling.name;
    const spriteIMG = devling.sprite;

    if (!scene.textures.exists(spriteKey)) {
      scene.load.spritesheet(spriteKey, spriteIMG, {
        frameWidth: 64,
        frameHeight: 64,
        endFrame: 30,
      });

      //immediately idle
      scene.load.once("complete", () => {
        this.createAnimations();
        this.playAnimation("idle");
      });

      scene.load.start();
    } else {
      //if is loaded, immediately play animations & idle
      this.createAnimations();
      this.playAnimation("idle");
    }
  }

  //all curr animations
  createAnimations() {
    const name = this.devling.name;

    const animationsToCreate = [
      //talking
      { key: "idle", start: 0, end: 9 },
      //nodding head
      { key: "win", start: 10, end: 19 },
      //shacking head
      { key: "lose", start: 20, end: 29 },
    ];

    animationsToCreate.forEach((anim) => {
      const fullKey = `${name}-${anim.key}`;

      // Only create the animation if it doesn't already exist
      if (!this.scene.anims.exists(fullKey)) {
        this.scene.anims.create({
          key: fullKey,
          frames: this.scene.anims.generateFrameNumbers(name, {
            start: anim.start,
            end: anim.end,
          }),
          frameRate: 10,
          repeat: anim.key === "idle" ? -1 : 0, // Loop idle forever, others play once
        });
      }
    });
  }

  // This plays a given animation type (idle, win, or lose)
  playAnimation(type) {
    const animKey = `${this.devling.name}-${type}`;

    // Only play the animation if it's not already playing
    if (!this.anims.currentAnim || this.anims.currentAnim.key !== animKey) {
      this.play(animKey, true);
    }
  }
}
