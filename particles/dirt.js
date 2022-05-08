class Dirt extends Particle {

	constructor( options ) {

		super( options );
		this.type = 'Dirt';
		this.color = [ 149, 113, 95 ];
		this.wet = false;
		this.nutrient = {
			p: random(),
			k: random(),
			n: random()

		};

	}

	findNewPosition( x, y ) {

		let p1, p2, p3;
		if ( y + 1 < gridSize.y ) p1 = ( ( ( y + 1 ) * gridSize.x ) + x );
		if ( y + 1 < gridSize.y && x + 1 < gridSize.x ) p2 = ( ( ( y + 1 ) * gridSize.x ) + x + 1 );
		if ( y + 1 < gridSize.y && x - 1 >= 0 ) p3 = ( ( ( y + 1 ) * gridSize.x ) + x - 1 );

		if ( p1 && ( ! grid[ p1 ] || grid[ p1 ].type == "Water" ) ) {

			return { x: x, y: y + 1, offset: p1 };

		} else if ( p2 && ( ! grid[ p2 ] || grid[ p2 ].type == "Water" ) ) {

			return { x: x + 1, y: y + 1, offset: p2 };

		} else if ( p3 && ( ! grid[ p3 ] || grid[ p3 ].type == "Water" ) ) {

			return { x: x - 1, y: y + 1, offset: p3 };

		}

	}

	replaceCurrentPosition( newPos ) {

		if ( newPos && grid[ newPos.offset ] && grid[ newPos.offset ].type == 'Water' ) {

			grid[ newPos.offset ].position.x = this.position.x;
			grid[ newPos.offset ].position.y = this.position.y;
			grid[ newPos.offset ].offset = this.offset;

			grid[ this.offset ] = grid[ newPos.offset ];
			grid[ this.offset ].display();

			return;

		}

		super.replaceCurrentPosition();

	}

	display() {

		super.display();

		pixels[ this.offset * 4 + 0 ] -= this.colorOffset * 0.5;
		pixels[ this.offset * 4 + 1 ] -= this.colorOffset * 0.5;
		pixels[ this.offset * 4 + 2 ] -= this.colorOffset * 0.5;

		let darkerWet = ( this.wet ) ? 0.65 : 1.0;
		pixels[ this.offset * 4 + 0 ] *= darkerWet;
		pixels[ this.offset * 4 + 1 ] *= darkerWet;
		pixels[ this.offset * 4 + 2 ] *= darkerWet;

	}

}

this.Dirt = Dirt;
