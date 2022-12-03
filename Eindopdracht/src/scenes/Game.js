import Phaser from "../lib/phaser.js";
export default class Game extends Phaser.Scene {
  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms;
  /** @type {Phaser.Physics.Arcade.Sprite} */
  player;
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors;
  constructor() {
    super("game");
  }
  preload() {
    this.load.image("background", "assets/bg_layer1.png");
    this.load.image("platform", "assets/ground_grass.png");
    this.load.image("bunny-stand", "assets/bunny1_stand.png");
    this.load.image("cloud", "assets/cloud.png");
    this.cursors = this.input.keyboard.createCursorKeys();
  }
  create() {
    this.coulds = [];
    this.add.image(240, 320, "background").setScrollFactor(1, 0);
    let cloudCount = 10;
    for (let i = 0; i < cloudCount; i++) {
      this.coulds.push(
        this.add
          .image(Math.random() * 480, Math.random() * 640, "cloud")
          .setScale((i + 1) / (cloudCount * 2))
      );
    }
    this.platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 5; ++i) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.5;
      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body;
      body.updateFromGameObject();
    }
    this.player = this.physics.add
      .sprite(240, 320, "bunny-stand")
      .setScale(0.5);
    this.physics.add.collider(this.platforms, this.player);
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;
    this.cameras.main.startFollow(this.player);
    // set the horizontal dead zone to 1.5x game width
    this.cameras.main.setDeadzone(this.scale.width * 1.5);
    //this.game.world.setBounds(0, 0, 800, 800);
  }
  update() {
    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child;
      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();
      }
    });
    console.log(this.cameras.main.scrollY);
    this.coulds.forEach((cloud) => {
      cloud.y = cloud.y + cloud.scale;
      //cloud.y = this.cameras.main.scrollY
      cloud.x = cloud.x + cloud.scale;
      if (cloud.y >= 640 + this.cameras.main.scrollY) {
        cloud.y = this.cameras.main.scrollY;
      }
      if (cloud.x >= 480) {
        cloud.x = 0;
      }
    });
    const touchingDown = this.player.body.touching.down;
    if (touchingDown) {
      this.player.setVelocityY(-300);
    }
    // left and right input logic
    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200);
    } else {
      // stop movement if not left or right
      this.player.setVelocityX(0);
    }
    this.horizontalWrap(this.player);
  }
  /**
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      console.log(sprite.x);
      sprite.x = -halfWidth;
    }
  }
}
