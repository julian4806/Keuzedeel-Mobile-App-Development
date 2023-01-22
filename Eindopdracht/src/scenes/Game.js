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

  settingsButton;
  leaderboardButton;

  startGame;
  canOpenMenus;
  path = `http://localhost/school/periode-5/Keuzedeel Mobile App Development/Eindopdracht/src/php/saveHighScore.php`;
  // path = `https://julianvh.nl/keuzedeel/src/php/saveHighScore.php`;

  constructor() {
    super("game");
  }

  init() {
    this.carrotsCollected = 0;
  }

  preload() {
    this.retrieveDataFromDatabase();
    // Load all the backgrouds in
    this.load.image("background", "assets/bg_layer1.jpg");
    this.load.image("clouds", "assets/clouds-white-small.png");
    this.load.image("platform", "assets/ground_grass.png");

    let dataURI = localStorage.getItem("userimage");
    if (dataURI !== null) {
      let data = new Image();
      data.src = dataURI;
      this.textures.addBase64("bunny-stand", dataURI, data);
      this.textures.addBase64("bunny-jump", dataURI, data);
    } else {
      this.load.image("bunny-stand", "assets/bunny1_stand.png");
      this.load.image("bunny-jump", "assets/bunny1_jump.png");
    }

    this.load.image("carrot", "assets/carrot.png");
    this.load.audio("jump", "assets/sfx/phaseJump1.wav");
    this.cursors = this.input.keyboard.createCursorKeys();

    this.settingsButton = document.querySelector(".settings-button");
    this.leaderboardButton = document.querySelector(".leaderboard-button");

    this.settingsModal = document.querySelector(".settings-modal");
    this.leaderboardModal = document.querySelector(".leaderboard-modal");
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
      // adds the bunny sprite with the width and height
      .sprite(240, 320, "bunny-stand")
      .setScale(0.5);
    // adds the collider on the platfroms and the player
    this.physics.add.collider(this.platforms, this.player);

    // sets the collision detection only on the bottom of the bunny
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    // camera follows the player
    this.cameras.main.startFollow(this.player);
    // Locks the background and makes sure the player can go out of the screen by a little margin
    this.cameras.main.setDeadzone(this.scale.width * 1.5);
    this.carrots = this.physics.add.group({
      classType: Carrot,
    });

    // Carrot🥕 Colliders
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
      .text(0, 0, "Click the screen✅", { color: "#000" })
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

    this.input.on("pointerdown", () => {
      closeModals();
      if (!this.startGame) {
        caniopenthemenu = false;
        this.startGame = true;
        this.pausePlayIndicatorText.text = `Playing`;
      } else {
        caniopenthemenu = true;
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

    // check if the game is paused, if so... The menu's can be opened
    if (!this.startGame && touchingDown && vy === 0) {
      this.canOpenMenus = true;
      this.settingsButton.style.opacity = 1;
      this.leaderboardButton.style.opacity = 1;
    } else {
      this.canOpenMenus = false;
      this.settingsButton.style.opacity = 0.3;
      this.leaderboardButton.style.opacity = 0.3;
    }

    if (vy > 0 && this.player.texture.key !== "bunny-stand") {
      this.player.setTexture("bunny-stand");
      this.clouds.tilePositionY -= 5;
    }

    // allows for keyboard controlls also
    // Left keypress⬅️
    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200);
      this.background.tilePositionX += 0.4;
      this.clouds.tilePositionX += 0.5;
      // right keypress➡️
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

    window.addEventListener(
      "devicemotion",
      (e) => {
        const x = Math.round(e.accelerationIncludingGravity.x) * 30;
        if (x < -60 && !touchingDown) {
          // right
          this.player.setVelocityX(200);
          this.background.tilePositionX -= 0.0004;
          this.clouds.tilePositionX -= 0.0005;
        } else if (x > 60 && !touchingDown) {
          //left
          this.player.setVelocityX(-200);
          this.background.tilePositionX += 0.0004;
          this.clouds.tilePositionX += 0.0005;
        } else {
          this.player.setVelocityX(0);
          this.clouds.tilePositionX += 0.002;
        }
      },
      true
    );

    // check if player surpasses the last platform ☠️
    const bottomPlatform = this.findBottomMostPlatform();
    if (this.player.y > bottomPlatform.y + 200) {
      this.scene.start("game-over");
      this.saveDataToDatabase();
      this.timer = 0; //zzz
      this.startGame = false;
    }

    // Checks if the canOpenMenus variable is true or false and according to that decides if the user can open up the menu or not
    this.settingsButton.onclick = () => {
      if (this.canOpenMenus) {
        settingsOpen();
      }
    };
    // same thing here⭕
    this.leaderboardButton.onclick = () => {
      if (this.canOpenMenus) {
        leaderboardOpen();
      }
    };
  }

  // Makes sure the player appears on the other side of the screen when leaving the screen
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

  // checks if player is colliding with a carrot🥕
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
    //
  }

  countdown(x) {
    if (this.startGame) {
      const time = Math.floor(this.timer++ / 60);
      if (time < 61) {
        //default 6️⃣1️⃣
        this.coundownIndicatorText.text = `Time Left: ${60 - time}`;
      } else {
        this.scene.start("game-over");
        this.saveDataToDatabase();
        this.timer = 0;
        this.startGame = false; //zzz
        // fetch that stores the userdata in the database
      }
    }
  }

  saveDataToDatabase() {
    // sends the data towards the PHP file
    fetch(
      `${this.path}?player=${username.value}&score=${this.carrotsCollected}`,
      {
        method: "get",
      }
    )
      .then(function (response) {
        if (response.status >= 200 && response.status < 300) {
          return response.text();
        }
        // throws an error if the request could not be made
        throw new Error(response.statusText);
      })
      .then(function (response) {
        // renders the result to the leaderboard
        leaderboardData.innerHTML = response;
      });
  }

  retrieveDataFromDatabase() {
    // gets the data from the PHP file. Doesn't insert anything
    fetch(`${this.path}`, {
      method: "get",
    })
      .then(function (response) {
        if (response.status >= 200 && response.status < 300) {
          return response.text();
        }
        throw new Error(response.statusText);
      })
      .then(function (response) {
        leaderboardData.innerHTML = response;
      });
  }
}
