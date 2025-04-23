import Phaser from 'phaser';

export default class TitleScene extends Phaser.Scene {
	constructor() {
		super('titleScene');
	}

	preload() {}

	create() {
		this.cameras.main.setBackgroundColor('#000000');
		this.cameras.main.fadeOut(0);

		//wait 500ms, then fade in over 1000ms
		this.time.delayedCall(500, () => {
			this.cameras.main.fadeIn(1000, 0, 0, 0);
		});
		const centerX = this.cameras.main.centerX;
		const centerY = this.cameras.main.centerY;

		const panelWidth = 700;
		const panelHeight = 300;
		const borderRadius = 30;
		const outlineColour = 0xb5c983;
		const outlineStroke = 10;

		const panel = this.add.graphics();
		panel.lineStyle(outlineStroke, outlineColour, 1);
		panel.strokeRoundedRect(
			centerX - panelWidth / 2,
			centerY - panelHeight / 2,
			panelWidth,
			panelHeight,
			borderRadius
		);
		panel.fillStyle(0xdee6ca, 1);
		panel.fillRoundedRect(
			centerX - panelWidth / 2,
			centerY - panelHeight / 2,
			panelWidth,
			panelHeight,
			borderRadius
		);
		panel.setDepth(0);
		this.add
			.text(centerX, centerY - 110, 'StackDew Valley', {
				fontFamily: 'VT323',
				fontSize: '64px',
				fill: '#1f451c',
			})
			.setOrigin(0.5);

		this.add
			.text(centerX, centerY - 60, 'made by a group of enthusiasts called', {
				fontFamily: 'VT323',
				fontSize: '20px',
				fill: '#1f451c',
			})
			.setOrigin(0.5);

		const names = [
			{ label: "Ken'Terria", url: 'https://github.com/MuseOfCode' },
			{ label: 'Paul', url: 'https://github.com/testmango-sudo' },
			{ label: 'Tymur', url: 'https://github.com/papaparadox' },
			{ label: 'Chris', url: 'https://github.com/slightly76' },
			{ label: 'Sophie,', url: 'https://github.com/sophtompa' },
			{ label: 'Dean', url: 'https://github.com/notyourimaginarycoder' },
		];

		const spacing = 70;
		const totalWidth = (names.length - 1) * spacing;

		names.forEach((person, index) => {
			const x = centerX - totalWidth / 2 + index * spacing;

			const nameText = this.add
				.text(x, centerY, person.label, {
					fontFamily: 'VT323',
					fontSize: '22px',
					fill: '#3b5b2c',
				})
				.setOrigin(0.5)
				.setInteractive();

			nameText.on('pointerdown', () => {
				window.open(person.url, '_blank');
			});

			// Hover effect
			nameText.on('pointerover', () => nameText.setFill('#FF984D'));
			nameText.on('pointerout', () => nameText.setFill('#3b5b2c'));
		});

		this.add
			.text(centerX, centerY + 20, '(click our names for GitHub links)', {
				fontFamily: 'VT323',
				fontSize: '14px',
				fill: '#1f451c',
			})
			.setOrigin(0.5);

		this.add
			.text(centerX, centerY + 100, 'Press SPACE to Start', {
				fontFamily: 'VT323',
				fontSize: '28px',
				fill: '#1f451c',
			})
			.setOrigin(0.5);

		this.input.keyboard.on('keydown-SPACE', () => {
			this.scene.start('loreScene');
		});
	}
}
