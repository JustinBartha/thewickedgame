var BasicGame = {
  SEA_SCROLL_SPEED: 100,
  PLAYER_SPRITE: '4',
  PLAYER_SPEED: 400,
  ENEMY_MIN_Y_VELOCITY: 30,
  ENEMY_MAX_Y_VELOCITY: 60,
  SHOOTER_MIN_VELOCITY: 30,
  SHOOTER_MAX_VELOCITY: 80,
  BOSS_Y_VELOCITY: 20,
  BOSS_X_VELOCITY: 200,
  BULLET_VELOCITY: 500,
  ENEMY_BULLET_VELOCITY: 150,
  POWERUP_VELOCITY: 200,

  SPAWN_ENEMY_DELAY: Phaser.Timer.SECOND,
  SPAWN_SHOOTER_DELAY: Phaser.Timer.SECOND * 1,
  BOSS_TRIGGER_SCORE: 1000,

  SHOT_DELAY: Phaser.Timer.SECOND * 0.1,
  SHOOTER_SHOT_DELAY: Phaser.Timer.SECOND * 2,
  BOSS_SHOT_DELAY: Phaser.Timer.SECOND,

  ENEMY_HEALTH: 3,
  SHOOTER_HEALTH: 5,
  BOSS_HEALTH: 300,

  BULLET_DAMAGE: 1,
  CRASH_DAMAGE: 3,

  ENEMY_REWARD: 100,
  SHOOTER_REWARD: 400,
  BOSS_REWARD: 10000,
  POWERUP_REWARD: 100,

  ENEMY_DROP_RATE: 1 ,
  SHOOTER_DROP_RATE: 0.5,
  BOSS_DROP_RATE: 0,

  PLAYER_EXTRA_LIVES: 10,
  PLAYER_GHOST_TIME: Phaser.Timer.SECOND * 3,

  INSTRUCTION_EXPIRE: Phaser.Timer.SECOND * 10,
  RETURN_MESSAGE_DELAY: Phaser.Timer.SECOND * 2
};

BasicGame.Boot = function (game) {

};

BasicGame.Boot.prototype = {

  init: function () {

    // Set the game to only allow one touch/pointer at a time (no need for multitouch here)
    this.input.maxPointers = 1;

    // Uncomment here for the game not to pause when it loses focus.
    // this.stage.disableVisibilityChange = true;

    if (this.game.device.desktop) {
      //  If you have any desktop specific settings, they can go in here
    } else {
      //  Same goes for mobile settings.
      //  In this case we're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
      this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      this.scale.setMinMax(480, 260, 1024, 768);
      this.scale.forceLandscape = true;
    }
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
  },

  preload: function () {
    //  Load the loading bar assets.
    this.load.image('preloaderBar', 'assets/preloader-bar.png');

  },

  create: function () {
      // Move onto the next stage, preloading the actual game.
      this.state.start('Preloader');

  }

};
