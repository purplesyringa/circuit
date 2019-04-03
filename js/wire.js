class Wire {
	constructor(field, x1, y1, e) {
		this.field = field;
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x1;
		this.y2 = y1;
		this.value = null;
		this.source = null;
		this.status = null;

		this.node = document.createElement("div");
		this.node.className = "wire";

		const addEdge = id => {
			const edge = document.createElement("div");
			edge.className = "edge edge" + id;
			edge.onmousedown = e => {
				const startX = e.clientX;
				const startY = e.clientY;
				const oldX = this["x" + id];
				const oldY = this["y" + id];

				document.onmousemove = e => {
					const x = Math.round((e.clientX - startX + oldX * REM) / REM);
					const y = Math.round((e.clientY - startY + oldY * REM) / REM);
					this["x" + id] = x;
					this["y" + id] = y;
					this.render();
				};
				document.onmouseup = e => {
					document.onmousemove = null;
					document.onmouseup = null;
				};
			};
			this.node.appendChild(edge);
			return edge;
		};
		addEdge(1);
		const edge = addEdge(2);
		if(e) {
			edge.onmousedown(e);
		}

		this.node.onclick = e => {
			this.onClick();
			e.stopPropagation();
		};
	}

	tick() {
		const v1 = this.field.getVertex(this.x1, this.y1);
		const v2 = this.field.getVertex(this.x2, this.y2);

		this.value = null;
		if(v1 === v2) {
			return;
		}

		if(this.source === v1) {
			if(v1.isSource) {
				this.source = v1;
				v2.set(v1.value);
				this.value = v1.value;
			} else {
				this.source = null;
				return;
			}
		} else if(this.source === v2) {
			if(v2.isSource) {
				this.source = v2;
				v1.set(v2.value);
				this.value = v2.value;
			} else {
				this.source = null;
				return;
			}
		} else if(this.source !== null) {
			this.source = null;
			return;
		}

		if(this.source === null) {
			if(v1.isSource) {
				this.source = v1;
				v2.set(v1.value);
				this.value = v1.value;
			} else if(v2.isSource) {
				this.source = v2;
				v1.set(v2.value);
				this.value = v2.value;
			}
		}
	}

	render() {
		this.node.classList.add("wire");
		this.node.style.left = this.x1 + "rem";
		this.node.style.top = this.y1 + "rem";

		const angle = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
		const dist = Math.sqrt((this.x2 - this.x1) ** 2 + (this.y2 - this.y1) ** 2);
		this.node.style.transform = `rotate(${angle / Math.PI * 180}deg)`;
		this.node.style.width = `${dist}rem`;

		this.node.classList.remove("value0");
		this.node.classList.remove("value1");
		if(this.value !== null) {
			this.node.classList.add(`value${this.value}`);
		}

		return this.node;
	}

	remove() {
		this.node.parentNode.removeChild(this.node);
	}


	onClick() {
		this.field.selectComponent(this);
	}

	setStatus(status) {
		this.status = status;
	}


	serialize() {
		return {
			type: "wire",
			x1: this.x1,
			y1: this.y1,
			x2: this.x2,
			y2: this.y2
		};
	}
	static deserialize(field, {x1, y1, x2, y2}) {
		const wire = new Wire(field, x1, y1);
		wire.x2 = x2;
		wire.y2 = y2;
		return wire;
	}
};