import Phaser from 'phaser';
import Player from '../src/player.js';
import { database, userInventory } from '../src/dummydata.js';

export default class farmScene extends Phaser.Scene {
	constructor() {
		super('farmScene');
	}

	preload() {
		this.load.tilemapTiledJSON('theFarmMap', '../assets/chrisfarm.json');
		//this.load.image('theFarmMap', '../assets/chrisfarm.png');
		this.load.image('1_Terrains_32x32', '../assets/1_Terrains_32x32.png');
		this.load.image('2_Fences_32x32', '../assets/2_Fences_32x32.png');
		this.load.image(
			'3_Props_and_Buildings_32x32',
			'../assets/3_Props_and_Buildings_32x32.png'
		);
		this.load.image('6_Trees_32x32', '../assets/6_Trees_32x32.png');
		this.load.spritesheet('playerSheet', 'assets/farmer.png', {
			frameWidth: 64,
			frameHeight: 64,
		});
		this.load.spritesheet('devlingImage', '../assets/devlingSpritesheet.png', {
			frameWidth: 64,
			frameHeight: 64,
		});

		//sound effects
		this.load.audio('plantingSound', '../assets/planting.wav');
		this.load.audio('wateringSound', '../assets/watering.wav');
		this.load.audio('harvestingSound', '../assets/harvest.wav');
		this.load.audio('birdsSound', '../assets/birds.wav');
	}

	create() {
		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		//create audio
		this.plantingSound = this.sound.add('plantingSound');
		this.wateringSound = this.sound.add('wateringSound');
		this.harvestingSound = this.sound.add('harvestingSound');
		this.birdSound = this.sound.add('birdsSound');

		// FRONT DOOR to firstFloor
		this.frontDoorTrigger = this.physics.add.sprite(273, 260, null);
		this.frontDoorTrigger.setSize(45, 80);
		this.frontDoorTrigger.setVisible(false);
		this.frontDoorTriggered = false;

		// PATH to overWorldMap
		this.toOverworldTrigger = this.physics.add.sprite(750, 365, null);
		this.toOverworldTrigger.setSize(100, 110);
		this.toOverworldTrigger.setVisible(false);
		this.toOverworldTriggered = false;

		//create hidden trigger for planting devling
		this.plantTrigger = this.physics.add.sprite(560, 235, null);
		this.plantTrigger.setSize(100, 75);
		this.plantTrigger.setVisible(false);
		this.plantTriggered = false;

		//create hidden trigger for watering devling
		// this.waterTrigger = this.physics.add.sprite(272, 400, null);
		// this.waterTrigger.setSize(42, 42);
		// this.waterTrigger.setVisible(false);
		// this.waterTriggered = false;

		//create devling sprite images
		this.devlingSprites = {};
		this.plantedDevlingSprites = {};

		this.renderInventory = () => {
			for (const name in this.devlingSprites) {
				if (this.devlingSprites[name]) {
					this.devlingSprites[name].destroy();
				}
			}
			this.devlingSprites = {};

			let x = 50;
			const y = 50;

			userInventory.forEach((devling, index) => {
				// Only show devlings that are not planted OR are fully grown
				if (!devling.isPlanted || devling.isGrown) {
					const sprite = this.add.sprite(x, y, 'devlingImage');
					sprite.setInteractive();
					sprite.setVisible(true);
					this.devlingSprites[devling.name] = sprite;
					x += 40;
					// if (devling.isPlanted) {
					// 	let plantedSprite = this.add.sprite(x, y + 50, 'devlingImage');
					// 	sprite.setInteractive();
					// 	sprite.setVisible(true);
					//this.plantedSprites[devling.name] = plantedSprite;
					// 	x += 40;
					// }
				}
			});
		};

		this.cameras.main.fadeIn(1000, 0, 0, 0);

		const map = this.make.tilemap({ key: 'theFarmMap' });
		const terrains = map.addTilesetImage('1_Terrains_32x32');
		const fences = map.addTilesetImage('2_Fences_32x32');
		const props = map.addTilesetImage('3_Props_and_Buildings_32x32');
		const trees = map.addTilesetImage('6_Trees_32x32');
		const tilesets = [terrains, fences, props, trees];
		const baseLayer = map.createLayer('base', tilesets, 0, 0);
		const treeLayer1 = map.createLayer('trees', tilesets, 0, 0);
		const treeLayer2 = map.createLayer('trees2', tilesets, 0, 0);
		const propsLayer = map.createLayer('props', tilesets, 0, 0);
		const plotsLayer = map.createLayer('plots', tilesets, 0, 0);
		propsLayer.setCollisionByProperty({ collide: true });
		plotsLayer.setCollisionByProperty({ collide: true });

		//show collision area on tilemap
		// const debugGraphics = this.add.graphics().setAlpha(0.75);
		// propsLayer.renderDebug(debugGraphics, {
		// 	tileColor: null,
		// 	collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255),
		// });
		// plotsLayer.renderDebug(debugGraphics, {
		// 	tileColor: null,
		// 	collidingTileColor: new Phaser.Display.Color(0, 255, 0, 255),
		// });

		// const mapLayer = map.createLayer('props', tileset, -250, -50);
		// mapLayer.setCollisionByProperty({ collide: true });
		//mapLayer.setScale(0.6);

		this.player = new Player(this, 275, 300, 'playerSheet');
		this.physics.add.collider(this.player, propsLayer);
		this.physics.add.collider(this.player, plotsLayer);
		// this.physics.add.collider(this.player, mapLayer);

		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.input.keyboard.enabled = true;

		//debug visual for playerBounds
		this.debugGraphics = this.add.graphics();
		this.debugGraphics.lineStyle(1, 0x00ff00);

		this.renderInventory();
		this.birdSound.play();
	}

	update() {
		this.player.update();

		//create playerBounds for collision
		const footHeight = this.player.height * 0.25;
		const playerBounds = new Phaser.Geom.Rectangle(
			this.player.x - this.player.width / 6,
			this.player.y - this.player.height / 4 + footHeight,
			this.player.width / 3,
			footHeight
		);

		//debug playerBounds for collision
		// this.debugGraphics = this.add.graphics();
		// this.debugGraphics.lineStyle(1, 0x00ff00);
		// this.debugRect = this.debugGraphics.strokeRectShape(playerBounds);
		// this.debugGraphics.clear();
		// this.debugGraphics.lineStyle(1, 0x00ff00);
		// this.debugGraphics.strokeRectShape(playerBounds);

		//FRONT DOOR requires
		if (
			Phaser.Geom.Intersects.RectangleToRectangle(
				playerBounds,
				this.frontDoorTrigger.getBounds()
			)
			// &&
			// Phaser.Input.Keyboard.JustDown(this.spaceKey)
		) {
			this.moveScene('firstFloor');
		}

		//PATH to overworldmap
		if (
			Phaser.Geom.Intersects.RectangleToRectangle(
				playerBounds,
				this.toOverworldTrigger.getBounds()
			)
			// &&
			// Phaser.Input.Keyboard.JustDown(this.spaceKey)
		) {
			this.moveScene('overworldScene');
		}

		//Plot for planting, watering, harvesting

		const isOverlappingPlot = Phaser.Geom.Intersects.RectangleToRectangle(
			playerBounds,
			this.plantTrigger.getBounds()
		);

		if (isOverlappingPlot && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
			//check user has devlings to plant or water (need to factor in location later? so that correct devling is being watered)
			const hasUnplanted = userInventory.some(
				(devling) => !devling.isPlanted && !devling.isGrown
			);
			const hasUnwatered = userInventory.some(
				(devling) => devling.isPlanted && !devling.isWatered && !devling.isGrown
			);
			const grown = userInventory.some(
				(devling) => devling.isPlanted && devling.isWatered
			);

			// for(let i = 0; i < userInventory.length; i++) {
			// 	if(userInventory[i].isPlanted && userInventory[i].isWatered) {
			// 		userInventory[i].isGrown = true;
			// 		console.log(userInventory[i].name, "ready to harvest")
			// 	}
			// }

			const hasGrown = userInventory.some((devling) => devling.isGrown);

			//If unplanted, we plant
			if (hasUnplanted) {
				for (let i = 0; i < userInventory.length; i++) {
					if (userInventory[i].isPlanted === false) {
						userInventory[i].isPlanted = true;

						//Set devling to visible in inventory when grown and harvested
						const sprite = this.devlingSprites[userInventory[i].name];
						let plantedSprite =
							this.plantedDevlingSprites[userInventory[i].name];
						if (i < 3) {
							plantedSprite = this.add.sprite(500 + i * 62, 70, 'devlingImage');
							plantedSprite.setInteractive();
							plantedSprite.setVisible(true);
							this.plantedDevlingSprites[userInventory[i].name] = plantedSprite;
							this.plantingSound.play();
						}
						if (i > 2) {
							plantedSprite = this.add.sprite(
								500 + (i - 3) * 62,
								135,
								'devlingImage'
							);
							plantedSprite.setInteractive();
							plantedSprite.setVisible(true);
							this.plantedDevlingSprites[userInventory[i].name] = plantedSprite;
							this.plantingSound.play();
						}

						console.log('devling sprites', this.devlingSprites);
						if (sprite) {
							sprite.setVisible(false);

							console.log('sprite removed');
						}

						if (plantedSprite) {
							plantedSprite.setVisible(true);

							console.log('sprite planted');
						}

						console.log('planting', userInventory[i]);
						break;
					}
				}
			}

			//If all planted and not watered, we water
			else if (hasUnwatered) {
				for (let i = 0; i < userInventory.length; i++) {
					if (
						userInventory[i].isPlanted === true &&
						userInventory[i].isWatered === false &&
						userInventory[i].isGrown === false
					) {
						userInventory[i].isWatered = true;
						this.wateringSound.play();
						//this.jiggleSprite(plantedSprite[userInventory[i].name]);
						console.log('watering', userInventory[i].name);
						break;
					}
				}
			}

			//If grown, we can harvest. Currently grown = has been planted and watered.
			else if (grown) {
				for (let i = 0; i < userInventory.length; i++) {
					if (userInventory[i].isGrown === false) {
						userInventory[i].isGrown = true;
						userInventory[i].isPlanted = false;
						userInventory[i].isWatered = false;

						//Set devling to visible in inventory when grown and harvested
						const sprite = this.devlingSprites[userInventory[i].name];
						let plantedSprite =
							this.plantedDevlingSprites[userInventory[i].name];
						if (sprite) {
							sprite.setVisible(true);
							plantedSprite.setVisible(false);
							this.harvestingSound.play();
						}

						console.log(
							userInventory[i].name,
							'has grown and has been harvested!'
						);
						break;
					}
				}
			}

			if (Phaser.Input.Keyboard.JustUp(this.spaceKey)) {
				this.plantingInProgress = false;
				this.wateringInProgress = false;
			}
		}
	}

	moveScene(sceneKey) {
		this.input.keyboard.enabled = false;
		this.cameras.main.fadeOut(500, 0, 0, 0);
		this.time.delayedCall(500, () => {
			this.scene.start(sceneKey);
		});
	}

	jiggleSprite(sprite) {
		this.tweens.add({
			targets: sprite,
			x: sprite.x + 3,
			yoyo: true,
			repeat: 3,
			duration: 50,
			ease: 'Sine.easeInOut',
			onComplete: () => {
				sprite.x = sprite.x - 3; // reset to original position just in case
			},
		});
	}
}
