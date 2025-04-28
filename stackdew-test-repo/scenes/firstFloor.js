import Phaser from 'phaser';
import Player from '../src/player.js';
import DialogueManager from '../src/dialogueManager.js';
import renderInventory from '../src/renderInventory.js';
import togglePause from '../src/togglePause.js';
import { database, userInventory } from '../src/dummydata.js';

export default class FirstFloor extends Phaser.Scene {
	constructor() {
		super('firstFloor');
	}

	preload() {
		//load firstFloor map
		this.load.tilemapTiledJSON(
			'firstFloorHouseMapData',
			'../assets/chrishouseMap.json'
		);
		this.load.image('firstFloorHouseMap', '../assets/chrishouseMap.png');
		this.load.spritesheet('playerSheet', 'assets/rose.png', {
			frameWidth: 32,
			frameHeight: 65,
		});

		database.forEach((devling) => {
			this.load.spritesheet(devling.name, devling.sprite, {
				frameWidth: 64,
				frameHeight: 64,
			});
		});
		this.load.image('emailIcon', 'assets/email.png');
		this.load.image('newMailIcon', '../assets/mail.png');
		this.load.audio('mailSound', 'assets/yougotmail.mp3');
		this.load.audio('harvestingSound', '../assets/harvest.wav');
		this.load.audio('speechSound', '../assets/speechSound.wav');
	}

	create() {
		//drop sound volumne a teeny bit for everything in this scene
		this.sound.volume = 0.7;

		//initialise dialogue manager
		this.dialogue = new DialogueManager(this);

		//initialise render inventory
		this.renderInventory = new renderInventory(this);
		this.renderInventory.render(userInventory);

		//create audio
		this.harvestingSound = this.sound.add('harvestingSound');

		// creation of input keys
		const { ENTER, SPACE } = Phaser.Input.Keyboard.KeyCodes;
		this.enterKey = this.input.keyboard.addKey(ENTER);
		this.spaceKey = this.input.keyboard.addKey(SPACE);
		this.xKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
		this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

		//create map for scene
		const map = this.make.tilemap({ key: 'firstFloorHouseMapData' });
		const tileset = map.addTilesetImage('houseMap', 'firstFloorHouseMap');
		const mapLayer = map
			.createLayer('Tile Layer 1', tileset)
			.setCollisionByProperty({ collide: true });
		mapLayer.setPosition(0, 0);
		const aboveLayer = map.createLayer('Tile Layer 2', tileset);
		aboveLayer.setPosition(0, 0);
		aboveLayer.setDepth(10);

		//spawn player in correct position depending on whether they've been to this scene before
		if (!this.registry.get('firstFloorSceneTutorial')) {
			this.player = new Player(this, 130, 120, 'playerSheet');
		} else {
			this.player = new Player(this, 545, 370, 'playerSheet');

			//face player upwards like they've just come in the door
			if (this.player.anims.isPlaying) {
				this.player.anims.stop();
			}
			this.player.lastDirection = 'up';
			this.player.setTexture('playerSheet').setFrame(1);
			this.player.setFrame(1);
		}

		//initialise collisions from map data
		this.physics.add.collider(this.player, mapLayer);

		//check to see if this is our first time in this scene and if so, play some tutorial dialogue
		if (!this.registry.get('firstFloorSceneTutorial')) {
			this.registry.set('firstFloorSceneTutorial', true);
			this.time.delayedCall(700, () => {
				this.dialogue.startDialogue(
					[
						{
							text: `Tip: Use arrow keys to move and spacebar to interact.`,
							speaker: '',
							color: '#1f451c',
						},
						{
							text: `It's almost 8:45 and time for the morning lecture.`,
							speaker: '',
							color: '#1f451c',
						},
						{
							text: `RISE AND SHINE CODERS!!!`,
							speaker: '',
							color: '#1f451c',
						},
						{
							text: `Tip: As a tutor, CorthNoders may contact you on your laptop.`,
							speaker: '',
							color: '#1f451c',
						},
						{
							text: `Alternatively, why not pop outside to touch grass?`,
							speaker: '',
							color: '#1f451c',
						},
					],
					null,
					30,
					345
				);
			});
		}

		// Email icon
		this.emailIcon = this.physics.add
			.staticSprite(272, 90, 'newMailIcon')
			.setVisible(false);
		this.floatingMail = this.add
			.image(398, 650, 'newMailIcon')
			.setVisible(false);
		this.mailSound = this.sound.add('mailSound');
		this.nearEmail = false;

		// Bobbing mail tween, give it a nice lil animation
		this.bobTween = this.tweens.add({
			targets: this.floatingMail,
			y: '-=10',
			duration: 600,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
			paused: true,
		});

		this.physics.add.overlap(this.player, this.emailIcon, () => {
			this.nearEmail = true;
		});

		// Enter key required to get to the computerScene
		// only once email pops up
		this.input.keyboard.on('keydown-ENTER', () => {
			if (this.nearEmail && this.emailIcon.visible) {
				this.scene.start('ComputerScene');
			}
		});

		// Loop for mail spawn
		// Timer, for now, change timer later on dependent
		//on when players will recieve new cohort of devlings
		// if (database.length > 0 && userInventory.length === 0) {
		// 	this.mailTimer = this.time.addEvent({
		// 		delay: 12000,
		// 		callback: this.spawnEmail,
		// 		callbackScope: this,
		// 		loop: true,
		// 	});
		// }

		//new email timer to only happen once
		if (database.length > 0 && userInventory.length === 0) {
			this.time.delayedCall(11000, this.spawnEmail, [], this);
		}

		this.createTriggers();

		//create hidden trigger sprite for computer trigger
		this.computerTrigger = this.physics.add.sprite(265, 130, null);
		this.computerTrigger.setSize(60, 60);
		this.computerTrigger.setVisible(false);
		this.computerTriggered = false;

		//create devling sprite images
		this.devlingSprites = {};

		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
		this.cameras.main.fadeIn(1000, 0, 0, 0);
	}

	update() {
		this.player.update();
		this.renderInventory.render(userInventory);

		//pause toggle
		if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
			togglePause(this);
		}

		//temporary test thing to remove devlings from oplayer ownership
		if (Phaser.Input.Keyboard.JustDown(this.xKey)) {
			console.log('x');
			for (let i = 0; i < userInventory.length; i++) {
				if (userInventory[i].belongsTo) {
					userInventory[i].belongsTo = null;
					console.log(userInventory[i].name, 'removed');
					this.renderInventory.render(userInventory);
				}
			}
		}

		const bounds = new Phaser.Geom.Rectangle(
			this.player.x - this.player.width / 2,
			this.player.y - this.player.height / 2,
			this.player.width,
			this.player.height
		);

		this.handleTriggers(bounds);
		this.nearEmail = Phaser.Geom.Intersects.RectangleToRectangle(
			bounds,
			this.emailIcon.getBounds()
		);

		const isOverlapping = Phaser.Geom.Intersects.RectangleToRectangle(
			bounds,
			this.computerTrigger.getBounds()
		);
		if (
			isOverlapping &&
			!this.computerTriggered &&
			Phaser.Input.Keyboard.JustDown(this.spaceKey) &&
			this.floatingMail.visible
		) {
			this.computerTriggered = true;
			const inventoryLimit = 6;

			//original code for collecting devlings
			// if (database.length > 0 && userInventory.length <= 6) {
			// 	for (
			// 		let i = 0;
			// 		i < database.length && (i < userInventory.length + 3);
			// 		i++
			// 	) {
			// 		const devling = database[i];
			// 		if (!devling.belongsTo) {
			// 			console.log(this.registry.get('playerName'));
			// 			devling.belongsTo = this.registry.get('playerName');
			// 			userInventory.push(devling);
			// 			this.renderInventory.render(userInventory);
			// 		}
			// 		this.harvestingSound.play();
			// 		console.log('devlings collected', userInventory);
			// 		console.log('data total', database);
			// 	}
			// } else if (!isOverlapping && this.computerTriggered) {
			// 	this.computerTriggered = false;
			// }

			//new code for collecting devlings
			if (database.length > 0 && userInventory.length <= inventoryLimit) {
				let itemsAdded = 0;

				for (let i = 0; i < database.length; i++) {
					//stop if userInventory is full
					if (userInventory.length >= inventoryLimit) break;
					//stop if we've added 6 devlings
					if (itemsAdded >= inventoryLimit) break;

					const devling = database[i];

					//check if current devling is available
					if (!devling.belongsTo) {
						//mark it as belonging to player
						devling.belongsTo = this.registry.get('playerName');
						userInventory.push(devling);
						itemsAdded++;
					}
				}
				if (itemsAdded > 0) {
					this.harvestingSound.play();
					console.log('devlings collected', userInventory);
					this.registry.set('gotMail', false);
					this.floatingMail.destroy();
					this.renderInventory.render(userInventory);
				}
			}
		}
		if (!isOverlapping && this.computerTriggered) {
			this.computerTriggered = false;
		}
	}

	spawnEmail() {
		if (userInventory.length >= 6) return;
		this.registry.set('gotMail', true);
		this.emailIcon.setVisible();
		this.floatingMail.setVisible(true);
		this.floatingMail.setPosition(this.emailIcon.x, this.emailIcon.y - 20);
		this.nearEmail = false;

		this.mailSound.play();
		this.renderInventory.render(userInventory);

		if (this.bobTween) {
			this.bobTween.stop();
			this.bobTween.remove();
		}

		this.bobTween = this.tweens.add({
			targets: this.floatingMail,
			y: this.floatingMail.y - 10,
			duration: 600,
			yoyo: true,
			repeat: -1,
			ease: 'Sine.easeInOut',
		});
	}

	createTriggers() {
		this.doorTrigger = this.physics.add
			.sprite(560, 440)
			.setSize(110, 53)
			.setVisible(false);
		this.doorTriggered = false;

		this.kitchenTrigger = this.physics.add
			.sprite(555, 290)
			.setSize(170, 70)
			.setVisible(false);
		this.kitchenTriggered = false;
	}

	handleTriggers(bounds) {
		//check if player exits via doorway
		const doorHit = Phaser.Geom.Intersects.RectangleToRectangle(
			bounds,
			this.doorTrigger.getBounds()
		);
		if (doorHit && !this.doorTriggered) {
			this.doorTriggered = true;
			this.moveScene('farmScene');
		} else if (!doorHit) {
			this.doorTriggered = false;
		}

		//check if player enters kitchen
		const kitchenHit = Phaser.Geom.Intersects.RectangleToRectangle(
			bounds,
			this.kitchenTrigger.getBounds()
		);
		if (
			kitchenHit &&
			!this.kitchenTriggered &&
			!this.dialogue.isDialogueRunning()
		) {
			this.kitchenTriggered = true;
			this.dialogue.startDialogue(
				[
					{
						text: `The kitchen is being renovated right now and will have fun things to do in future versions.`,
						speaker: '',
						color: '#1f451c',
					},
				],
				null,
				350,
				125
			);
		} else if (!kitchenHit) {
			this.kitchenTriggered = false;
		}
	}

	moveScene(target) {
		this.input.keyboard.enabled = false;
		this.cameras.main.fadeOut(1000, 0, 0, 0);
		this.time.delayedCall(1000, () => {
			this.scene.start(target);
			this.input.keyboard.enabled = true;
		});
	}
}
