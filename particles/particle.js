class Particle {

	constructor( options ) {

		this.offset = options.offset;
		this.position = options.position;
		this.colorOffset = Math.floor( noise( frameCount * 0.1 ) * 100 );

	}

	update() {

		const newPos = this.findNewPosition(
			this.position.x,
			this.position.y
		);

		if ( newPos ) {

			this.replaceCurrentPosition( newPos );
			this.moveToNewPosition( newPos );

		}

		this.display();

	}

	replaceCurrentPosition( ) {

		grid[ this.offset ] = 0;
		pixels[ this.offset * 4 + 0 ] = 0;
		pixels[ this.offset * 4 + 1 ] = 0;
		pixels[ this.offset * 4 + 2 ] = 0;

	}

	moveToNewPosition( newPos ) {

		this.position.x = newPos.x;
		this.position.y = newPos.y;
		this.offset = newPos.offset;
		grid[ this.offset ] = this;

	}

	display() {

		pixels[ this.offset * 4 + 0 ] = this.color[ 0 ];
		pixels[ this.offset * 4 + 1 ] = this.color[ 1 ];
		pixels[ this.offset * 4 + 2 ] = this.color[ 2 ];
		pixels[ this.offset * 4 + 3 ] = 255;

	}

	remove() {

		this.replaceCurrentPosition();
		particles.splice( particles.indexOf( this ), 1 );

	}

}

this.Particle = Particle;
