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

    this.input.once("pointerdown", () => {
      this.scene.start("game");
    });

    // this.input.keyboard.once("keydown-ENTER", () => {
    // this.scene.start("game");
    // });
  }
}
