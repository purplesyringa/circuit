# circuit

This is an old attempt at simulating circuits in real-time. There are buttons, LEDs, simple logic gates, and wires. Any logic gate designed from these elements can be isolated into a component. This can be used to implement a flip-flop and thus a register, or to get an ALU working. Unfortunately, this implementation simulates signal propagation thorugh each wire and logic gate once per tick in JavaScript, making it slow for anything significantly harder.
