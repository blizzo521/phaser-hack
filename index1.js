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
    game.stage.backgroundColor = '#BDC2C5';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.world.enableBody = true;

    this.player = game.add.sprite(32, 32, box({length: 32, width: 32, color: '#4F616E'}));

    this.enemy1 = game.add.sprite((game.world.width * 0.25)-10, (game.world.height - 80), box({length: 32, width: 32, color: '#A96262'}));
    game.physics.enable(this.enemy1, Phaser.Physics.ARCADE);
    this.enemy1.body.collideWorldBounds = true;
    this.enemy1.body.bounce.setTo(1,1);
    this.enemy1.body.velocity.y = 120;

    this.enemy2 = game.add.sprite((game.world.width * 0.5)-10, 32, box({length: 32, width: 32, color: '#A96262'}));
    game.physics.enable(this.enemy2, Phaser.Physics.ARCADE);
    this.enemy2.body.collideWorldBounds = true;
    this.enemy2.body.bounce.setTo(1,1);
    this.enemy2.body.velocity.y = 120;

    this.enemy3 = game.add.sprite((game.world.width * 0.75)-10, (game.world.height - 100), box({length: 32, width: 32, color: '#A96262'}));
    game.physics.enable(this.enemy3, Phaser.Physics.ARCADE);
    this.enemy3.body.collideWorldBounds = true;
    this.enemy3.body.bounce.setTo(1,1);
    this.enemy3.body.velocity.y = 120;

    this.gold = game.add.sprite(game.world.width - 80, 50, box({length: 32, width: 32, color: 'gold'}));
    game.physics.enable(this.gold, Phaser.Physics.ARCADE);
    this.gold.body.collideWorldBounds = true;

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

    var innerWall3 = this.walls.create(game.world.width * 0.75, 0, box({
      length: 16, 
      width: wallLength,
      color: '#374A59'
    }));
    innerWall3.body.immovable = true;
  },
  update: function() {
    var playerSpeed = 800;
    this.player.body.velocity.y = 0;
    this.player.body.velocity.x = 0;
    this.player.body.collideWorldBounds = true;
    
    game.physics.arcade.collide(this.player, this.walls);
    game.physics.arcade.overlap(this.player, this.enemy1, this.handlePlayerDeath, null, this);
    game.physics.arcade.overlap(this.player, this.enemy2, this.handlePlayerDeath, null, this);
    game.physics.arcade.overlap(this.player, this.enemy3, this.handlePlayerDeath, null, this);
    game.physics.arcade.overlap(this.player, this.gold, this.handlePlayerVictory, null, this);

    // movement
    if (this.cursor.up.isDown) {
      this.player.body.velocity.y -= playerSpeed;
    } else if (this.cursor.down.isDown) {
      this.player.body.velocity.y += playerSpeed;
    }

    if (this.cursor.left.isDown) {
      this.player.body.velocity.x -= playerSpeed;
    } else if (this.cursor.right.isDown) {
      this.player.body.velocity.x += playerSpeed;
    }
    
    game.physics.arcade.collide(this.enemy1, this.walls);
    game.physics.arcade.collide(this.enemy2, this.walls);
    game.physics.arcade.collide(this.enemy3, this.walls);

  },
  handlePlayerDeath: function(player, enemy) {
    player.kill();
    game.state.start('gameOver');
  },
  handlePlayerVictory: function(player, gold) {
    game.state.start('gameVictory');
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