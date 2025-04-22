import Phaser from 'phaser';
import Player from '../src/player.js';
import DialogueManager from '../src/dialogueManager.js';
import renderInventory from '../src/renderInventory.js';
import togglePause from '../src/togglePause.js';
import { database, userInventory } from '../src/dummydata.js';

export default class farmScene extends Phaser.Scene {
	constructor() {
		super('farmScene');
	}

	init(data) {
		this.from = data.from;
		console.log(this.from);

		//Where we spawn when coming FROM these locations
		const spawnPoints = {
			firstFloor: { x: 275, y: 300 },
			overworldScene: { x: 700, y: 340 },
		};

		const spawn = spawnPoints[this.from] || { x: 275, y: 300 };
		this.spawnX = spawn.x;
		this.spawnY = spawn.y;
	}

	preload() {
		this.load.tilemapTiledJSON('theFarmMap', '../assets/chrisfarm.json');
		this.load.image('1_Terrains_32x32', '../assets/1_Terrains_32x32.png');
		this.load.image('2_Fences_32x32', '../assets/2_Fences_32x32.png');
		this.load.image(
			'3_Props_and_Buildings_32x32',
			'../assets/3_Props_and_Buildings_32x32.png'
		);
		this.load.image('6_Trees_32x32', '../assets/6_Trees_32x32.png');
		this.load.spritesheet('playerSheet', 'assets/rose.png', {
			frameWidth: 64,
			frameHeight: 64,
		});
		//devling head for UI
		this.load.spritesheet('devlingImage', '../assets/devlingSpritesheet.png', {
			frameWidth: 64,
			frameHeight: 64,
		});

		//sound effects
		this.load.audio('plantingSound', '../assets/planting.wav');
		this.load.audio('wateringSound', '../assets/watering.wav');
		this.load.audio('harvestingSound', '../assets/harvest.wav');
		this.load.audio('birdsSound', '../assets/birds.wav');
		this.load.audio('speechSound', '../assets/speechSound.wav');
		this.load.audio('doorSound', '../assets/door.wav');
	}

	create() {
		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);
		this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

		//initialise dialogue manager
		this.dialogue = new DialogueManager(this);
		this.isDialogueRunning = false;

		//initialise render inventory
		this.renderInventory = new renderInventory(this);
		this.renderInventory.render(userInventory);

		//reset plot offset for planting later
		let plotOffset = 0;

		//test to see if the scene has ran before and if not, play a tutorial
		if (!this.registry.get('farmSceneTutorial')) {
			this.registry.set('farmSceneTutorial', true);
			this.time.delayedCall(700, () => {
				this.dialogue.startDialogue(
					[
						{
							text: `Tip: Use this plot by the troughs to nurture your devlings.`,
							speaker: '',
							color: '#1f451c',
						},
						{
							text: `Press Space to interact with it.`,
							speaker: '',
							color: '#1f451c',
						},
						{
							text: `Devlings need to be planted, watered then harvested.`,
							speaker: '',
							color: '#1f451c',
						},
						{
							text: `You can also head back into the farmhouse or into StackDew Valley.`,
							speaker: '',
							color: '#1f451c',
						},
					],
					null,
					360,
					20
				);
			});
		}

		//create audio
		this.plantingSound = this.sound.add('plantingSound');
		this.wateringSound = this.sound.add('wateringSound');
		this.harvestingSound = this.sound.add('harvestingSound');
		this.birdSound = this.sound.add('birdsSound');
		this.doorSound = this.sound.add('doorSound');
		this.doorSoundPlayed = false;

		// FRONT DOOR to firstFloor
		this.frontDoorTrigger = this.physics.add.sprite(273, 260, null);
		this.frontDoorTrigger.setSize(45, 60);
		this.frontDoorTrigger.setVisible(false);
		this.frontDoorTriggered = false;

		// PATH to overWorldMap
		this.toOverworldTrigger = this.physics.add.sprite(775, 365, null);
		this.toOverworldTrigger.setSize(40, 110);
		this.toOverworldTrigger.setVisible(false);
		this.toOverworldTriggered = false;

		//create hidden trigger for planting devling
		this.plantTrigger = this.physics.add.sprite(560, 215, null);
		this.plantTrigger.setSize(150, 40);
		this.plantTrigger.setVisible(false);
		this.plantTriggered = false;

		//create devling sprite images
		//inventory & shadow:
		this.devlingSprites = {};
		this.devlingShadowSprites = {};
		//farm dirt patch:
		this.plantedDevlingSprites = {};

		//this.renderInventory.render(userInventory);

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

		this.player = new Player(this, this.spawnX, this.spawnY, 'playerSheet');

		this.physics.add.collider(this.player, propsLayer);
		this.physics.add.collider(this.player, plotsLayer);

		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.input.keyboard.enabled = true;

		//debug visual for playerBounds
		this.debugGraphics = this.add.graphics();
		this.debugGraphics.lineStyle(1, 0x00ff00);

		this.renderInventory.render(userInventory);
		this.birdSound.play();
	}

	update() {
		this.player.update();
		//removed becauese it was breaking the new watering graphic
		//this.renderInventory.render(userInventory);

		// pause toggle
		if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
			togglePause(this);
		}

		//create playerBounds for collision
		const footHeight = this.player.height * 0.25;
		const playerBounds = new Phaser.Geom.Rectangle(
			this.player.x - this.player.width / 6,
			this.player.y - this.player.height / 4 + footHeight,
			this.player.width / 3,
			footHeight
		);

		//FRONT DOOR requires
		if (
			Phaser.Geom.Intersects.RectangleToRectangle(
				playerBounds,
				this.frontDoorTrigger.getBounds()
			)
		) {
			//stop player movement
			// this.player.setVelocity(0, 50);
			this.player.body.moves = false;

			//hide door to make it look open
			const doorCover = this.add
				.rectangle(272, 257, 33, 45, 0x333333)
				.setOrigin(0.5);
			doorCover.setDepth(500);
			doorCover.setAlpha(0);

			//fade door shadow in to hide player
			this.tweens.add({
				targets: doorCover,
				alpha: 0.3,
				duration: 500,
				ease: 'Power1',
			});

			this.tweens.add({
				targets: this.player,
				alpha: 0,
				duration: 200,
				ease: 'Power1',
			});
			this.time.delayedCall(100, () => {
				//play door sound
				if (!this.doorSoundPlayed) {
					this.sound.play('doorSound', { volume: 0.3 });
					this.doorSoundPlayed = true;
				}
				this.moveScene('firstFloor');
			});
		}

		//PATH to overworldmap
		const toOverworldTriggerBody = this.toOverworldTrigger.body;
		if (
			Phaser.Geom.Intersects.RectangleToRectangle(
				playerBounds,
				new Phaser.Geom.Rectangle(
					toOverworldTriggerBody.x,
					toOverworldTriggerBody.y,
					toOverworldTriggerBody.width,
					toOverworldTriggerBody.height
				)
			)
		) {
			this.input.keyboard.enabled = false;
			this.moveSceneToOverworld('overworldScene');
		}

		//Plot for planting, watering, harvesting
		const plantTriggerBody = this.plantTrigger.body;
		const isOverlappingPlot = Phaser.Geom.Intersects.RectangleToRectangle(
			playerBounds,
			new Phaser.Geom.Rectangle(
				plantTriggerBody.x,
				plantTriggerBody.y,
				plantTriggerBody.width,
				plantTriggerBody.height
			)
		);

		if (
			isOverlappingPlot &&
			Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
			!this.isDialogueRunning
		) {
			const unplanted = userInventory.find(
				(devling) => !devling.isPlanted && !devling.isGrown
			);
			const unwatered = userInventory.find(
				(devling) => devling.isPlanted && !devling.isWatered && !devling.isGrown
			);
			const harvestableIndex = userInventory.findIndex(
				(devling) => devling.isPlanted && devling.isWatered && !devling.isGrown
			);

			if (unplanted) {
				//plant
				unplanted.isPlanted = true;
				localStorage.setItem('userInventory', JSON.stringify(userInventory));
				this.plantingSound.play();
				console.log('planting', unplanted.name);
				this.renderInventory.render(userInventory);
			} else if (unwatered) {
				//water
				unwatered.isWatered = true;
				unwatered.isWateredTweenActive = false;
				this.wateringSound.play({ volume: 0.5 });
				console.log('watering', unwatered.name);
				this.renderInventory.render(userInventory);
			} else if (harvestableIndex !== -1) {
				//harvest
				const devling = userInventory[harvestableIndex];
				devling.isGrown = true;
				devling.isPlanted = false;
				devling.isWatered = false;

				console.log(devling.name, 'has grown and has been harvested!');
				this.harvestingSound.play();
				this.renderInventory.render(userInventory);

				// this.isDialogueRunning = true;
				// this.dialogue.startDialogue(
				// 	[
				// 		{
				// 			text: `Harvested Devling!`,
				// 			speaker: '',
				// 			color: '#1f451c',
				// 		},
				// 	],
				// 	() => {
				// 		this.isDialogueRunning = false;
				// 	},
				// 	435,
				// 	40
				// );
				// this.isDialogueRunning = true;
			} else {
				//nothing to do
				this.dialogue.startDialogue(
					[
						{
							text: `Nothing to do here right now...`,
							speaker: '',
							color: '#1f451c',
						},
					],
					() => {
						this.isDialogueRunning = false;
					},
					385,
					20
				);
				this.isDialogueRunning = true;
			}
		}

		//  {
		// 	//check user has devlings to plant or water
		// 	const hasUnplanted = userInventory.some(
		// 		(devling) => !devling.isPlanted && !devling.isGrown
		// 	);
		// 	const hasUnwatered = userInventory.some(
		// 		(devling) => devling.isPlanted && !devling.isWatered && !devling.isGrown
		// 	);
		// 	const grown = userInventory.some(
		// 		(devling) => devling.isPlanted && devling.isWatered
		// 	);

		// 	const hasGrown = userInventory.some((devling) => devling.isGrown);
		// 	this.renderInventory.render(userInventory);

		// 	//if unplanted, we plant
		// 	if (hasUnplanted) {
		// 		for (let i = 0; i < userInventory.length; i++) {
		// 			if (userInventory[i].isPlanted === false) {
		// 				userInventory[i].isPlanted = true;

		// 				localStorage.setItem(
		// 					'userInventory',
		// 					JSON.stringify(userInventory)
		// 				);
		// 				this.plantingSound.play();
		// 				console.log('planting', userInventory[i]);
		// 				this.renderInventory.render(userInventory);
		// 				break;
		// 			}
		// 		}
		// 	} else if (!hasUnplanted && !hasUnwatered && !hasGrown && !grown) {
		// 		//no devlings to plant/water/harvest
		// 		this.dialogue.startDialogue(
		// 			[
		// 				{
		// 					text: `Nothing to do here right now...`,
		// 					speaker: '',
		// 					color: '#1f451c',
		// 				},
		// 			],
		// 			() => {
		// 				//reset isDialogueRunning after the dialogue is complete via callback
		// 				this.isDialogueRunning = false;
		// 			},
		// 			385,
		// 			20
		// 		);
		// 		this.isDialogueRunning = true;
		// 	}

		// 	//If all planted and not watered, we water
		// 	else if (hasUnwatered) {
		// 		for (let i = 0; i < userInventory.length; i++) {
		// 			if (
		// 				userInventory[i].isPlanted === true &&
		// 				userInventory[i].isWatered === false &&
		// 				userInventory[i].isGrown === false
		// 			) {
		// 				userInventory[i].isWatered = true;
		// 				this.wateringSound.play({ volume: 0.5 });
		// 				//this.jiggleSprite(plantedSprite[userInventory[i].name]);
		// 				console.log('watering', userInventory[i].name);
		// 				this.renderInventory.render(userInventory);
		// 				break;
		// 			}
		// 		}
		// 	}

		// 	//If grown, we can harvest. Currently grown = has been planted and watered.
		// 	else if (grown) {
		// 		for (let i = 0; i < userInventory.length; i++) {
		// 			if (userInventory[i].isGrown === false) {
		// 				userInventory[i].isGrown = true;
		// 				userInventory[i].isPlanted = false;
		// 				userInventory[i].isWatered = false;

		// 				console.log(
		// 					userInventory[i].name,
		// 					'has grown and has been harvested!'
		// 				);
		// 				this.harvestingSound.play();
		// 				this.renderInventory.render(userInventory);
		// 				this.dialogue.startDialogue(
		// 					[
		// 						{
		// 							text: `Harvested Devling!`,
		// 							speaker: '',
		// 							color: '#1f451c',
		// 						},
		// 					],
		// 					() => {
		// 						//reset isDialogueRunning after the dialogue is complete via callback
		// 						this.isDialogueRunning = false;
		// 					},
		// 					435,
		// 					40
		// 				);
		// 				this.isDialogueRunning = true;
		// 				break;
		// 			}
		// 		}
		// 	}

		// 	if (Phaser.Input.Keyboard.JustUp(this.spaceKey)) {
		// 		this.plantingInProgress = false;
		// 		this.wateringInProgress = false;
		// 	}
		// }
	}

	moveScene(sceneKey) {
		this.input.keyboard.enabled = false;

		this.cameras.main.fadeOut(500, 0, 0, 0);
		this.time.delayedCall(500, () => {
			this.scene.start(sceneKey);
		});
	}

	moveSceneToOverworld(sceneKey) {
		this.input.keyboard.enabled = false;
		this.cameras.main.fadeOut(500, 0, 0, 0);
		this.time.delayedCall(500, () => {
			this.scene.start(sceneKey, { from: 'farmScene' });
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
