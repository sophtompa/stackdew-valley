import Phaser from 'phaser';
import dialogueManager from '../src/dialogueManager.js';

export default class battleScene extends Phaser.Scene {
	constructor() {
		super('battleScene');
		let keyPDown = false;
	}

	//always listen for P press regardless of pause state

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
		//draw map
		this.add.image(0, 0, 'jobApproach').setOrigin(0, 0);

		// added for "jumper"
		this.add.sprite(300, 1000, 'playerSheet');

		// initialise camera position
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

		// easter egg grafitti
		this.add
			.sprite(350, 1600, 'grafitti')
			.setScale(0.35, 0.65)
			.setTint(0xaaaaaa)
			.setAngle(-5);

		this.doCutScene();

		//skip scene if player presses space
		this.input.keyboard.on('keydown-SPACE', this.skipConversation, this);

		//listen for p press for pausing
		this.input.keyboard.on('keydown-P', this.togglePause, this);
	}

	skipConversation() {
		//skip to specified scene if user presses space (needs changing to actual battlescene)
		this.scene.start('overworldScene');
	}

	moveScene() {
		//transition to next scene
		this.cameras.main.fadeOut(1000, 0, 0, 0);
		this.time.delayedCall(1000, () => {
			this.scene.start('overworldScene');
		});
	}

	update() {
		//check for p press to toggle pause
		const keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
		if (Phaser.Input.Keyboard.JustDown(keyP) && !this.keyPDown) {
			this.togglePause();
			this.keyPDown = true;
		}
		//reset keyPDown flag after p is released
		if (Phaser.Input.Keyboard.JustUp(keyP)) {
			this.keyPDown = false;
		}
	}

	togglePause() {
		const isPaused = this.scene.isPaused();
		if (isPaused) {
			console.log('unpaused');
			this.scene.resume();
		} else {
			console.log('paused');
			this.scene.pause();
		}
	}

	doCutScene() {
		//initialise dialogue manager function in this scene
		this.dialogue = new dialogueManager(this);

		//initial pan up to door of building
		this.cameras.main.pan(
			400,
			3400,
			7000,
			'Sine.easeInOut',
			false,
			(camera, progress) => {
				// above callback checks to see if the first pan is finished
				// then we call dialogue function for conversation to welcome player in building
				if (progress === 1) {
					//this.time.delayedCall(1800, () => {
					this.dialogue.startDialogue(
						[
							// format here is text for the actual dialogue and the colour which helps denote player or npc is talking
							{
								text: `"Hello. I'm here about the job? I hope it doesn't involve chess cos I'm rubbish at it, sorry. You probably want Holovko for that. The boy's a natural."`,
								speaker: 'player',
								color: '#2c3e50',
							},
							{
								text: `"Ah yes. Right this way!"`,
								speaker: 'npc',
								color: '#502c2c',
							},
							{ text: `"Uh ... thanks!"`, speaker: 'player', color: '#2c3e50' },
							{
								text: `"what if I keep talking?"`,
								speaker: 'player',
								color: '#2c3e50',
							},
							{ text: `"and talking?"`, speaker: 'player', color: '#2c3e50' },

							{
								text: `"... can we go now?"`,
								speaker: 'npc',
								color: '#502c2c',
							},
							{
								text: `"I need the toilet."`,
								speaker: 'player',
								color: '#2c3e50',
							},
							{
								text: `"I guess I'll entertain myself with a long bit of text while you do a pre-interview anxiety-based butt-throw-up."`,
								speaker: 'npc',
								color: '#502c2c',
							},
							{
								text: `"Ew, I smell spicy tummy mud."`,
								speaker: 'npc',
								color: '#502c2c',
							},
							{
								text: `"Whatever ... stay fresh, cheese bags."`,
								speaker: 'player',
								color: '#2c3e50',
							},
						],
						() => {
							//this.time.delayedCall(8000, () => {

							this.cameras.main.pan(400, 224, 11000, 'Cubic.easeInOut');
							this.doFootSteps();
						},
						50,
						3200
					);
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

	// code below has now been moved to its own dialogueManager file.

	// doConversation() {
	// 	//const panelWidth = 350;
	// 	const panelHeight = 35;
	// 	const panelPadding = 20;
	// 	const textPadding = 7;
	// 	const baseOffsetX = 50;

	// 	const lines = [
	// 		{
	// 			text: `"Hello. I'm here about the job? bibbidy bobbidy dhfklsdh fksdhfksdfhk sdhsdkfjhs dkfsdhfkjsd hfksdj hfkdsjfhsdkh asasdasd asdasd asd asd asdasdasda asdasdasdas"`,
	// 			color: '#2c3e50',
	// 		},
	// 		{ text: `"Ah yes. Right this way!"`, color: '#502c2c' },
	// 		{ text: `"Uh ... thanks!"`, color: '#2c3e50' },
	// 	];

	// 	const panels = [];
	// 	const shadows = [];
	// 	const pointers = [];
	// 	const textObjects = [];

	// 	let currentLine = 0;

	// 	const createPanel = (yPosition, lineText, textColor) => {
	// 		const borderRadius = 20;
	// 		const outlineColour = 0xb5c983;
	// 		const outlineStroke = 8;
	// 		const margin = 20;

	// 		// temptext to calculate panel width of 'unwrapped' text that could be too long for single panel
	// 		const tempText = this.add.text(0, 0, lineText, {
	// 			fontFamily: 'VT323',
	// 			fontSize: '20px',
	// 		});
	// 		const textWidth = tempText.width;
	// 		tempText.destroy();

	// 		// padding calcs
	// 		const totalHorizontalPadding = textPadding * 2 + margin * 2;
	// 		let panelWidth = textWidth + totalHorizontalPadding + 10;
	// 		const maxPanelWidth = 350;
	// 		panelWidth = Math.min(panelWidth, maxPanelWidth);

	// 		//panelHeight = tempText.height + textPadding * 2;

	// 		// temptext2 measured again to see if we need more than one line once he have wrapping in place
	// 		const tempText2 = this.add.text(0, 0, lineText, {
	// 			fontFamily: 'VT323',
	// 			fontSize: '20px',
	// 			wordWrap: { width: panelWidth - totalHorizontalPadding },
	// 		});
	// 		const wrappedTextHeight = tempText2.height;
	// 		tempText2.destroy();

	// 		const panelHeight = wrappedTextHeight + textPadding * 2;

	// 		// drop shadow for panel
	// 		const shadowOffset = 10;
	// 		const shadow = this.add.graphics();
	// 		// black shadow, 50% transparent
	// 		shadow.fillStyle(0x000000, 0.5);
	// 		shadow.fillRoundedRect(
	// 			panelPadding + shadowOffset + baseOffsetX,
	// 			yPosition + shadowOffset,
	// 			panelWidth,
	// 			panelHeight,
	// 			borderRadius
	// 		);
	// 		shadows.push(shadow);

	// 		// panel frame - outline and fill
	// 		const frame = this.add.graphics();
	// 		frame.lineStyle(outlineStroke, outlineColour, 1);
	// 		frame.strokeRoundedRect(
	// 			panelPadding + baseOffsetX,
	// 			yPosition,
	// 			panelWidth,
	// 			panelHeight,
	// 			borderRadius
	// 		);
	// 		frame.fillStyle(0xdee6ca, 1);
	// 		frame.fillRoundedRect(
	// 			panelPadding + baseOffsetX,
	// 			yPosition,
	// 			panelWidth,
	// 			panelHeight,
	// 			borderRadius
	// 		);
	// 		panels.push(frame);

	// 		//triangle pointer to make it look like a speech bubble
	// 		const pointer = this.add.graphics();
	// 		pointer.fillStyle(0xb5c983, 1);

	// 		if (textColor === '#2c3e50') {
	// 			// left side triangle
	// 			pointer.fillTriangle(
	// 				panelPadding - 15 + baseOffsetX,
	// 				yPosition + 30,
	// 				panelPadding + baseOffsetX,
	// 				yPosition + 10,
	// 				panelPadding + baseOffsetX,
	// 				yPosition + 30,
	// 				borderRadius
	// 			);
	// 		} else {
	// 			//right side triangle

	// 			pointer.fillTriangle(
	// 				panelPadding + panelWidth + -5 + baseOffsetX,
	// 				yPosition + 35,
	// 				panelPadding + panelWidth + 2 + baseOffsetX,
	// 				yPosition + 22,
	// 				panelPadding + panelWidth + 10 + baseOffsetX,
	// 				yPosition + 35
	// 			);
	// 		}

	// 		pointers.push(pointer);

	// 		//actual text object placed inside panel
	// 		const text = this.add.text(
	// 			panelPadding + textPadding + margin + baseOffsetX,
	// 			yPosition + textPadding,
	// 			'',
	// 			{
	// 				fontFamily: 'VT323',
	// 				fontSize: '20px',
	// 				// fontStyle: 'bold',
	// 				color: '#2c3e50',
	// 				wordWrap: { width: panelWidth - totalHorizontalPadding },
	// 			}
	// 		);
	// 		textObjects.push(text);
	// 	};

	// 	const showNextLine = () => {
	// 		if (currentLine < lines.length) {
	// 			const yPosition = 3200 + currentLine * (panelHeight + 10);
	// 			createPanel(
	// 				yPosition,
	// 				lines[currentLine].text,
	// 				lines[currentLine].color
	// 			);

	// 			const thisLineIndex = currentLine;
	// 			const textObj = textObjects[thisLineIndex];
	// 			const panelObj = panels[thisLineIndex];
	// 			const shadowObj = shadows[thisLineIndex];
	// 			const pointerObj = pointers[thisLineIndex];

	// 			textObjects[currentLine].setStyle({ color: lines[currentLine].color });
	// 			textObjects[currentLine].setText('');

	// 			// const textLength = lines[thisLineIndex].text.length;
	// 			// const typingSpeed = 50;
	// 			// const baseDelay = 1250;
	// 			// const typingDelay = baseDelay + textLength * typingSpeed;

	// 			this.typeText(textObj, lines[thisLineIndex].text, () => {
	// 				this.time.delayedCall(1250, () => {
	// 					this.tweens.add({
	// 						targets: [panelObj, textObj, shadowObj, pointerObj],
	// 						alpha: 0,
	// 						duration: 1000,
	// 						ease: 'Power2',
	// 						onComplete: () => {
	// 							panelObj.destroy();
	// 							shadowObj.destroy();
	// 							currentLine++;
	// 							showNextLine();
	// 						},
	// 					});
	// 				});
	// 			});
	// 		} else {
	// 			this.doFootSteps();
	// 		}
	// 	};
	// 	showNextLine();
	// }

	// typeText(textObject, fullText, onComplete, speed = 50) {
	// 	let i = 0;
	// 	const sound = this.sound.add('speechSound');

	// 	this.time.addEvent({
	// 		repeat: fullText.length - 1,
	// 		delay: speed,
	// 		callback: () => {
	// 			textObject.text += fullText[i];
	// 			i++;
	// 			const pitchChange = Phaser.Math.FloatBetween(0.7, 1.3);
	// 			const sound = this.sound.add('speechSound');
	// 			sound.play({
	// 				volume: 0.05,
	// 				rate: pitchChange,
	// 			});
	// 			if (i === fullText.length && onComplete) {
	// 				onComplete();
	// 			}
	// 		},
	// 	});
	// }
}
