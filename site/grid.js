class Tile {
    static scale = 40;
    #area = new Path2D();
    #offsetX = 0;
    #offsetY = 0;
    hitbox = null;
    changeX = 0;
    changeY = 0;
    color = 'white';
    solid = false;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.#area.rect(this.x * Tile.scale, this.y * Tile.scale, Tile.scale - 1, Tile.scale - 1);
        this.hitbox = new Hitbox(this.x * Tile.scale + Tile.scale / 2, this.y * Tile.scale + Tile.scale / 2, Tile.scale - 1, Tile.scale - 1);
    }
    draw(options = {}) {
        if (typeof options.stokeStyle == 'number') ctx.strokeStyle = options.strokeStyle;
        else ctx.strokeStyle = this.color;
        if (typeof options.lineWidth == 'number') ctx.lineWidth = options.lineWidth;
        ctx.lineWidth = 0;
        ctx.fillStyle = this.color;
        ctx.save();
        ctx.translate(.5, .5);
        ctx.beginPath();
        ctx.fill(this.#area);
        ctx.stroke(this.#area);
        ctx.restore();
        if(this.color != 'white' && SHOW_HITBOXES) this.hitbox.draw('green');
    }
    hasPoint(x, y) {
        return ctx.isPointInPath(this.#area, x, y);
    }
    offset(x, y) {
        this.#offsetX = x;
        this.#offsetY = y;
        this.#area = new Path2D();
        this.#area.rect(this.x * Tile.scale + x, this.y * Tile.scale + y, Tile.scale - 1, Tile.scale - 1);
        this.hitbox.setPos(this.x * Tile.scale + Tile.scale / 2 + x, this.y * Tile.scale + Tile.scale / 2 + y);
    }
    update() {
        this.offset(this.#offsetX + this.changeX, this.#offsetY + this.changeY);
        if (this.#offsetX * flip > 0 || this.#offsetY * flip > 0) this.clearMovement();
    }
    clearMovement() {
        this.changeX = 0;
        this.changeY = 0;
        this.offset(0, 0);
    }
    touches(thg){
    	if(!this.solid) return false;
    	return this.hitbox.touches(thg);
    }
}
class Grid {
    static width = 10;
    static height = 10;
    tiles = [];
    constructor() {
        canvas.width = (Grid.width - 2) * Tile.scale;
        canvas.height = (Grid.height - 2) * Tile.scale;
        for (let y = 0; y < Grid.height; y++) {
            let row = [];
            for (let x = 0; x < Grid.width; x++) {
                row.push(new Tile(x - 1, y - 1));
            }
            this.tiles.push(row);
        }
    }
    forEach(callback) {
        let y = 0;
        for (let row of this.tiles) {
            let x = 0;
            for (let tile of row) {
                let end = callback(tile, y++, x++);
                if (end) return;
            }
        }
    }
    draw(options = {}) {
        this.forEach(tile => {
            tile.draw(options);
        });
    }
    getTileAt(x, y) {
        let result;
        this.forEach(tile => {
            if (tile.hasPoint(x, y)) {
                result = tile;
                return true;
            }
        });
        return result;
    }
    getRow(r) {
        return this.tiles[r];
    }
    getCol(c) {
        let result = [];
        for (let row of this.tiles) {
            result.push(row[c]);
        }
        return result;
    }
    update() {
        this.forEach(tile => {
            tile.update();
        });
    }
    clearMovement() {
        this.forEach(tile => {
            tile.clearMovement();
        });
    }
    touches(thg){
    	let result = false;
    	this.forEach(tile => {
    		let tchs = tile.touches(thg);
    		if(tchs){
	    		result = true;
	    		return true;
    		} 
    	});
    	return result;
    }
}
class Thing extends Sprite {
    constructor(...args) {
        super(...args);
        things.push(this);
    }
    gotoSquare(x,y) {
        this.moveTo(x * Tile.scale - 4*Tile.scale/5, y * Tile.scale - Tile.scale/6);
    }
    getSquare(){
    	let pos = this.getPos();
    	let x = Math.round(pos.x / Tile.scale)+1;
    	let y = Math.round(pos.y / Tile.scale);
    	let rw = board.tiles[y];
    	if(rw){
    		rw = rw[x];
    	}
    	return rw;
    }
}