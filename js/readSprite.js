var maxdim = 30;

///////////////////////  default loadings ///////////////////////////////
  
readSprite(4, 4, 'assets/sprites/ashey_explosion_sprite.png', 20);
document.getElementById("image").src= 'assets/sprites/ashey_explosion_sprite.png';

////////////////////////////// HTML interaction /////////////////////////

window.read = function(){

    var link = document.getElementById("link").value;

    var dim = document.getElementById("dim").value;
    dim = dim.split(",");

    var row = parseInt(dim[0]);
    var col = parseInt(dim[1]);

    var speed = parseInt(document.getElementById("speed").value);

    readSprite(row, col, link, speed);
    document.getElementById("image").src=link;
}

window.loadSprite = function(i){
    if(i==1)
    {
        document.getElementById("link").value= 'http://www.remcodraijer.nl/quintus/images/spritesheet.png';
        document.getElementById("dim").value= '4,5';
    }
    else if(i==2)
    {
        document.getElementById("link").value= 'assets/sprites/walking.png';
        document.getElementById("dim").value= '2,8';
    }
    else if(i==3)
    {
        document.getElementById("link").value= 'assets/sprites/npc_butterfly__x1_fly-angle1_png_1354829526.png';
        document.getElementById("dim").value= '3,12';
    }
    else if(i==4)
    {
        document.getElementById("link").value= 'http://front-back.com/wp-content/uploads/2013/01/ken-tatsumaki-senpuu-kyaku.png';
        document.getElementById("dim").value= '1,13';
    }
    else if(i==5)
    {
        document.getElementById("link").value= 'http://moikmellah.org/images/sprites/advnt00.png';
        document.getElementById("dim").value= '6,10';
    }    
    else if(i==6)
    {
        document.getElementById("link").value= 'assets/sprites/bag_butler.png';
        document.getElementById("dim").value= '6,6';
    }      
    
    
    window.read();
}

////////////////////////////// Iterate Frames ///////////////////////////

function getAutoDims(item){
    
    w = item.getInternalBounds().width
    h = item.getInternalBounds().height

    function colDivider(col){
        var xlen = w/col; 

        var r = new Rectangle(xlen, 0, 1, h);
        var ds = item.getSubRaster(r);

        for(var i = 0; i<h; i++ ){
            s = ds.getPixel(0,i)
            console.log(s.red+" "+s.green+" "+s.blue)
debugger
            if(s.red+s.green+s.blue < 2.9)
                return 0
        }
        return 1
    }

    function rowDivider(row){
        var ylen = h/row; 

        var r = new Rectangle(0, ylen, w, 1);
        var ds = item.getSubRaster(r);

        for(var i = 0; i<w; i++ ){
            var s = ds.getPixel(i,0)
            console.log(s.red+" "+s.green+" "+s.blue)
            if(s.red+s.green+s.blue < 2.9)
                return 0
        }
        return 1
    }

    var c = maxdim 
    var r = maxdim
    
    for(; c >= 1; c--)    
        if(colDivider(c))
            break
        else
        {
            console.log('sikinti')
        }

    for(; r >= 1; r--)    
        if(rowDivider(r))
            break        


    console.log('col:'+c)
    console.log('row:'+r)

    return {row:r, col:c}        

}

function readSprite(row, col, str, speed){
    
    item = new Raster({ source: str, visible: false});
    
    if(typeof frames_ != 'undefined'){
        var size = frames_.length;
        for(var i=size-1; i>=0; i--)
        {
            frames_[i].remove()
            frames_.pop()
        }
    }
        
    var timer = null
    frames_ = []
    
    item.on('load', function(){
    /*
        var res = getAutoDims(item);
        console.log(res.row +"x"+res.col)
        
        row = res.row
        col = res.col
    */    
        ///debugger
        
        w = item.getInternalBounds().width
        h = item.getInternalBounds().height

        xlen = w/col;
        ylen = h/row;
        
        for (var j = 0; j < row; j++) {
            for(var i = 0; i < col; i++) {
                r = new Rectangle(xlen*i, ylen*j, xlen, ylen);
                dd = item.getSubRaster(r);
                dd.visible = false;
                dd.position = new Point(120, 120);
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

function onFrame(event){}
