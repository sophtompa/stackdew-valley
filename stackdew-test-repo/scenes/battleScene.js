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
							//format here is text for the actual dialogue and the colour which helps denote player or npc is talking
							{
								text: `"Hello. I'm here about the job?"`,
								speaker: 'left',
								color: '#2c3e50',
							},
							{
								text: `"Ah yes. Right this way!"`,
								speaker: 'right',
								color: '#502c2c',
							},
							{ text: `"Uh ... thanks!"`, speaker: 'left', color: '#2c3e50' },
						],
						() => {
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
}
