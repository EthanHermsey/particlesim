importScripts( './particles/particle.js' );
importScripts( './particles/stone.js' );
importScripts( './particles/dirt.js' );
importScripts( './particles/water.js' );

importScripts( './particles/plantParticle.js' );
importScripts( './particles/seed.js' );
importScripts( './particles/root.js' );
importScripts( './particles/stem.js' );
importScripts( './particles/flower.js' );

let running = false;
let frameCount = 0;
const gridSize = { x: 400, y: 300 };
const pixels = new Uint8ClampedArray( gridSize.x * gridSize.y * 4 ).fill( 0 );
const particles = [];
const grid = new Array( gridSize.x * gridSize.y ).fill( null );

const particleTypes = [
	{ type: 'Stone', particle: self.Stone },
	{ type: 'Dirt', particle: self.Dirt },
	{ type: 'Water', particle: self.Water },
	{ type: 'Seed', particle: self.Seed },
];

self.onmessage = ( { data: msg } ) =>{

	const { tag, x, y, brushSize, selectedType } = msg;

	switch ( tag ) {

		case 'INIT':

			setInterval( ()=>{

				simulate();
				simulate();
				postMessage( pixels );
				frameCount ++;

			}, 1000 / 60 );
			break;

		case 'ADD':

			let bR = map( brushSize, 0, 32, 0.5, 0.01 );

			for ( let y1 = - brushSize; y1 <= brushSize; y1 ++ ) {

				for ( let x1 = - brushSize; x1 <= brushSize; x1 ++ ) {


					if ( ( Math.random() > bR ) ||
                        x1 * x1 + y1 * y1 > brushSize * brushSize ||
                        x + x1 >= gridSize.x || x + x1 < 0 ||
                        y + y1 >= gridSize.y || y + y1 < 0 ) {

						continue;

					}

					let offset = ( ( ( y + y1 ) * gridSize.x ) + ( x + x1 ) );

					if ( ! grid[ offset ] ) {

						const newParticle = new particleTypes[ selectedType ].particle( {
							offset: offset,
							position: { x: x + x1, y: y + y1 }
						} );

						newParticle.display();
						grid[ offset ] = newParticle;
						particles.push( newParticle );


					}

				}

			}

			break;

		case 'REMOVE':

			for ( let i = particles.length - 1; i >= 0; i -- ) {

				let p = particles[ i ];
				let dx = p.position.x - x, dy = p.position.y - y;
				if ( dx * dx + dy * dy < brushSize * brushSize ) {

					pixels[ p.offset * 4 + 0 ] = 0;
					pixels[ p.offset * 4 + 1 ] = 0;
					pixels[ p.offset * 4 + 2 ] = 0;
					grid[ p.offset ] = undefined;
					particles.splice( i, 1 );

				}

			}

			break;

	}

};


function simulate() {

	for ( let i = particles.length - 1; i >= 0; i -- ) {

		particles[ i ].update();

	}

}

function addParticles() {

	if ( mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height ) return;

	let x = floor( ( mouseX / width ) * ( gridSize.x ) );
	let y = floor( ( mouseY / height ) * ( gridSize.y ) );
	let bR = map( brushSize, 0, 15, 0.6, 0.2 );

	if ( mouseButton == LEFT ) {

		for ( let y1 = - brushSize; y1 <= brushSize; y1 ++ ) {

			for ( let x1 = - brushSize; x1 <= brushSize; x1 ++ ) {

				if ( ( selectedType != 2 && Math.random() > bR ) ||
          x1 * x1 + y1 * y1 > brushSize * brushSize ||
          x + x1 >= gridSize.x || x + x1 < 0 ||
          y + y1 >= gridSize.y || y + y1 < 0 ) {

					continue;

				}

				let offset = ( ( ( y + y1 ) * gridSize.x ) + ( x + x1 ) );

				if ( ! grid[ offset ] ) {


					const newParticle = new particleTypes[ selectedType ].particle( {
						offset: offset,
						position: { x: x + x1, y: y + y1 }
					} );

					newParticle.display();
					grid[ offset ] = newParticle;
					particles.push( newParticle );

				}

			}

		}

	} else if ( mouseButton == RIGHT ) {

		for ( let i = particles.length - 1; i >= 0; i -- ) {

			let p = particles[ i ];
			let dx = p.x - x, dy = p.y - y;
			if ( dx * dx + dy * dy < brushSize * brushSize ) {

				displayImage.pixels[ p.offset * 4 + 0 ] = 0;
				displayImage.pixels[ p.offset * 4 + 1 ] = 0;
				displayImage.pixels[ p.offset * 4 + 2 ] = 0;
				grid[ p.offset ] = undefined;
				particles.splice( i, 1 );

			}

		}

	}

}

map = ( n, start1, stop1, start2, stop2 ) => {

	const newval = ( n - start1 ) / ( stop1 - start1 ) * ( stop2 - start2 ) + start2;
	return newval;

};

random = ( min, max ) => {

	let rand;

	rand = Math.random();

	if ( typeof min === 'undefined' ) {

		return rand;

	} else if ( typeof max === 'undefined' ) {

		return rand * min;

	} else {

		if ( min > max ) {

			const tmp = min;
			min = max;
			max = tmp;

		}

		return rand * ( max - min ) + min;

	}

};

const PERLIN_YWRAPB = 4;
const PERLIN_YWRAP = 1 << PERLIN_YWRAPB;
const PERLIN_ZWRAPB = 8;
const PERLIN_ZWRAP = 1 << PERLIN_ZWRAPB;
const PERLIN_SIZE = 4095;

let perlin_octaves = 4; // default to medium smooth
let perlin_amp_falloff = 0.5; // 50% reduction/octave
let perlin = null;

const scaled_cosine = i => 0.5 * ( 1.0 - Math.cos( i * Math.PI ) );

noise = ( x, y = 0, z = 0 ) => {

	if ( perlin == null ) {

		perlin = new Array( PERLIN_SIZE + 1 );
		for ( let i = 0; i < PERLIN_SIZE + 1; i ++ ) {

			perlin[ i ] = Math.random();

		}

	}

	if ( x < 0 ) {

		x = - x;

	}
	if ( y < 0 ) {

		y = - y;

	}
	if ( z < 0 ) {

		z = - z;

	}

	let xi = Math.floor( x ),
		yi = Math.floor( y ),
		zi = Math.floor( z );
	let xf = x - xi;
	let yf = y - yi;
	let zf = z - zi;
	let rxf, ryf;

	let r = 0;
	let ampl = 0.5;

	let n1, n2, n3;

	for ( let o = 0; o < perlin_octaves; o ++ ) {

		let of = xi + ( yi << PERLIN_YWRAPB ) + ( zi << PERLIN_ZWRAPB );

		rxf = scaled_cosine( xf );
		ryf = scaled_cosine( yf );

		n1 = perlin[ of & PERLIN_SIZE ];
		n1 += rxf * ( perlin[ ( of + 1 ) & PERLIN_SIZE ] - n1 );
		n2 = perlin[ ( of + PERLIN_YWRAP ) & PERLIN_SIZE ];
		n2 += rxf * ( perlin[ ( of + PERLIN_YWRAP + 1 ) & PERLIN_SIZE ] - n2 );
		n1 += ryf * ( n2 - n1 );

		of += PERLIN_ZWRAP;
		n2 = perlin[ of & PERLIN_SIZE ];
		n2 += rxf * ( perlin[ ( of + 1 ) & PERLIN_SIZE ] - n2 );
		n3 = perlin[ ( of + PERLIN_YWRAP ) & PERLIN_SIZE ];
		n3 += rxf * ( perlin[ ( of + PERLIN_YWRAP + 1 ) & PERLIN_SIZE ] - n3 );
		n2 += ryf * ( n3 - n2 );

		n1 += scaled_cosine( zf ) * ( n2 - n1 );

		r += n1 * ampl;
		ampl *= perlin_amp_falloff;
		xi <<= 1;
		xf *= 2;
		yi <<= 1;
		yf *= 2;
		zi <<= 1;
		zf *= 2;

		if ( xf >= 1.0 ) {

			xi ++;
			xf --;

		}
		if ( yf >= 1.0 ) {

			yi ++;
			yf --;

		}
		if ( zf >= 1.0 ) {

			zi ++;
			zf --;

		}

	}
	return r;

};
