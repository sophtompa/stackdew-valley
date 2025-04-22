export default function togglePause(scene) {
	const isPaused = scene.scene.isPaused(scene);

	if (!isPaused) {
		//pause original scene
		scene.scene.pause();
		//switch to pauseScene
		scene.scene.launch('pauseScene', { returnScene: scene.scene.key });
	} else {
		//return to original scene
		scene.scene.stop('pauseScene');
		scene.scene.resume(scene.scene.key); // resume the calling scene
	}
}
