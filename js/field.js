class Field {
	constructor(node, errorNode) {
		this.vertexes = [];
		this.components = [];
		this.node = node;
		this.errorNode = errorNode;
		this.selectedComponent = null;

		if(this.node) {
			this.mode = "move";
			document.onkeydown = e => {
				if(e.key == " ") {
					this.mode = "move";
				} else if(e.key == "w") {
					this.mode = "wire";
				} else if(CIRCUITS[e.key]) {
					this.mode = e.key;
				} else if(e.key == "Escape") {
					this.selectComponent(null);
				} else if(e.key == "Delete") {
					if(this.selectedComponent !== null) {
						this.removeComponent(this.selectedComponent);
						this.selectedComponent = null;
					}
				} else if(e.key == ".") {
					this.save();
				} else if(e.key == ",") {
					this.load();
				}
			};
			this.node.onmousedown = e => {
				if(this.mode == "wire") {
					const x = Math.round(e.clientX / REM);
					const y = Math.round(e.clientY / REM);
					this.putCircuit(x, y, "wire", e);
					this.tick();
				}
			};
			this.node.onclick = e => {
				const x = Math.round(e.clientX / REM);
				const y = Math.round(e.clientY / REM);
				if(this.mode != "wire" && CIRCUITS[this.mode]) {
					this.putCircuit(x, y, this.mode);
					this.tick();
				}
			};
		}
	}

	putCircuit(x, y, name, e) {
		const Circuit = CIRCUITS[name];
		this.components.push(new Circuit(this, x, y, e));
	}

	getVertex(x, y) {
		const vertex = this.vertexes.find(v => {
			return v.x === x && v.y === y;
		});
		if(vertex) {
			return vertex;
		}

		const newVertex = new Vertex(x, y);
		this.vertexes.push(newVertex);
		return newVertex;
	}

	addComponent(component) {
		this.components.push(component);
	}

	tick() {
		// Reset vertex values
		for(const vertex of this.vertexes) {
			vertex.valueSet = false;
			vertex.setStatus(null);
		}

		// For each component
		for(const component of this.components) {
			if(component instanceof Component) {
				let ready = true;
				for(const input of Object.values(component.inputs)) {
					if(!input.vertex.isSource) {
						// Value wasn't set yet, not ready
						ready = false;
						break;
					}
				}

				ready = ready || component.inputNotRequired;

				component.isReady = ready;

				if(ready) {
					component.tick();
				}
			} else if(component instanceof Wire) {
				component.tick();
			}
		}

		// Update vertex inputs/outputs
		for(const vertex of this.vertexes) {
			if(!vertex.valueSet) {
				vertex.isSource = false;
			}
		}

		// Render
		if(this.node) {
			for(const component of this.components) {
				this.node.appendChild(component.render());
			}
		}

		// Check statuses
		if(this.errorNode) {
			this.errorNode.innerHTML = "";
			for(const vertex of this.vertexes) {
				if(vertex.status !== null) {
					this.errorNode.innerHTML += vertex.status + "<br>";
				}
			}
			for(const component of this.components) {
				if(component.status !== null) {
					this.errorNode.innerHTML += component.status + "<br>";
				}
			}
		}
	}


	selectComponent(component) {
		if(this.selectedComponent !== null) {
			this.selectedComponent.node.classList.remove("component-selected");
		}

		this.selectedComponent = component;
		if(component === null) {
			return;
		}

		component.node.classList.add("component-selected");
	}

	removeComponent(component) {
		component.remove();
		this.components = this.components.filter(c => c !== component);
	}


	save() {
		const name = prompt("[save] name?");
		if(name === null) {
			return;
		}

		let components = [];
		for(const component of this.components) {
			components.push(component.serialize());
		}
		localStorage["circuit-" + name] = JSON.stringify(components);
	}
	load(name) {
		if(!name) {
			name = prompt("[load] name?");
		}
		if(name === null) {
			return null;
		}

		let data = localStorage["circuit-" + name];
		if(!data) {
			alert("no such circuit");
			return null;
		}
		data = JSON.parse(data);

		this.vertexes = [];
		this.components = data.map(d => {
			return CIRCUITS[d.type].deserialize(this, d);
		});
		this.tick();

		return name;
	}


	getInputs() {
		return this.components.filter(component => component instanceof InputCircuit);
	}
	getOutputs() {
		return this.components.filter(component => component instanceof OutputCircuit);
	}
};