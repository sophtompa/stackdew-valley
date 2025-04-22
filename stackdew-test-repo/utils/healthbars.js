export function createHealthBars(scene, x, y) {
    const healthBarSprite = scene.add
      .image(x, y, "healthFull")
      .setOrigin(0.5)
      .setScale(0.5);
  
    return healthBarSprite;
  }