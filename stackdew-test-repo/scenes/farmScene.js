import Phaser from 'phaser';
import Player from '../src/player.js';
import { database, userInventory } from '../src/dummydata.js';

export default class farmScene extends Phaser.Scene {
	constructor() {
		super('farmScene');
	}

	preload() {
		this.load.tilemapTiledJSON('theFarmMap', 'assets/theFarmMap.json');
		this.load.image('theFarmMap', 'assets/theFarmMap.png');
		this.load.spritesheet('playerSheet', 'assets/farmer.png', {
			frameWidth: 64,
			frameHeight: 64,
		});
		this.load.spritesheet('devlingImage', '../assets/devlingSpritesheet.png', {
			frameWidth: 64,
			frameHeight: 64,
		});
	}

	create() {
		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		// FRONT DOOR to firstFloor
		this.frontDoorTrigger = this.physics.add.sprite(190, 270, null);
		this.frontDoorTrigger.setSize(60, 30);
		this.frontDoorTrigger.setVisible(false);
		this.frontDoorTriggered = false;

		// PATH to overWorldMap
		this.toOverworldTrigger = this.physics.add.sprite(660, 530, null);
		this.toOverworldTrigger.setSize(60, 100);
		this.toOverworldTrigger.setVisible(false);
		this.toOverworldTriggered = false;

		//create hidden trigger for planting devling
		this.plantTrigger = this.physics.add.sprite(410, 350, null);
		this.plantTrigger.setSize(230, 150);
		this.plantTrigger.setVisible(false);
		this.plantTriggered = false;

		//create hidden trigger for watering devling
		// this.waterTrigger = this.physics.add.sprite(272, 400, null);
		// this.waterTrigger.setSize(42, 42);
		// this.waterTrigger.setVisible(false);
		// this.waterTriggered = false;

		//create devling sprite images
		this.devlingSprites = {};

		this.cameras.main.fadeIn(1000, 0, 0, 0);

		const map = this.make.tilemap({ key: 'theFarmMap' });
		const tileset = map.addTilesetImage('theFarmMap', 'theFarmMap');
		const mapLayer = map.createLayer('Tile Layer 1', tileset, -250, -50);
		mapLayer.setCollisionByProperty({ collide: true });
		mapLayer.setScale(0.6);

		this.player = new Player(this, 190, 270, 'playerSheet');
		this.physics.add.collider(this.player, mapLayer);

		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.input.keyboard.enabled = true;
	}

	update() {
		this.player.update();

		const playerBounds = new Phaser.Geom.Rectangle(
			this.player.x - this.player.width / 2,
			this.player.y - this.player.height / 2,
			this.player.width,
			this.player.height
		);

		//FRONT DOOR requires space key
		if (
			Phaser.Geom.Intersects.RectangleToRectangle(
				playerBounds,
				this.frontDoorTrigger.getBounds()
			) &&
			Phaser.Input.Keyboard.JustDown(this.spaceKey)
		) {
			this.moveScene('firstFloor');
		}

		//PATH to overworldmap requires space key
		if (
			Phaser.Geom.Intersects.RectangleToRectangle(
				playerBounds,
				this.toOverworldTrigger.getBounds()
			) &&
			Phaser.Input.Keyboard.JustDown(this.spaceKey)
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
						if (sprite) {
							sprite.setVisible(false);
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
						if (sprite) {
							sprite.setVisible(true);
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
		this.cameras.main.fadeOut(1000, 0, 0, 0);
		this.time.delayedCall(1000, () => {
			this.scene.start(sceneKey);
		});
	}
}
