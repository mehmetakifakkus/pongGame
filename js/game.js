var gravity = 0.25;
var gamePlay = 1;
var balls = []
var score = 0;

var player = new Player(2, 8, 'assets/sprites/walking.png');
//var raster = new Raster({source: 'assets/background1.jpg', position: view.center, width: 720, height: 540, scaling: 1.4});
var text = new PointText({ point: [view.size.width/1.25, 50], justification: 'center', fontSize: 30, strokeColor:'white'});
var wavyLine;

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
            var pos = player.path.position.x + dir * player.path.getInternalBounds().width/2
            wavyLine = new WavyFire(pos)
        }
    }
    
}

///////////////////////////////    Classes   ///////////////////////////////

createRandomBalls(1);

function Ball(r, p, v ){
    var tempObj = this;
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
            this.path.position.y = this.oldState.oldY
            this.vector = this.oldState.vector * [1, -1]
            Crafty.audio.play("jump", 1, 0.2)  
        }
        if(pos.y - radius < 0)
            this.vector *= [1, -1];
        
        this.oldState = {vector: this.vector, oldY: pos.y};
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
    
    this.path.onFrame = function() {
        tempObj.checkBoundaries();
        tempObj.applyGravity();

        tempObj.path.rotate(tempObj.vector.x * 2);
        tempObj.path.position += tempObj.vector;
        tempObj.collisionPath.position = tempObj.path.position;
        
        for (var i = 0; i < balls.length; i++)
            tempObj.react(balls[i])
    };
    
    this.remove = function(){
        this.collisionPath.remove();
        this.path.remove();
    }
    
    this.divideBall = function(){
    
        var r = tempObj.radius;   
        var pos = tempObj.path.position;

        if(r < 16){
            tempObj.remove(); 
            return;
        }

        var vector1 = new Point({ angle: 245, length: 8});
        var vector2 = new Point({ angle: 305, length: 8});

        balls.push(new Ball(3*r/5, pos + [-3*r/5,0], vector1));    
        balls.push(new Ball(3*r/5, pos + [3*r/5, 0], vector2));    
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

function WavyFire(x){
    
    var amount = 30; // amount of the segments  // 
    this.selected = true
    var height = 6; // The maximum height of the wave:

    this.wavyFire = new Path({strokeColor: 'blue', strokeWidth: 6, strokeCap: 'square' });
    for (var i = 0; i <= 30; i++) {
        this.wavyFire.add(new Point(0, view.size.height + 2*i*(view.size.width/3) / 60));
    }

    this.tip = new Path({fillColor: 'blue', closed:true,  visible:false});
    this.tip.add(new Point(0,0), new Point(-8, -12), new Point(15, 0), new Point(-8, 12));

    this.tip2 = new Path()
    
    var temp = this;
    this.wavyFire.onFrame = function(event) {
        // Loop through the segments of the path:
        for (var i = 0; i <= 30; i++) {
            var sinus = Math.sin(-event.time * 30+i); // A cylic value between -1 and 1
            this.segments[i].point.x = x + sinus * height; // Change the y position of the segment point:
            this.segments[i].point.y -= 5 // advance forward
        }
        this.smooth();

        var p1 = this.segments[0].point;
        var p2 = this.segments[1].point;

        var degree = (180/Math.PI) * Math.atan2(p1.y - p2.y, p1.x - p2.x);
        temp.tip.position = this.segments[0].point;

        temp.tip2.remove()
        temp.tip2 = temp.tip.clone()
        temp.tip2.visible = true
        temp.tip2.rotate(degree)

        if(this.segments[0].point.y < 200)
        {
            this.remove()
            temp.tip.remove()
            temp.tip2.remove()
            wavyLine = 0;
        }
    }
    
    this.remove = function()
    {
        temp.tip.remove()
        temp.tip2.remove()
        this.wavyFire.remove();
        wavyLine = 0;
    }
}

///////////////////////////////////////// Initalize /////////////////////////////////

function createRandomBalls(count){
    for (var i = 0; i < count; i++) {
        var position = Point.random() * (view.size-400) + 60;
        var vector = new Point({ angle: 240 + 120 * Math.random(), length: Math.random() * 4});
        var radius = Math.random() * 20 + 40;
        balls.push(new Ball(radius, position, vector));
    }
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
        if(wavyLine.wavyFire.intersects(balls[i].collisionPath) || wavyLine.tip.intersects(balls[i].collisionPath))
        {
            score+= 5;
            document.getElementById("score").innerHTML = "Score: "+ score;
            Crafty.audio.play("explosion", 1, 0.75)   
            readSprite(4, 4, 'assets/sprites/explosion_sprite.png', balls[i].path.position, 20)
 
            wavyLine.remove();
            balls[i].divideBall();
            balls[i].remove()
            balls.splice(i,1)
        }
    }
}

/////////////Sprite

function readSprite(row, col, str, pos, speed){
    
    item = new Raster({ source: str, visible: false});
    
    if(typeof frames_ != 'undefined'){
        var size = frames_.length;
        for(var i=size-1; i>=0; i--)
        {
            frames_[i].remove()
           frames_.pop()
        }
    }
       
    var timer = 0
    frames_ = []
    
    item.on('load', function(){
        
        w = item.getInternalBounds().width
        h = item.getInternalBounds().height

        xlen = w/col;
        ylen = h/row;
        
        for (var j = 0; j < row; j++) {
            for(var i = 0; i < col; i++) {
                r = new Rectangle(xlen*i, ylen*j, xlen, ylen);
                dd = item.getSubRaster(r);
                dd.visible = false;
                dd.position = pos;
                frames_.push(dd)
            }
        }
    });
        
    this.advance = function(){
        
            if(advance.i == frames_.length)  
            {
                advance.i = 0
                clearInterval(timer) // comment if you want it endless
                return
            }

            if(advance.i == 0)
                frames_[frames_.length-1].visible = false
            else
                frames_[advance.i-1].visible = false;
            frames_[advance.i].visible = true; 
            
        advance.i++         
    }
    this.advance.i = 0
    
    clearInterval(timer);
    timer = setInterval(this.advance, 1000/speed);
}

function onFrame(event){
    if(!gamePlay)
       ;// return;  
  
    readKeys();
    checkCollision();        
}

//////////////////////////// load sounds
var assets = {
    'audio': 
        {'beep': 'assets/sounds/beep-04.mp3',
        'shoot': 'assets/sounds/laser_shoot.wav',
        'jump': 'assets/sounds/jump9.wav',
        'pulse': 'assets/sounds/pulse.mp3',
        'explosion': 'assets/sounds/explosion.wav',
        'victory': 'assets/sounds/victory.mp3'}
}
Crafty.load(assets)
