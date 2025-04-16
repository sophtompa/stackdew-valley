import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		this.setScale(0.9);

		// add player to scene
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.setSize(32, 50).setOffset(0, 10);

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
				start: 4,
				end: 7,
			}),
			frameRate: 4,
			repeat: -1,
		});

		scene.anims.create({
			key: 'walk-right',
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 12,
				end: 15,
			}),
			frameRate: 4,
			repeat: -1,
		});

		scene.anims.create({
			key: 'walk-up',
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 8,
				end: 11,
			}),
			frameRate: 4,
			repeat: -1,
		});
		scene.anims.create({
			key: 'walk-down',
			frames: this.anims.generateFrameNumbers('playerSheet', {
				start: 0,
				end: 2,
			}),
			frameRate: 4,
			repeat: -1,
		});

		// initialise which direction player faces
		scene.lastDirection = 'down';
	}

	update() {
		//player movement speed
		const speed = 200;

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
					this.setFrame(35);
					break;
				case 'right':
					this.setFrame(16);
					break;
				case 'up':
					this.setFrame(8);
					break;
				case 'down':
					this.setFrame(0);
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
