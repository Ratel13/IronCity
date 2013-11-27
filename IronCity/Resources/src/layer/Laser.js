/**
 * Created with JetBrains WebStorm.
 * User: cocos
 * Date: 13-10-24
 * Time: 下午3:06
 * To change this template use File | Settings | File Templates.
 */

//laser: attack's mode.
var Laser = cc.Layer.extend({
    _idx:0, //idx: index of laser.
    dir_x:0,    //for describe direction of laser.
    dir_y:0,
    speed:0,    //speed of laser.
    //init function, idx: index of laser, pos: position of laser. direction: direction of laser.
    init:function(idx, pos, direction){
        var _laser = cc.Sprite.create(Png_laser);
        this.addChild(_laser);
        //this.initWithFile(Png_laser);
        this.setPosition(pos);
        this.setAnchorPoint(cc.p(0, 0));
        this.setRotation(direction*180/3.14159);

        this._idx = idx;
        this.speed = 12;
        this.dir_x = Math.cos(direction);
        this.dir_y = -Math.sin(direction);
    },
    //delete self from parent.
    releaseLaser:function(){
        (this.getParent()).removeLaser(this._idx);
    },
    //outside of wall or not.
    ifOutSideWall:function(){
        var winSize = cc.Director.getInstance().getWinSize();
        if(winSize.width < 480)
            winSize.width = 480;
        if(winSize.height < 320)
            winSize.height = 320;
        var laserX = this.getPositionX();
        var laserY = this.getPositionY();

        if(laserX < 0.0 || laserX > winSize.width || laserY < 0.0 || laserY > winSize.height){
            return true;
        }

        return false;
    },
    //is crossing a rect.
    inRect:function(rect){
        var _org = this.getPosition();
        for (var i=0; i<100; i++) {
            var _p = cc.pAdd(_org, cc.p(this.dir_x*i, this.dir_y*i));
            if (cc.rectContainsPoint(rect, _p)) {
                return true;
            }
        }
        return false;
    },
    //update status of pre-frame.
    update:function(){
        //if out of wall, delete self and return.
        if (this.ifOutSideWall()) {
            this.releaseLaser();
            return;
        }
        //if hit a monster
        if (this.inRect(GameScene.getScene().gameSceneMonster.MonsterAmatureBoundingBox) && GameScene.getScene().gameSceneMonster.IsLive())
        {
            GameScene.getScene().gameSceneMonster.setIsLive(false);
            //add score.
            var type = GameScene.getScene().gameSceneMonster.MonsterIndex;
            if (type == MonsterType.MonsterSky_enum) {
                GameScene.getScene().playLayer.addMonsterSkyAmount();
                AudioPlayer.getInstance().playEffect(g_ArrEffects.Effect_Monster_Dead_0);
            }
            else if (type == MonsterType.MonsterGround_enum){
                GameScene.getScene().playLayer.addMonsterGroundAmount();
                AudioPlayer.getInstance().playEffect(g_ArrEffects.Effect_Monster_Dead_1);
            }
            if(!GameScene.getScene().isRectDetectedLock)
            {
                GameScene.getScene().isRectDetectedLock = true;
                //delete monster.
                GameScene.getScene().gameSceneMonster.MonsterDestroyAction();
            }
            //delete self.
            this.releaseLaser();

            return;
        }

        //move
        var pos = this.getPosition();
        pos.x += this.dir_x * this.speed;
        pos.y += this.dir_y * this.speed;
        this.setPosition(pos);
    }
});

//manager of lasers.
var LaserManager = cc.Node.extend({
    lasers:null,    //array of lasers.
    topNum:0,       //for count top number.
    attackTime:0,   //set attack time of two laser.
    //init function.
    init:function(){
        this.topNum = 0;
        this.attackTime = 0;
        this.lasers = [];
        //this->scheduleUpdate();
        return true;
    },
    //get index of current empty position.
    getIndex:function(){
        for (var i=0; i<this.topNum; i++) {
            if (this.lasers[i] == null) {
                return i;
            }
        }

        return this.topNum;
    },
    //tick all lasers.
    update:function(dt){
        if (this.attackTime > 0) {
            this.attackTime --;
        }
        for (var i=0; i<this.topNum; i++) {
            if (this.lasers[i] != null) {
                this.lasers[i].update();
            }
        }
    },
    //add a laser.
    addLaser:function(pos, dir){
        if (this.attackTime > 0) {
            return;
        }
        var idx = this.getIndex();
        var laser = new Laser();
        laser.init(idx, pos, dir);
        this.addChild(laser);

        this.lasers[idx] = laser;
        if (idx >= this.topNum) {
            this.topNum++;
        }

        this.attackTime = 20;
    },
    //remove a laser.
    removeLaser:function(idx){
        this.lasers[idx].removeFromParent(true);
        this.lasers[idx] = null;
    }
});