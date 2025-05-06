//todo MOVE X/Y COORDINATES TO EACH DIALOGUE LINE FOR FLEXIBILITY IN POSITION OF CONVERSATION
//todo DROP SHADOW ON POINTER MAYBE

//instructions are here;
//https://docs.google.com/document/d/1BFBMlYqjkxCOj6h-KyuFoI0Byq-edwZyRliMi3BItaw/edit?tab=t.0
//scroll to bottom

export default class DialogueManager {
	constructor(scene) {
		this.scene = scene;
		this.panels = [];
		this.shadows = [];
		this.pointers = [];
		this.textObjects = [];
		this.currentLine = 0;
		this.soundVolume = 0.1;
		this.activeTimers = [];
	}

	startDialogue(lines, onComplete, x, y) {
		if (this.currentLine > 0 && this.currentLine < this.lines.length) {
			//check to see if dialogue is already running
			if (this.isDialogueRunning()) {
				return;
			}
		}

		this.resetDialogue();
		this.lines = lines;
		this.onComplete = onComplete;
		this.dialogueX = x;
		this.dialogueY = y;
		this.currentLine = 0;
		this.showNextLine();
	}

	finishDialogue() {
		//trigger onComplete when dialogue finishes typing on screen
		if (this.onComplete) {
			this.onComplete();
			this.onComplete = null;
		}
	}

	isDialogueRunning() {
		//return this.currentLine < this.lines.length;
		return Array.isArray(this.lines) && this.currentLine < this.lines.length;
	}

	showNextLine() {
		const currentLineData = this.lines[this.currentLine];

		//this takes an x and y position from the dialogue text object
		//if it doesn't exist, it defaults to the global x/y coordinates given at the end of the argument
		const xPosition =
			currentLineData.x !== undefined ? currentLineData.x : this.dialogueX;
		const yPosition =
			currentLineData.y !== undefined ? currentLineData.y : this.dialogueY;
		if (this.currentLine < this.lines.length) {
			const currentLineData = this.lines[this.currentLine];
			let lineText = currentLineData.text;

			this.createPanel(
				yPosition,
				lineText,
				this.lines[this.currentLine].color,
				xPosition,
				this.lines[this.currentLine].speaker
			);

			const index = this.currentLine;
			const textObj = this.textObjects[index];
			const panelObj = this.panels[index];
			const shadowObj = this.shadows[index];
			const pointerObj = this.pointers[index];

			const isShouting = lineText === lineText.toUpperCase();

			// If SHOUTING, add a tween to make the text jiggle
			if (isShouting) {
				//shouting volume is also louder
				this.soundVolume = 0.2;
				this.shoutTween = this.scene.tweens.add({
					targets: textObj,
					x: {
						from: textObj.x - 2,
						to: textObj.x + 2,
					},
					duration: 50,
					yoyo: true,
					repeat: -1,
				});

				// You can also make the panel jiggle if you want
				// this.scene.tweens.add({
				//     targets: panelObj,
				//     x: { from: panelObj.x - 2, to: panelObj.x + 2 },
				//     y: { from: panelObj.y - 1, to: panelObj.y + 1 },
				//     duration: 50,
				//     yoyo: true,
				//     repeat: -1,
				// });
			} else {
				this.soundVolume = 0.1;
			}

			textObj.setStyle({ color: this.lines[index].color });
			textObj.setText('');

			// Type the text for both placeholder and regular dialogue
			this.typeText(textObj, lineText, () => {
				if (this.lines[index].persist) {
					return;
				}

				const fadeTimer = this.scene.time.delayedCall(1250, () => {
					this.scene.tweens.add({
						targets: [panelObj, textObj, shadowObj, pointerObj],
						alpha: 0,
						duration: 1000,
						ease: 'Power2',
						onComplete: () => {
							panelObj.destroy();
							shadowObj.destroy();
							this.currentLine++;
							if (this.currentLine < this.lines.length) {
								this.showNextLine();
							} else {
								this.finishDialogue();
							}
						},
					});
				});
				this.activeTimers.push(fadeTimer);
			});
		}
	}

	createPanel(
		yPosition,
		lineText,
		textColor,
		xPosition = 50,
		speaker = 'tutorial'
	) {
		const { add } = this.scene;
		console.log('Creating dialogue panel:', lineText);

		const panelPadding = 20;
		const textPadding = 7;
		const borderRadius = 20;
		const outlineColour = 0xb5c983;
		const outlineStroke = 8;
		const margin = 20;
		const maxPanelWidth = 350;
		const dialogueDepth = 1000;

		// tempText to get size
		const tempText = add.text(0, 0, lineText, {
			fontFamily: 'VT323',
			fontSize: '20px',
		});
		let panelWidth = Math.min(
			tempText.width + textPadding * 2 + margin * 2 + 10,
			maxPanelWidth
		);
		tempText.destroy();

		const wrappedText = add.text(0, 0, lineText, {
			fontFamily: 'VT323',
			fontSize: '20px',
			wordWrap: { width: panelWidth - textPadding * 2 - margin * 2 },
		});
		const panelHeight = wrappedText.height + textPadding * 2;
		wrappedText.destroy();

		//shadow
		const shadow = add.graphics();
		shadow.setDepth(dialogueDepth);
		shadow.fillStyle(0x000000, 0.5);
		shadow.fillRoundedRect(
			panelPadding + 10 + xPosition,
			yPosition + 10,
			panelWidth,
			panelHeight,
			borderRadius
		);
		this.shadows.push(shadow);

		//panel
		const panel = add.graphics();
		panel.setDepth(dialogueDepth + 1);
		panel.lineStyle(outlineStroke, outlineColour, 1);
		panel.strokeRoundedRect(
			panelPadding + xPosition,
			yPosition,
			panelWidth,
			panelHeight,
			borderRadius
		);
		panel.fillStyle(0xdee6ca, 1);
		panel.fillRoundedRect(
			panelPadding + xPosition,
			yPosition,
			panelWidth,
			panelHeight,
			borderRadius
		);
		this.panels.push(panel);

		//pointer
		const pointer = add.graphics();
		pointer.setDepth(dialogueDepth + 2);
		pointer.fillStyle(0xb5c983, 1);

		//find bottom of panel for speech bubble pointer
		const bottomY = yPosition + panelHeight - 5;

		//speech bubble pointer pointing left for player speech
		if (speaker === 'left') {
			pointer.fillTriangle(
				//bottom left of triangle (essentially the pointer)
				panelPadding - 25 + xPosition,
				bottomY + 10,
				//top of triangle
				panelPadding + xPosition,
				bottomY - 15,
				//bottom right of triangle
				panelPadding + xPosition,
				bottomY
			);
			//speech bubble pointer pointing right for npc speech
		} else if (speaker === 'right') {
			pointer.fillTriangle(
				//bottom right of triangle (essentially the pointer)
				panelPadding + panelWidth + 25 + xPosition,
				bottomY + 10,
				// top of triangle
				panelPadding + panelWidth + xPosition,
				bottomY - 15,
				//bottom left of triangle
				panelPadding + panelWidth + xPosition,
				bottomY
			);
		} else if (speaker === '') pointer.setVisible(false);
		this.pointers.push(pointer);

		const text = add.text(
			panelPadding + textPadding + margin + xPosition,
			yPosition + textPadding,
			'',
			{
				fontFamily: 'VT323',
				fontSize: '20px',
				color: textColor,
				wordWrap: { width: panelWidth - textPadding * 2 - margin * 2 },
			}
		);
		text.setDepth(dialogueDepth + 3);
		this.textObjects.push(text);
	}

	getWrappedText(fullText, textStyle, wrapWidth) {
		const words = fullText.split(/(\s+)/); // split into words + whitespace
		let line = '';
		let wrappedText = '';
		const tempText = this.scene.add.text(0, 0, '', textStyle);

		for (let i = 0; i < words.length; i++) {
			const testLine = line + words[i];
			tempText.setText(testLine);
			if (tempText.width > wrapWidth && line !== '') {
				//new line if word doesn't fit, removing leading space if there is one
				wrappedText += '\n' + words[i].trimStart();
				line = words[i].trimStart();
			} else {
				wrappedText += words[i];
				line = testLine;
			}
		}

		tempText.destroy();
		return wrappedText;
	}

	typeText(textObject, fullText, onComplete, speed = 40) {
		const speaker = this.lines[this.currentLine].speaker;
		const soundKey =
			{
				player: 'speechSound',
				npc: 'speechSound',
				narrator: 'narratorSound',
				tutorial: 'tutorialSound',
			}[speaker] || 'speechSound';

		const sound = this.scene.sound.add(soundKey);

		const textStyle = {
			fontFamily: textObject.style.fontFamily,
			fontSize: textObject.style.fontSize,
		};

		const wrappedText = this.getWrappedText(
			fullText,
			textStyle,
			textObject.style.wordWrapWidth
		);

		let i = 0;
		let currentText = '';

		const typeNextChar = () => {
			if (!textObject || !wrappedText) {
				return;
			}

			if (i < wrappedText.length) {
				// source of potential crash to do with bitmapped text
				// textObject.text += wrappedText[i];
				currentText += wrappedText[i];
				textObject.setText(currentText);
				i++;

				let pitch = speaker === '' ? 1 : Phaser.Math.FloatBetween(0.7, 1.3);
				sound.play({ volume: this.soundVolume, rate: pitch });

				const timer = this.scene.time.delayedCall(speed, typeNextChar);
				this.activeTimers.push(timer);
			} else if (onComplete) {
				onComplete();
			}
		};

		typeNextChar();
	}

	resetDialogue() {
		if (this.shoutTween) {
			this.shoutTween.stop();
			this.shoutTween = null;
		}
		this.panels.forEach((p) => p.destroy());
		this.shadows.forEach((s) => s.destroy());
		this.pointers.forEach((p) => p.destroy());
		this.textObjects.forEach((t) => t.destroy());

		this.panels = [];
		this.shadows = [];
		this.pointers = [];
		this.textObjects = [];
	}

	stopDialogue() {
		//stop shout wiggle if active
		if (this.shoutTween) {
			this.shoutTween.stop();
			this.shoutTween = null;
		}

		//destroy all visuals
		this.panels.forEach((p) => p.destroy());
		this.shadows.forEach((s) => s.destroy());
		this.pointers.forEach((p) => p.destroy());
		this.textObjects.forEach((t) => t.destroy());

		//clear arrays
		this.panels = [];
		this.shadows = [];
		this.pointers = [];
		this.textObjects = [];

		//reset dialogue state
		this.lines = [];
		this.currentLine = 0;
		this.onComplete = null;
	}
}
