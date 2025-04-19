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
		this.lines = lines;
		this.onComplete = onComplete;
		this.dialogueX = x;
		this.dialogueY = y;
		this.currentLine = 0;
		this.showNextLine();
	}

	showNextLine() {
		const xPosition = this.dialogueX;
		const yPosition = this.dialogueY;

		if (this.currentLine < this.lines.length) {
			//const yPosition = 3200; // adjust spacing as needed
			this.createPanel(
				yPosition,
				this.lines[this.currentLine].text,
				this.lines[this.currentLine].color,
				xPosition
			);

			const index = this.currentLine;
			const textObj = this.textObjects[index];
			const panelObj = this.panels[index];
			const shadowObj = this.shadows[index];
			const pointerObj = this.pointers[index];

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
			if (this.onComplete) this.onComplete();
		}
	}

	createPanel(yPosition, lineText, textColor, xPosition = 50) {
		const { add, time } = this.scene;

		const panelPadding = 20;
		const textPadding = 7;
		//const baseOffsetX = 50;
		const borderRadius = 20;
		const outlineColour = 0xb5c983;
		const outlineStroke = 8;
		const margin = 20;
		const maxPanelWidth = 350;

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

		// shadow
		const shadow = add.graphics();
		shadow.fillStyle(0x000000, 0.5);
		shadow.fillRoundedRect(
			panelPadding + 10 + xPosition,
			yPosition + 10,
			panelWidth,
			panelHeight,
			borderRadius
		);
		this.shadows.push(shadow);

		// panel
		const panel = add.graphics();
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

		// pointer
		const pointer = add.graphics();
		pointer.fillStyle(0xb5c983, 1);
		if (textColor === '#2c3e50') {
			pointer.fillTriangle(
				panelPadding - 15 + xPosition,
				yPosition + 30,
				panelPadding + xPosition,
				yPosition + 10,
				panelPadding + xPosition,
				yPosition + 30
			);
		} else {
			pointer.fillTriangle(
				panelPadding + panelWidth - 5 + xPosition,
				yPosition + 35,
				panelPadding + panelWidth + 2 + xPosition,
				yPosition + 22,
				panelPadding + panelWidth + 10 + xPosition,
				yPosition + 35
			);
		}
		this.pointers.push(pointer);

		// text
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
		this.textObjects.push(text);
	}

	typeText(textObject, fullText, onComplete, speed = 50) {
		let i = 0;
		this.scene.time.addEvent({
			repeat: fullText.length - 1,
			delay: speed,
			callback: () => {
				textObject.text += fullText[i];
				i++;
				const pitch = Phaser.Math.FloatBetween(0.7, 1.3);
				const sound = this.scene.sound.add('speechSound');
				sound.play({ volume: 0.05, rate: pitch });
				if (i === fullText.length && onComplete) {
					onComplete();
				}
			},
		});
	}
}
