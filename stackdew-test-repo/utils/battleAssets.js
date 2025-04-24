export function preloadBattleAssets(scene, database, enemyDatabase) {
    //background img & audio
    scene.load.image("background", "../assets/battleroof.png");
    scene.load.audio("backgroundMusic", "../assets/sounds/backgroundMusic.wav");
  
    //beginning sequence audio
    scene.load.image("vsImage", "../assets/vsimg.png");
    scene.load.audio("vsSound", "../assets/sounds/vssound.mp3");
  
    //round counter audio & imgs
    scene.load.audio("roundOne", "../assets/sounds/roundOne.mp3");
    scene.load.image("roundOneImg", "../assets/roundOneImg.png");
    scene.load.audio("roundTwo", "../assets/sounds/roundtwo.mp3");
    scene.load.audio("finalRound", "../assets/sounds/finalRound.mp3");

  //card images
    scene.load.image("playerCard", "../assets/dummyCard.png");
    scene.load.image("enemyCard", "../assets/cardDesign.png");
    scene.load.image("front", "../assets/cardFront.png");
    scene.load.image("back", "../assets/cardBack.png");
    scene.load.image("enemyfront", "../assets/enemyCardFront.png");
    scene.load.image("enemyback", "../assets/enemycardBack.png");
    scene.load.image("QuestionMarks", "../assets/questionMarks.png");
  
    //stat navigation audio, etc
    scene.load.audio("nav", "../assets/sounds/keypad.mp3");
    scene.load.audio("select", "../assets/sounds/select1.mp3");
    scene.load.audio("error", "../assets/sounds/keypadReject.mp3");
    scene.load.audio("swish", "../assets/sounds/cardFlipSound.mp3");
  
    //healthbar images
    scene.load.image("healthFull", "../assets/health_full.png");
    scene.load.image("healthMid", "../assets/health_mid.png");
    scene.load.image("healthLow", "../assets/health_low.png");
  
    //dummy standing lecterur sprites
    scene.load.image("playerDevling", "../assets/heads/standingSprite.png");
    scene.load.image("enemyDevling", "../assets/heads/standingSprite.png");
  
    //player devling database,
    database.forEach((devling) => {
      if (!devling.sprite  !devling.nameSound) return;
      // scene.load.atlas(devling.name, devling.sprite);
      scene.load.audio(${devling.name}Sound, devling.nameSound);
    });
  
    enemyDatabase.forEach((devling) => {
      if (!devling.sprite  !devling.nameSound) return;
      scene.load.atlas(devling.name, devling.sprite);
      scene.load.audio(${devling.name}Sound, devling.nameSound);
    });
  }