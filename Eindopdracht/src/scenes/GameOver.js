import Phaser from "../lib/phaser.js";

export default class GameOver extends Phaser.Scene {
  constructor() {
    super("game-over");
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add
      .text(
        width * 0.5,
        height * 0.5,
        "Game Over,\nYour score will be saved into the database!\n\nTap the screen to play again!",
        {
          fontSize: 18,
        }
      )
      .setOrigin(0.5);

    // this.input.keyboard.once("keydown-ENTER", () => {
    this.input.once("pointerdown", () => {
      this.startGame = false;
      this.scene.start("start-game");
    });
  }
}
