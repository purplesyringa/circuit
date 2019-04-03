class Vertex {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.value = null;
		this.valueSet = false;
		this.isSource = false;
		this.status = null;
	}

	set(x) {
		if(this.valueSet) {
			// Value was set by several components, critical bug
			this.setStatus("Several inputs!");
			return;
		}

		this.value = x;
		this.valueSet = true;
		this.isSource = true;
	}

	setStatus(status) {
		this.status = status;
	}
};