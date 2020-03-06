var socket = io();

function obj(id){return document.querySelector(id)}
Node.prototype.on=(a,b,c)=>{this.addEventListener(a,b,c)}

var joined = false;

obj('#join').on('click',e=>{
	if(e.target != obj('#join')) return;
	join();
});

obj('#fullscreen').on('click',e=>{
	if(e.target != obj('#fullscreen')) return;
	canvas.requestFullscreen();
});

obj('input').focus();

document.on('keydown',e=>{
	if(e.key == 'Enter') join();
})

function join(){
	if(joined) return;
	let username = obj('input').value;
	if(!username) username = 'RandomName';
	socket.emit('join',username);
	joined = true;
	obj('login').style.visibility = 'hidden';
	obj('game').style.visibility = null;
	canvas.requestFullscreen();
	// init();
}