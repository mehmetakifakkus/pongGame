//////////////////////////////////////// Objects ////////////////////////////////////////

function Player(row, col, str){
    
    var playerTemp = this;
    this.loaded = 0;  
    
    this.loadSprite = function(row, col, str){
        
        item = new Raster({ source: str, position: [view.size.width/2, 100], scaling:1, visible: false});
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
                    dd.position = new Point(100,100);
                    fr.push(dd)
                }
            }
            playerTemp.loaded = 1
            fr[0].visible = true;
        });
        return fr;
    }; 
	this.frames = this.loadSprite(row, col, str);
 
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
        this.setPos(this.frames[i].position + [5*dir,0])
        this.frames[i].matrix = new Matrix(dir, 0, 0, 1, this.frames[i].position.x, this.frames[i].position.y)
        i++   
    };    
};

player = new Player(2,8,'assets/sprites/walking.png');
//////////////////////////////////////// Keyboard Interaction ////////////////////////////////////////

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
            wavyLine = new Raster({ source: 'assets/wavy_line2.png', position: [frames[0].position.x + dir*frames[0].getInternalBounds().width/2, view.size.height + 110], scaling:0.35 });
            mod = 1
        }
    }
}

totalAmount = 0
function onFrame(event){
    if(player.loaded == 0) return
    
    totalAmount += event.delta
    
    if(totalAmount > 0.03)
    {
        readKeys(); 
        totalAmount = 0
    }
}
