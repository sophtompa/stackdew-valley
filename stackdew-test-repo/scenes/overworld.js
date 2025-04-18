import Phaser from 'phaser';
import Player from '../src/player.js';
import farmScene from '../scenes/farmScene.js';
import officeScene from '../scenes/officeScene.js';

// import { database, userInventory } from '../src/dummydata.js';

export default class overworldScene extends Phaser.Scene {
	constructor() {
		super('overworldScene');
	}

	init(data) {
		this.from = data.from;
		console.log(this.from)
		
		//Where we spawn when coming FROM these locations
		const spawnPoints = {
			farmScene: { x: 320, y: 220 },
			officeScene: {x: 560, y:190}
		}

		const spawn = spawnPoints[this.from] || { x: 275, y: 300 };
		this.spawnX = spawn.x;
		this.spawnY = spawn.y;
	}

	preload() {
		this.load.tilemapTiledJSON('map', '../assets/overworld.JSON');
		// this.load.tilemapTiledJSON('map', '../assets/overworldsophie.json');
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

		//enable keyboard
		this.input.keyboard.enabled = true;

		//scene fades in
		this.cameras.main.fadeIn(1000, 0, 0, 0);

		// create map
		const map = this.make.tilemap({ key: 'map' });
		const tilesets = map.addTilesetImage('1_Terrains_32x32', 'mapImage');
		const mapLayer = map.createLayer('grass', tilesets, 0, 0);
		mapLayer.setCollisionByProperty({ collide: true });
		this.locationLayer = map.createLayer('locations', tilesets, 0, 0);
		this.locationLayer.setCollisionByProperty({ collide: true });

		//create hidden trigger sprite for farm scene
		this.farmTrigger = this.physics.add.sprite(272, 240, null);
		this.farmTrigger.setSize(42, 42);
		this.farmTrigger.setVisible(false);
		this.farmTriggered = false;

		//create hidden trigger for job arena scene
		this.arenaTrigger = this.physics.add.sprite(272, 400, null);
		this.arenaTrigger.setSize(42, 42);
		this.arenaTrigger.setVisible(false);
		this.arenaTriggered = false;

		//create hidden trigger for job market scene
		this.jobMarketTrigger = this.physics.add.sprite(592, 208, null);
		this.jobMarketTrigger.setSize(42, 42);
		this.jobMarketTrigger.setVisible(false);
		this.jobMarketTriggered = false;

		//create devling sprite images
		// this.devlingSprites = {};

		//create player and add collision rules. Set spawn depending on scene change
		this.player = new Player(this, this.spawnX, this.spawnY, 'playerSheet');

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

		//create farmTrigger overlap rules
		const isOverlappingFarm = Phaser.Geom.Intersects.RectangleToRectangle(
			playerBounds,
			this.farmTrigger.getBounds()
		);
		if (
			isOverlappingFarm &&
			!this.farmTriggered 
			// &&
			// Phaser.Input.Keyboard.JustDown(this.spaceKey)
		) {
			console.log("go to farm!")
			this.moveSceneNew('farmScene')

			
			this.farmTriggered = true;}

		//create job arena overlap rules
		const isOverlappingArena = Phaser.Geom.Intersects.RectangleToRectangle(
			playerBounds,
			this.arenaTrigger.getBounds()
		);
		if (
			isOverlappingArena &&
			!this.arenaTriggered 
			// &&
			// Phaser.Input.Keyboard.JustDown(this.spaceKey)
		) {
			console.log("go to j.a!")
				
			this.arenaTriggered = true;}

		const isOverlappingJMarket = Phaser.Geom.Intersects.RectangleToRectangle(
				playerBounds,
				this.jobMarketTrigger.getBounds()
			);
			if (
				isOverlappingJMarket &&
				!this.jobMarketTriggered 
				// &&
				// Phaser.Input.Keyboard.JustDown(this.spaceKey)
			) {
				console.log("go to job market!")
				this.moveSceneNew('officeScene')
		
					
					this.jobMarketTriggered = true;}
		}

		moveScene(sceneKey) {
			this.input.keyboard.enabled = false;
			this.cameras.main.fadeOut(500, 0, 0, 0);
			this.time.delayedCall(500, () => {
				this.scene.start(sceneKey);
			});
		}

		moveSceneNew(sceneKey) {
			this.input.keyboard.enabled = false;
			this.cameras.main.fadeOut(500, 0, 0, 0);
			this.time.delayedCall(500, () => {
				this.scene.start(sceneKey, {from: 'overworldScene'});
			});
		}
}
