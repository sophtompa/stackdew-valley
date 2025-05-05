import Phaser from 'phaser';

export default class minigameSnake extends Phaser.Scene {
	constructor() {
		super('minigameSnake');
		this.snakeSprites = [];
	}

	preload() {
		this.load.image(
			'snakeSegment',
			'../assets/minigames/snake/snakeSegment.png'
		);
	}

	create() {
		//set up grid
		this.cellSize = 32;
		this.gridWidth = this.scale.width / this.cellSize;
		this.gridHeight = this.scale.height / this.cellSize;

		//initialise snake
		this.initialiseSnake();

		//initialise food system
		this.foodItems = [];

		// get control input from scene
		this.cursors = this.input.keyboard.createCursorKeys();

		this.time.addEvent({
			//snake speed
			delay: 150,
			loop: true,
			callback: this.moveSnake,
			callbackScope: this,
		});

		// //test food spawn names
		// const foodNames = [
		// 	'const',
		// 	'let',
		// 	'var',
		// 	'===',
		// 	'tween',
		// 	'Math',
		// 	'destroy',
		// 	'this',
		// ];

		// //test food spawn delay times
		// const minDelay = 3000;
		// const maxDelay = 6000;

		// this.startFoodSpawning(foodNames, minDelay, maxDelay);
	}

	update() {
		//handle input
		if (this.cursors.left.isDown) this.newDirection = { x: -1, y: 0 };
		else if (this.cursors.right.isDown) this.newDirection = { x: 1, y: 0 };
		else if (this.cursors.up.isDown) this.newDirection = { x: 0, y: -1 };
		else if (this.cursors.down.isDown) this.newDirection = { x: 0, y: 1 };

		//prevent snake turning back on itself
		if (
			this.newDirection &&
			!this.isOpposite(this.newDirection, this.direction)
		) {
			this.direction = this.newDirection;
		}
	}

	moveSnake() {
		const head = this.snake[0];

		//newHead is current head plus direction value
		const newHead = {
			x: head.x + this.direction.x,
			y: head.y + this.direction.y,
		};

		if (
			newHead.x < 0 ||
			newHead.x >= this.gridWidth ||
			newHead.y < 0 ||
			newHead.y >= this.gridHeight
		) {
			this.endGame();
			return;
		}

		//add new head position to front of snake array
		this.snake.unshift(newHead);

		//check to see if we ate food
		if (!this.justAteFood) {
			//remove last segment if not
			this.snake.pop();
		} else {
			//do nothing
			this.justAteFood = false;
		}

		//render snake
		this.renderSnake();
	}

	initialiseSnake() {
		//set initial snake position
		this.snake = [
			{ x: 10, y: 7 },
			{ x: 9, y: 7 },
			{ x: 8, y: 7 },
		];

		//set initial snake direction right
		this.direction = { x: 1, y: 0 };

		//snake has not just eaten food
		this.justAteFood = false;
		this.newDirection = null;

		this.snakeSprites = [];

		this.snake.forEach((segment, index) => {
			const sprite = this.add.sprite(
				segment.x * this.cellSize + this.cellSize / 2,
				segment.y * this.cellSize + this.cellSize / 2,
				'snakeSegment'
			);
			sprite.setDepth(5);
			if (index === 0) sprite.setScale(1.2);
			else sprite.setScale(0.8);

			this.snakeSprites.push(sprite);
		});
		this.snakeHead = this.snakeSprites[0];
	}

	renderSnake() {
		this.snake.forEach((segment, index) => {
			const sprite = this.snakeSprites[index];

			if (!sprite) {
				sprite = this.add.sprite(0, 0, 'snakeSegment');
				this.snakeSprites.push(sprite);
			}

			if (index === 0) {
				// make head normal size and on top
				sprite.setScale(1.0);
				sprite.setDepth(6);
			} else {
				// make body segments smaller and underneath
				sprite.setScale(0.7);
				sprite.setDepth(5);
			}

			// // Destroy all and recreate (simpler for now)
			// this.snakeSprites.forEach((sprite) => sprite.destroy());
			// this.snakeSprites = [];

			// this.snake.forEach((segment, index) => {
			// 	const sprite = this.add.sprite(
			// 		segment.x * this.cellSize + this.cellSize / 2,
			// 		segment.y * this.cellSize + this.cellSize / 2,
			// 		'snakeSegment'
			// 	);
			// 	sprite.setDepth(index === 0 ? 6 : 5);
			// 	sprite.setScale(index === 0 ? 1.2 : 0.7);
			// 	this.snakeSprites.push(sprite);

			this.tweens.add({
				targets: sprite,
				x: segment.x * this.cellSize + this.cellSize / 2,
				y: segment.y * this.cellSize + this.cellSize / 2,
				duration: 150,
				ease: 'Linear',
			});
		});
	}

	isOpposite(dir1, dir2) {
		return dir1.x === -dir2.x && dir1.y === -dir2.y;
	}

	// startFoodSpawning(foodNames, minDelay, maxDelay) {
	// 	const spawn = () => {
	// 		const maxFoodItems = 5;
	// 		if (this.foodItems.length >= maxFoodItems) {
	// 			const nextDelay = Phaser.Math.Between(minDelay, maxDelay);
	// 			this.time.delayedCall(nextDelay, spawn, [], this);
	// 			return;
	// 		}

	// 		const randomWord = Phaser.Utils.Array.GetRandom(foodNames);
	// 		this.spawnRandomSyntaxFood(randomWord);

	// 		const nextDelay = Phaser.Math.Between(minDelay, maxDelay);
	// 		this.time.delayedCall(nextDelay, spawn, [], this);
	// 	};

	// 	spawn();
	// }

	// getValidFoodPosition(gridSpan = 1) {
	// 	const allPositions = [];

	// 	//now handles longer text that spans 2 grid cells for better flexibility

	// 	//get all top-left positions where a gridSpan-wide item could fit
	// 	for (let y = 0; y < this.gridHeight; y++) {
	// 		for (let x = 0; x <= this.gridWidth - gridSpan; x++) {
	// 			allPositions.push({ x, y });
	// 		}
	// 	}

	// 	const occupiedSnake = this.snake.map((seg) => `${seg.x},${seg.y}`);
	// 	const occupiedFood = this.foodItems.flatMap((f) => {
	// 		//mark all grid cells occupied by each food
	// 		const cells = [];
	// 		for (let i = 0; i < f.gridSpan || 1; i++) {
	// 			cells.push(`${f.gridX + i},${f.gridY}`);
	// 		}
	// 		return cells;
	// 	});

	// 	const isOccupied = (x, y) => {
	// 		return (
	// 			occupiedSnake.includes(`${x},${y}`) ||
	// 			occupiedFood.includes(`${x},${y}`)
	// 		);
	// 	};

	// 	//filter valid positions where no part of the food collides
	// 	const validPositions = allPositions.filter(({ x, y }) => {
	// 		for (let i = 0; i < gridSpan; i++) {
	// 			if (isOccupied(x + i, y)) return false;
	// 		}
	// 		return true;
	// 	});

	// 	//if no valid positions exist, return null
	// 	if (validPositions.length === 0) return null;

	// 	//pick a random valid position
	// 	return Phaser.Utils.Array.GetRandom(validPositions);
	// }

	// createFoodTokenTexture(key, label) {
	// 	const padding = 10;
	// 	const charWidth = 8;
	// 	const width = Math.max(32, label.length * charWidth + padding);
	// 	const height = 32;

	// 	const text = this.add.text(0, 0, label, {
	// 		fontFamily: 'monospace',
	// 		fontSize: '10px',
	// 		color: '#ffffff',
	// 		backgroundColor: '#222222',
	// 		padding: { x: 2, y: 2 },
	// 	});
	// 	text.setOrigin(0.5);
	// 	text.setPosition(width / 2, height / 2);

	// 	//draw text on render texture (size is 32x32)
	// 	const rt = this.add.renderTexture(0, 0, width, height);
	// 	rt.draw(text);

	// 	//generate texture that is useable later
	// 	rt.saveTexture(key);

	// 	//cleanup
	// 	text.destroy();
	// 	rt.destroy();
	// }

	// spawnRandomSyntaxFood(optionText) {
	// 	const approxGridSpan = Math.ceil(
	// 		(optionText.length * 8 + 10) / this.cellSize
	// 	);
	// 	const gridPos = this.getValidFoodPosition(approxGridSpan);

	// 	//return empty if no positions avilable
	// 	if (!gridPos) return;

	// 	const x = gridPos.x * this.cellSize + (approxGridSpan * this.cellSize) / 2;
	// 	const y = gridPos.y * this.cellSize + this.cellSize / 2;
	// 	const food = this.spawnSyntaxFood(optionText, x, y);

	// 	food.gridX = gridPos.x;
	// 	food.gridY = gridPos.y;
	// 	food.gridSpan = approxGridSpan;

	// 	this.foodItems.push(food);

	// 	this.time.delayedCall(15000, () => {
	// 		if (this.foodItems.includes(food)) {
	// 			this.foodItems = this.foodItems.filter((f) => f !== food);
	// 			food.destroy();
	// 		}
	// 	});
	// }

	// spawnSyntaxFood(optionText, x, y, textureKeyPrefix = 'food_') {
	// 	const textureKey = textureKeyPrefix + optionText;

	// 	//if texture doesn't exist yet, create it
	// 	if (!this.textures.exists(textureKey)) {
	// 		this.createFoodTokenTexture(textureKey, optionText);
	// 	}
	// 	console.log('Texture created:', textureKey);

	// 	//create the physics sprite using the texture
	// 	const food = this.physics.add.sprite(x, y, textureKey);
	// 	food.setOrigin(0.5);
	// 	food.setImmovable(true);
	// 	food.setDepth(7);
	// 	food.optionText = optionText;

	// 	// custom width and grid info
	// 	const wordLength = optionText.length;
	// 	food.wordLength = wordLength;
	// 	food.gridSpan = Math.ceil((wordLength * 8 + 10) / this.cellSize);

	// 	console.log('Spawning food:', optionText, 'at', x, ',', y);

	// 	return food;
	// }

	// checkAnswer(answer) {
	// 	const correct = 'const'; // for now, hardcoded
	// 	if (answer === correct) {
	// 		console.log(`correct ${answer}`);
	// 		this.justAteFood = true;
	// 	} else {
	// 		console.log(`wrong ${answer}`);
	// 		this.endGame();
	// 	}
	// }

	endGame() {
		this.scene.pause();
		this.add
			.text(400, 224, 'YOU DIED.', {
				fontSize: '32px',
				color: '#ff0000',
			})
			.setOrigin(0.5)
			.setDepth(10);
		console.log('snake hit wall');
	}
}
