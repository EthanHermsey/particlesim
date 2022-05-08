class Seed extends PlantParticle {

	constructor( options ) {

		super( options );
		this.type = 'Seed';
		this.color = [ 25, 100, 25 ];
		this.state = 0;
		this.count = 0;
		this.growCount = 1;
		this.noGrowCount = 0;
		this.states = [
			{
				type: 'grow',
				duration: Math.floor( random( 40, 70 ) )
			},
			{
				type: 'flower',
				duration: Math.floor( random( 10, 20 ) )
			},
			{
				type: 'decay',
				duration: Math.floor( random( 40, 60 ) )
			},
			{
				type: 'transform'
			}
		];

		this.sprouted = false;
		this.rootParts = [];
		this.stemParts = [];
		this.flowerParts = [];

	}

	update() {

		if ( ! this.sprouted ) {

			super.update();

		} else {

			if ( this.state != 2 && this.counter ) this.counter();
			super.display();

		}

		// this.checkIntegrity();

		switch ( this.state ) {

			case 0:

				this.root();
				this.stem();
				break;

			case 1:

				//eat roots and grow flowers
				this.flower();
				break;

			case 2:

				//breakdown into soilpkn and seeds.
				this.wilk();
				break;

			case 3:

				this.transform();
				// this.remove();
				break;

		}


	}

	counter() {

		if ( ++ this.count > this.states[ this.state ].duration * 60 ) {

			if ( this.states[ this.state ].type != 'decay' ) this.state ++; //not on decay
			this.count = 0;

		}

	}

	checkIntegrity() {

		this.stemParts.map( ( p, i ) =>{

			if ( grid[ p.offset ] != p ) {

				for ( let x = i + 1; x < this.stemParts.length; x ++ ) {

					const o = this.stemParts[ x ].offset;
					if ( grid[ o ] && grid[ o ].type == 'Plant' ) grid[ o ].remove();

				}

				this.stemParts.length = i;
				return;

			}

		} );

	}


	root() {

		//check existing roots every frame
		this.rootParts.map( root => {

			root.rootUpdate();
			this.transfer( root );

		} );


		if ( this.growCount <= 0 || this.rootParts.length > 0 || ! this.isWet() || random() < 0.9998 ) return;

		//place new root
		//grow downwards
		const options = {
			offset: this.offset + gridSize.x,
			position: { x: this.position.x, y: this.position.y + 1 },
			previous: this,
			particle: Root,
			allowedTypes: [ 'Dirt' ]
		};

		let r = this.grow( options );
		if ( r ) {

			this.growCount --;
			this.rootParts.push( r );
			this.sprouted = true;

		}


	}

	stem() {

		//check existing roots every frame
		this.stemParts.map( stem => {

			stem.stemUpdate();
			this.transfer( stem );

		} );


		if ( this.growCount > 0 || this.stemParts.length > 0 || random() < 0.95 ||
         this.nutrient.p < this.flowRate || this.nutrient.k < this.flowRate ||
         this.nutrient.n < this.flowRate ) {

			return;

		}

		this.nutrient.p -= this.flowRate * 0.5;
		this.nutrient.k -= this.flowRate * 0.5;
		this.nutrient.n -= this.flowRate * 0.5;

		//place new stem
		//grow upwards
		const options = {
			offset: this.offset - gridSize.x,
			position: { x: this.position.x, y: this.position.y - 1 },
			previous: this,
			particle: Stem,
			allowedTypes: [ 'Dirt', 'Water' ]
		};

		const grown = this.grow( options );
		if ( grown ) {

			this.growCount ++;
			this.noGrowCount = 0;
			this.stemParts.push( grown );

		} else {

			this.noGrowCount ++;
			if ( this.noGrowCount > 5 ) this.transform();

		}

	}

	flower() {

		//check existing roots every frame
		this.stemParts.map( stem => {

			stem.flowerUpdate();
			this.transfer( stem );

		} );

		//check existing roots every frame
		this.rootParts.map( root => {

			root.getNutrient();
			this.transfer( root );

		} );

	}

	wilk() {

		let decayed = 0;
		//check existing roots every frame
		this.stemParts.map( stem => {

			stem.decayUpdate();
			stem.update();
			if ( stem.decay ) decayed ++;

		} );

		//check existing roots every frame
		this.rootParts.map( root => {

			root.decayUpdate();
			root.update();
			if ( root.decay ) decayed ++;

		} );

		if ( decayed == this.rootParts.length + this.stemParts.length ) {

			this.state ++;
			this.counter = 0;

		}

	}

	transform() {

		//check existing roots every frame
		this.stemParts.map( stem => {

			stem.transform();

		} );

		//check existing roots every frame
		this.rootParts.map( root => {

			root.transform();

		} );

		this.stemParts.length = 0;
		this.rootParts.length = 0;
		super.transform();

	}

	isWet() {

		let p1, p2, p3, p4;
		const x = this.position.x, y = this.position.y;

		if ( y - 1 >= 0 ) p1 = ( ( ( y - 1 ) * gridSize.x ) + x );
		if ( x + 1 < gridSize.x ) p2 = ( ( y * gridSize ) + x + 1 );
		if ( y + 1 < gridSize.y ) p3 = ( ( ( y + 1 ) * gridSize.x ) + x );
		if ( x - 1 >= 0 ) p4 = ( ( y * gridSize.x ) + x - 1 );
		return ( grid[ p1 ] && grid[ p1 ].wet ) || ( grid[ p2 ] && grid[ p2 ].wet ) || ( grid[ p3 ] && grid[ p3 ].wet ) || ( grid[ p4 ] && grid[ p4 ].wet );

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
		pixels[ this.offset * 4 + 0 ] += this.colorOffset;
		pixels[ this.offset * 4 + 1 ] += this.colorOffset;
		pixels[ this.offset * 4 + 2 ] += this.colorOffset;

	}

}

this.Seed = Seed;
