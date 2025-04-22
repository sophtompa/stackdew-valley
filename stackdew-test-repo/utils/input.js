export function inputControls(scene) {
    scene.input.keyboard.on("keydown-UP", () => {
      if (!scene.isRoundActive) scene.navigateStat(-1);
    });
  
    scene.input.keyboard.on("keydown-DOWN", () => {
      if (!scene.isRoundActive) scene.navigateStat(1);
    });
  
    scene.input.keyboard.on("keydown-ENTER", () => {
      if (!scene.isRoundActive) scene.compareStatValues();
    });
  }