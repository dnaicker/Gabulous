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
	
	if (!param.backgroundColor)
		param.backgroundColor = Gabscape.default_bgcolor;

	if (!param.displayStats)
		param.displayStats = Gabscape.default_display_stats;

	this.twitterInfo = param.info;
	
	SB.Game.prototype.initialize.call(this, param);
	
	this.getTwitterData();
}


Gabscape.prototype.initEntities = function()
{
	this.root = new SB.Entity;
	this.dragger = new SB.Dragger();
	this.rotator = new SB.Rotator();
	this.root.addComponent(this.dragger);
	this.root.addComponent(this.rotator);
	this.dragger.subscribe("move", this, this.onDraggerMove);
	this.rotator.subscribe("rotate", this, this.onRotatorRotate);
	
	var grid = new SB.Grid();
	this.root.addComponent(grid);
	
	var g1 = new Gabber();
	g1.transform.position.x = 5;

	var g2 = new Gabber();
	g2.transform.position.x = -5;

	var g3 = new Gabber();
	g3.transform.position.z = -5;

	this.createViewer();
	
	this.gabbers = [g1, g2, g3];
	this.activeGabber = null;
	
	this.root.addChild(g1);
	this.root.addChild(g2);
	this.root.addChild(g3);
	this.root.addChild(this.viewer);
	
	this.addEntity(this.root);

	this.root.realize();
	
	this.viewer.viewpoint.camera.bind();
	
}

Gabscape.prototype.createViewer = function()
{
	this.viewer = new SB.Viewer({ headlight : true });
	this.gabatar = new Gabatar({ info : this.twitterInfo });

	this.viewer.addChild(this.gabatar);
}

Gabscape.prototype.getTwitterData = function()
{
	var that = this;
	Gabulous.getTimeline(function(result, text) 
			{ that.timelineCallback(result, text); });
}

Gabscape.prototype.timelineCallback = function(result, responseText)
{
	var foo = result;
	var statusInfo = this.getStatusInfo(result);
	this.updateStatus(statusInfo);
	var that = this;
	Gabulous.getFriends(this.twitterInfo.screen_name, 
			function(result, text) { that.friendsCallback(result, text); });
}

Gabscape.prototype.friendsCallback = function(result, responseText)
{
	var foo = result;
	var friendsInfo = this.getFriendsInfo(result);
	
	this.updateFriends(friendsInfo);

	var that = this;
	Gabulous.getPublicTimeline(function(result, text) 
			{ that.publicTimelineCallback(result, text); });
}


Gabscape.prototype.publicTimelineCallback = function(result, responseText)
{
	var foo = result;
	var statusInfo = this.getStatusInfo(result);
    this.updatePublicTimeline(statusInfo);
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
	if (this.activeMonster)
		this.activeMonster.onKeyDown(keyCode, charCode);
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

	if (!handled && this.activeMonster)
	{
		this.activeMonster.onKeyUp(keyCode, charCode);
	}
		
	if (mi)
	{
		var monster = this.monsters[mi-1];
		this.setActiveMonster(monster);
	}
}

Gabscape.prototype.onKeyPress = function(keyCode, charCode)
{
}

Gabscape.prototype.onRotatorRotate = function(axis, delta)
{
	delta *= .666;
	
	if (delta != 0)
	{
		// this.viewer.transform.rotation.y -= delta;
		var dir = new THREE.Vector3(0, -delta, 0);
		this.viewer.turn(dir);
		this.lastrotate = delta;
	}
}

Gabscape.prototype.onDraggerMove = function(dx, dy)
{
	if (Math.abs(dy) <= 2)
		dy = 0;
	
	dy *= .02;
	
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
		// this.viewer.transform.position.z -= dy;
		var dir = new THREE.Vector3(0, 0, -dy);
		this.viewer.move(dir);
	}
}

Gabscape.prototype.setActiveMonster = function(monster)
{
	if (this.activeMonster)
	{
		this.activeMonster.setActive(false);
	}
	
	monster.setActive(true);
	
	this.activeMonster = monster;
}

Gabscape.prototype.help = function()
{
	if (!this.helpScreen)
	{
		this.helpScreen = new GabscapeHelp();
	}
	
	this.helpScreen.show();
}

Gabscape.default_bgcolor = '#000000';
Gabscape.default_display_stats = false;
