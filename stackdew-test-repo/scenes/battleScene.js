import Phaser from 'phaser';

export default class battleScene extends Phaser.Scene {
	constructor() {
		super('battleScene');
	}

	preload() {
		this.load.image('jobApproach', '../assets/battlewithapproach.png');

		this.load.spritesheet('playerSheet', 'assets/dummy.png', {
			frameWidth: 32,
			frameHeight: 61,
		});

		this.load.spritesheet('fire', '../assets/burning_loop_3.png', {
			frameWidth: 15,
			frameHeight: 24,
		});

		// this.load.bitmapFont(
		// 	'retroFont',
		// 	'../assets/monogram-italic-bitmap.png',
		// 	'../assets/monogram-bitmap.json'
		// );
	}

	create() {
		this.add.image(0, 0, 'jobApproach').setOrigin(0, 0);

		this.add.sprite(300, 1000, 'playerSheet');

		this.cameras.main.setScroll(0, 4030);

		//create flame animated sprites
		this.anims.create({
			key: 'flame',
			frames: this.anims.generateFrameNumbers('fire', { start: 0, end: 5 }),
			frameRate: 6,
			repeat: -1,
		});
		const flame1 = this.add.sprite(47, 329, 'fire');
		const flame2 = this.add.sprite(750, 41, 'fire');
		flame1.play('flame').setScale(2.5).setFrame(3);
		flame2.play('flame').setScale(2.5);

		this.doCutScene();
	}

	moveScene() {
		this.cameras.main.fadeOut(1000, 0, 0, 0);
		this.time.delayedCall(1000, () => {
			this.scene.start('overworldScene');
		});
	}

	update() {}

	doCutScene() {
		//initial pan up to door of building
		this.cameras.main.pan(
			400,
			3400,
			7000,
			'Sine.easeInOut',
			false,
			(camera, progress) => {
				// above callback checks to see if the first pan is finished
				// then we pause to allow npc conversation welcome in building
				if (progress === 1) {
					this.time.delayedCall(2000, () => {
						this.doConversation();

						this.time.delayedCall(8000, () => {
							this.cameras.main.pan(400, 224, 10000, 'Cubic.easeInOut');
						});
					});
				}
			}
		);
	}

	doConversation() {
		const panelWidth = 700;
		const panelHeight = 60;
		const panelPadding = 50;
		const textPadding = 20;

		const lines = [
			{ text: "Hello. I'm here about the job?", color: '#2c3e50' },
			{ text: 'Ah yes. Right this way!', color: '#e47c3c' },
			{ text: 'Um ... thanks!', color: '#2c3e50' },
		];

		const panels = [];
		const textObjects = [];

		let currentLine = 0;

		const createPanel = (yPosition) => {
			const frame = this.add.graphics();
			frame.fillStyle(0xffffff, 1);
			frame.fillRect(panelPadding, yPosition, panelWidth, panelHeight);
			panels.push(frame);

			const text = this.add.text(
				panelPadding + textPadding,
				yPosition + textPadding,
				'',
				{
					fontSize: '26px',
					fontStyle: 'bold',
					color: '#2c3e50',
					wordWrap: { width: panelWidth - textPadding * 2 },
				}
			);
			textObjects.push(text);
		};

		const showNextLine = () => {
			if (currentLine < lines.length) {
				const yPosition = 3200 + currentLine * (panelHeight + 10);
				createPanel(yPosition);
				textObjects[currentLine].setStyle({ color: lines[currentLine].color });
				textObjects[currentLine].setText('');
				this.typeText(textObjects[currentLine], lines[currentLine].text);

				currentLine++;

				this.time.delayedCall(2200, showNextLine, [], this);
			}
		};

		showNextLine();
	}

	typeText(textObject, fullText, speed = 50) {
		let i = 0;
		this.time.addEvent({
			repeat: fullText.length - 1,
			delay: speed,
			callback: () => {
				textObject.text += fullText[i];
				i++;
			},
		});
	}
}
