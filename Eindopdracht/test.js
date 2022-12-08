var game = new Phaser.Game(800, 600, Phaser.AUTO, "", {
  preload: preload,
  create: create,
  update: update,
});
var sky;
var cursors;

function preload() {
  game.load.image("sky", "sky.png");
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  sky = game.add.sprite(0, 0, "sky");
  game.physics.enable(sky, Phaser.Physics.ARCADE);
  cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  if (cursors.left.isDown) {
    sky.body.velocity.x = -150;
  } else {
    sky.body.velocity.x = 0;
  }
}
