import Phaser from 'phaser';
import Player from '../src/player.js';
import DialogueManager from '../src/dialogueManager.js';
import renderInventory from '../src/renderInventory.js';
import farmScene from '../scenes/farmScene.js';
import officeScene from '../scenes/officeScene.js';
import { database, userInventory } from '../src/dummydata.js';

export default class overworldScene extends Phaser.Scene {
	constructor() {
		super('overworldScene');
	}

	init(data) {
		this.from = data.from;
		console.log(this.from);

		//Where we spawn when coming FROM these locations
		const spawnPoints = {
			farmScene: { x: 200, y: 220 },
			officeScene: { x: 490, y: 130 },
			battleScene: { x: 200, y: 275 },
			dungeonScene: {x: 500, y: 320},
			trumpScene: {x: 200, y: 275}
		};

		const spawn = spawnPoints[this.from] || { x: 275, y: 300 };
		this.spawnX = spawn.x;
		this.spawnY = spawn.y;
	}

	preload() {
		// this.load.tilemapTiledJSON('map', '../assets/overworld.JSON');
		// this.load.image('mapImage', '../assets/1_Terrains_32x32.png');

		// this.load.tilemapTiledJSON('map', '../assets/overworldsophie.json');
		this.load.image('mapImage', '../assets/overworldsophienew.png');

		this.load.spritesheet('playerSheet', '../assets/rose.png', {
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

		// // // create map
		// const map = this.make.tilemap({ key: 'overworldMap' });
		// const tilesets = map.addTilesetImage('overworldsophie', 'mapImage');
		// map.createLayer('Tile Layer 1', tilesets, 0, 0);

		// mapLayer.setCollisionByProperty({ collide: true });
		// this.locationLayer = map.createLayer('locations', tilesets, 0, 0);
		// this.locationLayer.setCollisionByProperty({ collide: true });

		//create new map
		this.add.image(400, 221, 'mapImage');

		//create hidden trigger sprite for farm scene
		this.farmTrigger = this.physics.add.sprite(200, 150, null);
		this.farmTrigger.setSize(125, 80);
		this.farmTrigger.setVisible(false);
		this.farmTriggered = false;

		//create hidden trigger for job arena scene
		this.arenaTrigger = this.physics.add.sprite(150, 350, null);
		this.arenaTrigger.setSize(150, 60);
		this.arenaTrigger.setVisible(false);
		this.arenaTriggered = false;

		//create hidden trigger for job market scene
		this.jobMarketTrigger = this.physics.add.sprite(450, 70, null);
		this.jobMarketTrigger.setSize(150, 100);
		this.jobMarketTrigger.setVisible(false);
		this.jobMarketTriggered = false;

		//create hidden trigger for tech dungeon
		this.dungeonTrigger = this.physics.add.sprite(550, 375, null);
		this.dungeonTrigger.setSize(150, 100);
		this.dungeonTrigger.setVisible(false); 
		this.dungeonTriggered = false; 


		//create devling sprite images
		// this.devlingSprites = {};

		//create player and add collision rules. Set spawn depending on scene change
		this.player = new Player(this, this.spawnX, this.spawnY, 'playerSheet');
		// this.physics.add.collider(this.player, mapLayer);

		//initialising space key
		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		//initialise render inventory
		this.renderInventory = new renderInventory(this);
		this.renderInventory.render(userInventory);

		//initialise dialogue
		this.dialogue = new DialogueManager(this);
		this.isDialogueRunning = false;

		if (!this.registry.get('overworldTutorialShown')) {
			this.dialogue.startDialogue(
				[
					{
						text: 'Harvested Devlings need to be taken South West to the ...',
						speaker: '',
						color: '#1f451c',
						x: 200,
						y: 350,
					},
					{
						text: 'JOB MARKET!!!',
						speaker: '',
						color: '#1f451c',
						x: 250,
						y: 350,
					},
					{
						text: 'The StackDew Valley Farm is to the North West.',
						speaker: '',
						color: '#1f451c',
						x: 200,
						y: 350,
					},
					{
						text: 'To the North East you can visit Devlings who have acquired Gainful Employment.',
						speaker: '',
						color: '#1f451c',
						x: 200,
						y: 350,
					},
					{
						text: 'Other visitable areas may appear in future updates...',
						speaker: '',
						color: '#1f451c',
						x: 200,
						y: 350,
					},
				],
				null,
				0,
				0
			);
			//set tutorial flag so it doesn't repeat next time
			this.registry.set('overworldTutorialShown', true);
		}
	}

	update() {
		this.player.update();

		const playerBounds = new Phaser.Geom.Rectangle(
			this.player.x - this.player.width / 2 + 24,
			this.player.y - this.player.height / 2 + 38,
			15,
			8
		);

		//set player map boundaries
		const minX = 80;
		const maxX = 530;
		const minY = 80;
		const maxY = 350;

		// Clamp player's position within bounds
		this.player.x = Phaser.Math.Clamp(this.player.x, minX, maxX);
		this.player.y = Phaser.Math.Clamp(this.player.y, minY, maxY);

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
			console.log('go to farm!');
			this.moveSceneNew('farmScene');

			this.farmTriggered = true;
		}

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
			this.moveSceneNew('battleScene')
				
			this.arenaTriggered = true;}
		
		//create office scene overlap rules
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
		

		const isOverlappingDungeon = Phaser.Geom.Intersects.RectangleToRectangle(
			playerBounds,
			this.dungeonTrigger.getBounds()
		);
		if (
			isOverlappingDungeon &&
			!this.dungeonTriggered 
			// &&
			// Phaser.Input.Keyboard.JustDown(this.spaceKey)
		) {
			console.log("go to dungeon!")
			this.moveSceneNew('dungeonScene')

			
			this.dungeonTriggered = true;}
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
			this.scene.start(sceneKey, { from: 'overworldScene' });
		});
	}
}
