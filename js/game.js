var ArrayClouds = [];
var ArrayTubes = [];


var GameLayer = cc.Layer.extend({
    ctor:function(){
        this._super();
        this.init();
    },
    init:function(){
        this._super();
        var size = cc.director.getWinSize();
        var bgsprite = cc.Sprite.create(res.BG_IMAGE);
        bgsprite.setPosition(size.width / 2, size.height / 2);
        //bgsprite.setScale(0.8);
        this.addChild(bgsprite, kZindexBG);

        this._floor = cc.Sprite.create(res.FLOOR_IMAGE);
        this._floor.setPosition(0,0);
        this._floor.setAnchorPoint(0,0);
        this.addChild(this._floor, kZindexFloor);

        this._robin = new RobinSprite(res.ROBIN_IMAGE);
        this._robin.x = kRobinStatex;
        this._robin.y = size.height/2;
        this._robin.topOfScreen = size.height;
        this._robin.Reset();
        this.addChild(this._robin, kZindexRobin);
       
        this.CreateClouds();

        this._gameTime = 0;
        this._gameStarted = FALSE;
        this._middleY = size.height/2 ;
        this._processTouch = FALSE;

        this._lastSpawnTime = 0;
        this._nextSpawnTime = 0;

        this._lastTubeType = kTubeTypeNone;
        this._lastGetUnderY = 0;

        this._score = 0;
        this._highScore = 0;

        this._gameOverLabel = this.addLabel("Game Over!", size.width/2, size.height/2, FALSE, kZindexRobin, cc.color.RED, kFontSizeGameOver);
        this._gameStartLabel = this.addLabel("Click To Start!", size.width/2, size.height/3*2, TRUE, kZindexRobin, cc.color.RED, kFontSizeGameOver);
        this._scoreLabel = this.addLabel("00000", kScoreX, size.height - kScoreY, TRUE, kZindexRobin, cc.color.RED, kFontSizeScore);
        this._highScoreLabel = this.addLabel("10000", kScoreX, size.height - kScoreY * 3, TRUE, kZindexRobin, cc.color.RED, kFontSizeScore);
        this._scoreLabel.setAnchorPoint(0,1);
        this._highScoreLabel.setAnchorPoint(0,1);

        this.setScoreLabels();
    },

    setScoreLabels: function(){
        this._scoreLabel.string = this._score.toString();
        this._highScoreLabel.string = this._highScore.toString();
    },

    addLabel: function(text, x, y, vis, zin, col, fsize){
        var label = new cc.LabelTTF(text, kFontName, fsize);
        label.setPosition(x,y);
        label.color = col;
        label.visible = vis;
        this.addChild(label, zin);
        return label;
    },

    onEnter:function () {
        this._super();
        cc.eventManager.addListener({
            event:cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches:true,
            onTouchBegan:this.onTouchBegan,
            onTouchMoved:this.onTouchMoved,
            onTouchEnded:this.onTouchEnded
        },this);

        this.schedule(this.onTick);

        this.StopGame();
        this._processTouch = TRUE;
    },

    onTick:function(dt){
        var gameOver = FALSE;
        if(this._gameStarted == TRUE){
            this._gameTime += dt;
            this._lastSpawnTime += dt;
            if(this._lastSpawnTime > this._nextSpawnTime){
                this.SetSpawnTime();
                this.SpawnNewTubes();
            }
            if(this._robin.y < this._floor.y/2){
                gameOver = TRUE;
            }else{
                var RobinCollBox = this._robin.TubeCollisionBox();
                for(var i=0;i<ArrayTubes.length;i++){
                    if(ArrayTubes[i].state == kTubeStateActive){
                        if(cc.rectIntersectsRect(ArrayTubes[i].getBoundingBox(), RobinCollBox) == TRUE){
                            console.log("collision!!!!");
                            gameOver = TRUE;
                        }else{
                            if(ArrayTubes[i].scored == FALSE){
                                if(ArrayTubes[i].getBoundingBox().x + ArrayTubes[i].getBoundingBox().width < this._robin.getBoundingBox().x){
                                    ArrayTubes[i].scored=TRUE;
                                    this._score += kTubeScore;
                                    this.setScoreLabels();
                                }
                            }
                        }
                    }
                }
            }
            if(gameOver == FALSE){
                this._robin.UpdateRobin(dt);
            }else{
                this.GameOver();
            }
        }
    },

    onTouchBegan:function(touch,event){
        var tp = touch.getLocation();
        var tar = event.getCurrentTarget();
        this._gameStarted = TRUE;
        if(tar._processTouch==TRUE){
            tar._robin.SetStartSpeed();
            if(tar._gameStarted == FALSE){
                tar.StartGame();
            }
        }
        return false;
    },
    onTouchMoved:function(touch,event){
        var tp = touch.getLocation();
        console.log(tp.x.toFixed(2)+","+tp.y.toFixed(2));

    },
    onTouchEnded:function(touch,event){
        var tp = touch.getLocation();
        console.log(tp.x.toFixed(2)+","+tp.y.toFixed(2));
    },

    AddCloud:function(speed, position, scale , zIndex , name ,XOffset){
        var screenSize = cc.director.getWinSize();
        var cloud = new CloudSprite(name);
        cloud.SetSpeedAndWidth(speed, screenSize.width, XOffset);
        cloud.x = position.x;
        cloud.y = position.y;
        cloud.setScale(scale);
        this.addChild(cloud,zIndex);
        ArrayClouds[ArrayClouds.length] = cloud;
    },

    CreateClouds: function(){
        var FileName = res.CLOUD_IMAGE;
        this.AddCloud(kColudSpeedSlow, cc.p(700,610), kCloudScaleSlow, kZindexCloudSlow, FileName, kCloudRestartX);
        this.AddCloud(kColudSpeedSlow, cc.p(150,570), kCloudScaleSlow, kZindexCloudSlow, FileName, kCloudRestartX);

        this.AddCloud(kCloudSpeedFast, cc.p(150,300), kCloudScaleFast, kZindexCloudFast, FileName, kCloudRestartX);
        this.AddCloud(kCloudSpeedFast, cc.p(400,500), kCloudScaleFast, kZindexCloudFast, FileName, kCloudRestartX);
        this.AddCloud(kCloudSpeedFast, cc.p(880,400), kCloudScaleFast, kZindexCloudFast, FileName, kCloudRestartX);

        FileName = res.MOUNT_IMAGE;
        this.AddCloud(kMountSpeed, cc.p(300,170), kMountScale, kZindexMount, FileName, kMountRestartX);
        this.AddCloud(kMountSpeed, cc.p(800,170), kMountScale, kZindexMount, FileName, kMountRestartX);

        FileName = res.Tree_IMAGE;
        this.AddCloud(kTreeSpeed, cc.p(128,72), kTreeScale, kZindexTree, FileName, kCloudRestartX);
        this.AddCloud(kTreeSpeed, cc.p(624,72), kTreeScale, kZindexTree, FileName, kCloudRestartX);
        this.AddCloud(kTreeSpeed, cc.p(864,72), kTreeScale, kZindexTree, FileName, kCloudRestartX);
    },

    StartClouds: function(){
        for(var i=0;i<ArrayClouds.length;i++){
            ArrayClouds[i].Start();
        }
    },

    StopClouds: function(){
        for(var i=0;i<ArrayClouds.length;i++){
            ArrayClouds[i].Stop();
        }
    },

    StopTubes: function(){
        for(var i=0;i<ArrayTubes.length;i++){
            ArrayTubes[i].stopAllActions();
        }
    },

    ClearTubes:function(){
        for(var i=0;i<ArrayTubes.length;i++){
            ArrayTubes[i].Stop();
        }
    },

    StartGame: function(){
        this._robin.state = kRobinStateMoving;
        this.StartClouds();
        this._gameStarted = TRUE;
        this._lastTubeType = kTubeTypeNone;
        this._lastGetUnderY = this._middleY;
        this._gameStartLabel.visible = FALSE;
    },
    StopGame: function(){
        this.StopClouds();
        this._gameStarted = FALSE;
        this._gameTime = 0;
        this._nextSpawnTime = 0.2;
        this.StopTubes();
    },
    GameOver: function(){
        this._processTouch = FALSE;
        this._gameOverLabel.visible = TRUE;
        this.StopGame();
        this.scheduleOnce(this.ReEnableAfterGameOver,kReenableTime);
    },
    ReEnableAfterGameOver: function(){
        this._robin.y = this._middleY;
        this._processTouch = TRUE;
        this._gameOverLabel.visible = FALSE;
        this._gameStartLabel.visible = TRUE;
        this.ClearTubes();

        if(this._score > this._highscore){
            this._highScore = this._score;
        }

        this._score = 0;
        this.setScoreLabels();
    },

    SetSpawnTime: function(){
        this._lastSpawnTime = 0;
        this._nextSpawnTime = Math.floor((Math.random() * kTubeSpawnTimeVariance) + 1)/10  + kTubeSpawnMinTime;
        console.log('next set to:',this._nextSpawnTime);
    },

    SpawnNewTubes: function(){
        var ourChance = Math.floor((Math.random()*3) +1);
        while(1){
            if(this._lastTubeType == kTubeTypeUpper && ourChance == 1){
                ourChance = Math.floor((Math.random()*3) +1);
            }else if(this._lastTubeType == kTubeTypeLower && ourChance == 2){
                ourChance = Math.floor((Math.random()*3) +1);
            }else if(this._lastTubeType == kTubeTypePair && ourChance == 3){
                ourChance = Math.floor((Math.random()*3) +1);
            }else{
                break;
            }
        }
        
        if(ourChance == 1){
            this.SpawnUppderOrLower(TRUE);
        }else if(ourChance == 2){
            this.SpawnUppderOrLower(FALSE);
        }else{
            this.SpawnTubePair();
        }
    },

    SpawnUppderOrLower: function(isUpper){
        var YMax, YMin;
        if(isUpper == TRUE){
            this._lastTubeType = kTubeTypeUpper;
            YMax = this._middleY;
            YMin = kSingleGapBottom;
        }else{
            this._lastTubeType = kTubeTypeLower;
            YMax = kSingleGapTop;
            YMin = this._middleY;
            //避免前一個管子和當前管子高度差距過大 無法通過
            if(YMax - this._lastGetUnderY > kTubeMaxUpPixels){
                YMax = this._lastGetUnderY + kTubeMaxUpPixels;
            } 
        }
        var YRange = Math.abs(YMax - YMin); //絕對值
        var YPos = YMax - Math.floor(Math.random()*(YRange));
        if(isUpper== TRUE){
            this._lastGetUnderY = YPos;
        }else{
            this._lastGetUnderY = this._middleY;
        }
        console.log('SpawnUpperOrLower tube isUpper:', isUpper,'YPos:',YPos);
        this.SpawnATube(isUpper,YPos);
    },

    SpawnTubePair: function(){
        this._lastTubeType = kTubeTypePair;
        var Gap = kDoubleGapMin + Math.floor(Math.random() * (kDoubleGapMax - kDoubleGapMin));
        var YRange = kDoubleGapTop - Gap - kDoubleGapBottom;
        var TopY = kDoubleGapTop - Math.floor(Math.random() * YRange);
        var BottomY = TopY - Gap;

        this._lastGetUnderY = TopY;
        console.log('SpawnTubePair TopY:', TopY,'BottomY:',BottomY);
        this.SpawnATube(TRUE,TopY);
        this.SpawnATube(FALSE,BottomY);
    },

    SpawnATube: function(isUpper, yPos){
        var tube = this.GetNextTube();
        
        if(isUpper == TRUE){
            tube.setAnchorPoint(0.5,0);
            tube.setFlippedY(FALSE); //翻轉
        }else{
            tube.setAnchorPoint(0.5,1);
            tube.setFlippedY(TRUE);
        }
        tube.y = yPos;
        tube.Start();
    },

    GetNextTube: function(){
        for(var i=0;i<ArrayTubes.length;i++){
            if(ArrayTubes[i].state == kTubeStateInActive){
                console.log("found resuable tube");
                return ArrayTubes[i];
            }
        }
        var size = cc.director.getWinSize();

        var newTube = new TubeSprite(res.TUBE_IMAGE);
        newTube.Initialise(kTreeSpeed, size.width, kTubeOffsetX, kTubeInactiveX);
        this.addChild(newTube, kZindexTube);
        ArrayTubes[ArrayTubes.length] = newTube;
        console.log('made tube num:'+ArrayTubes.length);
        return newTube;
    }
});

GameLayer.scene = function(){
    var scene = new cc.Scene();
    var layer = new GameLayer();
    scene.addChild(layer);
    return scene;
}

window.onload = function(){
    
    var targetWidth=960;
    var targetHeight=640;
    cc.game.onStart = function(){
        //resize window size
        cc.view.adjustViewPort(false);
        cc.view.setDesignResolutionSize(targetWidth,targetHeight,cc.ResolutionPolicy.SHOW_ALL);
        cc.view.resizeWithBrowserSize(true);
        //load resources
        cc.LoaderScene.preload(["images/HelloWorld.png"], function () {
            cc.director.runScene(new GameLayer.scene());
        }, this);
    };
    cc.game.run("gameCanvas");
};