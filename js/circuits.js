function ValueCircuit(value) {
	class ValueCircuit extends Component {
		constructor(field, x, y) {
			super(
				field, x, y, 2, 2,
				[],
				[
					{D: [2, 1, "horizontal", 3, 1]}
				],
				value.toString()
			);
		}
		tick() {
			this.set("D", value);
		}
		serialize() {
			return {
				type: value.toString(),
				x: this.x,
				y: this.y
			};
		}
		static deserialize(field, {x, y}) {
			return new ValueCircuit(field, x, y);
		}
	};
	return ValueCircuit;
}

function BinaryCircuit(type, label, op) {
	class BinaryCircuit extends Component {
		constructor(field, x, y) {
			super(
				field, x, y, 3, 3,
				[
					{A: [-1, 1, "horizontal", -1, 1]},
					{B: [-1, 2, "horizontal", -1, 2]}
				],
				[
					{D: [3, 1, "horizontal", 4, 1]}
				],
				label
			);
		}
		tick() {
			this.set("D", op(this.get("A"), this.get("B")));
		}
		serialize() {
			return {
				type,
				x: this.x,
				y: this.y
			};
		}
		static deserialize(field, {type, x, y}) {
			return new CIRCUITS[type](field, x, y);
		}
	};
	return BinaryCircuit;
}

function UnaryCircuit(type, label, op) {
	class UnaryCircuit extends Component {
		constructor(field, x, y) {
			super(
				field, x, y, 2, 2,
				[
					{A: [-1, 1, "horizontal", -1, 1]}
				],
				[
					{B: [2, 1, "horizontal", 3, 1]}
				],
				label
			);
		}
		tick() {
			this.set("B", op(this.get("A")));
		}
		serialize() {
			return {
				type,
				x: this.x,
				y: this.y
			};
		}
		static deserialize(field, {type, x, y}) {
			return new CIRCUITS[type](field, x, y);
		}
	};
	return UnaryCircuit;
}



class SwitchCircuit extends Component {
	constructor(field, x, y) {
		super(
			field, x, y, 2, 2,
			[],
			[
				{D: [2, 1, "horizontal", 3, 1]}
			],
			"[0]"
		);
		this._switchValue = 0;
	}

	onClick() {
		super.onClick();
		this._switchValue = this._switchValue ^ 1;
	}
	render() {
		this.name = this._switchValue ? `
			<span style="color: #0F0">1</span>
		` : `
			<span style="color: #F00">0</span>
		`;
		return super.render();
	}
	tick() {
		this.set("D", this._switchValue);
	}
	serialize() {
		return {
			type: "s",
			x: this.x,
			y: this.y,
			value: this._switchValue
		};
	}
	static deserialize(field, {x, y, value}) {
		const s = new SwitchCircuit(field, x, y);
		s._switchValue = value;
		return s;
	}
};

class ControlSwitchCircuit extends Component {
	constructor(field, x, y) {
		super(
			field, x, y, 2, 2,
			[
				{A: [-1, 1, "horizontal", -1, 1]}
			],
			[
				{B: [2, 1, "horizontal", 3, 1]}
			],
			"&rArr;"
		);
		this._switchValue = 0;
	}

	onClick() {
		super.onClick();
		this._switchValue = this._switchValue ^ 1;
	}
	render() {
		this.name = this._switchValue ? `
			<span style="color: #0F0">&rArr;</span>
		` : `
			<span style="color: #F00">&#8655;</span>
		`;
		return super.render();
	}
	tick() {
		if(this._switchValue) {
			this.set("B", this.get("A"));
		}
	}
	serialize() {
		return {
			type: "S",
			x: this.x,
			y: this.y,
			value: this._switchValue
		};
	}
	static deserialize(field, {x, y, value}) {
		const s = new ControlSwitchCircuit(field, x, y);
		s._switchValue = value;
		return s;
	}
};

class LedCircuit extends Component {
	constructor(field, x, y) {
		super(
			field, x, y, 2, 2,
			[
				{C: [-1, 1, "horizontal", -1, 1]}
			],
			[],
			""
		);
		this.light = false;
	}
	tick() {
		this.light = this.get("C");
	}
	render() {
		this.name = `
			<div style="
				width: 1rem;
				height: 1rem;
				border-radius: 50%;
				display: inline-block;
				border: 2px solid #888;
				background-color: ${this.light ? "#FFF" : "#000"};
			"></div>
		`;
		return super.render();
	}
	serialize() {
		return {
			type: "l",
			x: this.x,
			y: this.y
		};
	}
	static deserialize(field, {x, y}) {
		return new LedCircuit(field, x, y);
	}
};


class InputCircuit extends Component {
	constructor(field, x, y, name) {
		// while, not do..while because name can be passed directly
		// (e.g. when deserializing)
		while(!name) {
			name = prompt("name?");
		}

		super(
			field, x, y, 4, 2,
			[],
			[
				{[name]: [4, 1, "horizontal", 5, 1]}
			],
			""
		);
		this._inputName = name;
		this._inputValue = 0;
	}
	tick() {
		this.name = `
			<span style="color: ${this._inputValue ? "#0F0" : "#F00"}">
				${this._inputName}&#10093;
			</span>
		`;
		this.set(this._inputName, this._inputValue);
	}
	onClick() {
		super.onClick();
		this._inputValue = this._inputValue ^ 1;
	}
	serialize() {
		return {
			type: "i",
			x: this.x,
			y: this.y,
			name: this._inputName,
			value: this._inputValue
		};
	}
	static deserialize(field, {x, y, name, value}) {
		const input = new InputCircuit(field, x, y, name);
		input._inputValue = value;
		return input;
	}
};

class OutputCircuit extends Component {
	constructor(field, x, y, name) {
		// while, not do..while because name can be passed directly
		// (e.g. when deserializing)
		while(!name) {
			name = prompt("name?");
		}

		super(
			field, x, y, 4, 2,
			[
				{[name]: [-1, 1, "horizontal", -1, 1]}
			],
			[],
			`&#10092;${name}`
		);
		this._outputName = name;
	}
	tick() {
		this.name = `
			<span style="color: ${this.get(this._outputName) ? "#0F0" : "#F00"}">
				&#10092;${this._outputName}
			</span>
		`;
	}
	serialize() {
		return {
			type: "I",
			x: this.x,
			y: this.y,
			name: this._outputName
		};
	}
	static deserialize(field, {x, y, name, value}) {
		return new OutputCircuit(field, x, y, name);
	}
};

class PipeCircuit extends Component {
	constructor(field, x, y) {
		super(
			field, x, y, 2, 2,
			[
				{C: [-1, 1, "horizontal", -1, 1]}
			],
			[
				{P: [2, 1, "horizontal", 3, 1]}
			],
			"&rArr;"
		);
		this.inputNotRequired = true;
	}
	tick() {
		this.set("P", this.get("C") || 0);
	}
	serialize() {
		return {
			type: "p",
			x: this.x,
			y: this.y
		};
	}
	static deserialize(field, {x, y}) {
		return new PipeCircuit(field, x, y);
	}
};

class TransistorCircuit extends Component {
	constructor(field, x, y) {
		super(
			field, x, y, 2, 2,
			[
				{D: [-1, 1, "horizontal", -1, 1]},
				{C: [1, 2, "vertical", 1, 3]}
			],
			[
				{D: [2, 1, "horizontal", 3, 1]}
			],
			"&perp;"
		);
		this.inputNotRequired = true;
	}
	tick() {
		if(this.get("C") === 1) {
			this.set("D", this.get("D"));
		}
	}
	serialize() {
		return {
			type: "t",
			x: this.x,
			y: this.y
		};
	}
	static deserialize(field, {x, y}) {
		return new PipeCircuit(field, x, y);
	}
};


class SubCircuit extends Component {
	constructor(field, x, y, name) {
		// Load circuit as field
		const subField = new Field();
		name = subField.load(name);

		let inputs = [];
		let outputs = [];

		if(name !== null) {
			for(const input of subField.getInputs()) {
				const y = inputs.length + 1;
				inputs.push({
					[input._inputName]: [-1, y, "horizontal", -1, y]
				});
			}
			for(const output of subField.getOutputs()) {
				const y = outputs.length + 1;
				outputs.push({
					[output._outputName]: [5, y, "horizontal", 6, y]
				});
			}
		}

		super(
			field, x, y, 5, 1 + Math.max(inputs.length, outputs.length),
			inputs,
			outputs,
			`&#10214;${name}&#10215;`
		);
		this.inputNotRequired = true;
		this.showPinLabels = true;
		this.subField = subField;
		this.circuitName = name;
	}
	tick() {
		for(const input of this.subField.getInputs()) {
			input._inputValue = this.get(input._inputName);
		}
		this.subField.tick();
		for(const output of this.subField.getOutputs()) {
			this.set(output._outputName, output.get(output._outputName));
		}
	}
	serialize() {
		return {
			type: "c",
			x: this.x,
			y: this.y,
			name: this.circuitName
		};
	}
	static deserialize(field, {x, y, name}) {
		return new SubCircuit(field, x, y, name);
	}
};

class UserCircuit extends Component {
	constructor(field, x, y, inputStr, outputStr, code) {
		while(!inputStr) {
			inputStr = prompt("inputs? (comma-separated)");
		}
		while(!outputStr) {
			outputStr = prompt("outputs? (comma-separated)");
		}
		while(!code) {
			code = prompt("code?");
		}

		let inputs = [], outputs = [];
		for(const input of inputStr.split(",")) {
			const y = inputs.length + 1;
			inputs.push({
				[input]: [-1, y, "horizontal", -1, y]
			});
		}
		for(const output of outputStr.split(",")) {
			const y = outputs.length + 1;
			outputs.push({
				[output]: [5, y, "horizontal", 6, y]
			});
		}

		super(
			field, x, y, 5, 1 + Math.max(inputs.length, outputs.length),
			inputs,
			outputs,
			"USR"
		);
		this.inputNotRequired = true;
		this.showPinLabels = true;

		this.inputStr = inputStr;
		this.outputStr = outputStr;
		this.code = code;

		this.tick = (new Function(code)).bind(this);
	}
	serialize() {
		return {
			type: "u",
			x: this.x,
			y: this.y,
			inputStr: this.inputStr,
			outputStr: this.outputStr,
			code: this.code
		};
	}
	static deserialize(field, {x, y, inputStr, outputStr, code}) {
		return new UserCircuit(field, x, y, inputStr, outputStr, code);
	}
};

class RSTriggerCircuit extends Component {
	constructor(field, x, y) {
		super(
			field, x, y, 3, 3,
			[
				{R: [-1, 1, "horizontal", -1, 1]},
				{S: [-1, 2, "horizontal", -1, 2]}
			],
			[
				{Q: [3, 1, "horizontal", 4, 1]},
				{"/Q": [3, 2, "horizontal", 4, 2]}
			],
			"RS"
		);
		this.showPinLabels = true;
		this._value = 0;
	}
	tick() {
		if(this.get("R") && this.get("S")) {
			this.set("Q", 1);
			this.set("/Q", 1);
		} else if(this.get("R")) {
			this.set("Q", 0);
			this.set("/Q", 1);
			this._value = 0;
		} else if(this.get("S")) {
			this.set("Q", 1);
			this.set("/Q", 0);
			this._value = 1;
		} else {
			this.set("Q", this._value);
			this.set("/Q", this._value ^ 1);
		}
	}
	serialize() {
		return {
			type: "r",
			x: this.x,
			y: this.y,
			value: this._value
		};
	}
	static deserialize(field, {x, y, value}) {
		const rs = new RSTriggerCircuit(field, x, y);
		rs._value = value;
		return rs;
	}
};


const CIRCUITS = {
	0: ValueCircuit(0),
	1: ValueCircuit(1),
	a: BinaryCircuit("a", "&amp;", (a, b) => a & b), // AND
	o: BinaryCircuit("o", "&#8741;", (a, b) => a | b), // OR
	x: BinaryCircuit("x", "&oplus;", (a, b) => a ^ b), // XOR
	A: BinaryCircuit("A", "&#x2191;", (a, b) => (a & b) ^ 1), // NAND
	O: BinaryCircuit("O", "&#x2193;", (a, b) => (a | b) ^ 1), // NOR
	X: BinaryCircuit("X", "=", (a, b) => a ^ b ^ 1), // XNOR
	i: BinaryCircuit("i", "&rarr;", (a, b) => (a ^ 1) | b), // implication
	n: UnaryCircuit("n", "&not;", a => a ^ 1), // NOT
	s: SwitchCircuit,
	S: ControlSwitchCircuit,
	l: LedCircuit,
	i: InputCircuit,
	I: OutputCircuit,
	p: PipeCircuit,
	t: TransistorCircuit,
	c: SubCircuit,
	u: UserCircuit,
	r: RSTriggerCircuit,
	wire: Wire
};