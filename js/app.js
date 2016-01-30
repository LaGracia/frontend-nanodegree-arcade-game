/* --------------------------------------------------------------------
Having no programming background at all, I needed the step-by-step 
explanations given in the discussion thread “A Study in JavaScript: 
Provided Code for the Game Clone,” written by Udayan. The post explained 
the two other JS files, but it didn't go beyond the Enemy Class and the 
canvas. To actually start filling out this file, I resorted to copying 
from the work of students who have posted their project repositories on 
GitHub and shared the links in the forum. Many thanks to danielmoi, 
morapost, andrewlw89, jyothisridhar, ayimaster, lacyjpr and joseterrera.
-------------------------------------------------------------------- */

/* =============
    ENEMIES
============= */

// Appearance, starting position, and speed of enemy bugs
var Enemy = function(x, y, speed) {
    this.sprite = 'images/enemy-bug.png';
    this.x = x;
    this.y = y;
    this.speed = Math.floor((Math.random() * 500) + 100);
};

// Speed of movement across the screen and behavior at canvas edges
Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt; // speed is the same on all computers
    if (this.x > 500) { // whenever a bug reaches the right edge
        this.x = -100; // a new bug appears at the left edge
        this.speed = Math.floor((Math.random() * 600) + 200);
    }
};

// How each enemy bug is drawn on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* The enemy array. The for loop keeps adding bugs to the pavement. 
The ones in the top row are centered at -100px on the horizontal 
axis and at 60px on the vertical. Each of the others start at the 
same horizontal point 83px below the previous one, except on the 
“safe” grassy strip in the middle - no bugs will run across this. 
I edited engine.js to switch the grass and pavement rows. */
var allEnemies = [];
for (var i = 0; i < 4; i++) {
    if (i === 2) {continue;}
    allEnemies.push(new Enemy(-100, 60 + (83 * i)));
}

/* =============
    PLAYER
============= */

// Appearance, position, number of lives, and user score
var Player = function(x, y, lives, score) {
    this.sprite = 'images/char-cat-girl.png';
    this.x = x;
    this.y = y;
    this.lives = lives;
    this.score = score;
};

// Behavior on reaching water, colliding with a bug, collecting a star
Player.prototype.update = function() {
    if (this.y <= 40) { // when player reaches the edge of the water
        this.y = 390; // player's position on vertical axis is reset
        this.score += 10; // user's score increases
    }
    this.drawText(); // score is shown above the canvas (defined below)
    this.collision(); // behavior on collision with bug (defined below)
    this.collection(); // behavior on collecting stars (defined below)
};

// How the player is drawn on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// How the user controls the player, using arrow keys
Player.prototype.handleInput = function(key) {
    var horizontalStep = 100; // number of pixels up or down
    var verticalStep = 87; // number of pixels left or right
    if (key === 'up') {
        if (this.y === 40) { // movement stops at water's edge
            this.reset();
        }
        this.y -= verticalStep;
    } else if (key === 'down') {
        if (this.y === 390) { // movement off bottom is not allowed
            this.reset();
        }
        this.y += verticalStep;
    } else if (key === 'left') { // no movement off left side
        if (this.x < 40) {
            this.reset();
        }
        this.x -= horizontalStep;
    } else if (key === 'right') { // no movement off right side
        if (this.x === 400) {
            this.reset();
        }
        this.x += horizontalStep;
    }
};

// The player object
var player = new Player(200, 390, 3, 0);

/* This listens for key presses and sends the keys to the 
Player.handleInput() method. */
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

/* ==========
    STAR
========== */

// Appearance and starting position, using the formula below
var Star = function(){
    this.sprite = 'images/Star.png';
    this.x = colWidth * random(0,5);
    this.y = rowHeight * random(1,5) - 11;
};

/* Formula for starting position and location reset after collision, 
adapted from <https://discussions.udacity.com/t/gem-class-randomly-
reappear-evenly-on-the-grid/15498> */
var colWidth = 101, rowHeight = 83;
var random = function(low,high) {
    var range = high - low;
    return Math.floor(Math.random() * range) + low;
};

Star.prototype.update = function() {
    this.collection(); // behavior when player collects (defined below)
};

// How each star is drawn on the screen
Star.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// The collectible star object
var star = new Star();

/* ================
    COLLISIONS
================ */

/* The only collision method I could get to work were ayimaster's 
<https://github.com/ayimaster/Udacity-FrontEnd-Proj3/blob/master/
js/app.js>. This checks if objects a and b collide. That way, it 
can be used for player collisions with enemies as well as stars.*/
var collision = function(a, b) {
    return  a.x < (b.x + 50) &&
            (a.x + 50) > b.x &&
            a.y < (b.y + 50) &&
            (a.y + 50) > b.y;
};

window.setTimeout(player.wait, 5000);

// User score and player lives on collision with an enemy bug
// TODO: Use setTimeout to delay location reset after collision
Player.prototype.collision = function() {
    for (var i = 0; i < allEnemies.length; i++) {
        if (collision(this, allEnemies[i])) {
            this.lives -= 1; // player loses a life
            this.y = 390; // player's vertical position is reset
        }
        if (this.lives < 0) { // when player has lost all extra lives
            alert('GAME OVER! RELOAD TO REPLAY (CMD-R or CTRL-R).');
            player.reset();
        }
        if (this.score != 0 && // if score is higher than 0
            this.score % 15 === 0 && // and is a multiple of 15
            this.lives === 0) { // and player has lost all extra lives
                alert('SCORE IS A MULTIPLE OF 15 - ' +
                'EXTRA LIFE & BONUS POINTS!');
                this.lives += 1; // player gains a bonus life
                this.score += 5; // user gets bonus points
                this.y = 390; // player's vertical position is reset
        }
    }
};

// User score when player collides with star (i.e., star collection)
Player.prototype.collection = function() {
    if (collision(this, star)) {
        this.score += 5;
    }
};

// New star's random location every time player makes a collection
// TODO: Avoid rewriting this.x and this.y in full
// TODO: Use setTimeout to delay this
Star.prototype.collection = function() {
    if (collision(this, player)) {
        this.x = colWidth * random(0,5);
        this.y = rowHeight * random(1,3) - 11;
    }
};

/* =============
    DOCUMENT
============= */

/* Text showing user score, player lives, and simplified instructions; 
adapted from <https://github.com/jyothisridhar/frontend-nanodegree-
arcade-game/blob/master/js/app.js>. I extended the height of the 
canvas by 50px in engine.js. The score and life counts are in a 
different font, size and color than the instructions. */
Player.prototype.drawText = function() {
    ctx.fillStyle = '#333';
    ctx.font = '26px Permanent Marker';
    ctx.clearRect(0, 0, 505, 40);
    ctx.fillText('Score  ' + this.score, 10, 30);
    ctx.clearRect(400, 0, 505, 40);
    ctx.fillText('Lives  ' + this.lives, 400, 30);
    ctx.fillStyle = '#222';
    ctx.font = 'bold 14px Arial';
    ctx.clearRect(0, 595, 505, 656);
    ctx.fillText('Use the arrow keys to move the player. ' + 
        'Get 10 points for reaching the water', 0, 610);
    ctx.fillText('and 5 points for collecting a star. ' +
        'You can get extra lives and bonus points!', 0, 630);

};

/* Blue background behind the game canvas. This makes the star look 
more like it's glowing. */
document.body.style.backgroundColor = '#1ac6ff';
