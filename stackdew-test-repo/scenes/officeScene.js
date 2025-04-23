import Phaser from 'phaser';
import DialogueManager from '../src/dialogueManager.js';
import renderInventory from '../src/renderInventory.js';
import { database, userInventory } from '../src/dummydata.js';

export default class officeScene extends Phaser.Scene {
	constructor() {
		super('officeScene');
	}
	//similar scene ould be added for player resting, switch map to show character in bed perhaps
	preload() {
		this.load.tilemapTiledJSON('dummyOfficeMap', 'assets/dummyOfficeMap.json');
		this.load.image('dummyOfficeMap', 'assets/dummyOfficeMap.png');
		this.load.audio('speechSound', '../assets/speechSound.wav');
	}

	create() {
		//initialise dialogue manager
		this.dialogue = new DialogueManager(this);

		//initialise render inventory
		this.renderInventory = new renderInventory(this);
		this.renderInventory.render(userInventory);

		const map = this.make.tilemap({ key: 'dummyOfficeMap' });
		const tileset = map.addTilesetImage('dummyOfficeMap', 'dummyOfficeMap');
		const mapLayer = map.createLayer('Tile Layer 1', tileset, 0, 0);

		this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
		this.cameras.main.fadeIn(1000, 0, 0, 0);

		//SPACE key for the scene transitions, player not actively in scene
		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);

		this.dialogue.startDialogue(
			[
				{
					text: `This feature is under construction.`,
					speaker: '',
					color: '#1f451c',
				},
				{
					text: `Please come back at a later date to see how your Devlings have flourished.`,
					speaker: '',
					color: '#1f451c',
				},
				{
					text: `I love my job.`,
					speaker: 'left',
					color: '#1f451c',
					x: 420,
					y: 30,
				},
				{
					text: `Thanks CorthNoders!`,
					speaker: 'left',
					color: '#1f451c',
					x: 420,
					y: 30,
				},
			],
			null,
			100,
			365
		);
	}

	update() {
		if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
			this.moveScene();
		}
	}

	moveScene() {
		this.input.keyboard.enabled = false;
		this.cameras.main.fadeOut(1000, 0, 0, 0);
		this.time.delayedCall(1000, () => {
			this.scene.start('overworldScene', { from: 'officeScene' });
			this.input.keyboard.enabled = true;
		});
	}
}
