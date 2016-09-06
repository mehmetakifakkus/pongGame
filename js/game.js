var gravity = 0.25;
var gamePlay = 1;
var balls = []
var score = 0;

var player = new Player(2, 8, 'assets/sprites/walking.png');
//var raster = new Raster({source: 'assets/background1.jpg', position: view.center, width: 720, height: 540, scaling: 1.4});
var text = new PointText({ point: [view.size.width/1.25, 50], justification: 'center', fontSize: 30, strokeColor:'white'});
var wavyLine;

advanceWavy.mod = 1

/////////////////////////////////   Keyboard Interactions   /////////////////////////////

function readKeys(){    
    if(Key.isDown('left'))
    {
        player.advance(-1); 
        dir = -1
    }
    if(Key.isDown('right'))
    {
        player.advance(1); 
        dir = 1
    }
    if(Key.isDown('space'))
    {
        if(!wavyLine)
        {
            Crafty.audio.play("shoot", 1, 0.5)
            wavyLine = new Raster({ source: 'assets/wavy_line2.png', position: [player.path.position.x + dir * player.path.getInternalBounds().width/2, view.size.height + 110], scaling:0.35 });
            advanceWavy.mod = 1            
        }
    }
    
}

///////////////////////////////    Motion  of Balls   ///////////////////////////////

createRandomBalls(1);

function Ball(r, p, v ){
	this.radius = r;
 	this.collisionPath = new Path.Circle({center: p, radius: r, strokeWidth: 1});
	this.vector = v; //new Point(0.8,0.5)
    this.path = new Raster({ source: 'assets/beachball2.png', position: p,  
                            scaling: this.radius/128
                           });
    
    this.applyGravity = function() {
        this.vector.y += gravity;
    };
    
    this.checkBoundaries = function() {
        var radius = this.radius + this.path.strokeWidth/2;
        var pos = this.path.position;

        // Check if it is in the arena
        if(pos.x + radius > view.size.width || pos.x - radius < 0)
            this.vector *= [-1, 1];
        if(pos.y + radius > view.size.height)
        {
            pos.y = view.size.height - this.radius;  
            this.vector *= [1, -1];   
        }
        if(pos.y - radius < 0)
            this.vector *= [1, -1];
        
    };
    
    this.iterate = function() {
        this.checkBoundaries();
        this.applyGravity();

        this.path.rotate(this.vector.x * 2);
        this.path.position += this.vector;
        this.collisionPath.position = this.path.position;
    };
    
    this.react = function(b) {
        var pos1 = this.path.position;
        var pos2 = b.path.position;	
        var dist = pos1.getDistance(pos2);

        var overlap = this.radius + b.radius - dist;

        if (overlap > 0) { // Check if they have collision	
            //var overlap = 1;
            var direc = (pos1 - pos2).normalize(overlap);
            this.vector += direc * (b.radius/(b.radius+this.radius));
            b.vector -= direc * (this.radius/(b.radius+this.radius));	
        }

        if (this.vector.x > 10 || this.vector.y>10)    // Check speed
            this.vector = this.vector.normalize(10);
    };
    
    this.remove = function(){
        this.collisionPath.remove();
        this.path.remove();
    }
};

function Player(row, col, str){
    
    this.loaded = 0;  
    this.path = [];
    
    var temp = this;
    
    this.loadAsset = function(row, col, str){
        
        item = new Raster({ source: str, visible: false});
        var fr = []

        item.on('load', function() {

            w = item.getInternalBounds().width
            h = item.getInternalBounds().height

            xlen = w/col;
            ylen = h/row;

            for (var j = 0; j < row; j++) {
                for(var i = 0; i < col; i++) {
                    r = new Rectangle(xlen*i, ylen*j, xlen, ylen);
                    dd = item.getSubRaster(r);
                    dd.visible = false;
                    dd.position = new Point(100, 490);
                    fr.push(dd)
                }
                fr[0].visible = true;
            }
            temp.loaded = 1;
            console.log(fr[0])
            temp.path = fr[0];
        });
        return fr;
    }; 
	this.frames = this.loadAsset(row, col, str); 
    this.setPos = function(pos){
        for(var i=0; i<this.frames.length; i++)
            this.frames[i].position = pos;
    };

    var i=0
    this.advance = function(dir){
        if(i == this.frames.length)  
            i = 0

        if(i == 0)
            this.frames[this.frames.length-1].visible = false
        else
           this.frames[i-1].visible = false;

        this.frames[i].visible = true; 
        this.setPos(this.frames[i].position + [6*dir, 0])
        this.frames[i].matrix = new Matrix(dir, 0, 0, 1, this.frames[i].position.x, this.frames[i].position.y)
        i++   
    };    
};
    
function createRandomBalls(count){
    for (var i = 0; i < count; i++) {
        var position = Point.random() * (view.size-400) + 60;
        var vector = new Point({ angle: 240 + 120 * Math.random(), length: Math.random() * 4});
        var radius = Math.random() * 20 + 40;
        balls.push(new Ball(radius, position, vector));
    }
}

function drawBall() {
	for (var i = 0; i < balls.length; i++)
	{
		balls[i].iterate();
		for (var j = 0; j < balls.length; j++)
			if (i != j)
                balls[i].react(balls[j]);
	}
} 

function divideBalls(ball){
    
    var r = ball.radius;   
    if(r < 16)
    {
        ball.remove(); return;
    }
    var pos = ball.path.position;
    
    var vector1 = new Point({ angle: 245, length: 8});
    var vector2 = new Point({ angle: 305, length: 8});
    
    balls.push(new Ball(3*r/5, pos + [-3*r/5,0], vector1));    
    balls.push(new Ball(3*r/5, pos + [3*r/5, 0], vector2));    

}

///////////////////////////////    Collision etc   ///////////////////////////////

function checkCollision(){
	
    if(balls.length == 0){
        text.content = "Congrats, You win!"
        Crafty.audio.play("victory", 1, 0.75)
    }
    
    for (var i = 0; i < balls.length; i++) // player
	{
        if(player.loaded)
        if(player.path.intersects(balls[i].collisionPath))
        {
            text.content = "Game Over!"
            text.bringToFront()
            gamePlay = 0
        }
    }
    
    for (var i = 0; i < balls.length; i++) // wavyline
	{
        if(wavyLine)
        if(wavyLine.intersects(balls[i].collisionPath))
        {
            Crafty.audio.play("explosion", 1, 0.25)   

            wavyLine.remove()
            wavyLine = 0;
            
            divideBalls(balls[i]);
            balls[i].remove()
            balls.splice(i,1)
            
            score+= 5;
            document.getElementById("score").innerHTML = "Score: "+ score;
        }
    }
}

function advanceWavy(){
    if(wavyLine)
    {
        if(advanceWavy.mod == 1)
        {
            wavyLine.position.y -= 10;
            if(wavyLine.position.y < 385)
                advanceWavy.mod = 0
        }
        if(advanceWavy.mod == 0)
            wavyLine.position.y += 7;
        if( wavyLine.position.y > view.size.height + wavyLine.getInternalBounds().height * 0.25)
            wavyLine = 0
    }
    
}

function draw(){
    
    if(!gamePlay)
       ;// return;
    
    drawBall();
    checkCollision();
    advanceWavy();
    
    readKeys();
}

setInterval(draw, 33);
function onFrame(event){}


//// load sounds
var assets = {
    'audio': 
        {'beep': 'assets/sounds/beep-04.mp3',
        'shoot': 'assets/sounds/laser_shoot.wav',
        'jump': 'assets/sounds/jump.wav',
        'pulse': 'assets/sounds/pulse.mp3',
        'explosion': 'assets/sounds/explosion.wav',
        'victory': 'assets/sounds/victory.mp3'}
}
Crafty.load(assets)