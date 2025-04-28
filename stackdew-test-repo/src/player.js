import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		// this.setScale(0.9);

		// add player to scene
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.setSize(24, 20).setOffset(4, 45);

		// get control input from scene
		this.cursors = scene.input.keyboard.createCursorKeys();
		this.spacebar = scene.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		//player faces down on spawn
		this.lastDirection = 'down';

		//create animations in the scene
		this.createAnimations(scene);
	}

	createAnimations(scene) {
		//return early if animations already exist
		if (scene.anims.exists('walk-left')) return;

		scene.anims.create({
			key: 'walk-left',
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 124,
				end: 129,
			}),
			frameRate: 7,
			repeat: -1,
		});

		scene.anims.create({
			key: 'walk-right',
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 112,
				end: 117,
			}),
			frameRate: 7,
			repeat: -1,
		});

		scene.anims.create({
			key: 'walk-up',
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 118,
				end: 123,
			}),
			frameRate: 7,
			repeat: -1,
		});
		scene.anims.create({
			key: 'walk-down',
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 130,
				end: 135,
			}),
			frameRate: 7,
			repeat: -1,
		});
		scene.anims.create({
			key: 'disappointed',
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 200,
				end: 206,
			}),
			frameRate: 7,
			repeat: -1,
		});

		scene.anims.create({
			key: 'standing',
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 56,
				end: 60,
			}),
			frameRate: 7,
			repeat: -1,
		});
		scene.anims.create({
			key: 'mitchStanding',
			frames: this.anims.generateFrameNumbers('mitchSheet', {
				start: 56,
				end: 60,
			}),
			frameRate: 7,
			repeat: -1,
		});
		scene.anims.create({
			key: 'turning-forward',
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 79,
				end: 75,
			}),
			frameRate: 7,
			repeat: -1,
		});
		scene.anims.create({
			key: 'bossStanding',
			frames: this.anims.generateFrameNumbers('bossSheet', {
				start: 79,
				end: 75,
			}),
			frameRate: 7,
			repeat: -1,
		});
		scene.anims.create({
			key: 'celebrating',
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 510,
				end: 520,
			}),
			frameRate: 7,
			repeat: -1,
		});

		// initialise which direction player faces
		scene.lastDirection = 'down';
	}

	update() {
		//player movement speed
		const speed = 100;

		//stop player moving if not being told to move
		this.body.setVelocity(0);

		let direction = null;

		if (this.cursors.left.isDown) {
			this.body.setVelocityX(-speed);
			this.anims.play('walk-left', true);
			direction = 'left';
		} else if (this.cursors.right.isDown) {
			this.body.setVelocityX(speed);
			this.anims.play('walk-right', true);
			direction = 'right';
		} else if (this.cursors.up.isDown) {
			this.body.setVelocityY(-speed);
			this.anims.play('walk-up', true);
			direction = 'up';
		} else if (this.cursors.down.isDown) {
			this.body.setVelocityY(speed);
			this.anims.play('walk-down', true);
			direction = 'down';
		} else {
			this.anims.stop();
			// return to an idle frame if character stops
			switch (this.lastDirection) {
				case 'left':
					this.setFrame(2);
					break;
				case 'right':
					this.setFrame(0);
					break;
				case 'up':
					this.setFrame(1);
					break;
				case 'down':
					this.setFrame(3);
					break;
			}
		}

		//record players direction for returning an idle frame
		if (direction) {
			this.lastDirection = direction;
		}

		//no walking diagonally
		this.body.velocity.normalize().scale(speed);
	}
}
