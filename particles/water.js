class Water extends Particle {

	constructor( options ) {

		super( options );
		this.type = 'Water';
		this.color = [ 10, 10, 250 ];
		this.seepRange = random( 15, 25 );

	}

	update() {

		super.update();
		this.seep();

	}

	seep() {

		const maxSeep = Math.min( this.position.y + this.seepRange, gridSize.y );
		let xX = 0;

		for ( let y = this.position.y + 1; y < maxSeep; y ++ ) {

			if ( random() > 0.6 ) xX += Math.sign( random( 2 ) - 1 );
			let offset = ( gridSize.x * y ) + this.position.x + xX;

			if ( grid[ offset ] && grid[ offset ].type == "Dirt" ) {

				if ( ! grid[ offset ].wet ) {

					if ( random() > 0.99 ) {

						grid[ offset ].wet = true;
						// super.remove();

					}
					break;

				}

			} else if ( grid[ offset ] && grid[ offset ].type != "Seed" && grid[ offset ].type != "Plant" ) {

				break;

			}

		}

	}

	findNewPosition( x, y ) {

		let p1, p2, p3, p4, p5;
		if ( y + 1 < gridSize.y ) p1 = ( ( ( y + 1 ) * gridSize.x ) + x );
		if ( y + 1 < gridSize.y && x + 1 < gridSize.x ) p2 = ( ( ( y + 1 ) * gridSize.x ) + x + 1 );
		if ( y + 1 < gridSize.y && x - 1 >= 0 ) p3 = ( ( ( y + 1 ) * gridSize.x ) + x - 1 );
		if ( x + 1 < gridSize.x ) p4 = ( ( y * gridSize.x ) + x + 1 );
		if ( x - 1 >= 0 ) p5 = ( ( y * gridSize.x ) + x - 1 );


		if ( p1 && ! grid[ p1 ] ) {

			return { x: x, y: y + 1, offset: p1 };

		} else if ( p2 && ! grid[ p2 ] ) {

			return { x: x + 1, y: y + 1, offset: p2 };

		} else if ( p3 && ! grid[ p3 ] ) {

			return { x: x - 1, y: y + 1, offset: p3 };

		} else if ( p4 && ! grid[ p4 ] ) {

			return { x: x + 1, y: y, offset: p4 };

		} else if ( p5 && ! grid[ p5 ] ) {

			return { x: x - 1, y: y, offset: p5 };

		}


	}

	display() {

		super.display();
		pixels[ this.offset * 4 + 2 ] -= this.colorOffset;

	}

	moveUp() {

		for ( let y = this.position.y; y >= 0; y -- ) {

			let offset = ( y * gridSize.x ) + this.position.x;
			if ( ! grid[ offset ] ) {

				this.position.y = y;
				this.offset = offset;
				grid[ offset ] = this;
				grid[ offset ].display();
				return;

			}

		}

		super.remove();

	}

}

this.Water = Water;
