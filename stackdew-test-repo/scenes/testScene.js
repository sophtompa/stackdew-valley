import Phaser from 'phaser';
import Player from '../src/player.js';
import { database, userInventory } from '../src/dummydata.js';

export default class overworldScene extends Phaser.Scene {
	constructor() {
		super('overworldScene');
	}

	preload() {
		this.load.tilemapTiledJSON('map', '../assets/overworld.JSON');
		this.load.image('mapImage', '../assets/1_Terrains_32x32.png');
		this.load.spritesheet('playerSheet', '../assets/farmer.png', {
			frameWidth: 64,
			frameHeight: 64,
		});
		this.load.spritesheet('devlingImage', '../assets/devlingSpritesheet.png', {
			frameWidth: 64,
			frameHeight: 64,
		});
	}

	create() {
		//scene fades in
		this.cameras.main.fadeIn(1000, 0, 0, 0);

		// create map
		const map = this.make.tilemap({ key: 'map' });
		const tilesets = map.addTilesetImage('1_Terrains_32x32', 'mapImage');
		const mapLayer = map.createLayer('grass', tilesets, 0, 0);
		mapLayer.setCollisionByProperty({ collide: true });
		this.locationLayer = map.createLayer('locations', tilesets, 0, 0);
		this.locationLayer.setCollisionByProperty({ collide: true });

		//create hidden trigger sprite for doors etc
		this.doorTrigger = this.physics.add.sprite(272, 240, null);
		this.doorTrigger.setSize(42, 42);
		this.doorTrigger.setVisible(false);
		this.doorTriggered = false;

		//create hidden trigger for planting devling
		this.plantTrigger = this.physics.add.sprite(272, 400, null);
		this.plantTrigger.setSize(42, 42);
		this.plantTrigger.setVisible(false);
		this.plantTriggered = false;

		//create hidden trigger for watering devling
		this.waterTrigger = this.physics.add.sprite(272, 400, null);
		this.waterTrigger.setSize(42, 42);
		this.waterTrigger.setVisible(false);
		this.waterTriggered = false;

		//create devling sprite images
		this.devlingSprites = {};

		//create player and add collision rules
		this.player = new Player(this, 250, 300, 'playerSheet');
		this.physics.add.collider(this.player, mapLayer);

		//initialising space key
		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);
	}

	update() {
		this.player.update();

		const playerBounds = new Phaser.Geom.Rectangle(
			this.player.x - this.player.width / 2 + 24,
			this.player.y - this.player.height / 2 + 38,
			15,
			8
		);

		//create doortrigger overlap rules
		const isOverlapping = Phaser.Geom.Intersects.RectangleToRectangle(
			playerBounds,
			this.doorTrigger.getBounds()
		);
		if (
			isOverlapping &&
			!this.doorTriggered &&
			Phaser.Input.Keyboard.JustDown(this.spaceKey)
		) {
			this.doorTriggered = true;

			//code for collecting devlings
			if (database.length > 0 && userInventory.length === 0) {
				for (let i = 0; i < database.length; i++) {
					const devling = database[i];
					userInventory.push(devling);

					//create devling visuals
					const sprite = this.add.sprite(50 + i * 40, 50, 'devlingImage');
					sprite.setInteractive();
					sprite.setVisible(true);
					this.devlingSprites[devling.name] = sprite;
				}
				console.log('devlings collected', userInventory);
			}
		} else if (
			!isOverlapping &&
			this.doorTriggered
			//Phaser.Input.Keyboard.JustDown(this.spaceKey)
		) {
			this.doorTriggered = false;
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
}
