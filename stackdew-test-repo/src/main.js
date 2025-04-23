import Phaser from 'phaser';
import overworldScene from '../scenes/overworld.js';
import preloadScene from '../scenes/preloadScene.js';
import firstFloor from '../scenes/firstFloor.js';
import secondFloor from '../scenes/secondFloor.js';
import farmScene from '../scenes/farmScene.js';
import ComputerScene from '../scenes/computerScene.js';
import officeScene from '../scenes/officeScene.js';
import battleScene from '../scenes/battleScene.js';
import battleCardScene from '../scenes/battleCards.js';
import titleScene from '../scenes/titleScene.js';
import pauseScene from '../scenes/pauseScene.js';
// import trumpBattle from "../scenes/trumpScene.js";

export class mainScene extends Phaser.Scene {
	constructor() {
		super('mainScene');
	}
}

//blah

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 448,
	backgroundColor: '#2d2d2d',

	// config to being able to get the dom and have input for computerScene
	parent: 'game-container',

	dom: {
		createContainer: true,
	},
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		// zoom: window.screen.availWidth / 200,
	},
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 0 },
			debug: true,
		},
	},

	scene: [

		titleScene,
    development
		firstFloor,
		farmScene,
		preloadScene,
		overworldScene,
		secondFloor,
		ComputerScene,
		battleScene,
		battleCardScene,
		pauseScene,
	],
};

const game = new Phaser.Game(config);
