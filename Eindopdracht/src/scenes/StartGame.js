import Phaser from "../lib/phaser.js";

export default class StartGame extends Phaser.Scene {
  constructor() {
    super("start-game");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .text(width * 0.5, height * 0.5, "Start Game", {
        fontSize: 48,
      })
      .setOrigin(0.5);

    this.input.keyboard.once("keydown-SPACE", () => {
      this.scene.start("game");
    });
  }
}
