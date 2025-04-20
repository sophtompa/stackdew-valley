import Phaser from 'phaser';
import Player from '../src/player.js';
import DialogueManager from '../src/dialogueManager.js';
import { database, userInventory } from '../src/dummydata.js';

export default class farmScene extends Phaser.Scene {
	constructor() {
		super('farmScene');
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
		this.load.spritesheet('playerSheet', 'assets/farmer.png', {
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
	}

	create() {
		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		//initialise dialogue manager
		this.dialogue = new DialogueManager(this);
		this.isDialogueRunning = false;

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
		this.plantTrigger = this.physics.add.sprite(560, 215, null);
		this.plantTrigger.setSize(150, 25);
		this.plantTrigger.setVisible(false);
		this.plantTriggered = false;

		//create devling sprite images
		//inventory & shadow:
		this.devlingSprites = {};
		this.devlingShadowSprites = {};
		//farm dirt patch:
		this.plantedDevlingSprites = {};

		//function to render inventory to be called on each dvling state change
		this.renderInventory = () => {
			//cleanup existing ui
			plotOffset = 0;
			//inventory devlings & shadow
			Object.values(this.devlingSprites).forEach((sprite) => sprite.destroy());
			Object.values(this.devlingShadowSprites).forEach((shadow) =>
				shadow.destroy()
			);
			//also planted devlings
			Object.values(this.plantedDevlingSprites).forEach((sprite) =>
				sprite.destroy()
			);

			this.devlingSprites = {};
			this.devlingShadowSprites = {};
			this.plantedDevlingSprites = {};

			//set inventory coordinates top left
			let invX = 50;
			let invY = 50;
			let plotX = 500;
			let plotY = 70;

			userInventory.forEach((devling) => {
				// Inventory slots: Only show devlings in INV that are not planted OR are fully groww
				if (!devling.isPlanted || devling.isGrown) {
					const sprite = this.add.sprite(invX, invY, 'devlingImage');
					//make 2nd copy of devlingsprite for drop shadow, make sure its behind devlingsprite
					const shadow = this.add.sprite(invX + 4, invY + 4, 'devlingImage');
					shadow.setTint(0x000000);
					shadow.setAlpha(0.5);
					sprite.setDepth(1);
					shadow.setDepth(0);

					this.devlingSprites[devling.name] = sprite;
					this.devlingShadowSprites[devling.name] = shadow;
					invX += 40;
				}
				//Plant Bed: Only show devlings that are planted or watered
				if (devling.isPlanted && !devling.isGrown) {
					if (devling.plantX === undefined || devling.plantY === undefined) {
						const row = Math.floor(plotOffset / 3);
						const col = plotOffset % 3;
						devling.plantX = plotX + col * 62;
						devling.plantY = plotY + row * 65;
					}
					plotOffset++;

					const plantedSprite = this.add.sprite(
						devling.plantX,
						devling.plantY,
						'devlingImage'
					);
					this.plantedDevlingSprites[devling.name] = plantedSprite;
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

		this.player = new Player(this, 275, 300, 'playerSheet');
		this.physics.add.collider(this.player, propsLayer);
		this.physics.add.collider(this.player, plotsLayer);

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

		//FRONT DOOR requires
		if (
			Phaser.Geom.Intersects.RectangleToRectangle(
				playerBounds,
				this.frontDoorTrigger.getBounds()
			)
		) {
			this.moveScene('firstFloor');
		}

		//PATH to overworldmap
		if (
			Phaser.Geom.Intersects.RectangleToRectangle(
				playerBounds,
				this.toOverworldTrigger.getBounds()
			)
		) {
			this.moveScene('overworldScene');
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
			//check user has devlings to plant or water
			const hasUnplanted = userInventory.some(
				(devling) => !devling.isPlanted && !devling.isGrown
			);
			const hasUnwatered = userInventory.some(
				(devling) => devling.isPlanted && !devling.isWatered && !devling.isGrown
			);
			const grown = userInventory.some(
				(devling) => devling.isPlanted && devling.isWatered
			);

			const hasGrown = userInventory.some((devling) => devling.isGrown);
			this.renderInventory();

			//if unplanted, we plant
			if (hasUnplanted) {
				for (let i = 0; i < userInventory.length; i++) {
					if (userInventory[i].isPlanted === false) {
						userInventory[i].isPlanted = true;

						localStorage.setItem(
							'userInventory',
							JSON.stringify(userInventory)
						);
						this.plantingSound.play();
						console.log('planting', userInventory[i]);
						this.renderInventory();
						break;
					}
				}
			} else if (!hasUnplanted && !hasUnwatered && !hasGrown && !grown) {
				//no devlings to plant/water/harvest
				this.dialogue.startDialogue(
					[
						{
							text: `Nothing to do here right now...`,
							speaker: '',
							color: '#1f451c',
						},
					],
					() => {
						//reset isDialogueRunning after the dialogue is complete via callback
						this.isDialogueRunning = false;
					},
					385,
					20
				);
				this.isDialogueRunning = true;
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
						this.wateringSound.play({ volume: 0.5 });
						//this.jiggleSprite(plantedSprite[userInventory[i].name]);
						console.log('watering', userInventory[i].name);
						this.renderInventory();
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

						console.log(
							userInventory[i].name,
							'has grown and has been harvested!'
						);
						this.harvestingSound.play();
						this.renderInventory();
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
