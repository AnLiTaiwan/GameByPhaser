
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var mainScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function mainScene ()
    {
        Phaser.Scene.call(this, { key: 'mainScene' });
    }, // mainScene ()
    preload: function ()
    {
        this.load.setBaseURL('assets/');
        this.load.image('background', 'ExamleGame1/background.png');
        this.load.image('platform', 'ExamleGame1/platform.png');
        this.load.image('ice-platform', 'ExamleGame1/ice-platform.png');
        this.load.image('ground', 'ExamleGame1/ground.png');
        this.load.image('star', 'ExamleGame1/star.png');
        this.load.image('bomb', 'ExamleGame1/bomb.png');
        this.load.image('arrow-up', 'UI/arrow-up.png');
        this.load.image('arrow-left', 'UI/arrow-left.png');
        this.load.image('arrow-right', 'UI/arrow-right.png');
        this.load.image('arrow-down', 'UI/arrow-down.png');
        this.load.spritesheet('jolteon', 'ExamleGame1/jolteon_running65.625x50.png', { frameWidth: 65.6, frameHeight: 50 });
        this.load.spritesheet('fullscreen', 'UI/fullscreen.png', { frameWidth: 64, frameHeight: 64 });
    }, // preload
    create: function ()
    {        
        //  A simple background for our game
        this.add.image(400, 300, 'background');

        //  The platforms group contains the ground and the 2 ledges we can jump on
        platforms = this.physics.add.staticGroup();
        platforms.enableBody = true ;
        platforms.create(400, 568, 'ground');
        platforms.create(400, 400, 'platform');
        platforms.create(150, 250, 'ice-platform');
        platforms.create(550, 220, 'platform');
        // The player and its settings
        player = this.physics.add.sprite(100, 450, 'jolteon');

        //  Player physics properties. Give the little guy a slight bounce.
        player.setBounce(0);
        player.setCollideWorldBounds(true);

        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('jolteon', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'jolteon', frame: 8 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('jolteon', { start: 4, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        //  Input Events
        if (!this.sys.game.device.input.touch) {
            cursors = this.input.keyboard.createCursorKeys()
        } else {
            cursors = this.input.keyboard.createCursorKeys()
            // keyboard listeners to be user for each key
            this.input.addPointer(2);  
            this.input.topOnly = true; 
            const pointerDown = key => {
                cursors[key].isDown = true ;
            }
            const pointerUp = key => {
                cursors[key].isDown = false ;
            }
            const pointerUpOutside = key => {
                cursors[key].isDown = false ;
            }
            // Create a button helper
            const createBtn = (key, x, y, img) => {
                // Add a faded out red rectangle for our button
				this.add.image(x, y, img)
					.setOrigin(0,0)
                    .setScrollFactor(0)
                    .setInteractive()
                    .on('pointerover', () => pointerDown(key))
			        .on('pointerout', () => pointerUp(key))
                    .on('pointerupoutside', () => pointerUpOutside(key))
            }
			
            // gutter width between buttons
            const GUTTER = 12; 
			const WIDTH = 160;
            const HEIGHT = 160;
            // Y coordinate to place buttons
            const BTN_Y = 600 - HEIGHT - GUTTER;
            // create player control buttons
            createBtn('left', GUTTER, BTN_Y,'arrow-left');
            createBtn('right', WIDTH + 2*GUTTER, BTN_Y, 'arrow-right');
            createBtn('up', 800 - 2*(WIDTH) - GUTTER, BTN_Y, 'arrow-up');
            createBtn('down', 800 - WIDTH, BTN_Y, 'arrow-down');
        }

        //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
        stars = this.physics.add.group({
            key: 'star',
            repeat: 5,
            setXY: { x: 12, y: 0, stepX: 155 }
        });

        stars.children.iterate(function (child) {

            //  Give each star a slightly different bounce
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });

        bombs = this.physics.add.group();

        //  The score
        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

        //  Collide the player and the stars with the platforms
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);
        this.physics.add.collider(bombs, platforms);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.physics.add.overlap(player, stars, collectStar, null, this);

        this.physics.add.collider(player, bombs, hitBomb, null, this);

        var button = this.add.image(800-16, 16, 'fullscreen', 0).setOrigin(1, 0).setInteractive();
        button.on('pointerup', function () {
            if (this.scale.isFullscreen)
            {
                button.setFrame(0);
                this.scale.stopFullscreen();
            }
            else
            {
                button.setFrame(1);
                this.scale.startFullscreen();
            }
        }, this);

        playText = this.add.text(350, 300, 'Game Over', {
            fontSize: '24px',
            fill: '#000'
        })

        
        playText.visible = false
        this.input.on('pointerdown', function (event) {
            if ( gameOver == true )
            {
                this.scene.restart();
                score = 0 ;
                gameOver = false  ;
            }
        }, this);
    }, // create
    update:function ()
    {
        if (gameOver)
        {   
            playText.visible = true ;
        }

        if (cursors.left.isDown)
        {
            player.setVelocityX(-160);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }
        bombs.children.iterate( bomb => {
            const v = 100;
            const distanceX = player.x - bomb.x;
            const distanceY = player.y - bomb.y;
            const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
            const vx = v * (distanceX / distance);
            const vy = v * (distanceY / distance);
            bomb.setVelocity(vx, vy);
        })
    } // update
}) ;

var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600,
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [mainScene]
};

var game = new Phaser.Game(config);

function collectStar (player, star)
{
    star.disableBody(true, true);
    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0)
    {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;
    } // if()
} // collectStar (player, star)

function hitBomb (player, bomb)
{
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
} // hitBomb (player, bomb)
