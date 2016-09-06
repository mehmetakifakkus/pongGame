Crafty.init(300,300, document.getElementById('game'));

Crafty.e('Floor, 2D, Canvas, Color')
  .attr({x: 0, y: 250, w: 250, h: 10})
  .color('green');

Crafty.e('2D, Canvas, Color, Twoway, Gravity')
  .attr({x: 0, y: 0, w: 50, h: 50})
  .color('#F00')
  .twoway(200)
  .gravity('Floor');


var assets = {
    'audio': 
    
        {'beep': 'assets/sounds/beep-04.mp3',
        'shoot': 'assets/sounds/laser_shoot.wav',
        'jump': 'assets/sounds/jump.wav',
        'pulse': 'assets/sounds/pulse.mp3'}
}

Crafty.load(assets)

function onKeyDown(event) {
    
    if(event.key == 'space')
        Crafty.audio.play("beep", 1, 0.25)
    if(event.key == 'up')
        Crafty.audio.play("shoot", 1, 0.25)
    if(event.key == 'j')
        Crafty.audio.play("jump", 1, 0.25)    
    if(event.key == 'p')
        Crafty.audio.play("pulse", 1, 0.25)       
}

function onFrame(event){
    
    readKeys()
}


