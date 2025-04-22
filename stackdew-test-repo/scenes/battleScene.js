import Phaser from 'phaser';
import dialogueManager from '../src/dialogueManager.js';
import togglePause from '../src/togglePause.js';

export default class battleScene extends Phaser.Scene {
	constructor() {
		super('battleScene');
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
		this.load.audio('citySound', '../assets/cityweird.wav');
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

		//ambient city sound that fades as the convo starts
		const cityAmbienceSound = this.sound.add('citySound', {
			volume: 0.7,
			loop: 3,
		});
		cityAmbienceSound.play();
		this.tweens.add({
			targets: cityAmbienceSound,
			volume: 0.1,
			duration: 6500,
			ease: 'Linear',
		});

		this.doCutScene();

		//skip scene if player presses space
		this.input.keyboard.on('keydown-SPACE', this.skipConversation, this);

		//listen for p key press
		this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
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
		// pause toggle
		if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
			togglePause(this);
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
								x: 260,
								y: 3345,
							},
							{
								text: `"Ah yes. Right this way!"`,
								speaker: 'right',
								color: '#502c2c',
								x: 0,
								y: 3340,
							},
							{
								text: `"Uh ... thanks!"`,
								speaker: 'left',
								color: '#2c3e50',
								x: 260,
								y: 3345,
							},
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
		const footSteps = this.sound.add('footStepSound', {
			volume: 0.3,
			loop: false,
		});

		let interval = 500;
		let reducer = 90;
		let footStepTimer = null;

		const playStep = () => {
			footSteps.play();

			//set up the next step
			footStepTimer = this.time.delayedCall(interval, playStep, null, this);
		};

		//start after a short delay
		this.time.delayedCall(50, () => {
			playStep();
		});

		//gradually decrease interval between steps
		const intervalDecrease = this.time.addEvent({
			delay: 700,
			callback: () => {
				//this value is the fastest steps
				if (interval > 130) {
					interval -= reducer;
					reducer -= 10;
				}
			},
			loop: true,
		});

		//fade out and stop after x seconds
		this.time.delayedCall(6200, () => {
			//start fading out during the last second
			this.tweens.add({
				targets: footSteps,
				volume: 0.0,
				duration: 1000,
				ease: 'Linear',
			});
		});

		//stop the footstep sound and cleanup after x seconds
		this.time.delayedCall(7000, () => {
			footSteps.stop();

			intervalDecrease.remove();

			//stop any more footstep sounds happening
			if (footStepTimer) {
				footStepTimer.remove();
			}
		});
	}
}
