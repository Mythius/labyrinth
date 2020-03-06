const canvas = obj('canvas');
const ctx = canvas.getContext('2d');

var FPS = 60;
let board;
var playing = false;


obj('game').style.visibility = 'hidden';

var things = [];

var test;

let dead;

function loop(){
	if(playing) setTimeout(loop,1000/FPS);
	if(!board) return;
	ctx.clearRect(-2,-2,canvas.width+2,canvas.height+2);

	board.update();
	board.draw({
		fillStyle:'white',
		lineWidth: 0
	});
	if(test) test.getSquare().color = 'purple';
	for(let thing of things){
		thing.step();
		thing.draw();
	}
}

socket.on('data',info=>{
	Grid.width = info.dimensions.width;
	Grid.height = info.dimensions.height;
	board = new Grid();
	loadBoard(info.data);
	playing = true;
	loop(); 
	test = new Thing('assets/player.png');
	test.addControls();
});

function loadBoard(data){
	for(let y=0;y<Grid.height;y++){
		for(let x=0;x<Grid.width;x++){
			let solid = data[x][y];
			board.tiles[x][y].solid = solid;
			board.tiles[x][y].color = solid ? 'darkblue' : 'white';
		}
	}
}

var flip = 1;

socket.on('moveWalls',info=>{
	if(!playing || !joined) return;
	board.clearMovement();
	loadBoard(info.data);
	flip = info.direction;
	let ts = test.getSquare();
	// WHEN INFO.DIRECTION IS POSITIVE: ERROR
	if(info.row >= 0){
		let row = board.getRow(info.row);
		for(let tile of row){
			tile.offset(info.direction * Tile.scale * -1,0);
			tile.changeX = 2 * info.direction;
			if(tile == ts){
				test.gotoSquare(ts.x,ts.y-info.direction);
			}
		}
	} else {
		let col = board.getCol(info.col);
		for(let tile of col){
			tile.offset(0,info.direction * Tile.scale * -1);
			tile.changeY = 2 * info.direction;
			if(tile == ts){
				test.gotoSquare(ts.x-info.direction,ts.y);
			}
		}
	}
});

function init(){
	board = new Grid();
	playing = true;
	loop();
}

function stopAll(){
	playing = false;
	board = null;
}