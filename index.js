var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');
var system = require('child_process');

var file = {
	save: function(name,text){
		fs.writeFile(name,text,e=>{
			if(e) console.log(e);
		});
	},
	read: function(name,callback){
		fs.readFile(name,(error,buffer)=>{
			if (error) console.log(error);
			else callback(buffer.toString());
		});
	}
}

const port = 80;
const path = __dirname+'/';

app.use(express.static(path+'site/'));
app.get(/.*/,function(request,response){
	response.sendFile(path+'site/');
});

http.listen(port,()=>{console.log('Serving Port: '+port)});

var labyrinth = {};

class Maze{
	arr = [];
	static width;
	static height;
	constructor(width,height){
		labyrinth.width = width;
		labyrinth.height = height;
		Maze.width = width;
		Maze.height = height;
		for(let y=0;y<height;y++){
			let row = [];
			for(let x=0;x<width;x++){
				row.push(random(0,3)<2?0:1);
			}
			this.arr.push(row);
		}
	}
	print(){
		console.log('Maze');
		let ay = this.arr;
		for(let t of ay) console.log(t.join(''));
		console.log('\n');
	}
	getRow(r){
		return this.arr[r];
	}
	getCol(c){
		let result = [];
		for(let row of this.arr){
			result.push(row[c]);
		}
		return result;
	}
	setPos(x,y,value){
		this.arr[x][y] = value;
	}
	shiftRows(row_number,direction,new_number){
		let shifted_row = this.getRow(row_number);
		if(direction > 0){
			shifted_row.unshift(new_number);
			shifted_row.pop();
		} else {
			shifted_row.push(new_number);
			shifted_row.shift();
		}
		for(let y=0;y<Maze.height;y++){
			this.setPos(row_number,y,shifted_row[y]);
		}
	}
	shiftCols(col_number,direction,new_number){
		let shifted_col = this.getCol(col_number);
		if(direction > 0){
			shifted_col.unshift(new_number);
			shifted_col.pop();
		} else {
			shifted_col.push(new_number);
			shifted_col.shift();
		}
		for(let x=0;x<Maze.width;x++){
			this.setPos(x,col_number,shifted_col[x]);
		}
	}
}

var user_id = 0;
var users = [];

function random(min,max){
	return min+Math.floor(Math.random()*(max-min+1));
}

let maze = new Maze(10,10);

// maze.print();


class User{
	constructor(name){
		this.name = name;
		this.id = user_id++;
		users.push(this);
	}
}

function serverLoop(){
	let row=-1,col=-1;
	let direction=random(0,1)==0?-1:1;
	let insert=random(0,3)<=1?0:1;
	if(random(0,1)==0){
		row=random(1,labyrinth.width-2);
	} else {
		col=random(1,labyrinth.height-2);
	}
	if(row>=0){ // Move Row
		maze.shiftRows(row,direction,insert);
	} else { // Move Column
		maze.shiftCols(col,direction,insert);
	}
	io.emit('moveWalls',{row,col,direction,wait,insert,data:maze.arr});
}

let wait = .5;
setInterval(serverLoop,1000*wait);

io.on('connection',socket=>{
	socket.on('join',usrnm=>{
		new User(usrnm);
		console.log(usrnm+' joined.');
		socket.emit('data',{dimensions:labyrinth,data:maze.arr});
	});
});