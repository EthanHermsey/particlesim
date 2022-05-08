class Stone extends Particle {

	constructor( options ) {

		super( options );
		this.type = 'Fixed';
		this.color = [ 125, 125, 125 ];
		this.colorOffset = Math.floor( ( Math.random() * 2 - 1 ) * 50 );

	}

	update() {

		super.display();
		pixels[ this.offset * 4 + 0 ] += this.colorOffset;
		pixels[ this.offset * 4 + 1 ] += this.colorOffset;
		pixels[ this.offset * 4 + 2 ] += this.colorOffset;

	}

}

this.Stone = Stone;
