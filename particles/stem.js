class Stem extends PlantParticle {

	constructor( options ) {

		super( options );
		this.type = 'Plant';
		this.color = [ 25, 100, 25 ];
		this.flowerParts = [];

	}

	update() {

		if ( this.decay ) super.update();
		super.display();

	}

	stemUpdate() {

		this.transfer( this.previous );

		if ( ! this.next && random() > 0.98 &&
       this.nutrient.p > this.flowRate &&
       this.nutrient.k > this.flowRate &&
       this.nutrient.n > this.flowRate ) {

			this.next = [];
			let firstRandom;
			let split = ( random() > 0.92 ) ? 2 : 1;
			for ( let i = 0; i < split; i ++ ) {

				this.nutrient.p -= this.flowRate;
				this.nutrient.k -= this.flowRate;
				this.nutrient.n -= this.flowRate;

				let rX = ( firstRandom ) ? firstRandom * - 1 : ( Math.sign( random( 2 ) - 1 ) );
				if ( split == 1 ) rX = 0;

				const options = {
					offset: this.offset - gridSize.x + rX,
					position: { x: this.position.x + rX, y: this.position.y - 1 },
					previous: this,
					particle: Stem,
					allowedTypes: [ 'Dirt', 'Water' ]
				};

				firstRandom = rX;
				const s = super.grow( options );
				if ( s ) this.next.push( s );

			}

		} else if ( this.next ) {

			this.next.map( next=>{

				next.stemUpdate();
				this.transfer( next );

			} );

		}

	}

	flowerUpdate() {

		if ( this.next && this.next.length > 0 ) {

			this.next.map( next =>{

				next.flowerUpdate();
				this.transfer( next );

			} );
			return;

		}

		if ( random() > 0.95 &&
       this.nutrient.p > this.flowRate &&
       this.nutrient.k > this.flowRate &&
       this.nutrient.n > this.flowRate ) {

			this.nutrient.p -= this.flowRate;
			this.nutrient.k -= this.flowRate;
			this.nutrient.n -= this.flowRate;

			let p1, p2, p3, p4;
			const x = this.position.x, y = this.position.y;

			if ( y - 1 >= 0 ) p1 = ( ( ( y - 1 ) * gridSize.x ) + x );
			if ( y + 1 >= 0 ) p2 = ( ( ( y + 1 ) * gridSize.x ) + x );
			if ( x + 1 < gridSize.y ) p3 = ( ( y * gridSize.x ) + x + 1 );
			if ( x - 1 >= 0 ) p4 = ( ( y * gridSize.x ) + x - 1 );

			const options = {
				offset: undefined,
				position: undefined
			};

			if ( ! grid[ p1 ] || grid[ p1 ].type == 'Water' || grid[ p1 ].type == 'Dirt' ) {

				options.offset = p1;
				options.position = { x: x, y: y - 1 };

			} else if ( ! grid[ p2 ] || grid[ p2 ].type == 'Water' || grid[ p2 ].type == 'Dirt' ) {

				options.offset = p2;
				options.position = { x: x, y: y + 1 };

			} else if ( ! grid[ p3 ] || grid[ p3 ].type == 'Water' || grid[ p3 ].type == 'Dirt' ) {

				options.offset = p3;
				options.position = { x: x + 1, y: y };

			} else if ( ! grid[ p4 ] || grid[ p4 ].type == 'Water' || grid[ p4 ].type == 'Dirt' ) {

				options.offset = p4;
				options.position = { x: x - 1, y: y };

			}

			if ( options.offset ) {

				options.previous = this;
				options.particle = Flower;


				const s = super.grow( options );
				this.flowerParts.push( s );

			}



		}

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

}

this.Stem = Stem;
