var game = new Phaser.Game(500, 500);

var box = function(options) {
  var bmd = game.add.bitmapData(options.length, options.width);
  bmd.ctx.beginPath();
  bmd.ctx.rect(0, 0, options.length, options.width);
  bmd.ctx.fillStyle = options.color;
  bmd.ctx.fill();
  return bmd;
}

var mainState = {
  create: function() {
    var self = this;
    game.stage.backgroundColor = '#BDC2C5';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.enableBody = true;

    this.hasKey = false;
    this.facing = null;

    this.player = game.add.sprite(32, 32, box({length: 32, width: 32, color: '#4F616E'}));
    this.attackKey = this.game.input.keyboard.addKey(Phaser.Keyboard.X);

    this.enemies = [];

    this.enemy1 = game.add.sprite((game.world.width * 0.25)-10, (game.world.height - 80), box({length: 32, width: 32, color: '#A96262'}));
    game.physics.enable(this.enemy1, Phaser.Physics.ARCADE);
    this.enemy1.body.collideWorldBounds = true;
    this.enemy1.body.bounce.setTo(1,1);
    this.enemy1.body.velocity.y = 120;
    this.enemies.push(this.enemy1);

    this.enemy2 = game.add.sprite((game.world.width * 0.5)-10, 32, box({length: 32, width: 32, color: '#A96262'}));
    game.physics.enable(this.enemy2, Phaser.Physics.ARCADE);
    this.enemy2.body.collideWorldBounds = true;
    this.enemy2.body.bounce.setTo(1,1);
    this.enemy2.body.velocity.y = 120;
    this.enemies.push(this.enemy2);

    var minPosition = game.world.width * 0.6;
    var maxPosition = game.world.width * 0.9;
    var minEnemySpeed = 150;
    var maxEnemySpeed = 350;

    for(var i=0;i<3;i++) {
      var verticalPosition = Math.floor(Math.random()*(maxPosition-minPosition+1)+minPosition);
      var speed = Math.floor(Math.random()*(maxEnemySpeed-minEnemySpeed+1)+minEnemySpeed);

      var enemy = game.add.sprite(verticalPosition, 60 + (100*(i+1)), box({length: 32, width: 32, color: '#A96262'}));
      game.physics.enable(enemy, Phaser.Physics.ARCADE);
      enemy.body.collideWorldBounds = true;
      enemy.body.bounce.setTo(1,1);
      enemy.body.velocity.x = speed;
      self.enemies.push(enemy);
    }

    this.key = game.add.sprite((game.world.width * 0.25) + 40, game.world.height * 0.5, box({length: 32, width: 32, color: 'gold'}));
    game.physics.enable(this.key, Phaser.Physics.ARCADE);
    this.key.body.collideWorldBounds = true;

    this.door = game.add.sprite(game.world.width - 60, game.world.height - 60, box({length: 32, width: 32, color: 'rgba(139,69,19,1.0)'}));
    game.physics.enable(this.door, Phaser.Physics.ARCADE);
    this.door.body.collideWorldBounds = true;

    this.cursor = game.input.keyboard.createCursorKeys();
    this.walls = game.add.group();
    this.walls.enableBody = true;

    var top = this.walls.create(0, 0, box({
      length: game.world.width, 
      width: 16, 
      color: '#374A59'
    }));
    top.body.immovable = true;
    
    var bottom = this.walls.create(0, game.world.height - 16, box({
      length: game.world.width, 
      width: 16, 
      color: '#374A59'
    }));
    bottom.body.immovable = true;

    var left = this.walls.create(0, 0, box({
      length: 16, 
      width: game.world.height, 
      color: '#374A59'
    }));
    left.body.immovable = true;

    var right = this.walls.create(game.world.width - 16, 0, box({
      length: 16, 
      width: game.world.height - 16,
      color: '#374A59'
    }));
    right.body.immovable = true;

    var wallLength = game.world.height * 0.75;

    var innerWall1 = this.walls.create(game.world.width * 0.25, 0, box({
      length: 16, 
      width: wallLength,
      color: '#374A59'
    }));
    innerWall1.body.immovable = true;

    var innerWall2 = this.walls.create(game.world.width * 0.5, game.world.height - wallLength, box({
      length: 16, 
      width: wallLength,
      color: '#374A59'
    }));
    innerWall2.body.immovable = true;

  },
  update: function() {
    var playerSpeed = 200;
    var self = this;
    self.player.body.velocity.y = 0;
    self.player.body.velocity.x = 0;
    self.player.body.collideWorldBounds = true;
    
    game.physics.arcade.collide(self.player, self.walls, self.handlePlayerDeath);

    self.enemies.forEach(function(enemy){
      game.physics.arcade.overlap(self.player, enemy, self.handlePlayerDeath, null, self);
    });
    game.physics.arcade.overlap(self.player, self.door, self.handlePlayerVictory, null, this);

    game.physics.arcade.overlap(self.player, self.key, self.handlePickupKey, null, this);


    if (!self.swordStart) {
      if (self.cursor.up.isDown) {
        self.player.body.velocity.y -= playerSpeed;
        self.facing = 'up';
      } else if (self.cursor.down.isDown) {
        self.player.body.velocity.y += playerSpeed;
        self.facing = 'down';
      }

      if (self.cursor.left.isDown) {
        self.player.body.velocity.x -= playerSpeed;
        self.facing = 'left';
      } else if (self.cursor.right.isDown) {
        self.player.body.velocity.x += playerSpeed;
        self.facing = 'right';
      }
    }

    if (self.attackKey.isDown && ((self.swordCooldown && game.time.now > self.swordCooldown) || !self.swordCooldown)) {
      var x = self.player.body.position.x;
      var y = self.player.body.position.y;
      var width = 32;
      var length = 8;
      if (self.facing === 'down') {
        y += 32;
      } else if (self.facing === 'up') {
        y -= 32;
      } else if (self.facing === 'left') {
        x -= 32;
        length = 32;
        width = 8;
      } else if (self.facing === 'right') {
        x += 32;
        length = 32;
        width = 8;
      }

      self.sword = game.add.sprite(x, y, box({length: length, width: width, color: 'white'}));
      game.physics.enable(self.sword, Phaser.Physics.ARCADE);
      self.sword.body.collideWorldBounds = false;
      self.swordStart = game.time.now;
      self.swordCooldown = game.time.now + 1000;

      this.enemies.forEach(function(enemy){
        game.physics.arcade.overlap(enemy, self.sword, self.handleEnemyDeath, null, self);
      });
    }

    if (self.sword && self.swordStart && ((game.time.now - self.swordStart) > 100)) {
      self.sword.kill();
      self.swordStart = null;
    }
    
    this.enemies.forEach(function(enemy){
      game.physics.arcade.collide(enemy, self.walls);
    });
  },
  handlePlayerDeath: function(player, enemy) {
    player.kill();
    game.state.start('gameOver');
  },
  handleEnemyDeath: function(enemy, sword) {
    enemy.kill();
  },
  handlePlayerVictory: function(player, gold) {
    if (this.hasKey) {
      game.state.start('gameVictory');
    }
  },
  handlePickupKey: function(player, key) {
    this.hasKey = true;

    this.door.kill();
    this.door = game.add.sprite(game.world.width - 60, game.world.height - 60, box({length: 32, width: 32, color: 'rgba(50,205,50,1.0)'}));
    game.physics.enable(this.door, Phaser.Physics.ARCADE);
    this.door.body.collideWorldBounds = true;

    key.kill();
  }
};

var gameOverState = {
  create: function() {
    var label = game.add.text(game.world.width / 2, game.world.height / 2, 'GAME OVER\nPress SPACE to restart', {
      font: '22px arial',
      fill: '#fff',
      align: 'center'
    });
    label.anchor.setTo(0.5, 0.5);

    this.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  },
  update: function() {
    if (this.spacebar.isDown) {
      game.state.start('main');
    }
  },
};

var gameVictoryState = {
  create: function() {
    var label = game.add.text(game.world.width / 2, game.world.height / 2, 'YOU WIN!!!!!\nPress SPACE to restart', {
      font: '22px arial',
      fill: '#fff',
      align: 'center'
    });
    label.anchor.setTo(0.5, 0.5);

    this.spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  },
  update: function() {
    if (this.spacebar.isDown) {
      game.state.start('main');
    }
  },
};

game.state.add('main', mainState);
game.state.add('gameOver', gameOverState);
game.state.add('gameVictory', gameVictoryState);
game.state.start('main');
