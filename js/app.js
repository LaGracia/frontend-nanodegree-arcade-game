/* Having no programming background at all, I resorted to adapting 
* the work of students who shared links to their project repositories 
* in the forum. Many thanks to danielmoi, morapost, andrewlw89, 
* jyothisridhar, ayimaster, lacyjpr, joseterrera, poonamgp14, 
* justintemps and dooster, among others. */

/* ------------------------------------------------------------------
GAME VARIABLES
------------------------------------------------------------------ */

// Superclass that defines all subclasses as having an x and y position 
var Character = function(x, y) {
    this.x = x;
    this.y = y;
}

// Render function shared by all subclasses, drawing them on the canvas
Character.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Column width and row height needed for movement of all subclasses
var colWidth = 101, rowHeight = 83;

/* ------------------------------------------------------------------
ENEMIES
------------------------------------------------------------------ */

/* Subclass with location properties inherited from the Character 
* superclass. The keyword 'this' refers to Character, so the 'call' 
* function is needed to make it refer to Enemy. Then this subclass 
* can be assigned its own image and random speed. */
var Enemy = function(x, y, speed) {
    Character.call(this, x, y);
    this.sprite = 'images/enemy-bug.png';
    this.speed = Math.floor((Math.random() * 500) + 100);
};

/* Enemy subclass created according to Character superclass. 
* This allows it to inherit the Character 'render' function, 
* which draws characters on the canvas. */
Enemy.prototype = Object.create(Character.prototype);

/* Enemy assigned its own constructor property. This allows it 
* to construct its own functions, such as 'update' below. */
Enemy.prototype.constructor = Enemy;

// Speed of enemy movement across the board and behavior at edges
Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt; // speed is the same on all computers
    if (this.x > 500) { // whenever a bug reaches the right edge
        this.x = -100; // a new bug appears at the left edge
        this.speed = Math.floor((Math.random() * 600) + 100);
    }
};

/* The actual enemy array. The 'for' loop keeps pushing bugs to the 
* pavement. The ones in the first strip will start from off the board 
* in the middle of the row. The others start exactly one row height 
* below. I edited engine.js to switch the grass and pavement rows 
* in the middle, so no bugs will run across that grassy strip. */
var allEnemies = [];
for (var i = 0; i < 4; i++) { // four rows of enemies are constructed
    if (i === 2) { // the ones on the grassy strip are skipped
        continue;
    }
    allEnemies.push(new Enemy(-100, 60 + (rowHeight * i)));
}

/* ------------------------------------------------------------------
PLAYER
------------------------------------------------------------------ */

// Subclass with Character properties, image, lives, and user score
var Player = function(x, y, score, lives) {
    Character.call(this, x, y); // changes 'this' to refer to Player
    this.sprite = 'images/char-cat-girl.png';
    this.score = score;
    this.lives = lives;
};

// Player prototype that inherits 'render' and 'constructor' functions
Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

// Behavior on reaching water, which the player cannot get into
Player.prototype.update = function() {
    if (this.y <= 40) { // player movement stops at water's edge
        this.y = 390; // her vertical position is reset
        this.score += 10; // the user score increases
    }
    // Effects of collisions. These functions are defined below.
    this.collision();
    this.collection();
    this.drawText();
};

/* The actual player object with location, number of lives, and the 
* user's score. The player is always centered on the square. */
var player = new Player(200, 390, 0, 3);

// How user controls player with arrow keys, and how far she moves
Player.prototype.handleInput = function(key) {
    if (key === 'up') {
        this.y -= rowHeight;
    } 
    if (key === 'down' &&
        this.y < 390) { // movement off bottom is not allowed
            this.y += rowHeight;
    }
    if (key === 'left' &&
        this.x >= 40) { // movement off left side not allowed
            this.x -= colWidth;
    }
    if (key === 'right' &&
        this.x <= 400) { // movement off right side not allowed
            this.x += colWidth;
    }
};

// How user's key presses are sent to the Player.handleInput() method
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    player.handleInput(allowedKeys[e.keyCode]);
});

/* ------------------------------------------------------------------
STAR
------------------------------------------------------------------ */

/* Subclass with its own location and image properties, not inherited 
* from the Character superclass. This is because each star must appear 
* on a random square every time. The formula function defined below 
* achieves this. Subtracting 11 centers each star on each square. */
var Star = function(){
    this.x = colWidth * random(0,5);
    this.y = rowHeight * random(1,5) - 11;
    this.sprite = 'images/Star.png';
};

/* Formula for where it starts and where it appears after collision. 
* Adapted from <https://discussions.udacity.com/t/gem-class-randomly-
* reappear-evenly-on-the-grid/15498>. The range limits the star's 
* position to five columns and four rows: (0,5) at this.x and (1,5) 
* at this.y. This range is then randomized for every appearance. */
var random = function(min,max) {
    var range = max - min;
    return Math.floor(Math.random() * range) + min;
};

// Star prototype that inherits 'render' and 'constructor' functions
Star.prototype = Object.create(Character.prototype);
Star.prototype.constructor = Star;

// Behavior when star collides with player (i.e., star is collected)
Star.prototype.update = function() {
    this.collection(); // see function definition below
};

// Each collectible star object
var star = new Star();

/* ------------------------------------------------------------------
COLLISIONS
------------------------------------------------------------------ */

/* The only collision method I could get to work was ayimaster's 
* <https://github.com/ayimaster/Udacity-FrontEnd-Proj3/blob/master/
* js/app.js>. This checks if objects a and b collide. That way, it 
* can be used for player collisions with enemies as well as stars. */
var collision = function(a, b) {
    return  a.x < (b.x + 50) &&
            (a.x + 50) > b.x &&
            a.y < (b.y + 50) &&
            (a.y + 50) > b.y;
};

// Effects whenever the player collides with an enemy bug
// TODO: Use setTimeout to delay player location reset
Player.prototype.collision = function() {
    for (var i = 0; i < allEnemies.length; i++) {
        if (collision(this, allEnemies[i])) { // whenever they collide
            this.lives -= 1; // player loses a life
            this.y = 390; // player's vertical position is reset
        }
        if (this.score !== 0 && // if score is higher than 0
            this.score % 15 === 0 && // and is a multiple of 15
            this.lives === 0) { // and player has lost all extra lives
                alert('SCORE IS A MULTIPLE OF 15 - ' +
                'EXTRA LIFE & BONUS POINTS!');
                this.lives += 1; // player gains one more extra life
                this.score += 5; // user gets bonus points
                this.y = 390; // player's vertical position is reset
        }
        if (this.lives === 0) { // when player has lost all extra lives
            alert('GAME OVER! RELOAD TO REPLAY (CMD-R or CTRL-R.)');
            this.reset();
        }
    }
};

// Effect on score when player collides with star (i.e., collects it)
Player.prototype.collection = function() {
    if (collision(this, star)) {
        this.score += 5;
    }
};

// New star's random location every time player collects previous star
// TODO: Avoid rewriting this.x and this.y in full
// TODO: Use setTimeout to delay this
Star.prototype.collection = function() {
    if (collision(this, player)) {
        this.x = colWidth * random(0,5);
        this.y = rowHeight * random(1,5) - 11;
    }
};

/* ------------------------------------------------------------------
GAME BOARD
------------------------------------------------------------------ */

/* Text showing user score, player lives, and simplified instructions. 
* I extended the height of the canvas by 50px in engine.js. */
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
* more like it's glowing. I adapted this from <w3schools.com>. */
document.body.style.backgroundColor = '#1ac6ff';
