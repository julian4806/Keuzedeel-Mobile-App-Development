// imports the necessary files and classes
import Phaser from "./lib/phaser.js";
import Game from "./scenes/Game.js";
import StartGame from "./scenes/StartGame.js";
import GameOver from "./scenes/GameOver.js";

// makes sure the game will be configured
export default new Phaser.Game({
  // sets WebGL or Canvas based on browser compatibility
  type: Phaser.AUTO,
  // width / height of the game screen
  width: 480,
  height: 640,
  // loads the different child classes (in order)
  scene: [StartGame, Game, GameOver],
  physics: {
    // declares which physics engine will be used
    default: "arcade",
    arcade: {
      gravity: {
        // sets the amount of gravity
        y: 200,
      },
      // shows lines and hitboxes handy for development
      debug: true,
    },
  },
  fps: {
    // sets the framerate
    target: 60,
    forceSetTimeOut: true,
  },
});
