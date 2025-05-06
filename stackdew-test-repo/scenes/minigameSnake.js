import Phaser from 'phaser';
import DialogueManager from '../src/dialogueManager.js';

export default class minigameSnake extends Phaser.Scene {
	constructor() {
		super('minigameSnake');
		this.snakeSprites = [];
		this.activeGrowthTweens = [];
		this.activeGrowthTimers = [];
		this.hasDied = false;
	}

	preload() {
		//map image
		this.load.image('snakemud', '../assets/minigames/snake/snakemud.png');

		//snake sprite
		this.load.image(
			'snakeSegment',
			'../assets/minigames/snake/snakeSegment.png'
		);

		//weed sprite
		this.load.image('weed', '../assets/minigames/snake/weed.png');

		//lump sprite
		this.load.image('lump', '../assets/minigames/snake/lump.png');

		this.load.audio('foodSound', '../assets/minigames/snake/food.wav');
		this.load.audio('dieSound', '../assets/minigames/snake/die.wav');
		this.load.audio('growSound', '../assets/minigames/snake/grow.wav');
		this.load.audio('endgrowSound', '../assets/minigames/snake/endgrow.wav');
		this.load.audio('youdiedSound', '../assets/minigames/snake/youdied.wav');
		this.load.audio('lumpSound', '../assets/planting.wav');
		this.load.audio('speechSound', '../assets/speechSound.wav');
	}

	create() {
		//set up grid
		this.cellSize = 32;
		this.gridWidth = this.scale.width / this.cellSize;
		this.gridHeight = this.scale.height / this.cellSize;

		//draw background
		this.add.image(400, 224, 'snakemud');

		//initialise audio
		this.foodSound = this.sound.add('foodSound');
		this.dieSound = this.sound.add('dieSound');
		this.growSound = this.sound.add('growSound');
		this.endgrowSound = this.sound.add('endgrowSound');
		this.youdiedSound = this.sound.add('youdiedSound');
		this.lumpSound = this.sound.add('lumpSound');

		//initialise dialogue manager
		this.dialogue = new DialogueManager(this);
		this.isDialogueRunning = false;

		this.dialogue.startDialogue(
			[
				{
					text: ` Hey there Danger Noodle!`,
					speaker: '',
					color: '#1f451c',
					x: 250,
					y: 20,
				},
				{
					text: `Be a good Snek and eat up all of the tasty weeds. Nom. Nom. Nom.`,
					speaker: '',
					color: '#1f451c',
					x: 200,
					y: 20,
				},
				{
					text: `Don't eat the Devlings as they start to sprout because that would make Rose a sad Panda.`,
					speaker: '',
					color: '#1f451c',
					x: 200,
					y: 20,
				},
				{
					text: `Also the DfE would start asking difficult questions ...`,
					speaker: '',
					color: '#1f451c',
					x: 225,
					y: 20,
				},
				{
					text: `I digress ...`,
					speaker: '',
					color: '#1f451c',
					x: 300,
					y: 20,
				},
				{
					text: `Arrow keys to move, press Space to start.`,
					speaker: '',
					color: '#1f451c',
					x: 220,
					y: 20,
				},
			],
			null,
			240,
			20
		);

		// Wait for spacebar to begin the countdown
		this.input.keyboard.once('keydown-SPACE', () => {
			//stop any ongoing dialogue
			if (this.dialogue) {
				this.dialogue.stopDialogue();
			}

			this.startCountdown();

			// Start game systems after countdown finishes (4s total)
			this.time.delayedCall(4000, () => {
				this.spawnFoodTimer();
				this.spawnLumpTimer();
			});
		});

		//initialise snake and movement
		this.initialiseSnake();
		this.nextDirection = null;
		this.directionChangedThisStep = false;

		//initialise food system
		this.food = null;
		this.justAteFood = false;

		// get control input from scene
		this.cursors = this.input.keyboard.createCursorKeys();

		//create slowmo key for debugging
		this.input.keyboard.on('keydown-S', () => {
			this.time.timeScale = this.time.timeScale === 1 ? 0.25 : 1;
		});
	}

	update() {
		//no update if we're frozen (for countdown)
		if (this.sceneIsFrozen) return;

		//handle input
		if (this.directionChangedThisStep) return;

		if (this.cursors.left.isDown && this.direction.x !== 1) {
			this.nextDirection = { x: -1, y: 0 };
			this.directionChangedThisStep = true;
		} else if (this.cursors.right.isDown && this.direction.x !== -1) {
			this.nextDirection = { x: 1, y: 0 };
			this.directionChangedThisStep = true;
		} else if (this.cursors.up.isDown && this.direction.y !== 1) {
			this.nextDirection = { x: 0, y: -1 };
			this.directionChangedThisStep = true;
		} else if (this.cursors.down.isDown && this.direction.y !== -1) {
			this.nextDirection = { x: 0, y: 1 };
			this.directionChangedThisStep = true;
		}
		//prevent snake turning back on itself
		if (
			this.nextDirection &&
			!this.isOpposite(this.nextDirection, this.direction)
		) {
			this.direction = this.nextDirection;
		}
	}

	initialiseSnake() {
		//set initial snake position
		this.snake = [
			{ x: 13, y: 9 },
			{ x: 12, y: 9 },
			{ x: 11, y: 9 },
		];

		//set initial snake direction right
		this.direction = { x: 1, y: 0 };
		this.newDirection = { x: 1, y: 0 };

		this.snakeSprites = [];

		this.snake.forEach((segment, index) => {
			const x = segment.x * this.cellSize + this.cellSize / 2;
			const y = segment.y * this.cellSize + this.cellSize / 2;

			const sprite = this.add.sprite(x, y, 'snakeSegment');
			const shadow = this.add.sprite(x - 2, y + 2, 'snakeSegment');
			shadow.setTint(0x000000).setAlpha(0.3).setDepth(4);

			sprite.setDepth(5);
			sprite.setScale(index === 0 ? 1.2 : 0.8);
			shadow.setScale(index === 0 ? 1.1 : 0.7);

			this.snakeSprites.push({ sprite, shadow });
		});
		this.snakeHead = this.snakeSprites[0];
	}

	renderSnake() {
		//no rerendered snake for the dead
		if (this.hasDied) return;

		this.snake.forEach((segment, index) => {
			const x = segment.x * this.cellSize + this.cellSize / 2;
			const y = segment.y * this.cellSize + this.cellSize / 2;

			let entry = this.snakeSprites[index];

			//f the sprite/shadow pair doesn't exist, create them
			if (!entry) {
				const sprite = this.add.sprite(x, y, 'snakeSegment');
				const shadow = this.add.sprite(x - 2, y + 2, 'snakeSegment');
				shadow.setTint(0x000000).setAlpha(0.5).setDepth(4);

				entry = { sprite, shadow };
				this.snakeSprites[index] = entry;
			}

			const { sprite, shadow } = entry;

			//tween shadow
			this.tweens.add({
				targets: shadow,
				x: x - 2,
				y: y + 2,
				duration: 150,
				ease: 'Linear',
			});

			//tween snake sprite
			this.tweens.add({
				targets: sprite,
				x,
				y,
				duration: 150,
				ease: 'Linear',
			});

			//set scale and depth
			if (index === 0) {
				sprite.setScale(1.0);
				sprite.setDepth(6);
			} else {
				sprite.setScale(0.7);
				sprite.setDepth(5);
			}
		});
	}

	moveSnake() {
		//no movement for the dead
		if (this.hasDied) return;

		//no movement if we're frozen (for countdown)
		if (this.sceneIsFrozen) return;

		//apply new direction once per move
		if (
			this.nextDirection &&
			!this.isOpposite(this.nextDirection, this.direction)
		) {
			this.direction = this.nextDirection;
		}
		this.nextDirection = null;
		this.directionChangedThisStep = false;

		//pass snake head position into head variable
		const head = this.snake[0];

		//newHead is current head plus direction value
		const newHead = {
			x: head.x + this.direction.x,
			y: head.y + this.direction.y,
		};

		//check for newHead hitting wall at edge of grid
		if (
			newHead.x < 0 ||
			newHead.x >= this.gridWidth ||
			newHead.y < 0 ||
			newHead.y >= this.gridHeight
		) {
			this.endGame();
			return;
		}

		//psyically add new head position to front of snake array
		this.snake.unshift(newHead);

		//check to see if snake collides with itself
		for (let i = 1; i < this.snake.length; i++) {
			if (newHead.x === this.snake[i].x && newHead.y === this.snake[i].y) {
				this.endGame();
				return;
			}
		}

		//check for collision with lump
		if (
			this.lump &&
			newHead.x === this.lump.gridX &&
			newHead.y === this.lump.gridY
		) {
			this.endGame();
			return;
		}

		const ateFood =
			this.food &&
			newHead.x === this.food.gridX &&
			newHead.y === this.food.gridY;

		//store tail segment BEFORE removing it
		const realTail = { ...this.snake[this.snake.length - 1] };

		//always pop tail (ie don't grow immediately)
		this.snake.pop();

		if (ateFood) {
			this.food.destroy();
			this.foodShadow.destroy();
			this.food = null;

			this.renderSnake();
			this.animateSnakeGrowth(realTail);
		} else {
			//normal movement remove tail
			this.renderSnake();
		}
	}

	isOpposite(dir1, dir2) {
		return dir1.x === -dir2.x && dir1.y === -dir2.y;
	}

	spawnFoodTimer() {
		const delay = Phaser.Math.Between(2000, 4000);
		this.time.delayedCall(delay, () => {
			if (!this.food) {
				this.spawnFood();
			}
			this.spawnFoodTimer();
		});
	}

	spawnLumpTimer() {
		const delay = Phaser.Math.Between(4000, 8000);
		this.time.delayedCall(delay, () => {
			this.spawnLump();
			this.spawnLumpTimer();
		});
	}

	spawnFood() {
		//no food for the dead
		if (this.hasDied) return;

		//destroy old food
		if (this.food) {
			this.food.destroy();
			this.foodShadow.destroy();
		}

		const allPositions = [];

		//calculate all possible positions in grid
		for (let y = 0; y < this.gridHeight; y++) {
			for (let x = 0; x < this.gridWidth; x++) {
				allPositions.push({ x, y });
			}
		}

		//record all positions currently filled by snake
		const snakePositions = this.snake.map((seg) => `${seg.x},${seg.y}`);

		//record all positions currently filled by lumps
		const lumpKey = this.lump ? `${this.lump.gridX},${this.lump.gridY}` : null;

		//work out valid positions for food (valid = all - snake) )
		const validPositions = allPositions.filter((pos) => {
			const key = `${pos.x},${pos.y}`;
			const head = this.snake[0];
			const distance = Math.abs(pos.x - head.x) + Math.abs(pos.y - head.y);

			//Ensure it’s not overlapping snake, not overlapping lump, and not too close to head
			const overlapsSnake = snakePositions.includes(key);
			const overlapsLump =
				this.lump && pos.x === this.lump.gridX && pos.y === this.lump.gridY;

			return !overlapsSnake && !overlapsLump && distance > 3;
		});

		//return if no valid positions available
		if (validPositions.length === 0) return;

		const pos = Phaser.Utils.Array.GetRandom(validPositions);
		const x = pos.x * this.cellSize + this.cellSize / 2;
		const y = pos.y * this.cellSize + this.cellSize / 2;

		this.food = this.add.image(x, y, 'weed').setDepth(4).setScale(1);
		this.foodShadow = this.add
			.image(x - 2, y + 2, 'weed')
			.setDepth(3)
			.setScale(1.5)
			.setAlpha(0.4)
			.setTint('0x000000');

		//record food grid position
		this.food.gridX = pos.x;
		this.food.gridY = pos.y;

		//play sound at different pitches
		const pitch = Phaser.Math.FloatBetween(0.8, 1.2);
		this.foodSound.play({ rate: pitch });

		//make food 'pulse'
		this.tweens.add({
			targets: this.food,
			duration: 400,
			yoyo: true,
			repeat: -1,
			tint: 0xffffff,
			scale: { from: 1, to: 1.5 },
			ease: 'Sine.easeInOut',
		});

		this.tweens.add({
			targets: this.foodShadow,
			duration: 400,
			yoyo: true,
			repeat: -1,
			scale: { from: 1, to: 1.5 },
			ease: 'Sine.easeInOut',
		});
	}

	spawnLump() {
		//no lumps for the dead
		if (this.hasDied) return;

		const allPositions = [];

		//calculate all possible positions in grid
		for (let y = 0; y < this.gridHeight; y++) {
			for (let x = 0; x < this.gridWidth; x++) {
				allPositions.push({ x, y });
			}
		}

		//record all positions currently filled by snake
		const snakePositions = this.snake.map((seg) => `${seg.x},${seg.y}`);

		//record all position currently filled by food
		const foodKey = this.food ? `${this.food.gridX},${this.food.gridY}` : null;

		//work out valid positions for lump (valid = all - snake, - food) )
		const validPositions = allPositions.filter((pos) => {
			const key = `${pos.x},${pos.y}`;
			const head = this.snake[0];
			const distance = Math.abs(pos.x - head.x) + Math.abs(pos.y - head.y);

			//ensure it’s not overlapping snake, not overlapping lump, and not too close to head
			const overlapsSnake = snakePositions.includes(key);
			const overlapsFood =
				this.food && pos.x === this.food.gridX && pos.y === this.food.gridY;

			//return if chosen spot is filled with snake or food or its too close to snake head
			return !overlapsSnake && !overlapsFood && distance > 3;
		});

		//return if no valid positions available
		if (validPositions.length === 0) return;

		const pos = Phaser.Utils.Array.GetRandom(validPositions);
		const x = pos.x * this.cellSize + this.cellSize / 2;
		const y = pos.y * this.cellSize + this.cellSize / 2;

		this.lump = this.add.image(x, y, 'lump').setDepth(4).setScale(1);
		this.lumpShadow = this.add
			.image(x - 2, y + 2, 'weed')
			.setDepth(3)
			.setScale(1.5)
			.setAlpha(0.4)
			.setTint('0x000000');

		this.lumpSound.play();

		//record lump grid position
		this.lump.gridX = pos.x;
		this.lump.gridY = pos.y;
	}

	animateSnakeGrowth(onComplete) {
		//can't grow if yer dead
		if (this.hasDied) return;

		this.activeGrowthTweens = [];
		this.activeGrowthTimers = [];

		this.snake.forEach((segment, index) => {
			const entry = this.snakeSprites[index];
			if (!entry || !entry.sprite || !entry.shadow) return;

			const { sprite, shadow } = entry;

			//grow sound (detuned per segment)
			const timer = this.time.delayedCall(index * 75, () => {
				this.growSound.setDetune(index * 75).play();
			});
			this.activeGrowthTimers.push(timer);

			//bulge main sprite
			const spriteTween = this.tweens.add({
				targets: sprite,
				scaleX: sprite.scaleX * 1.5,
				scaleY: sprite.scaleY * 1.5,
				duration: 100,
				yoyo: true,
				delay: index * 50,
				ease: 'Sine.easeInOut',
			});
			this.activeGrowthTweens.push(spriteTween);

			//bulge shadow
			const shadowTween = this.tweens.add({
				targets: shadow,
				scaleX: shadow.scaleX * 1.2,
				scaleY: shadow.scaleY * 1.2,
				duration: 100,
				yoyo: true,
				delay: index * 50,
				ease: 'Sine.easeInOut',
			});
			this.activeGrowthTweens.push(shadowTween);
		});

		//delay tail growth until bulge SFX finishes
		const bulgeFinishDelay = (this.snake.length - 1) * 75;
		const tailTimer = this.time.delayedCall(bulgeFinishDelay, () => {
			if (this.hasDied) return;

			const tail = this.snake[this.snake.length - 1];
			this.snake.push({ ...tail });

			const sprite = this.add
				.sprite(
					tail.x * this.cellSize + this.cellSize / 2,
					tail.y * this.cellSize + this.cellSize / 2,
					'snakeSegment'
				)
				.setScale(1)
				.setAlpha(0)
				.setDepth(4);

			const shadow = this.add
				.sprite(
					tail.x * this.cellSize + this.cellSize / 2 - 2,
					tail.y * this.cellSize + this.cellSize / 2 + 2,
					'snakeSegment'
				)
				.setTint(0x000000)
				.setAlpha(0)
				.setDepth(3)
				.setScale(0.7);

			//play final grow sound *as* segment is added
			this.endgrowSound.play({ rate: 1.2 });

			this.snakeSprites.push({ sprite, shadow });

			this.activeGrowthTweens.push(
				this.tweens.add({
					targets: sprite,
					alpha: 1,
					scale: 0.7,
					duration: 300,
					delay: 0,
					ease: 'Back.Out',
				})
			);

			this.activeGrowthTweens.push(
				this.tweens.add({
					targets: shadow,
					alpha: 0.5,
					scale: 0.7,
					duration: 300,
					delay: 0,
					ease: 'Back.Out',
				})
			);
		});
		this.activeGrowthTimers.push(tailTimer);
	}

	startGameLoop() {
		this.snakeMoveTimer = this.time.addEvent({
			delay: 150,
			loop: true,
			callback: this.moveSnake,
			callbackScope: this,
		});
	}

	startCountdown() {
		const countdownNumbers = ['3', '2', '1', 'GO!'];
		let delay = 0;

		const text = this.add
			.text(400, 224, '', {
				fontFamily: 'VT323',
				fontSize: '84px',
				color: '#ff0000',
			})
			.setOrigin(0.5)
			.setDepth(20);

		//block input and updates
		this.sceneIsFrozen = true;

		countdownNumbers.forEach((number, index) => {
			this.time.delayedCall(delay, () => {
				text.setText(number);
				text.setAlpha(0);
				text.setScale(0.5);
				text.setShadow(3, 3, '#000000', 4, false, true);

				this.tweens.add({
					targets: text,
					alpha: 1,
					scale: 1,
					duration: 400,
					yoyo: true,
					ease: 'Sine.easeInOut',
				});

				if (number !== 'GO!') {
					this.foodSound.play({ rate: 0.8 });
				} else {
					this.endgrowSound.play();
				}
			});
			delay += 1000;
		});

		//unfreeze after countdown completed and start snake movement
		this.time.delayedCall(delay, () => {
			text.destroy();
			this.sceneIsFrozen = false;
			this.startGameLoop();
		});
	}

	endGame() {
		//you only die once
		if (this.hasDied) return;
		this.hasDied = true;

		//cancel queued growth animations and sounds
		if (this.activeGrowthTweens) {
			this.activeGrowthTweens.forEach((tween) => tween.stop());
			this.activeGrowthTweens = [];
		}
		if (this.activeGrowthTimers) {
			this.activeGrowthTimers.forEach((timer) => timer.remove());
			this.activeGrowthTimers = [];
		}

		//kill all other animations (weed pulsing etc)
		this.tweens.killAll();

		//play sound
		this.dieSound.setVolume(0.3).play();

		//initialise fade to black
		const fade = this.add
			.rectangle(400, 224, 800, 448, 0x000000)
			.setAlpha(0)
			.setDepth(10);

		//initialise text
		const deathText = this.add
			.text(400, 224, 'YOU DIED.', {
				fontFamily: 'VT323',
				fontSize: '32px',
				color: '#ff0000',
			})
			.setOrigin(0.5)
			.setAlpha(0)
			.setDepth(11)
			.setScale(1.6);

		//fade in the black background
		this.tweens.add({
			targets: fade,
			alpha: 1,
			duration: 1800,
			ease: 'Linear',
			onComplete: () => {
				this.youdiedSound.setVolume(0.6).play();
				//fade in the red text
				this.tweens.add({
					targets: deathText,
					alpha: 1,
					duration: 2500,
					scale: { from: 1.6, to: 2 },
					ease: 'Cubic.easeOut',
					onComplete: () => {
						//then pause the scene
						this.scene.pause();
					},
				});
			},
		});
	}
}
