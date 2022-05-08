class Root extends PlantParticle {

	constructor( options ) {

		super( options );
		this.type = 'Root';
		this.color = [ 232, 220, 191 ];

	}

	update() {

		if ( this.decay ) super.update();
		super.display();

	}

	rootUpdate() {

		this.getNutrient();

		if ( ! this.next && random() > 0.994 &&
       this.nutrient.p > this.flowRate &&
       this.nutrient.k > this.flowRate &&
       this.nutrient.n > this.flowRate ) {

			this.next = [];
			let firstRandom;
			const split = ( random() > 0.89 ) ? 2 : 1;
			for ( let i = 0; i < split; i ++ ) {

				this.nutrient.p -= this.flowRate;
				this.nutrient.k -= this.flowRate;
				this.nutrient.n -= this.flowRate;

				let rX = ( firstRandom ) ? firstRandom * - 1 : ( Math.sign( random( 2 ) - 1 ) );
				if ( split == 1 ) rX = 0;

				const options = {
					offset: this.offset + gridSize.x + rX,
					position: {
						x: this.position.x + rX,
						y: this.position.y + 1
					},
					previous: this,
					particle: Root,
					allowedTypes: [ 'Dirt' ]
				};

				firstRandom = rX;
				const s = super.grow( options );
				if ( s ) this.next.push( s );

			}

		} else if ( this.next ) {

			this.next.map( root=>{

				root.rootUpdate();
				this.transfer( root );

			} );

		}

		this.transfer( this.previous );

	}




	getNutrient() {

		const pArray = [ 0, 0, 0, 0 ];
		const x = this.position.x, y = this.position.y;
		const n = {
			p: 0,
			k: 0,
			n: 0
		};

		if ( y - 1 >= 0 ) pArray[ 0 ] = ( ( ( y - 1 ) * gridSize.x ) + x );
		if ( x + 1 < gridSize.x ) pArray[ 1 ] = ( ( y * gridSize.x ) + x + 1 );
		if ( y + 1 < gridSize.y ) pArray[ 2 ] = ( ( ( y + 1 ) * gridSize.x ) + x );
		if ( x - 1 >= 0 ) pArray[ 3 ] = ( ( y * gridSize.x ) + x - 1 );


		for ( let i = 0; i < pArray.length; i ++ ) {

			let a = pArray[ i ];

			if ( grid[ a ] && grid[ a ].type == 'Dirt' ) {

				if ( grid[ a ].nutrient.p > 0 ) {

					n.p += this.absorptionRate;
					grid[ a ].nutrient.p -= this.absorptionRate;

				}
				if ( grid[ a ].nutrient.k > 0 ) {

					n.k += this.absorptionRate;
					grid[ a ].nutrient.k -= this.absorptionRate;

				}
				if ( grid[ a ].nutrient.n > 0 ) {

					n.n += this.absorptionRate;
					grid[ a ].nutrient.n -= this.absorptionRate;

				}

			}

		}

		this.nutrient.p += n.p;
		this.nutrient.k += n.k;
		this.nutrient.n += n.n;

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

this.Root = Root;
