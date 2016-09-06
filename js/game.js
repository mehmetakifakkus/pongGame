var gravity = 0.25;
var gamePlay = 1;
var balls = []
var flag = 0

var score = 0;

//var raster = new Raster({source: 'assets/background1.jpg', position: view.center, width: 720, height: 540, scaling: 1.4});

mario = new Raster({ source: 'assets/mario2.png', position: [view.size.width/2, view.size.height-36], scaling:0.75 });
var text = new PointText({ point: [view.size.width/1.25, 50], justification: 'center', fontSize: 30, strokeColor:'white'});

var marioDir = 1;
var wavyLine;

/////////////////////////////////   Mouse Interactions   /////////////////////////////

function onMouseMove(event){
    //mario.position = event.point
}

/////////////////////////////////   Keyboard Interactions   /////////////////////////////

function readKeys(){    
    if(Key.isDown('left'))
    {
        mario.position += [5 * marioDir, 0];
        mario.matrix = new Matrix(marioDir, 0, 0, 1, mario.position.x, mario.position.y)
        
        marioDir = -1
    }
    if(Key.isDown('right'))
    {
        mario.position += [5 * marioDir, 0];
        mario.matrix = new Matrix(marioDir, 0, 0, 1, mario.position.x, mario.position.y)
        
        marioDir = 1
    }
    if(Key.isDown('space'))
    {
        if(!wavyLine)
        {
            wavyLine = new Raster({ source: 'assets/wavy_line2.png', position: [mario.position.x + marioDir * mario.getInternalBounds().width/2, view.size.height + 110], scaling:0.35 });
            mod = 1
        }
    }   
}

    ///////////////////////////////    Motion  of Balls   ///////////////////////////////
var canvas = document.getElementById('myCanvas');
createRandomBalls(1);

function Ball(r, p, v ){
	this.radius = r;
 	this.collisionPath = new Path.Circle({center: p, radius: r, strokeWidth: 1});
	this.vector = v; //new Point(0.8,0.5)
    this.path = new Raster({ source: 'assets/football.png', position: p,  
                            scaling: this.radius/128
                           });
    
    this.applyGravity = function() {
        this.vector.y += gravity;
    };
    
    this.checkBoundaries = function() {
        var radius = this.radius + this.path.strokeWidth/2;
        var pos = this.path.position;

        // Check if it is in the arena
        if(pos.x + radius > canvas.width || pos.x - radius < 0)
            this.vector *= [-1, 1];
        if(pos.y + radius > canvas.height)
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
	
    if(balls.length == 0)
        text.content = "Congrats, You win!"
    
    for (var i = 0; i < balls.length; i++)
	{
        if(mario.intersects(balls[i].collisionPath))
        {
            text.content = "Game Over!"
            text.bringToFront()
            gamePlay = 0
        }
    }
    
    for (var i = 0; i < balls.length; i++)
	{
        if(wavyLine)
        if(wavyLine.intersects(balls[i].collisionPath))
        {
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

var mod;
function advanceWavy(){
    if(wavyLine)
    {
        if(mod == 1)
        {
            wavyLine.position.y -= 10;
            if(wavyLine.position.y < 385)
                mod = 0
        }
        if(mod == 0)
            wavyLine.position.y += 7;
        if( wavyLine.position.y > view.size.height + wavyLine.getInternalBounds().height * 0.25)
            wavyLine = 0
    }
    
}


function loadAsset(row, col, str, speed){
    
    item = new Raster({ source: str, visible: false});
    item.bringToFront()
    var frames = []
    
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
                dd.position = new Point(100, view.size.height-55);
                dd.bringToFront()
                frames.push(dd)
            }
        }
        flag = 1
    });

    return frames;
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


