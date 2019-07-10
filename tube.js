var TubeSprite = cc.Sprite.extend({
    
    screenWidth: 0.0,
    pixelsPerSecond: 0,
    xOffset: 0,
    scored: FALSE,
    inactiveX: 0,
    state: kTubeStateInActive,

    ctor: function(spriteFrameName){
        this._super(spriteFrameName);
    },

    Start: function(){
        this.stopAllActions();
        
        var distance = this.xOffset + this.xOffset + this.screenWidth;
        var time = distance / this.pixelsPerSecond;
        var destination = cc.p(-this.xOffset,this.y);
        this.setPosition(this.xOffset + this.screenWidth, this.y);
        this.state = kTubeStateActive;
        this.Visible = TRUE;

        var actionMove = cc.moveTo(time,destination);
        var actionMoveDone = cc.callFunc(this.ReachedDestination,this);

        this.runAction(cc.sequence(actionMove,actionMoveDone));
    },

    Stop: function(){
        this.stopAllActions;
        this.Visible = FALSE;
        this.state = kTubeStateInActive;
        this.setPosition(this.inactiveX, this.y);
        this.scored = FALSE;
    },

    Initialise: function(speed, width, Xoffset , InactiveX){
        this.screenWidth = width;
        this.pixelsPerSecond = speed;
        this.xOffset = Xoffset;
        this.inactiveX = InactiveX;
        this.x = InactiveX;
        this.y = 0;
        this.state = kTubeStateInActive;
        this.scored = FALSE;
    },

    ReachedDestination: function(sender){
        console.log("reached");
        sender.Stop();
    }
});