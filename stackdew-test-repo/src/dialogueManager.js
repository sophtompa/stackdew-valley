//todo MOVE X/Y COORDINATES TO EACH DIALOGUE LINE FOR FLEXIBILITY IN POSITION OF CONVERSATION
//todo DROP SHADOW ON POINTER

export default class DialogueManager {
	constructor(scene) {
		this.scene = scene;
		this.panels = [];
		this.shadows = [];
		this.pointers = [];
		this.textObjects = [];
		this.currentLine = 0;
	}

	startDialogue(lines, onComplete, x, y) {
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

	showNextLine() {
		const xPosition = this.dialogueX;
		const yPosition = this.dialogueY;

		if (this.currentLine < this.lines.length) {
			this.createPanel(
				yPosition,
				this.lines[this.currentLine].text,
				this.lines[this.currentLine].color,
				xPosition,
				this.lines[this.currentLine].speaker
			);

			const index = this.currentLine;
			const textObj = this.textObjects[index];
			const panelObj = this.panels[index];
			const shadowObj = this.shadows[index];
			const pointerObj = this.pointers[index];

			// check to see if we're SHOUTING
			const currentLineData = this.lines[this.currentLine];
			const isShouting =
				currentLineData.text === currentLineData.text.toUpperCase();

			//if SHOUTING add a tween to the text to make it jiggle
			if (isShouting) {
				this.shoutTween = this.scene.tweens.add({
					targets: textObj,
					x: {
						from: textObj.x - 2,
						to: textObj.x + 2,
					},
					// y: {
					// 	from: textObj.y - 1,
					// 	to: textObj.y + 1,
					// },
					duration: 50,
					yoyo: true,
					repeat: -1,
				});

				//jiggle speech bubble panel if SHOUTING
				// this.scene.tweens.add({
				// 	targets: panelObj,
				// 	x: { from: panelObj.x - 2, to: panelObj.x + 2 },
				// 	y: { from: panelObj.y - 1, to: panelObj.y + 1 },
				// 	duration: 50,
				// 	yoyo: true,
				// 	repeat: -1,
				// });
			}

			textObj.setStyle({ color: this.lines[index].color });
			textObj.setText('');

			this.typeText(textObj, this.lines[index].text, () => {
				this.scene.time.delayedCall(1250, () => {
					this.scene.tweens.add({
						targets: [panelObj, textObj, shadowObj, pointerObj],
						alpha: 0,
						duration: 1000,
						ease: 'Power2',
						onComplete: () => {
							panelObj.destroy();
							shadowObj.destroy();
							this.currentLine++;
							this.showNextLine();
						},
					});
				});
			});
		} else {
			if (this.onComplete) {
				if (this.shoutTween) {
					this.shoutTween.stop();
					this.shoutTween = null;
				}
				this.onComplete();
			}
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

	typeText(textObject, fullText, onComplete, speed = 50) {
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
		const typeNextChar = () => {
			if (i < wrappedText.length) {
				// source of potential crash to do with bitmapped text
				// textObject.text += wrappedText[i];
				textObject.setText(textObject.text + wrappedText[i]);
				i++;

				let pitch = speaker === '' ? 1 : Phaser.Math.FloatBetween(0.7, 1.3);
				sound.play({ volume: 0.05, rate: pitch });

				this.scene.time.delayedCall(speed, typeNextChar);
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
}
