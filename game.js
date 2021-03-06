BasicGame.Game = function (game) {

};

BasicGame.Game.prototype = {
    /* Creates the game objects (ideally with already loaded assets) */
    create: function () {
        // Phase One:
       this.setupBackground();
   this.setupPlayer();
        this.setupEnemies();
        // Implement keyboard control with arrow keys
        this.cursors = this.input.keyboard.createCursorKeys();
        this.setupBullets();
        this.setupExplosions();
        this.setupPlayerIcons();
        this.setupText();
          //Phase Two:
        this.setupBoss();
  this.setupAudio();
    },


    update: function () {
      this.processPlayerInput();
this.spawnEnemies();
this.checkCollisions();
this.enemyFire();
this.processDelayedEffects();  // Phase One:
        //Phase Two
                this.bossFire();

    },


    render: function () {
        // Enable collision range display for debugging
        //this.game.debug.body(this.bullet);
        //this.game.debug.body(this.enemy);
        //this.game.debug.body(this.player);

    },

    //
    // create() - related functions
    //

    setupAudio: function () {
        this.explosionSFX = this.add.audio('explosion');
        this.playerExplosionSFX = this.add.audio('playerExplosion');
        this.enemyFireSFX = this.add.audio('enemyFire');
        this.playerFireSFX = this.add.audio('playerFire');
        this.powerUpSFX = this.add.audio('powerUp');
    },

    setupBackground: function () {
        // Creates the sea background
        this.sea = this.add.tileSprite(0, 0, this.game.width, this.game.height, 'sea');
        this.sea.autoScroll(0, BasicGame.SEA_SCROLL_SPEED);
    },

    setupPlayer: function () {
        // Creates the player Sprite
        this.player = this.add.sprite(this.game.width / 2, this.game.height - 50, 'player');
        this.player.anchor.setTo(0.5, 0.5);
        this.player.animations.add('fly', [0, 1, 2], 20, true);
        this.player.animations.add('ghost', [ 3, 0, 3, 1 ], 20, true);
        this.player.play('fly');
        this.physics.enable(this.player, Phaser.Physics.ARCADE);
        // Player's default motion speed
        this.player.speed = BasicGame.PLAYER_SPEED;
        // Player is bound within game stage
        this.player.body.collideWorldBounds = true;

        // 20 x 20 pixel hitbox, centered a little bit higher than the center
        this.player.body.setSize(20, 20, 0, -5);

        this.weaponLevel = 0;
    },

    setupEnemies: function () {
        // Creates the enemy sprite pool
        this.enemyPool = this.add.group();
        this.enemyPool.enableBody = true;
        this.enemyPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyPool.createMultiple(50, 'greenEnemy');
        this.enemyPool.setAll('anchor.x', 0.5);
        this.enemyPool.setAll('anchor.y', 0.5);
        this.enemyPool.setAll('outOfBoundsKill', true);
        this.enemyPool.setAll('checkWorldBounds', true);
        // Enemy points reward
        this.enemyPool.setAll('reward', BasicGame.ENEMY_REWARD, false, false, 0, true);
        this.enemyPool.setAll(
            'dropRate', BasicGame.ENEMY_DROP_RATE, false, false, 0, true
        );

        // Set the animation for each sprite in enemyPool
        this.enemyPool.forEach(function (enemy) {
            enemy.animations.add('fly', [ 0, 1, 2], 20, true);
            enemy.animations.add('hit', [ 3, 1, 3, 2], 20, false);
            enemy.events.onAnimationComplete.add( function(e) {
                e.play('fly');
            }, this);
        });
        // Set enemy spawn rate
        this.nextEnemyAt = 0;
        this.enemyDelay = BasicGame.SPAWN_ENEMY_DELAY;

        // Creates Shooter enemy sprite pool
        this.shooterPool = this.add.group();
        this.shooterPool.enableBody = true;
        this.shooterPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.shooterPool.createMultiple(20, 'whiteEnemy');
        this.shooterPool.setAll('anchor.x', 0.5);
        this.shooterPool.setAll('anchor.y', 0.5);
        this.shooterPool.setAll('outOfBoundsKill', true);
        this.shooterPool.setAll('checkWorldBounds', true);
        // Enemy points reward
        this.shooterPool.setAll('reward', BasicGame.SHOOTER_REWARD, false, false, 0, true);
        this.shooterPool.setAll(
            'dropRate', BasicGame.SHOOTER_DROP_RATE, false, false, 0 ,true
        );

        // Set the animation for each sprite in enemyPool
        this.shooterPool.forEach(function (enemy) {
            enemy.animations.add('fly', [ 0, 1, 2], 20, true);
            enemy.animations.add('hit', [ 3, 1, 3, 2], 20, false);
            enemy.events.onAnimationComplete.add( function(e) {
                e.play('fly');
            }, this);
        });
        // Start Spawning Shooters 5 seconds after game starts
        this.nextShooterAt = this.time.now + Phaser.Timer.SECOND * 5;
        this.shooterDelay = BasicGame.SPAWN_SHOOTER_DELAY;
    },

    setupBoss: function() {
        this.bossPool = this.add.group();
        this.bossPool.enableBody = true;
        this.bossPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.bossPool.createMultiple(1, 'boss');
        this.bossPool.setAll('anchor.x', 0.5);
        this.bossPool.setAll('anchor.y', 0.5);
        this.bossPool.setAll('outOfBoundsKill', true);
        this.bossPool.setAll('reward', BasicGame.BOSS_REWARD, false, false, 0, true);
        this.bossPool.setAll(
            'dropRate', BasicGame.BOSS_DROP_RATE, false, false, 0, true
        );

        this.bossPool.forEach(function (enemy) {
            enemy.animations.add('fly', [0, 1, 2 ], 20, true);
            enemy.animations.add('hit', [ 3, 1, 3, 2 ], 20, false);
            enemy.events.onAnimationComplete.add( function (e) {
                e.play('fly');
            }, this);
        });

        this.boss = this.bossPool.getTop();
        this.bossApproaching = false;

    },

    setupBullets: function () {
        this.enemyBulletPool = this.add.group();
        this.enemyBulletPool.enableBody = true;
        this.enemyBulletPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.enemyBulletPool.createMultiple(100, 'enemyBullet');
        this.enemyBulletPool.setAll('anchor.x', 0.5);
        this.enemyBulletPool.setAll('anchor.y', 0.5);
        this.enemyBulletPool.setAll('outOfBoundsKill', true);
        this.enemyBulletPool.setAll('checkWorldBounds', true);
        this.enemyBulletPool.setAll('reward', 0, false, false, 0, true);


        // Creates the bullets sprite group
        this.bulletPool = this.add.group();
        // Enable physics to the whole sprite group
        this.bulletPool.enableBody = true;
        this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
        // Add 100 'bullet' sprites in the group.
        // By default this uses the first frame of the sprite sheet and
        // sets the initial state as non-existing (i.e. killed/dead)
        this.bulletPool.createMultiple(100, 'bullet');
        // Sets anchors of all bullet sprites
        this.bulletPool.setAll('anchor.x', 0.5);
        this.bulletPool.setAll('anchor.y', 0.5);
        // Automatically kill the bullet sprites when they go out of bounds
        this.bulletPool.setAll('outOfBoundsKill', true);
        this.bulletPool.setAll('checkWorldBounds', true);
        // Set firing rate
        this.nextShotAt = 0;
        this.shotDelay = BasicGame.SHOT_DELAY;
    },

    setupExplosions: function () {
        //Turn explosions into a pool for better performance
        this.explosionPool = this.add.group();
        this.explosionPool.enableBody = true;
        this.explosionPool.physicsBodyType = Phaser.Physics.ARCADE;
        this.explosionPool.createMultiple(100, 'explosion');
        this.explosionPool.setAll('anchor.x', 0.5);
        this.explosionPool.setAll('anchor.y', 0.5);
        this.explosionPool.forEach(function (explosion) {
            explosion.animations.add('boom');
        });
    },

    setupPlayerIcons: function () {
        this.powerUpPool = this.add.group();
        this.powerUpPool.enableBody = true;
        this.powerUpPool.physicsBodyType = Phaser.Physics.ARCARDE;
        this.powerUpPool.createMultiple(5, 'powerup1');
        this.powerUpPool.setAll('anchor.x', 0.5);
        this.powerUpPool.setAll('anchor.y', 0.5);
        this.powerUpPool.setAll('outOfBoundsKill', true);
        this.powerUpPool.setAll('checkWorldBounds', true);
        this.powerUpPool.setAll(
            'reward', BasicGame.POWERUP_REWARD, false, false, 0, true
        );

        this.lives = this.add.group();
        // Calculate location of first life icon
        var firstLifeIconX = this.game.width - 10 - (BasicGame.PLAYER_EXTRA_LIVES * 30);
        for (var i = 0; i < BasicGame.PLAYER_EXTRA_LIVES; i++) {
            var life = this.lives.create(firstLifeIconX + (30 * i), 30, 'player');
            life.scale.setTo(0.5, 0.5);
            life.anchor.setTo(0.5, 0.5);
        };
    },

    setupText: function () {
        // Creates a help message with instructions
        this.instructions = this.add.text(
            this.game.width / 2,
            this.game.height - 100,
            'Use Arrow Keys to Move, Press Z to Fire\n' +
                'Tapping/clicking does both',
            { font: '20px monospace', fill: '#fff', align: 'center' });
        this.instructions.anchor.setTo(0.5, 0.5);
        this.instExpire = this.time.now + BasicGame.INSTRUCTION_EXPIRE;

        this.score = 0;
        this.scoreText = this.add.text(
            this.game.width / 2, 30, '' + this.score,
            {font: '20px monospace', fill: '#fff', align: 'center' }
        );
        this.scoreText.anchor.setTo(0.5, 0.5);
    },

    //
    // update() - related functions
    //
    checkCollisions: function () {
        // Collision handling between enemy and bullet
        this.physics.arcade.overlap(
            this.bulletPool, this.enemyPool, this.enemyHit, null, this
        );

        this.physics.arcade.overlap(
            this.player, this.powerUpPool, this.playerPowerUp, null, this
        );

        if (this.bossApproaching === false) {
            this.physics.arcade.overlap(
                this.bulletPool, this.bossPool, this.enemyHit, null, this
            );

            this.physics.arcade.overlap(
                this.player, this.bossPool, this.playerHit, null, this
            );
        }

        // Collision between shooter and bullet
        this.physics.arcade.overlap(
            this.bulletPool, this.shooterPool, this.enemyHit, null, this
        );

        // Collision detection between player and enemy
        this.physics.arcade.overlap(
            this.player, this.enemyPool, this.playerHit, null, this
        );

        this.physics.arcade.overlap(
            this.player, this.shooterPool, this.playerHit, null, this
        );

        this.physics.arcade.overlap(
            this.player, this.enemyBulletPool, this.playerHit, null, this
        );
    },

    spawnEnemies: function () {
        if (this.nextEnemyAt < this.time.now && this.enemyPool.countDead() > 0){
            this.nextEnemyAt = this.time.now + this.enemyDelay;
            var enemy = this.enemyPool.getFirstExists(false);

            // Spawn at a random location top of the screen
            enemy.reset(
                this.rnd.integerInRange(20, this.game.width - 20), 0,
                BasicGame.ENEMY_HEALTH // same as enemy.health =
            );

            // Also randomise speed
            enemy.body.velocity.y = this.rnd.integerInRange(
                BasicGame.ENEMY_MIN_Y_VELOCITY, BasicGame.ENEMY_MAX_Y_VELOCITY
            );
            enemy.play('fly');
        }

        if (this.nextShooterAt < this.time.now && this.shooterPool.countDead() > 0) {
            // if ( this.bossPool.countDead() === 0) {
            //     //Won't spawn shooters if the boss is alive
            //     return;
            // };


            this.nextShooterAt = this.time.now + this.shooterDelay;
            var shooter = this.shooterPool.getFirstExists(false);

            // Spawn at a random location at the top
            shooter.reset(
                this.rnd.integerInRange(20, this.game.width - 20), 0,
                BasicGame.SHOOTER_HEALTH
            );

            // choose a random target location at the bottom
            var target = this.rnd.integerInRange(20, this.game.width - 20);

            // Move to target and rotate the sprite accordingly
            shooter.rotation = this.physics.arcade.moveToXY(
                shooter, target, this.game.height,
                this.rnd.integerInRange(
                    BasicGame.SHOOTER_MIN_VELOCITY, BasicGame.SHOOTER_MAX_VELOCITY
                )
            ) - Math.PI / 2;

            shooter.play('fly');

            // Each shooter should have its own timer
            shooter.nextShotAt = 0;
        }
    },

    spawnBoss: function () {
        this.bossApproaching = true;
        this.boss.reset(this.game.width / 2, 0, BasicGame.BOSS_HEALTH);
        this.physics.enable(this.boss, Phaser.Physics.ARCADE);
        this.boss.body.velocity.y = BasicGame.BOSS_Y_VELOCITY;
        this.boss.play('fly');
    },

    enemyFire: function () {
        this.shooterPool.forEachAlive(function (enemy) {
            if (this.time.now > enemy.nextShotAt && this.enemyBulletPool.countDead() > 0) {
                var bullet = this.enemyBulletPool.getFirstExists(false);
                bullet.reset(enemy.x, enemy.y);
                this.physics.arcade.moveToObject(
                    bullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY
                );
                enemy.nextShotAt = this.time.now + BasicGame.SHOOTER_SHOT_DELAY;
                 this.enemyFireSFX.play();
            }
        }, this);
    },

    bossFire: function() {
        if (this.bossApproaching === false && this.boss.alive &&
            this.boss.nextShotAt < this.time.now &&
            this.enemyBulletPool.countDead() >= 10) {

            this.boss.nextShotAt = this.time.now + BasicGame.BOSS_SHOT_DELAY;

             this.enemyFireSFX.play();


            for (var i = 0; i < 5; i++) {
                // Process 2 bullets at a time
                var leftBullet = this.enemyBulletPool.getFirstExists(false);
                leftBullet.reset (this.boss.x - 10 - i * 10, this.boss.y + 20);
                var rightBullet = this.enemyBulletPool.getFirstExists(false);
                rightBullet.reset(this.boss.x + 10 + i * 10, this.boss.y + 20);

                if (this.boss.health > BasicGame.BOSS_HEALTH / 2) {
                    // Aim directly at the player
                    this.physics.arcade.moveToObject(
                        leftBullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY
                    );
                    this.physics.arcade.moveToObject(
                        rightBullet, this.player, BasicGame.ENEMY_BULLET_VELOCITY
                    );
                } else {
                    this.physics.arcade.moveToXY(
                        leftBullet, this.player.x - i * 100, this.player.y,
                        BasicGame.ENEMY_BULLET_VELOCITY
                    );
                    this.physics.arcade.moveToXY(
                        rightBullet, this.player.x + i * 100, this.player.y,
                        BasicGame.ENEMY_BULLET_VELOCITY
                    );
                }
            };
        }
    },

    processPlayerInput: function () {
        // Defines Player Motion engine
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;

        // Horizontal Move Arrows
        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -this.player.speed;
        } else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = this.player.speed;
        }

        // Vertical Move Arrows
        if (this.cursors.up.isDown) {
            this.player.body.velocity.y = -this.player.speed;
        } else if (this.cursors.down.isDown) {
            this.player.body.velocity.y = this.player.speed;
        }

        // Implement Mouse and Touch movement
        if (this.input.activePointer.isDown &&
            this.physics.arcade.distanceToPointer(this.player) > 15) { //Fixes trembling sprite caused by movement overshoot

            this.physics.arcade.moveToPointer(this.player, this.player.speed);
        }

        if ((this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) ||
            this.input.activePointer.isDown) || 
            (this.input.keyboard.isDown(Phaser.Keyboard.K))) {
            if (this.returnText && this.returnText.exists) {
                this.quitGame();
            } else {
                this.fire();
            }
        }
    },

    processDelayedEffects: function () {
        if (this.instructions.exists && this.time.now > this.instExpire) {
            this.instructions.destroy();
        }

        if (this.ghostUntil && this.ghostUntil < this.time.now) {
            this.ghostUntil = null;
            this.player.play('fly');
        }

        if (this.showReturn && this.time.now > this.showReturn) {
            this.returnText = this.add.text(
                this.game.width / 2, this.game.height / 2 + 20,
                'Press Z or Tap Game to go back to Main Menu',
                { font: '16px sans-serif', fill: '#fff'}
            );
            this.returnText.anchor.setTo(0.5, 0.5);
            this.showReturn = false;
        }

         if (this.bossApproaching && this.boss.y > 80) {
             this.bossApproaching = false;
            this.boss.nextShotAt = 0;

            this.boss.body.velocity.y = 0;
            this.boss.body.velocity.x = BasicGame.BOSS_X_VELOCITY;

            //Allow bouncing off world bounds
             this.boss.body.bounce.x = 1;
             this.boss.body.collideWorldBounds = true;
         };
    },

    //
    // Other Functions
    //

    // Function to define behaviour when enemy is hit
    enemyHit: function (bullet, enemy) {
        bullet.kill();
        this.damageEnemy(enemy, BasicGame.BULLET_DAMAGE);
    },

    // Function to define behaviour when player is hit
    playerHit: function (player, enemy) {
        // Check first if this.ghostUntil is not undefined or null
        if (this.ghostUntil && this.ghostUntil > this.time.now) {
            return;
        }

         this.playerExplosionSFX.play();

        // Crashing into an enemy only deals 5 damage
        this.damageEnemy(enemy, BasicGame.CRASH_DAMAGE);
        var life = this.lives.getFirstAlive();
        if (life !== null) {
            life.kill();
            this.weaponLevel = 0;
            this.ghostUntil = this.time.now + BasicGame.PLAYER_GHOST_TIME;
            this.player.play('ghost');
        } else {
            this.explode(player);
            player.kill();
            this.displayEnd(false);
        }
    },

    // Calculates Enemy Damage
    damageEnemy: function (enemy, damage) {
        enemy.damage(damage);
        if (enemy.alive) {
            enemy.play('hit');
        } else {
            this.explode(enemy);
             this.explosionSFX.play();
            this.spawnPowerUp(enemy);
            this.addToScore(enemy.reward);
            // We check the sprite key (e.g. 'greenEnemy') to see if the sprite is a boss
            // For full games, it would be better to set flags on the sprites themselves
            if (enemy.key === 'boss') {
                this.enemyPool.destroy();
                this.shooterPool.destroy();
                this.bossPool.destroy();
                this.enemyBulletPool.destroy();
                this.displayEnd(true);
            }
        }
    },

    spawnPowerUp: function (enemy) {
        if (this.powerUpPool.countDead() === 0 || this.weaponLevel === 5) {
            return;
        }

        if (this.rnd.frac() < enemy.dropRate) {
            var powerUp = this.powerUpPool.getFirstExists(false);
            powerUp.reset(enemy.x, enemy.y);
            powerUp.body.velocity.y = BasicGame.POWERUP_VELOCITY;
        }
    },

    playerPowerUp: function (player, powerUp) {
        this.addToScore(powerUp.reward);
        powerUp.kill();
        this.powerUpSFX.play();
        if (this.weaponLevel < 5) {
            this.weaponLevel++;
        }
    },

    addToScore: function (score) {
        this.score += score;
        this.scoreText.text = this.score;
         if (this.score >= BasicGame.BOSS_TRIGGER_SCORE && this.bossPool.countDead() == 1) {
             this.spawnBoss();
         }
    },

    // Manage player's bullets being fired
    fire: function () {
        if (!this.player.alive || this.nextShotAt > this.time.now) {
            return;
        }

        this.nextShotAt = this.time.now + this.shotDelay;
         this.playerFireSFX.play();

        var bullet;
        if (this.weaponLevel === 0) {
            if (this.bulletPool.countDead() === 0) {
                return;
            }
            bullet = this.bulletPool.getFirstExists(false);
            bullet.reset(this.player.x, this.player.y - 20);
            bullet.body.velocity.y = -BasicGame.BULLET_VELOCITY;
        } else {
            if (this.bulletPool.countDead() < this.weaponLevel * 2) {
                return;
            }
            for (var i = 0; i < this.weaponLevel; i++) {
                bullet = this.bulletPool.getFirstExists(false);
                // Spawn left bullet slightly left off center
                bullet.reset(this.player.x - (10 + i * 6), this.player.y - 20);
                // The left bullets spread from -95 to -135 degrees
                this.physics.arcade.velocityFromAngle(
                        -95 - i * 10, BasicGame.BULLET_VELOCITY, bullet.body.velocity
                );

                bullet = this.bulletPool.getFirstExists(false);
                // Spawn right bullets slightly right off center
                bullet.reset(this.player.x + (10 + i * 6), this.player.y - 20);
                // The right bullets spread from -85 degrees to -45
                this.physics.arcade.velocityFromAngle(
                        -85 + i * 10, BasicGame.BULLET_VELOCITY, bullet.body.velocity
                );
            }
        }
    },

    // Manages Explosions
    explode: function (sprite) {
        if (this.explosionPool.countDead() === 0) {
            return;
        }
        var explosion = this.explosionPool.getFirstExists(false);
        explosion.reset(sprite.x, sprite.y);
        explosion.play('boom', 15, false, true);
        // add the original sprite's velocity to the explosion
        explosion.body.velocity.x = sprite.body.velocity.x;
        explosion.body.velocity.y = sprite.body.velocity.y;
    },

    // Manage end game
    displayEnd: function(win) {
        //you can't win and lose at the same time
        if (this.endText && this.endText.exists) {
            return;
        }

        var msg = win ? 'You Win!!!' : 'See Ya!';
        this.endText = this.add.text(
            this.game.width / 2, this.game.height / 2 - 60, msg,
            { font: '72px serif', fill: '#fff'}
        );
        this.endText.anchor.setTo(0.5, 0);

        this.showReturn = this.time.now + BasicGame.RETURN_MESSAGE_DELAY;
    },

    quitGame: function (pointer) {
        this.sea.destroy();
        this.player.destroy();
        this.enemyPool.destroy();
        this.bulletPool.destroy();
        this.explosionPool.destroy();
        this.shooterPool.destroy();
        this.enemyBulletPool.destroy();
        this.powerUpPool.destroy();
        //this.bossPool.destroy();
        this.instructions.destroy();
        this.scoreText.destroy();
        this.endText.destroy();
        this.returnText.destroy();
        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }
};
