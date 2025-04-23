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
		this.load.image('dungeon', '../assets/newdungeon.png' )

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
            this.player = new Player(this, this.spawnX, this.spawnY, 'playerSheet');

            // //enable keyboard
		    // this.input.keyboard.enabled = true;

		    //scene fades in
		    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
            //initialise dialogue manager
            this.dialogue = new DialogueManager(this);
            this.isDialogueRunning = false;
    
            // //initialise render inventory
            // this.renderInventory = new renderInventory(this);
            // this.renderInventory.render(userInventory);

            //create new map
		    this.add.image(400, 221, 'dungeon')
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