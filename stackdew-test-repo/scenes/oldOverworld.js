// import Phaser from 'phaser';

// export default class overworldScene extends Phaser.Scene {
// 	constructor() {
// 		super('overworldScene');
// 	}

// 	preload() {
// 		this.load.tilemapTiledJSON('map', '../assets/overworld.JSON');
// 		this.load.image('mapImage', '../assets/1_Terrains_32x32.png');
// 		this.load.spritesheet('playerSheet', '../assets/farmer.png', {
// 			frameWidth: 64,
// 			frameHeight: 64,
// 		});
// 	}

// 	create() {
// 		//scene fades in
// 		this.cameras.main.fadeIn(1000, 0, 0, 0);

// 		// create map
// 		const map = this.make.tilemap({ key: 'map' });
// 		const tilesets = map.addTilesetImage('1_Terrains_32x32', 'mapImage');
// 		this.add.image(0, 0, 'mapImage').setOrigin(0, 0);
// 		const mapLayer = map.createLayer('grass', tilesets, 0, 0);
// 		mapLayer.setCollisionByProperty({ collide: true });
// 		this.locationLayer = map.createLayer('locations', tilesets, 0, 0);
// 		this.locationLayer.setCollisionByProperty({ collide: true });

// 		// // DEBUG graphics to show tile collision shapes
// 		// const debugGraphics = this.add.graphics().setAlpha(0.75);
// 		// this.locationLayer.renderDebug(debugGraphics, {
// 		// 	tileColor: null,
// 		// 	collidingTileColor: new Phaser.Display.Color(255, 0, 0, 255),
// 		// 	faceColor: new Phaser.Display.Color(0, 255, 0, 255),
// 		// });

// 		// create player sprite
// 		this.player = this.physics.add.sprite(250, 300, 'playerSheet');
// 		this.player.setSize(15, 8).setOffset(24, 38);

// 		// make player collide with map
// 		this.physics.add.collider(this.player, mapLayer);

// 		// // make player overlap the 'location' areas on the map
// 		// this.physics.add.overlap(this.player, this.locationLayer);

// 		// create cursor controls and spacebar
// 		this.cursors = this.input.keyboard.createCursorKeys();
// 		this.spacebar = this.input.keyboard.addKey(
// 			Phaser.Input.Keyboard.KeyCodes.SPACE
// 		);

// 		this.anims.create({
// 			key: 'walk-left',
// 			frames: this.anims.generateFrameNumbers('playerSheet', {
// 				start: 56,
// 				end: 61,
// 			}),
// 			frameRate: 10,
// 			repeat: -1,
// 		});

// 		this.anims.create({
// 			key: 'walk-right',
// 			frames: this.anims.generateFrameNumbers('playerSheet', {
// 				start: 48,
// 				end: 53,
// 			}),
// 			frameRate: 10,
// 			repeat: -1,
// 		});

// 		this.anims.create({
// 			key: 'walk-up',
// 			frames: this.anims.generateFrameNumbers('playerSheet', {
// 				start: 40,
// 				end: 45,
// 			}),
// 			frameRate: 10,
// 			repeat: -1,
// 		});
// 		this.anims.create({
// 			key: 'walk-down',
// 			frames: this.anims.generateFrameNumbers('playerSheet', {
// 				start: 32,
// 				end: 37,
// 			}),
// 			frameRate: 10,
// 			repeat: -1,
// 		});

// 		// initialise which direction player faces
// 		this.lastDirection = 'down';
// 	}

// 	update() {
// 		const speed = 100;
// 		const player = this.player;
// 		const cursors = this.cursors;

// 		player.body.setVelocity(0);

// 		let direction = null;

// 		if (cursors.left.isDown) {
// 			player.body.setVelocityX(-speed);
// 			player.anims.play('walk-left', true);
// 			direction = 'left';
// 		} else if (cursors.right.isDown) {
// 			player.body.setVelocityX(speed);
// 			player.anims.play('walk-right', true);
// 			direction = 'right';
// 		} else if (cursors.up.isDown) {
// 			player.body.setVelocityY(-speed);
// 			player.anims.play('walk-up', true);
// 			direction = 'up';
// 		} else if (cursors.down.isDown) {
// 			player.body.setVelocityY(speed);
// 			player.anims.play('walk-down', true);
// 			direction = 'down';
// 		} else {
// 			player.anims.stop();
// 			// return to an idle frame if character stops
// 			switch (this.lastDirection) {
// 				case 'left':
// 					player.setFrame(24);
// 					break;
// 				case 'right':
// 					player.setFrame(16);
// 					break;
// 				case 'up':
// 					player.setFrame(8);
// 					break;
// 				case 'down':
// 					player.setFrame(0);
// 					break;
// 			}
// 		}

// 		// record players direction for returning an idle frame
// 		if (direction) {
// 			this.lastDirection = direction;
// 		}

// 		// no walking diagonally
// 		player.body.velocity.normalize().scale(speed);

// 		// this.physics.add.overlap(this.player, this.locationLayer, () => {
// 		// 	console.log('Player is overlapping the location layer!');
// 		// });

// 		// check for overlap with location tiles
// 		// if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
// 		// 	const feetX = this.player.x;
// 		// 	const feetY = this.player.y + 16; // adjust if needed based on testing

// 		// 	const tile = this.locationLayer.getTileAtWorldXY(feetX, feetY);

// 		// 	if (tile && tile.properties.collide) {
// 		// 		console.log('unacceptable');
// 		// 	}
// 		// }
// 	}
// }
