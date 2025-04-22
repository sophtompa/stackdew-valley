import DialogueManager from '../src/dialogueManager.js';

export default class pauseScene extends Phaser.Scene {
	constructor() {
		super('pauseScene');
	}

	create(data) {
		const { returnScene } = data;

		//initialise dialogue manager
		this.dialogue = new DialogueManager(this);
		this.isDialogueRunning = false;

		// Tint overlay with semi transparency
		this.add.rectangle(400, 300, 800, 600, 0x000000, 0.5).setScrollFactor(0);
		this.dialogue.startDialogue(
			[
				{
					text: `Paused.`,
					speaker: '',
					color: '#1f451c',
					persist: true,
				},
			],
			() => {},
			320,
			221
		);

		this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

		//listen for P ress and 'unpause' by returning to original scene
		this.input.keyboard.on('keydown-P', () => {
			this.scene.stop();
			this.scene.resume(returnScene);
		});
	}
}
