Gabscape = function()
{
	SB.Game.call(this);	    	
	
	this.lastdy = 0;
	this.dragging = false;
	this.helpScreen = null;
}

goog.inherits(Gabscape, SB.Game);

Gabscape.prototype.initialize = function(param)
{
	if (!param)
		param = {};
	
	if (!param.displayStats)
		param.displayStats = Gabscape.default_display_stats;

	this.twitterInfo = param.info;
	
	SB.Game.prototype.initialize.call(this, param);

	this.getTwitterData();
}


Gabscape.prototype.findGabber = function(gabberName) {
    var i;
    for (i = 0; i < this.gabbers.length; i++) {
        if (this.gabbers[i].name === gabberName) {
            return this.gabbers[i];
        }
    }
    return undefined;
}

Gabscape.prototype.initEntities = function()
{
	this.whichKeyDown = 0;
	this.turnFraction = 0;

	this.root = new SB.Entity;
	this.dragger = new SB.Dragger();
	this.rotator = new SB.Rotator();
	this.root.addComponent(this.dragger);
	this.root.addComponent(this.rotator);
	this.dragger.subscribe("move", this, this.onDraggerMove);
	this.rotator.subscribe("rotate", this, this.onRotatorRotate);

	this.timer = new SB.Timer( { duration : 3333 } );
	this.root.addComponent(this.timer);
	this.timer.subscribe("time", this, this.onTimeChanged);
	this.timer.subscribe("fraction", this, this.onTimeFractionChanged);
	this.timer.start();
	
	this.initModels();

    this.gabbers = [];
    var i;
    for (i = 0; i < Gabscape.users.length; i++) {
        if (Gabscape.users[i] == Gabscape.user) {
            // Don't add yourself
            continue;
        }
        var g1 = new Gabber({name: Gabscape.users[i]});
        g1.name = Gabscape.users[i];
        g1.network = g1.network || {};
        g1.network.orientationInterpolationTime = 0.0;
        g1.network.positionInterpolationTime = 0.0;
        g1.transform.position.set(0, 0, 0);
        this.gabbers.push(g1);
    }


    for (i = 0; i < this.gabbers.length; i++) {
        this.root.addChild(this.gabbers[i]);
    }

	this.createViewer();
	this.createNetwork();

	this.activeGabber = null;

	this.root.addChild(this.viewer);

	this.addEntity(this.root);

	this.root.realize();
	
	this.viewer.viewpoint.camera.bind();
	
	this.initSound();
}

Gabscape.prototype.createViewer = function()
{
	this.viewer = new SB.Viewer({ headlight : true });
	this.gabatar = new Gabatar({ info : this.twitterInfo });

	this.viewer.addChild(this.gabatar);
}

Gabscape.prototype.createNetwork = function()
{
	this.network = new Gabscape_GabClient(Gabscape.user, this);
	this.network.connect();
	this.lastNetworkUpdateTime = 0;
    this.lastTweenUpdateTime = 0;
}

Gabscape.prototype.initModels = function()
{
	var modelpath = '../../models/';
	
	  this.initModel(modelpath + 'flatland01.js', 0, -2, 0, 0);
		this.initModel(modelpath + 'trees01_rescaled.js', 15, 0, 15, 0.3);
		this.initModel(modelpath + 'trees01_rescaled.js', -15, 1, 15, 0.2 );
		this.initModel(modelpath + 'trees01_rescaled.js', 15, 0, -15, 0.5 );
	  this.initModel(modelpath + 'trees01_rescaled.js', -15, 0, -15, 0,7 );
		this.initModel(modelpath + 'trees01_rescaled.js', 13, 0, 7, -0.3 );
		this.initModel(modelpath + 'trees01_rescaled.js', -13, 0, 7, -0.5 );
		this.initModel(modelpath + 'trees01_rescaled.js', 7, 0, 13, -0.7 );
	  this.initModel(modelpath + 'trees01_rescaled.js', 7, 0, -13, -0.9 ); 
	  
	  this.initModel(modelpath + 'flatland01.js', 0, -2, 0, 1 );
		this.initModel(modelpath + 'trees01_rescaled.js', 8, 0, 9, 2 );
		this.initModel(modelpath + 'trees01_rescaled.js', -8, 1, 9, 3 );
		this.initModel(modelpath + 'trees01_rescaled.js', 8, 0, -9, 4 );
	  this.initModel(modelpath + 'trees01_rescaled.js', -8, 0, -9, 5 );
	  
		this.initModel(modelpath + 'trees01_rescaled.js', 11, 0, 10, -1 );
		this.initModel(modelpath + 'trees01_rescaled.js', -11, 0, 10, -2 );
		this.initModel(modelpath + 'trees01_rescaled.js', 11, 0, -10, -3);
	  this.initModel(modelpath + 'trees01_rescaled.js', 11, 0, -10, -4 ); 
	  
		this.initModel(modelpath + 'trees_conf01_rescaled.js', 12, 0, 0, 1 );
	  this.initModel(modelpath + 'trees_conf01_rescaled.js', -12, 0, 0, 2 );
	  this.initModel(modelpath + 'trees_conf01_rescaled.js', 0, 0, 12, 3);
	  this.initModel(modelpath + 'trees_conf01_rescaled.js', 0, 0, -12, 4 );
	  
		this.initModel(modelpath + 'trees_conf01_rescaled.js', 15, 0, -5, -1 );
	  this.initModel(modelpath + 'trees_conf01_rescaled.js', -15, 0, -5, -2 );
	  this.initModel(modelpath + 'trees_conf01_rescaled.js', 5, 0, 15, -3 );
	  this.initModel(modelpath + 'trees_conf01_rescaled.js', -5, 0, -15, -4 );  
	  
		this.initModel(modelpath + 'cloud01_rescaled.js', -20, 8, -20, 1 );
	  this.initModel(modelpath + 'cloud01_rescaled.js', 20, 9, -20, 2 );
	  this.initModel(modelpath + 'cloud01_rescaled.js', -20, 10, 20, 3 );
	  this.initModel(modelpath + 'cloud01_rescaled.js', 20, 11, 20, 4 );
	  
	  this.initModel(modelpath + 'cloud01_rescaled.js', 15, 8, 0, -1 );
	  this.initModel(modelpath + 'cloud01_rescaled.js', -15, 9, 0, -2 );
	  this.initModel(modelpath + 'cloud01_rescaled.js', 0, 10, 16, -3 );
	  this.initModel(modelpath + 'cloud01_rescaled.js', 0, 11, -16, -4 );
	  
		this.initModel(modelpath + 'mountan01.js', -48, 0, 0, 1 );
	  this.initModel(modelpath + 'mountan01.js', 49, 0, -0, 2 );
	  this.initModel(modelpath + 'mountan01.js', 3, 0, -45, 3 );
	  this.initModel(modelpath + 'mountan01.js', -1, 0, 43, 0 );  
	  
		this.initModel(modelpath + 'moon01_rescaled.js', -50, 60, -50, 0 );
		this.initModel(modelpath + 'body_base_nopane.js', -10, 0, -10, 0 );
		this.initModel(modelpath + 'body_flying_nopane.js', 10, 0, 10, 0 );
		this.initModel(modelpath + 'body_flying2_nopane.js', 10, 0, -10, 0 );
		this.initModel(modelpath + 'body_hero_nopane.js', -10, 0, 10, 0 );
		this.initModel(modelpath + 'body_inactive_nopane.js', 0, 0, -15, 0 ); 
		this.initModel(modelpath + 'failwhale.js', 20, 1.5, -25, 0); 
	  this.initModel(modelpath + 'bird.js', 30, 6, 30, -1); 
}

Gabscape.prototype.initModel = function(url, x, y, z, ry)
{
       var entity = new SB.Entity();

	   var transform = new SB.Transform();
	   transform.position.x = x;
	   transform.position.y = y;
	   transform.position.z = z;
     transform.rotation.y = ry;
	   entity.addComponent(transform);
	   entity.transform = transform;

     // Create the params
       var params = {
               materialType: SB.MaterialType.FromFile,
               //materialParam: {color: 0x00ff00, shading: THREE.SmoothShading }
               materialParam: {color: 0x00ff00 },
       } ;


       var model = SB.Model.loadModel(url, params);
       entity.addComponent(model);

       entity.realize();

       this.addEntity(entity);
}

Gabscape.prototype.initSound = function()
{
	sound_init();
}

Gabscape.prototype.getTwitterData = function()
{
	var that = this;

	TWITTER_CLIENT.getUserData(function(data) { that.getUserCallback(data); });
	TWITTER_CLIENT.getUserTimeLine(function(data) { that.userTimelineCallback(data); });
	TWITTER_CLIENT.getUserFriends(function(data) { that.userFriendsCallback(data); });

}

Gabscape.prototype.getUserCallback = function(data)
{
	var userInfo = data[0];
	this.gabatar.setUserInfo(userInfo);
}

Gabscape.prototype.userTimelineCallback = function(data)
{
	var foo = data;
}

Gabscape.prototype.userFriendsCallback = function(data)
{
	var i, len = data.length;
	for (i = 0; i < len; i++)
	{
		if (i >= this.gabbers.length)
			break;
		
		this.gabbers[i].setUserInfo(data[i]);
	}
}
Gabscape.prototype.selfSpawnEvent = function(twitterId, message) {
    var x = message.spawnposition.x;
    var y = message.spawnposition.y;
    var z = message.spawnposition.z;
    console.log('Got selfspawn for ' + twitterId + ' ' + x + ' ' + y + ' ' + z);
    this.viewer.transform.position.set(message.spawnposition.x, message.spawnposition.y, message.spawnposition.z);
    this.viewer.transform.rotation.set(message.spawnorientation.pitch, message.spawnorientation.yaw, message.spawnorientation.roll);
    var i, len = Gabscape.users.length;
    for (i = 0; i < len; i++)
    {
        if (Gabscape.users[i] === Gabscape.user) {
            // Don't subscribe to self.
            continue;
        }
        this.network.subscribeToUser(Gabscape.users[i]);
    }
}

Gabscape.prototype.positionChangeEvent = function(twitterId, message) {
    console.log('Got positionChangeEvent for ' + twitterId);

    var gabber = this.findGabber(twitterId);
    if (gabber === undefined) {
        console.log('Could not find gabber: ' + twitterId);
        return;
    }
    gabber.network = gabber.network || {};
    if (gabber.network.positionTarget === undefined) {
        // First time, take position
        gabber.transform.position.set(message.position.x, message.position.y, message.position.z);
    } else {
        // Jump to last network position
        // If we are interpolate quick enough, we shouldn't notice this.
        gabber.transform.position.set(gabber.network.positionTarget.x, gabber.network.positionTarget.y, gabber.network.positionTarget.z);
    }
    // Start interpolation
    gabber.network.positionSource = gabber.transform.position;
    gabber.network.positionTarget = message.position;
    gabber.network.positionInterpolationTime = 0.0;
}

Gabscape.prototype.orientationChangeEvent = function(twitterId, message) {
    console.log('Got orientationChangeEvent for ' + twitterId);

    var gabber = this.findGabber(twitterId);
    if (gabber === undefined) {
        console.log('Could not find gabber: ' + twitterId);
        return;
    }
    gabber.network = gabber.network || {};
    if (gabber.network.orientationTarget === undefined) {
        // First time, take orientation
        gabber.transform.rotation.set(message.orientation.pitch, message.orientation.yaw, message.orientation.roll);
    } else {
        // Jump to previous network orientation
        // If we are interpolate quick enough, we shouldn't notice this.
        gabber.transform.rotation.set(gabber.network.orientationTarget.pitch, gabber.network.orientationTarget.yaw, gabber.network.orientationTarget.roll);
    }
    // Start interpolation
    gabber.network.orientationSource = gabber.transform.rotation;
    gabber.network.orientationTarget = message.orientation;
    gabber.network.orientationInterpolationTime = 0.0;
}

Gabscape.prototype.actionEvent = function(twitterId, message) {
    console.log('Got actionEvent for ' + twitterId);
}

function orientationTween(t, source, target) {
    var x,y,z;
    x = ((1.0 - t) * source.x) + (t * target.pitch);
    y = ((1.0 - t) * source.y) + (t * target.yaw);
    z = ((1.0 - t) * source.z) + (t * target.roll);
    return {"x": x, "y": y, "z": z};
}

function positionTween(t, source, target) {
    var x,y,z;
    x = ((1.0 - t) * source.x) + (t * target.x);
    y = ((1.0 - t) * source.y) + (t * target.y);
    z = ((1.0 - t) * source.z) + (t * target.z);
    return {"x": x, "y": y, "z": z};
}
Gabscape.prototype.updateNetworkPositions = function(t) {
    var deltat = (t - this.lastTweenUpdateTime)/1000.0;
    this.lastTweenUpdateTime = t;
    var i;
    for (i = 0; i < this.gabbers.length; i++) {
        var gabber = this.gabbers[i];
        var gabnet = gabber.network;
        if (gabnet.positionSource === undefined || gabnet.positionTarget == undefined) {
            continue;
        }
        gabnet.positionInterpolationTime += deltat;
        if (gabnet.positionInterpolationTime > 1.0) {
            gabnet.positionInterpolationTime = 1.0;
        }
        var pt = positionTween(gabnet.positionInterpolationTime, gabnet.positionSource, gabnet.positionTarget);
        gabber.transform.position.set(pt.x, pt.y, pt.z);
    }

    for (i = 0; i < this.gabbers.length; i++) {
        var gabber = this.gabbers[i];
        var gabnet = gabber.network;
        if (gabnet.orientationSource === undefined || gabnet.orientationTarget == undefined) {
            continue;
        }
        gabnet.orientationInterpolationTime += deltat;
        if (gabnet.orientationInterpolationTime > 1.0) {
            gabnet.orientationInterpolationTime = 1.0;
        }
        var ot = orientationTween(gabnet.orientationInterpolationTime, gabnet.orientationSource, gabnet.orientationTarget);
        gabber.transform.rotation.set(ot.x, ot.y, ot.z);
    }
}

Gabscape.prototype.updateNetwork = function(t) 
{
	var deltat = t - this.lastNetworkUpdateTime;
	if (deltat > Gabscape.networkUpdateThreshold)
	{
		var pos = this.viewer.transform.position;
		this.network.updatePosition(pos.x, pos.y, pos.z);
		var rot = this.viewer.transform.rotation;
		this.network.updateOrientation(rot.x, rot.y, rot.z);
		this.lastNetworkUpdateTime = t;
	}
}

Gabscape.prototype.updateStatus = function(message)
{
//	document.getElementById("status").innerHTML = message;
}

Gabscape.prototype.getStatusInfo = function(status)
{
	var info = "";
	var i, len = status.length;
	for (i = 0; i < len; i++)
	{
		var stat = status[i];
		
		info += (
	"<img src='" + stat.user.profile_image_url + "'>" +
	"<b>" + stat.user.name +"</b>" + " @" + stat.user.screen_name + "<br/>" + stat.text + "<br/>"
			);
	}	

	return info;
}

Gabscape.prototype.updateFriends = function(message)
{
//	document.getElementById("friends").innerHTML = message;
}

Gabscape.prototype.getFriendsInfo = function(friends)
{
	var info = "";
	var i, len = friends.length;
	for (i = 0; i < len; i++)
	{
		var friend = friends[i][0];
		
		info += (
	"<img src='" + friend.profile_image_url + "'>" +
	"<b>" + friend.name +"</b>" + " @" + friend.screen_name + "<br/>" + friend.status.text + "<br/>"
			);
	}	

	return info;
}

Gabscape.prototype.updatePublicTimeline = function(message)
{
	// document.getElementById("public").innerHTML = message;
}



Gabscape.prototype.onMouseMove = function(x, y)
{
	this.dragger.set(x, y);
	this.rotator.set(x, y);
}

Gabscape.prototype.onMouseDown = function(x, y)
{
	this.dragger.start(x, y);
	this.rotator.start(x, y);
	this.dragging = true;
}

Gabscape.prototype.onMouseUp = function(x, y)
{
	this.dragger.stop(x, y);
	this.rotator.stop(x, y);
	this.dragging = false;
	this.lastdy = 0;
}

Gabscape.prototype.onMouseScroll = function(delta)
{
	SB.Graphics.instance.camera.position.z -= delta;
}

Gabscape.prototype.onKeyDown = function(keyCode, charCode)
{
	this.whichKeyDown = keyCode;
	if (this.activeGabber)
		this.activeGabber.onKeyDown(keyCode, charCode);
}

Gabscape.prototype.onKeyUp = function(keyCode, charCode)
{
	this.lastdy = 0;
	var mi;
	
	var handled = false;
	switch (String.fromCharCode(keyCode))
	{
    	case 'H' :
    		this.help();
    		handled = true;
    		break;
    		
    	case '1' :
    		mi = 1;
    		break;
    	case '2' :
    		mi = 2;
    		break;
    	case '3' :
    		mi = 3;
    		break;
    		
    	default : 
    		break;
	}

	if (!handled && this.activeGabber)
	{
		this.activeGabber.onKeyUp(keyCode, charCode);
	}
		
	if (mi)
	{
		var gabber = this.gabbers[mi-1];
		this.setActiveGabber(gabber);
	}

	this.whichKeyDown = 0;
	this.turnFraction = 0;
	
}

Gabscape.prototype.onKeyPress = function(keyCode, charCode)
{
}

Gabscape.prototype.onRotatorRotate = function(axis, delta)
{
	return;
	
	delta *= .1667;
	
	if (delta != 0)
	{
		// this.viewer.transform.rotation.y -= delta;
		//var dir = new THREE.Vector3(0, -delta, 0);
		//this.viewer.turn(dir);
		this.viewer.viewpoint.camera.rotation.y -= delta;

		var ry = this.viewer.viewpoint.camera.rotation.y;
		if (ry > Math.PI / 8)
			this.viewer.viewpoint.camera.rotation.y = Math.PI / 8;
		if (ry < - Math.PI / 8)
			this.viewer.viewpoint.camera.rotation.y = -Math.PI / 8;
	
	}
}

Gabscape.prototype.onDraggerMove = function(dx, dy)
{
	if (Math.abs(dy) <= 2)
		dy = 0;
	
	dy *= .002;
	
	if (dy)
	{
		this.lastdy = dy;
	}
	else if (this.lastdy && this.dragging)
	{
		dy = this.lastdy;
	}

	if (dy != 0)
	{
		this.viewer.viewpoint.camera.rotation.x += dy;
		var rx = this.viewer.viewpoint.camera.rotation.x;
		if (rx > Math.PI / 8)
			this.viewer.viewpoint.camera.rotation.x = Math.PI / 8;
		if (rx < - Math.PI / 8)
			this.viewer.viewpoint.camera.rotation.x = -Math.PI / 8;
	}
}

Gabscape.prototype.onTimeChanged = function(t)
{
	if (!this.activeGabber)
	{
		var handled = false;
		
		switch (this.whichKeyDown)
		{
	    	case SB.Keyboard.KEY_LEFT : 
				this.turn(+1);
				handled = true;
	    		break;
	    	case SB.Keyboard.KEY_UP : 
				this.move(-1);
				handled = true;
	    		break;
	    	case SB.Keyboard.KEY_RIGHT : 
	    		this.turn(-1);
				handled = true;
	    		break;
	    	case SB.Keyboard.KEY_DOWN : 
    			this.move(+1);
				handled = true;
	    		break;
		}
		
		if (!handled)
		{
			switch (String.fromCharCode(this.whichKeyDown))
			{
		    	case 'A' :
					this.turn(+1);
		    		handled = true;
		    		break;
		    		
		    	case 'W' :
					this.move(-1);
		    		handled = true;
		    		break;
		    	case 'D' :
		    		this.turn(-1);
					handled = true;
		    		break;
		    	case 'S' :
	    			this.move(+1);
					handled = true;
		    		break;
		    		
		    	default : 
		    		break;
			}
		}
	}
	this.updateNetworkPositions(t);
	this.updateNetwork(t);
}

Gabscape.prototype.onTimeFractionChanged = function(fraction)
{
	this.turnFraction = fraction;
}

Gabscape.prototype.move = function(direction)
{
	var delta = direction * .1666;
	var dir = new THREE.Vector3(0, 0, delta);
	this.viewer.move(dir);
	gain2.gain.value = 1;
}

Gabscape.prototype.turn = function(direction)
{
	var delta = direction * .0333;
	// this.viewer.transform.rotation.y -= delta;
	var dir = new THREE.Vector3(0, delta, 0);
	this.viewer.turn(dir);
}

Gabscape.prototype.setActiveGabber = function(gabber)
{
	if (this.activeGabber)
	{
		this.activeGabber.setActive(false);
	}
	
	gabber.setActive(true);
	
	this.activeGabber = gabber;
}

Gabscape.prototype.help = function()
{
	if (!this.helpScreen)
	{
		this.helpScreen = new GabscapeHelp();
	}
	
	this.helpScreen.show();
}

Gabscape.default_display_stats = false;
Gabscape.users = ["auradeluxe", "carrnation", "cyberdino", "don_olmstead", "fromthought2web",
                  "Gamepsych", "jackpryne", "JohnMcCutchan", "mgpettit", "scottfoe", "ta"];

Gabscape.user = "auradeluxe";
Gabscape.networkUpdateThreshold = 100;
