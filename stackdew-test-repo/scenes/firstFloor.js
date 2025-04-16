import Phaser from 'phaser';
import Player from '../src/player.js';
import { database, userInventory } from '../src/dummydata.js';

export default class FirstFloor extends Phaser.Scene {
	constructor() {
		super('firstFloor');
	}

	preload() {
		this.load.tilemapTiledJSON(
			'firstFloorHouseMap',
			'assets/firstFloorHouseMap.JSON'
		);
		this.load.image('firstFloorHouseMap', 'assets/firstFloorImage.png');
		this.load.spritesheet('playerSheet', 'assets/dummy.png', {
			frameWidth: 32,
			frameHeight: 61,
		});
		this.load.spritesheet('devlingImage', '../assets/devlingSpritesheet.png', {
			frameWidth: 64,
			frameHeight: 64,
		});
		this.load.image('emailIcon', 'assets/email.png');
		this.load.image('newMailIcon', 'assets/mail.png');
		this.load.audio('mailSound', 'assets/yougotmail.mp3');
	}

	create() {
		// creation of input keys
		const { ENTER, SPACE } = Phaser.Input.Keyboard.KeyCodes;
		this.enterKey = this.input.keyboard.addKey(ENTER);
		this.spaceKey = this.input.keyboard.addKey(SPACE);

		const map = this.make.tilemap({ key: 'firstFloorHouseMap' });
		const tileset = map.addTilesetImage(
			'firstFloorHouseMap',
			'firstFloorHouseMap'
		);
		const mapLayer = map
			.createLayer('Tile Layer 1', tileset)
			.setCollisionByProperty({ collide: true });
		mapLayer.setPosition(0, -100);

		this.player = new Player(this, 250, 300, 'playerSheet');
		this.physics.add.collider(this.player, mapLayer);

		// Email icon
		//TODO: sort out images for the icons
		this.emailIcon = this.physics.add
			.staticSprite(560, 220, 'emailIcon')
			.setVisible(false);
		this.floatingMail = this.add
			.image(400, 650, 'emailIcon')
			.setVisible(false)
			.setScale(0.5);
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
		this.mailTimer = this.time.addEvent({
			delay: 12000,
			callback: this.spawnEmail,
			callbackScope: this,
			loop: true,
		});

		this.createTriggers();

		//create hidden trigger sprite for computer trigger
		this.computerTrigger = this.physics.add.sprite(560, 260, null);
		this.computerTrigger.setSize(60, 60);
		this.computerTrigger.setVisible(false);
		this.computerTriggered = false;

		//create devling sprite images
		this.devlingSprites = {};

		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
		this.cameras.main.fadeIn(1000, 0, 0, 0);
	}

	spawnEmail() {
		this.emailIcon.setVisible(true);
		this.floatingMail.setVisible(true);
		this.floatingMail.setPosition(this.emailIcon.x, this.emailIcon.y - 20);
		this.nearEmail = false;

		this.mailSound.play();

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

	update() {
		this.player.update();

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
			Phaser.Input.Keyboard.JustDown(this.spaceKey)
		) {
			this.computerTriggered = true;

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
			this.computerTriggered
			//Phaser.Input.Keyboard.JustDown(this.spaceKey)
		) {
			this.computerTriggered = false;
		}
	}

	createTriggers() {
		this.stairsTrigger = this.physics.add
			.sprite(128, 160)
			.setSize(110, 25)
			.setVisible(false);
		this.stairsTriggered = false;

		this.doorTrigger = this.physics.add
			.sprite(850, 650)
			.setSize(110, 25)
			.setVisible(false);
		this.doorTriggered = false;
	}

	handleTriggers(bounds) {
		const stairsHit = Phaser.Geom.Intersects.RectangleToRectangle(
			bounds,
			this.stairsTrigger.getBounds()
		);
		const doorHit = Phaser.Geom.Intersects.RectangleToRectangle(
			bounds,
			this.doorTrigger.getBounds()
		);

		if (stairsHit && !this.stairsTriggered) {
			this.stairsTriggered = true;
			this.moveScene('secondFloor');
		} else if (!stairsHit) {
			this.stairsTriggered = false;
		}

		if (doorHit && this.spaceKey.isDown && !this.doorTriggered) {
			this.doorTriggered = true;
			this.moveScene('farmScene');
		} else if (!doorHit) {
			this.doorTriggered = false;
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
