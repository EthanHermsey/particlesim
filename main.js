
let brushSize = 6;
let paused = false;
const gridSize = { x: 400, y: 300 };
const frameRates = [];

let displayImage;
const particleTypes = [
	{ type: 'Stone', color: [ 125, 125, 125 ] },
	{ type: 'Dirt', color: [ 149, 113, 95 ] },
	{ type: 'Water', color: [ 10, 10, 250 ] },
	{ type: 'Seed', color: [ 25, 100, 25 ] },
];
let selectedType = 0;
let selectedColor;

const worker = new Worker( "./worker.js" );
worker.onmessage = ( { data } ) => {

	displayImage.pixels.set( data );
	displayImage.updatePixels();

};


//setup
function setup() {

	let size = min( windowWidth * 0.9, windowHeight );
	let sizeX = size * ( gridSize.x / gridSize.y );
	createCanvas( sizeX, size );
	textFont( 'Tahoma' );
	textAlign( RIGHT );

	displayImage = createImage( gridSize.x, gridSize.y );
	displayImage.loadPixels();

	let particleSelect = select( '#particleSelect' );
	particleSelect.style( 'right', `${ min( windowWidth * 0.9 + 5, windowWidth * 0.5 + sizeX * 0.5 + 5 ) }px` );

	const setSelectedColor = ()=>{

		const selected = document.querySelector( '.selected' );
		selectedColor = color( selected.style.background );

	};

	particleTypes.map( ( type, i )=>{

		let d = createElement( 'div' );
		let p = createElement( 'p', type.type );

		if ( i == selectedType ) d.class( 'selected' );
		d.style( 'background', `rgb(${type.color.join( ',' )} )` );
		p.parent( d );
		d.parent( particleSelect );
		d.mouseClicked( ()=>{

			selectedType = i;

			for ( let i = 0; i < d.elt.parentElement.children.length; i ++ ) {

				let elt = d.elt.parentElement.children[ i ];
				elt.className = '';
				if ( i == selectedType ) elt.className = 'selected';

			}

			setSelectedColor();

		} );

		setSelectedColor();

	} );


	worker.postMessage( { tag: 'INIT' } );

}

function meanFps() {

	frameRates.unshift( floor( frameRate() ) );
	if ( frameRates.length > 10 ) {

		frameRates.pop();

	}
	const sum = frameRates.reduce( ( s, v ) => {

		return s + v;

	} );
	return Math.floor( sum / frameRates.length );

}





//draw, simulate
function draw() {

	background( 0 );

	//add new particles
	if ( mouseIsPressed ) {

		addParticles();

	}

	image( displayImage, 0, 0, width, height );

	//display mouse
	stroke( selectedColor );
	noFill();
	circle( mouseX, mouseY, brushSize * brushSize + 1 );

	//display info
	// noStroke();
	// fill( 255 );
	// if ( paused ) text( 'PAUSED', width * 0.48, 15 );
	// text( 'Fps: ' + meanFps(), width - 5, 15 );
	// text( 'Brush size: ' + ( brushSize + 1 ), width - 5, 30 );

}




function addParticles() {

	if ( mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height ) return;

	let x = floor( ( mouseX / width ) * ( gridSize.x ) );
	let y = floor( ( mouseY / height ) * ( gridSize.y ) );

	if ( mouseButton == LEFT ) {

		worker.postMessage( {
			tag: 'ADD',
			x,
			y,
			selectedType,
			brushSize: brushSize * 2
		} );

	} else if ( mouseButton == RIGHT ) {

		worker.postMessage( {
			tag: 'REMOVE',
			x,
			y,
			brushSize: brushSize * 2
		} );

	}

}




//user input / drawing new particles
function mousePressed() {

	addParticles();

}


function keyPressed() {

	if ( keyCode == 32 ) { //space

		paused = ! paused;

	}

	if ( keyCode == 16 ) speed = true;

}
function keyReleased() {

	if ( keyCode == 16 ) speed = false;

}

function mouseWheel( e ) {

	let d = Math.sign( e.delta );
	brushSize -= d;
	if ( brushSize < 0 ) brushSize = 0;
	if ( brushSize > 15 ) brushSize = 15;

}

