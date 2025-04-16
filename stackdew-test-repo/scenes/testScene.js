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
		this.load.audio('unacceptable', '../assets/unacceptable.mp3');
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

		//create player and add collision rules
		this.player = new Player(this, 250, 300, 'playerSheet');
		this.physics.add.collider(this.player, mapLayer);

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
					userInventory.push(database[i]);
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

		const isOverlappingPlot = Phaser.Geom.Intersects.RectangleToRectangle(
			playerBounds,
			this.plantTrigger.getBounds()
		);
		if (
			isOverlappingPlot &&
			Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
			!this.plantingInProgress
		) {
			this.plantingInProgress = true;
			console.log('attempting to plant', userInventory);

			//code for planting devlings
			if (userInventory.length > 0) {
				for (let i = 0; i < userInventory.length; i++) {
					if (userInventory[i].isPlanted === false) {
						userInventory[i].isPlanted = true;
						console.log('planting', userInventory[i]);
					}
				}
			}
		}
		if (Phaser.Input.Keyboard.JustUp(this.spaceKey)) {
			this.plantingInProgress = false;
		}
	}
}
