export default class RenderInventory {
	constructor(scene) {
		this.scene = scene;
		this.devlingSprites = {};
		this.devlingShadowSprites = {};
		this.devlingWateredSprites = {};
		this.plantedDevlingSprites = {};
		this.plotOffset = 0;
	}

	render(userInventory, scene) {
		const { add } = this.scene;

		// Clean up existing UI
		this.plotOffset = 0;
		Object.values(this.devlingSprites).forEach((sprite) => sprite.destroy());
		Object.values(this.devlingShadowSprites).forEach((shadow) =>
			shadow.destroy()
		);

		Object.values(this.plantedDevlingSprites).forEach((sprite) =>
			sprite.destroy()
		);

		this.devlingSprites = {};
		this.devlingShadowSprites = {};
		// this.devlingWateredSprites = {};
		this.plantedDevlingSprites = {};

		let invX = 50;
		let invY = 50;
		let plotX = 500;
		let plotY = 70;

		userInventory.forEach((devling) => {
			// Inventory (top left)
			if (!devling.isPlanted || devling.isGrown) {
				const sprite = add.sprite(invX, invY, devling.name);
				const shadow = add.sprite(invX + 4, invY + 4, devling.name);
				shadow.setTint(0x000000);
				shadow.setAlpha(0.5);
				sprite.setDepth(1002);
				shadow.setDepth(1001);
				this.devlingSprites[devling.name] = sprite;
				this.devlingShadowSprites[devling.name] = shadow;

				invX += 40;
			}

			if (this.scene.scene.key === 'farmScene') {
				// Planted plot (dirt bed)
				if (devling.isPlanted && !devling.isGrown) {
					if (devling.plantX === undefined || devling.plantY === undefined) {
						const row = Math.floor(this.plotOffset / 3);
						const col = this.plotOffset % 3;
						devling.plantX = plotX + col * 62;
						devling.plantY = plotY + row * 65;
					}
					this.plotOffset++;

					const plantedSprite = add.sprite(
						devling.plantX,
						devling.plantY,
						devling.name
					);
					plantedSprite.setDepth(6);

					this.plantedDevlingSprites[devling.name] = plantedSprite;
				}

				if (
					devling.isPlanted &&
					devling.isWatered &&
					!devling.isGrown &&
					!devling.isWateredTweenActive
				) {
					const watered = add.sprite(
						devling.plantX,
						devling.plantY,
						devling.name
					);
					watered.setTint(0x000000);
					watered.setAlpha(0.5);
					watered.setDepth(4);
					watered.setScale(1.5);
					this.devlingWateredSprites[devling.name] = watered;

					devling.isWateredTweenActive = true;

					this.scene.tweens.add({
						targets: watered,
						alpha: 0,
						duration: 5000,
						ease: 'Sine.easeInOut',
						onComplete: () => {
							devling.isWatered = true;
							devling.isWateredTweenActive = false;
							watered.destroy();
							delete this.devlingWateredSprites[devling.name];
							//console.log(`${devling.name} is now watered!`);
						},
					});
				}
			}
		});
	}

	jiggleSprite(devlingName) {
		//jiggle the devling sprite in the UI
		const sprite = this.devlingSprites[devlingName];
		this.scene.tweens.add({
			targets: sprite,
			x: sprite.x + 3,
			yoyo: true,
			repeat: 3,
			duration: 50,
			ease: 'Sine.easeInOut',
		});

		//make the shadow flash white briefly
		const shadow = this.devlingShadowSprites[devlingName];
		if (shadow) {
			this.scene.tweens.addCounter({
				from: 0,
				to: 100,
				duration: 200,
				yoyo: true,
				ease: 'Sine.easeInOut',
				onUpdate: (tween) => {
					const value = tween.getValue();
					const color = Phaser.Display.Color.Interpolate.ColorWithColor(
						Phaser.Display.Color.ValueToColor(0x000000), // original shadow color
						Phaser.Display.Color.ValueToColor(0xffffff), // flash to white
						100,
						value
					);
					shadow.setTint(
						Phaser.Display.Color.GetColor(color.r, color.g, color.b)
					);
				},
				onComplete: () => {
					shadow.setTint(0x000000);
				},
			});
		}
	}
}
