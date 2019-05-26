function createPinNode(x, y, direction) {
	const node = document.createElement("div");
	node.className = "pin pin-" + direction;
	node.style.left = x + "rem";
	node.style.top = y + "rem";
	return node;
}

function renderPin(node, vertex, name, direction) {
	node.classList.remove("value0");
	node.classList.remove("value1");
	node.classList.remove("pin-not-ready");
	if(vertex.valueSet) {
		node.classList.add(`value${vertex.value}`);
	} else {
		node.classList.add("pin-not-ready");
	}

	node.innerHTML = `<span class="pin-name pin-name-${direction}">${name}</span>`;
}


class Component {
	constructor(field, x, y, width, height, inputs, outputs, name) {
		this.field = field;
		this.isReady = false;
		this.name = name;
		this.x = x;
		this.y = y;
		this.status = null;

		this.node = document.createElement("div");
		this.node.className = "component";
		this.node.style.width = width + "rem";
		this.node.style.height = height + "rem";

		const label = document.createElement("span");
		label.className = "label";
		this.node.appendChild(label);

		this.node.onmousedown = e => {
			const startX = e.clientX;
			const startY = e.clientY;
			const oldX = this.x;
			const oldY = this.y;
			let isClick = true;

			document.onmousemove = e => {
				const x = Math.round((e.clientX - startX + oldX * REM) / REM);
				const y = Math.round((e.clientY - startY + oldY * REM) / REM);
				if(this.x != x || this.y != y) {
					isClick = false;
				}
				this.x = x;
				this.y = y;
				this.updatePinPositions();
				this.render();
			};
			document.onmouseup = e => {
				document.onmousemove = null;
				document.onmouseup = null;

				if(isClick) {
					this.onClick();
				}
			};
		};

		this.node.onclick = e => {
			e.stopPropagation();
		};




		this.inputs = {};
		for(const pin of inputs) {
			const name = Object.keys(pin)[0];
			const [x1, y1, direction, activeX, activeY] = pin[name];

			const node = createPinNode(x1, y1, direction, activeX, activeY);
			this.inputs[name] = {
				node,
				vertex: field.getVertex(x + activeX, y + activeY),
				x: x1,
				y: y1,
				activeX,
				activeY,
				direction
			};
			this.node.appendChild(node);
		}

		this.outputs = {};
		for(const pin of outputs) {
			const name = Object.keys(pin)[0];
			const [x1, y1, direction, activeX, activeY] = pin[name];

			const node = createPinNode(x1, y1, direction, activeX, activeY);
			this.outputs[name] = {
				node,
				vertex: field.getVertex(x + activeX, y + activeY),
				x: x1,
				y: y1,
				activeX,
				activeY,
				direction
			};
			this.node.appendChild(node);
		}
	}

	updatePinPositions() {
		for(const pin of Object.values(this.inputs)) {
			pin.vertex = field.getVertex(this.x + pin.activeX, this.y + pin.activeY);
		}
		for(const pin of Object.values(this.outputs)) {
			pin.vertex = field.getVertex(this.x + pin.activeX, this.y + pin.activeY);
		}
	}

	tick() {
		throw new Error("Not implemented tick()!");
	}

	render() {
		// Render pins
		for(const name of Object.keys(this.inputs)) {
			const {node, vertex, x, y, activeX, activeY, direction} = this.inputs[name];
			const bidirection = direction === "horizontal" ? (x < activeX ? "right" : "left") : (y < activeY ? "down" : "up");
			renderPin(node, vertex, this.showPinLabels ? name : "", bidirection);
		}
		for(const name of Object.keys(this.outputs)) {
			const {node, vertex, x, y, activeX, activeY, direction} = this.outputs[name];
			const bidirection = direction === "horizontal" ? (x < activeX ? "right" : "left") : (y < activeY ? "down" : "up");
			renderPin(node, vertex, this.showPinLabels ? name : "", bidirection);
		}

		// Render label
		this.node.querySelector(".label").innerHTML = this.name;

		// Render component
		this.node.classList.remove("component-ready");
		this.node.classList.remove("component-not-ready");
		this.node.classList.add(`component-${this.isReady ? "" : "not-"}ready`);
		this.node.style.left = this.x + "rem";
		this.node.style.top = this.y + "rem";
		return this.node;
	}

	remove() {
		this.node.parentNode.removeChild(this.node);
	}


	onClick() {
		this.field.selectComponent(this);
	}


	get(name) {
		if(this.inputs[name].vertex.isSource) {
			return this.inputs[name].vertex.value;
		} else {
			return null;
		}
	}
	set(name, value) {
		if(value !== null) {
			this.outputs[name].vertex.set(value);
		}
	}


	setStatus(status) {
		this.status = status;
	}
};