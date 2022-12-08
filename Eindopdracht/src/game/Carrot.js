import Phaser from "../lib/phaser.js";

export default class Carrot extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "carrot") {
    super(scene, x, y, texture);
    this.setScale(0.5);
  }
}
