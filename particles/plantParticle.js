class PlantParticle extends Particle {

	constructor( options ) {

		super( options );
		this.connected = true;
		this.flowRate = 0.1;
		this.absorptionRate = 0.01;
		this.decay = false;
		this.previous = options.previous;
		this.next = undefined;
		this.nutrient = options.nutrient || {
			p: 0,
			k: 0,
			n: 0
		};

	}

	transfer( particle ) {

		const p = {
			p: particle.nutrient.p - this.nutrient.p,
			k: particle.nutrient.k - this.nutrient.k,
			n: particle.nutrient.n - this.nutrient.n
		};

		p.p = Math.max( - this.flowRate, Math.min( this.flowRate, p.p ) );
		p.k = Math.max( - this.flowRate, Math.min( this.flowRate, p.k ) );
		p.n = Math.max( - this.flowRate, Math.min( this.flowRate, p.n ) );

		this.nutrient.p += p.p;
		this.nutrient.k += p.k;
		this.nutrient.n += p.n;

		particle.nutrient.p -= p.p;
		particle.nutrient.k -= p.k;
		particle.nutrient.n -= p.n;

	}

	grow( options ) {

		if ( options.position.y >= gridSize.y ) return;

		//direction
		if ( random() > 0.75 ) {

			const dir = Math.sign( random( 2 ) - 1 );
			if ( options.position.x + dir < gridSize.x && options.position.x + dir >= 0 ) {

				options.position.x += dir;
				options.offset += dir;

			}

		}

		if ( options.allowedTypes && grid[ options.offset ] &&
         options.allowedTypes.indexOf( grid[ options.offset ].type ) == - 1 ) {

			return;

		}

		if ( grid[ options.offset ] && grid[ options.offset ].nutrient ) {

			options.nutrient = grid[ options.offset ].nutrient;

		}

		const newParticle = new options.particle( options );
		newParticle.display();

		if ( grid[ options.offset ] ) {

			if ( grid[ options.offset ].type == 'Water' ) {

				grid[ options.offset ].moveUp();

			} else {

				grid[ options.offset ].remove();

			}

		}

		grid[ options.offset ] = newParticle;
		particles.push( newParticle );

		return newParticle;

	}

	integrity() {

		//check if the last and next positions are flowable
		//connected
		//decay
	}

	decayUpdate() {

		let updated = false;
		if ( this.next && this.next.length > 0 ) {

			this.next.map( next =>{

				if ( ! next.decay ) {

					next.decayUpdate();
					updated = true;

				}


			} );

		}

		if ( ! updated ) {

			this.decay = true;

			if ( this.flowerParts ) {

				this.flowerParts.map( flower =>{

					flower.decay = true;

				} );

			}


		}

	}

	transform() {


		if ( this.next ) {

			this.next.map( next =>{

				next.transform();

			} );

			this.next = undefined;

		}



		if ( this.flowerParts ) {

			this.flowerParts.map( flower =>{

				flower.transform();

			} );

			this.flowerParts = undefined;

		}



		let p = Dirt;
		if ( this.type == 'Flower' && random() > 0.5 ) p = Seed;

		let keepNutrient = this.nutrient;

		const options = {
			offset: this.offset,
			position: {
				x: this.position.x,
				y: this.position.y
			},
			particle: p,
		};

		const transformer = ()=>{

			this.remove();
			const newParticle = new p( options );

			if ( newParticle.type != 'Seed' ) {

				keepNutrient.p += this.flowRate * 2 + 1;
				keepNutrient.k += this.flowRate * 2 + 1;
				keepNutrient.n += this.flowRate * 2 + 1;

			}

			newParticle.nutrient = keepNutrient;
			grid[ options.offset ] = newParticle;
			particles.push( newParticle );

		};

		if ( this.type == 'Root' ) {

			setTimeout( transformer, random( 200, 600 ) );

		} else {

			transformer();

		}

	}

}

this.PlantParticle = PlantParticle;
