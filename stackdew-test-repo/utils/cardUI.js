export function devilingCardDesign(scene, playerDevling, enemyDevling) {
    scene.cardTextStyle = function () {
      return {
        fontSize: "12px",
        fontFamily: '"Press Start 2P"',
        fill: "black",
      };
    };
  
    scene.cardStatStyle = function () {
      return {
        fontSize: "25px",
        fontFamily: '"Press Start 2P"',
        fill: "black",
      };
    };
  
    scene.statTextStyle = function (color) {
      return {
        fontSize: "10px",
        fontFamily: '"Press Start 2P"',
        fill: color,
      };
    };
  
    const centerX = scene.cameras.main.centerX;
    const centerY = scene.cameras.main.centerY;
  
    scene.add.image(centerX - 200, centerY + 50, "front").setScale(0.8);
  
    const playerCardName = scene.add
      .text(
        centerX - 200,
        centerY + 55,
        playerDevling.name.toUpperCase(),
        scene.cardTextStyle()
      )
      .setOrigin(0.5);
  
    const enemyCard = scene.add
      .image(centerX + 200, centerY + 50, "enemyfront")
      .setScale(0.8)
      .setOrigin(0.5);
  
    const enemyCardName = scene.add
      .text(
        centerX + 200,
        centerY + 55,
        enemyDevling.name.toUpperCase(),
        scene.cardTextStyle()
      )
      .setOrigin(0.5);
  
    const questionMarks = scene.add
      .image(centerX + 205, centerY + 120, "QuestionMarks")
      .setOrigin(0.5)
      .setScale(0.7);
  
    const enemyCardStat = scene.add
      .text(centerX + 200, centerY + 100, "", scene.cardStatStyle())
      .setOrigin(0.5)
      .setAlpha(0);
  
    return {
      playerCardName,
      enemyCard,
      enemyCardName,
      questionMarks,
      enemyCardStat,
    };
  }

  export function playerStatDesign(scene, playerDevling, centerX, centerY) {
    const statKeys = Object.keys(playerDevling).filter(
      (key) => typeof playerDevling[key] === "number"
    );
  
    const statTextList = [];
    let currentStatIndex = 0;
    let statY = centerY;
  
    statKeys.forEach((stat, i) => {
      // NAME COLUMN
      const nameText = scene.add.text(centerX / 2.2, statY, stat.toUpperCase(), {
        fontSize: "10px",
        fontFamily: '"Press Start 2P"',
        fill: i === currentStatIndex ? "green" : "black",
      });
  
      // LVL COLUMN
      const lvlText = scene.add.text(
        centerX / 1.6,
        statY,
           LVL${playerDevling[stat]},
        {
          fontSize: "10px",
          fontFamily: '"Press Start 2P"',
          fill: i === currentStatIndex ? "green" : "black",
        }
      );
  
      statTextList.push({ name: nameText, lvl: lvlText });
      statY += 20;
    });
  
    return {
      statTextList,
      statKeys,
      currentStatIndex,
    };
  }