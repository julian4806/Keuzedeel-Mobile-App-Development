import Phaser from "../lib/phaser.js";
import Carrot from "../game/Carrot.js";

export default class Game extends Phaser.Scene {
  platforms;
  player;
  cursors;
  carrots;
  carrotsCollected = 0;

  carrotsCollectedText;
  pausePlayIndicatorText;
  speedIndicatorText;

  timer = 0;
  bunnySpeed = 400;

  constructor() {
    super("game");
  }

  init() {
    this.carrotsCollected = 0;
  }

  preload() {
    // Load all the backgrouds in
    this.load.image("background", "assets/bg_layer1.jpg");
    this.load.image("clouds", "assets/clouds-white-small.png");
    this.load.image("platform", "assets/ground_grass.png");
    this.load.image("bunny-stand", "assets/bunny1_stand.png");
    this.load.image("bunny-jump", "assets/bunny1_jump.png");
    this.load.image("carrot", "assets/carrot.png");
    this.load.audio("jump", "assets/sfx/phaseJump1.wav");
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.game_width = this.scale.width;
    this.game_height = this.scale.height;
    this.background = this.add.tileSprite(240, 320, 0, 0, "background");
    this.clouds = this.add.tileSprite(240, 320, 0, 0, "clouds");
    this.background.setScrollFactor(1, 0);
    this.clouds.setScrollFactor(1, 0);
    // this.add.image(240, 320, "background");
    this.platforms = this.physics.add.staticGroup();
    // then create 5 platforms from the group
    for (let i = 0; i < 5; ++i) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;
      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.5;
      const body = platform.body;
      body.updateFromGameObject();
    }

    // Bunny🐇 Physics
    this.player = this.physics.add
      .sprite(240, 320, "bunny-stand")
      .setScale(0.5);
    this.physics.add.collider(this.platforms, this.player);
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(this.scale.width * 1.5);
    this.carrots = this.physics.add.group({
      classType: Carrot,
    });

    // Carrot Colliders
    this.physics.add.collider(this.platforms, this.carrots);
    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot,
      undefined,
      this
    );

    // Create Texts
    this.carrotsCollectedText = this.add
      .text(240, 10, "Carrots: 0", { color: "#000", fontSize: 24 })
      .setScrollFactor(0)
      .setOrigin(0.5, 0);

    this.pausePlayIndicatorText = this.add
      .text(0, 0, "Press SPACE✅", { color: "#000" })
      .setScrollFactor(0)
      .setOrigin(0, 0);

    this.speedIndicatorText = this.add
      .text(355, 0, "Speed: 400mph", {
        color: "#000",
        backgroundColor: "lightgreen",
      })
      .setScrollFactor(0)
      .setOrigin(0, 0);

    this.coundownIndicatorText = this.add
      .text(355, 0, "Time Left: 60", {
        color: "#000",
      })
      .setScrollFactor(0)
      .setOrigin(0, -1.2);

    // Keyboard⌨️
    this.input.keyboard.on("keydown-SPACE", () => {
      if (!this.startGame) {
        this.startGame = true;
        this.pausePlayIndicatorText.text = `Playing`;
      } else {
        this.startGame = false;
        this.pausePlayIndicatorText.text = `Paused`;
      }
    });
  }

  update(time, delta) {
    this.countdown(time);
    if (!this.player) return;

    this.platforms.children.iterate((child) => {
      const platform = child;

      const scrollY = this.cameras.main.scrollY;
      // checks if a platform touches the ground
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();
        this.addCarrotAbove(platform);
      }
    });
    const touchingDown = this.player.body.touching.down;
    const vy = this.player.body.velocity.y;
    if (touchingDown && vy === 0 && this.startGame) {
      this.player.setVelocityY(-this.bunnySpeed);
      this.player.setTexture("bunny-jump");
      this.sound.play("jump");
      this.clouds.tilePositionY += 5;
    }
    if (vy > 0 && this.player.texture.key !== "bunny-stand") {
      this.player.setTexture("bunny-stand");
      this.clouds.tilePositionY -= 5;
    }
    // Left keypress
    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200);
      this.background.tilePositionX += 0.4;
      this.clouds.tilePositionX += 0.5;
      //   rightkeypress
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200);
      this.background.tilePositionX -= 0.4;
      this.clouds.tilePositionX -= 0.5;
    } else {
      this.player.setVelocityX(0);
      //   this.background.x -= 0.1;
      this.clouds.tilePositionX += 0.2;
      this.background.tilePositionX += 0.1;
    }

    this.horizontalWrap(this.player);

    // check if player surpasses last platform ☠️
    const bottomPlatform = this.findBottomMostPlatform();
    if (this.player.y > bottomPlatform.y + 200) {
      this.scene.start("game-over");
      this.timer = 0; //zzz
      this.startGame = false;
    }
  }

  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;
    const carrot = this.carrots.get(sprite.x, y, "carrot");
    carrot.setActive(true);
    carrot.setVisible(true);
    this.add.existing(carrot);
    carrot.body.setSize(carrot.width, carrot.height);
    this.physics.world.enable(carrot);
    return carrot;
  }

  handleCollectCarrot(player, carrot) {
    this.carrots.killAndHide(carrot);
    this.physics.world.disableBody(carrot.body);
    this.carrotsCollected++;
    this.carrotsCollectedText.text = `Carrots: ${this.carrotsCollected}`;
    this.changeGameSpeedAccordingToTheAmountOfCarrotsCollected(
      this.carrotsCollected
    );
  }

  findBottomMostPlatform() {
    const platforms = this.platforms.getChildren();
    let bottomPlatform = platforms[0];
    for (let i = 1; i < platforms.length; ++i) {
      const platform = platforms[i];
      // discard any platforms that are above current
      if (platform.y < bottomPlatform.y) {
        continue;
      }
      bottomPlatform = platform;
    }
    return bottomPlatform;
  }

  changeGameSpeedAccordingToTheAmountOfCarrotsCollected(collectedCarrotCount) {
    this.bunnySpeed += +JSON.parse(`${collectedCarrotCount}`);
    this.speedIndicatorText.text = `Speed: ${this.bunnySpeed}mph`;

    if (this.bunnySpeed > 450)
      this.speedIndicatorText.setBackgroundColor("yellow");

    if (this.bunnySpeed > 500)
      this.speedIndicatorText.setBackgroundColor("orange");

    if (this.bunnySpeed > 550)
      this.speedIndicatorText.setBackgroundColor("red");

    if (this.bunnySpeed > 600) {
      this.bunnySpeed = 400;
      this.speedIndicatorText.text = `Speed: ${this.bunnySpeed}mph`;
      this.speedIndicatorText.setBackgroundColor("lightgreen");
    }
    // console.log(this.bunnySpeed);
  }

  countdown(x) {
    if (this.startGame) {
      const time = Math.floor(this.timer++ / 60);
      if (time < 61) {
        this.coundownIndicatorText.text = `Time Left: ${60 - time}`;
      } else {
        this.scene.start("game-over");
        this.timer = 0;
        this.startGame = false; //zzz
      }
    }

    //   this.timer = 0;
    //   this.startGame = false;
    //   this.scene.start("game-over");
    // } else {
    //   this.coundownIndicatorText.text = `Time Left: ${60 - x}`;
    // }
  }
}
