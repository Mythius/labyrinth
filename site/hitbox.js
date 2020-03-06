// This file stores all classes
// this file gets blocked by some adblockers, such as uOrigin
var SHOW_HITBOXES = false;

function radians(deg){
	return deg * Math.PI / 180;
}

const distance=(x,y,x1,y1)=>Math.round(Math.sqrt((x-x1)**2+(y-y1)**2));

function getDir(x,y){return (Math.atan(y/x)+(x<0?0:Math.PI))*180/Math.PI}

function getPointIn(dir,dist,ox=0,oy=0){
	let x = ox + Math.cos(dir) * dist;
	let y = oy + Math.sin(dir) * dist;
	return new Vector(x,y);
}

class Vector{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
}
function Line(px1,py1,px2,py2){
	var x1 = px1;
	var y1 = py1;
	var x2 = px2;
	var y2 = py2;

	function setPos(px1,py1,px2,py2){
		x1 = px1;
		y1 = py1;
		x2 = px2;
		y2 = py2;
	}

	function getPosA(){return new Vector(x1,y1)}
	function getPosB(){return new Vector(x2,y2)}
	function touches(line){

		let posA = line.getPosA();
		let posB = line.getPosB();

		const x3 = posA.x;
		const y3 = posA.y;
		const x4 = posB.x;
		const y4 = posB.y;

		const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
		if(den == 0){
			return;
		}

		const t =  ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
		const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

		if(t >= 0 && t <= 1 && u >= 0 && u <= 1){
			const pt = new Vector();
			pt.x = x1 + t * (x2-x1);
			pt.y = y1 + t * (y2-y1);
			return pt;
		}
		else return;
	}
	function draw(color='white'){
		ctx.beginPath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = color;
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.stroke();
	}

	this.getPosA = getPosA;
	this.getPosB = getPosB;
	this.touches = touches;
	this.draw = draw;
	this.setPos = setPos;
	this.getData = function(){
		return `P1: (${x1},${y1}), P2: (${x2},${y2})`;
	}
}
function Hitbox(x,y,w,h){

	var dir = 0;

	var px = x;
	var py = y;
	var width = w;
	var height = h;
	var w2 = width / 2;
	var h2 = height / 2;

	var dist = distance(px,py,px-w2,py-h2);

	var l1 = new Line(px-w2,py-h2,px-w2,py+h2);
	var l2 = new Line(px-w2,py+h2,px+w2,py+h2);
	var l3 = new Line(px+w2,py+h2,px+w2,py-h2);
	var l4 = new Line(px+w2,py-h2,px-w2,py-h2);

	var a1 = getDir(-w2,-h2);
	var a2 = getDir(w2,-h2);
	var a3 = getDir(-w2,h2);
	var a4 = getDir(w2,h2);

	var lines = [l1,l2,l3,l4];
	var angles = [a1,a3,a4,a2];

	function draw(color='white'){
		ctx.fillStyle = color;
		ctx.fillRect(px-1,py-1,3,3);
		for(let l of lines){
			l.draw(color);
		}
	}

	function updateLines(){
		let points = [];
		for(let i=0;i<4;i++){
			let ln = lines[i];
			let an = angles[i];
			let pt = getPointIn(radians(dir+an),dist,px,py);
			points.push(pt);
		}
		for(let i=4;i<8;i++){
			let pt1 = points[i%4];
			let pt2 = points[(i-1)%4];
			lines[i%4].setPos(pt1.x,pt1.y,pt2.x,pt2.y);
		}
		
	}

	function setDir(d){
		dir = d;
		updateLines();
	}

	function setPos(x,y){
		px = x;
		py = y;
	}

	function touches(hitbox){
		if(!hitbox.getLines) return false;
		let other_lines = hitbox.getLines();
		for(let l1 of lines){
			for(let l2 of other_lines){
				if(l1.touches(l2)){
					return true;
				}
			}
		}
		return false;
	}

	function getLines(){
		return lines;
	}

	this.setDir = setDir;
	this.getLines = getLines;
	this.draw = draw;
	this.touches = touches;
	this.setPos = setPos;
}
function Sprite(path='./'){
	var img = create('img');
	var animation;
	var update_callback;
	img.src = path;

	var hitbox,keys={w:false,a:false,s:false,d:false},ks; // Controls (wasd)
	let w2=0,h2=0;
	var once = false;
	var temp;
	const THIS = this;

	function create(e){
		return document.createElement(e);
	}



	img.onload = function(){
		if(once){
			// Create a temporary loaded image to draw, prevents drawing unloaded images.
			temp = create('img');
			temp.src = img.src;
		}
		// this resizes the hitbox, only needed it to run once
		once = true;
		w = img.width;
		h = img.height;
		w2 = w/2;
		h2 = h/2;
		hitbox = new Hitbox(x+w2,y-h2,w,h);
		// add hitbox methods to sprite methods after image loads.
		THIS.getLines = hitbox.getLines;
		THIS.touches = hitbox.touches;
		temp = create('img');
		temp.src = img.src;
	}

	var w,h;
	var x = 100;
	var y = 100;
	var dir = 0;
	var speed = 2;



	function draw(){
		ctx.save();
		ctx.translate(x+w2,y-h2);
		ctx.rotate(radians(dir));
		try{ // Prevents Errors thrown if the image is not yet loaded
			if(img.src) ctx.drawImage(temp,-w2,-h2,w,h);
		} catch(e){};
		ctx.restore();
		if(SHOW_HITBOXES && hitbox) hitbox.draw('green');
	}

	function addControls(cb){
		// only use on player (wasd)
		update_callback = cb;
		document.on('keydown',e=>{
			if(e.key in keys){
				keys[e.key] = true;
				e.preventDefault();
			}
		});
		document.on('keyup',e=>{
			if(e.key in keys){
				keys[e.key] = false;
			}
		})
	}

	function step(dist=0,cd=0){
		// handles controls weather a player or projectile
		let tempx = x,tempy = y;

		// in theory this should test the position and move it if new position is ok
		// doesn't work 
		if(keys.w){
			y-=speed;
		}
		if(keys.s){
			y+=speed;
		}
		if(keys.a){
			x-=speed;
		}
		if(keys.d){
			x+=speed;
		}

		let pt = getPointIn(radians(dir*-1+90),dist);

		dir+=cd;
		y+=pt.x;
		x+=pt.y;

		let pos = new Vector(x,y);
		let condition = true;

		if(update_callback) condition = update_callback(keys,pos);
		if(!condition){
			x = tempx;
			y = tempy;
		}

		if(hitbox) hitbox.setPos(x+w2,y-h2);
		if(hitbox) hitbox.setDir(dir);
	}

	function setDir(d){
		// degrees not radians
		dir = d;
	}

	function moveTo(tx,ty){
		x = tx;
		y = ty;
		// updateLines();
	}

	function goTo(sprite){
		let pos = sprite.getData();
		x = pos.x;
		y = pos.y;
	}

	function pointAt(sprite,offset_angle=0){
		let pos = sprite.getData();
		let d = getDir(x - pos.x,y - pos.y);
		dir = d + offset_angle;
	}

	function pointTowards(tx,ty,offset_angle=0){
		let d = getDir(x - tx, y - ty);
		dir = d + offset_angle;
	}

	function addAnimation(path){
		// path to .anims, designed on www.matthiassouthwick.x10host.com
		return new Promise(resolve=>{
			xml(path,text=>{
				animation = new Animation(img,text);
				resolve();
			});
		});
	}

	function getPos(){
		return {x,y};
	}

	// Making wanted methods / data public (Everything before this point it private)
	this.layer = 0;
	this.initial_dir = 0;

	this.getImg=()=>img;
	this.anim=()=>animation;

	this.addAnimation = addAnimation;

	this.step = step;
	this.addControls = addControls;
	this.draw = draw;

	this.setDir = setDir;
	this.goTo = goTo;
	this.pointTowards = pointTowards;
	this.pointAt = pointAt;
	this.moveTo = moveTo;

	this.getPos = getPos;

	this.getData=()=>{
		// getters
		return {x:x+w2*.7,y:y-h2*.82,w,h,dir,hitbox};
		// .7 and .82 are just to adjust where other object target / goto
		// no clue why it doesn't work normally
	}
}