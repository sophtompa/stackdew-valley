import Phaser from 'phaser';
import Player from '../src/player.js';
import DialogueManager from '../src/dialogueManager.js';
import renderInventory from '../src/renderInventory.js';
import togglePause from '../src/togglePause.js';
import { database, userInventory } from '../src/dummydata.js';

export default class dungeonScene extends Phaser.Scene {
	constructor() {
		super('dungeonScene');
	}

	preload() {
		this.load.image('dungeon', '../assets/newdungeon.png');

		this.load.spritesheet('playerSheet', '../assets/rose.png', {
			frameWidth: 64,
			frameHeight: 64,
		});
		this.load.spritesheet('devlingImage', '../assets/devlingSpritesheet.png', {
			frameWidth: 64,
			frameHeight: 64,
		});
	}

	create() {
		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE
		);
		this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
		//this.player = new Player(this, this.spawnX, this.spawnY, 'playerSheet');

		// //enable keyboard
		// this.input.keyboard.enabled = true;

		//scene fades in
		this.cameras.main.fadeIn(1000, 0, 0, 0);

		//initialise dialogue manager
		this.dialogue = new DialogueManager(this);
		this.isDialogueRunning = false;

		// //initialise render inventory
		this.renderInventory = new renderInventory(this);
		this.renderInventory.render(userInventory);

		//create new map
		this.add.image(400, 221, 'dungeon');

		this.dialogue.startDialogue(
			[
				{
					text: `"Wicked Mitch of the West's Tech Dungeon"(tm) is not safe to be visited right now.`,
					speaker: '',
					color: '#1f451c',
				},
				{
					text: `Please come back at a later date to see how your Devlings have suffered.`,
					speaker: '',
					color: '#1f451c',
				},
				{
					text: `An infinite loop of...`,
					speaker: 'left',
					color: '#1f451c',
					x: 330,
					y: 135,
				},
				{
					text: `PAIN!!!`,
					speaker: 'left',
					color: '#1f451c',
					x: 330,
					y: 135,
				},
				{
					text: `Trapped in development hell!`,
					speaker: 'left',
					color: '#1f451c',
					x: 460,
					y: 165,
				},
				{
					text: `Thanks CorthNoders!`,
					speaker: 'left',
					color: '#1f451c',
					x: 395,
					y: 60,
				},
			],
			null,
			220,
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
			this.scene.start('overworldScene', { from: 'dungeonScene' });
			this.input.keyboard.enabled = true;
		});
	}
}
