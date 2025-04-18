import Phaser from 'phaser';

export default class battleScene extends Phaser.Scene {
	constructor() {
		super('battleScene');
	}

	preload() {
		//single map background
		this.load.image('jobApproach', '../assets/battlewithapproach.png');

		//player sprite (for "jumper")
		this.load.spritesheet('playerSheet', 'assets/dummy.png', {
			frameWidth: 32,
			frameHeight: 61,
		});

		//animated fire sprite for rooftop barrels
		this.load.spritesheet('fire', '../assets/burning_loop_3.png', {
			frameWidth: 15,
			frameHeight: 24,
		});

		// grafitti sprite for "easter egg"
		this.load.image('grafitti', '../assets/grafitti.png');

		//audio files for speech and footsteps
		this.load.audio('speechSound', '../assets/speechSound.wav');
		this.load.audio('footStepSound', '../assets/footStepSound.wav');
	}

	create() {
		this.add.image(0, 0, 'jobApproach').setOrigin(0, 0);

		this.add.sprite(300, 1000, 'playerSheet');

		this.cameras.main.setScroll(0, 4030);

		//create flame animated sprites
		this.anims.create({
			key: 'flame',
			frames: this.anims.generateFrameNumbers('fire', { start: 0, end: 5 }),
			frameRate: 10,
			repeat: -1,
		});
		const flame1 = this.add.sprite(47, 329, 'fire');
		const flame2 = this.add.sprite(750, 41, 'fire');
		flame1.play('flame').setScale(2.5).setFrame(3);
		flame2.play('flame').setScale(2.5);

		this.add
			.sprite(350, 1600, 'grafitti')
			.setScale(0.35, 0.65)
			.setTint(0xaaaaaa)
			.setAngle(-5);

		this.doCutScene();

		//skip scene if player presses space
		this.input.keyboard.on('keydown-SPACE', this.skipConversation, this);

		//always listen for P press regardless of pause state
		this.input.keyboard.on('keydown-P', this.togglePause, this);
	}

	togglePause() {
		const isPaused = this.scene.isPaused('battleScene');
		if (isPaused) {
			console.log('unpaused');
			this.scene.resume();
		} else {
			console.log('paused');
			this.scene.pause();
		}
	}

	skipConversation() {
		this.scene.start('overworldScene');
	}

	moveScene() {
		this.cameras.main.fadeOut(1000, 0, 0, 0);
		this.time.delayedCall(1000, () => {
			this.scene.start('overworldScene');
		});
	}

	update() {
		if (this.scene.isPaused()) {
			if (this.input.keyboard.justPressed(Phaser.Input.Keyboard.KeyCodes.P)) {
				this.togglePause();
			}
		}
	}

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
					this.time.delayedCall(1800, () => {
						this.doConversation();

						this.time.delayedCall(8000, () => {
							this.cameras.main.pan(400, 224, 11000, 'Cubic.easeInOut');
							this.doFootSteps();
						});
					});
				}
			}
		);
	}

	doFootSteps() {
		this.time.delayedCall(750);
		const footSteps = this.sound.add('footStepSound', {
			volume: 0.2,
			loop: false,
		});
		footSteps.play();
		// interval is twice a second
		let interval = 700;
		const footStepsEvent = this.time.addEvent({
			delay: interval,
			callback: () => {
				footSteps.play();
			},
			callbackScope: this,
			loop: true,
		});

		const intervalDecrease = this.time.addEvent({
			delay: 1000,
			callback: () => {
				if (interval > 80) {
					interval -= 100;
					//footStepsEvent.delay = interval;
					footStepsEvent.reset({
						delay: interval,
						callback: () => {
							footSteps.play();
						},
						callbackScope: this,
						loop: true,
					});
				}
			},
			callbackScope: this,
			loop: true,
		});
		this.time.delayedCall(5000, () => {
			this.tweens.add({
				targets: footSteps,
				volume: 0.01,
				duration: 2000,
				ease: 'Linear',
				onComplete: () => {
					footSteps.stop();
				},
			});

			intervalDecrease.remove();
		});
	}

	doConversation() {
		//const panelWidth = 350;
		const panelHeight = 35;
		const panelPadding = 20;
		const textPadding = 7;

		const lines = [
			{ text: `"Hello. I'm here about the job?"`, color: '#2c3e50' },
			{ text: `"Ah yes. Right this way!"`, color: '#502c2c' },
			{ text: `"Uh ... thanks!"`, color: '#2c3e50' },
		];

		const panels = [];
		const shadows = [];
		const textObjects = [];

		let currentLine = 0;

		const createPanel = (yPosition, lineText, textColor) => {
			const borderRadius = 20;
			const outlineColour = 0xb5c983;
			const outlineStroke = 8;
			const margin = 20;

			// temptext to calculate panel width
			const tempText = this.add.text(0, 0, lineText, {
				fontFamily: 'VT323',
				fontSize: '20px',
			});
			const textWidth = tempText.width;
			tempText.destroy();

			// padding calcs
			const totalHorizontalPadding = textPadding * 2 + margin * 2;
			const panelWidth = textWidth + totalHorizontalPadding;
			const panelHeight = 35;

			// drop shadow for panel
			const shadowOffset = 10;
			const shadow = this.add.graphics();
			// black shadow, 50% transparent
			shadow.fillStyle(0x000000, 0.5);
			shadow.fillRoundedRect(
				panelPadding + shadowOffset,
				yPosition + shadowOffset,
				panelWidth,
				panelHeight,
				borderRadius
			);
			shadows.push(shadow);

			// panel frame - outline and fill
			const frame = this.add.graphics();
			frame.lineStyle(outlineStroke, outlineColour, 1);
			frame.strokeRoundedRect(
				panelPadding,
				yPosition,
				panelWidth,
				panelHeight,
				borderRadius
			);
			frame.fillStyle(0xdee6ca, 1);
			frame.fillRoundedRect(
				panelPadding,
				yPosition,
				panelWidth,
				panelHeight,
				borderRadius
			);
			panels.push(frame);

			//const margin = 20;

			//text object placed inside panel
			const text = this.add.text(
				panelPadding + textPadding + margin,
				yPosition + textPadding,
				'',
				{
					fontFamily: 'VT323',
					fontSize: '20px',
					// fontStyle: 'bold',
					color: '#2c3e50',
					wordWrap: { width: panelWidth - totalHorizontalPadding },
				}
			);
			textObjects.push(text);
		};

		const showNextLine = () => {
			if (currentLine < lines.length) {
				const yPosition = 3200 + currentLine * (panelHeight + 10);
				createPanel(
					yPosition,
					lines[currentLine].text,
					lines[currentLine].color
				);

				const thisLineIndex = currentLine;
				const textObj = textObjects[thisLineIndex];
				const panelObj = panels[thisLineIndex];
				const shadowObj = shadows[thisLineIndex];

				textObjects[currentLine].setStyle({ color: lines[currentLine].color });
				textObjects[currentLine].setText('');

				this.typeText(textObj, lines[thisLineIndex].text, () => {
					this.time.delayedCall(1250, () => {
						this.tweens.add({
							targets: [panelObj, textObj, shadowObj],
							alpha: 0,
							duration: 1000,
							ease: 'Power2',
							onComplete: () => {
								panelObj.destroy();
								shadowObj.destroy();
							},
						});
					});
				});

				currentLine++;
				this.time.delayedCall(2200, showNextLine, [], this);
			} else {
				this.doFootSteps();
			}
		};

		showNextLine();

		//const fadeOutText = () => {};
	}

	typeText(textObject, fullText, onComplete, speed = 50) {
		let i = 0;
		const sound = this.sound.add('speechSound');

		this.time.addEvent({
			repeat: fullText.length - 1,
			delay: speed,
			callback: () => {
				textObject.text += fullText[i];
				i++;
				const pitchChange = Phaser.Math.FloatBetween(0.7, 1.3);
				const sound = this.sound.add('speechSound');
				sound.play({
					volume: 0.05,
					rate: pitchChange,
				});
				if (i === fullText.length && onComplete) {
					onComplete();
				}
			},
		});
	}
}
