export default class RenderInventory {
	constructor(scene) {
		this.scene = scene;
		this.devlingSprites = {};
		this.devlingShadowSprites = {};
		this.plantedDevlingSprites = {};
		this.plotOffset = 0;
	}

	render(userInventory) {
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
		this.plantedDevlingSprites = {};

		let invX = 50;
		let invY = 50;
		let plotX = 500;
		let plotY = 70;

		userInventory.forEach((devling) => {
			// Inventory (top left)
			if (!devling.isPlanted || devling.isGrown) {
				const sprite = add.sprite(invX, invY, 'devlingImage');
				const shadow = add.sprite(invX + 4, invY + 4, 'devlingImage');
				shadow.setTint(0x000000);
				shadow.setAlpha(0.5);
				sprite.setDepth(1002);
				shadow.setDepth(1001);

				this.devlingSprites[devling.name] = sprite;
				this.devlingShadowSprites[devling.name] = shadow;
				invX += 40;
			}

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
					'devlingImage'
				);
				this.plantedDevlingSprites[devling.name] = plantedSprite;
			}
		});
	}
}
