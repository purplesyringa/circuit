const REM = 16;


const field = new Field(
	document.getElementById("root"),
	document.getElementById("error")
);

const f = () => {
	field.tick();
	setTimeout(f, 50);
};
f();