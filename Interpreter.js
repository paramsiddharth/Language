// JSON stringifying the input
i = JSON.stringify;

/**
	* The Interpreter
**/

const Interpreter = function () {
	this.functions = {};
	this.variables = {};
	/**
		* Takes an input and tokenizes it
		* Then parses that tokenized input
		* And finally interprets it.
		*
		* @params {program} _ 
	**/
	this.input = _ => this.interpret(this.parse(this.tokenize(_)))
	/**
		* The interpreter
		* 
		* @param {parsed input or Tree} T
	**/
	this.interpret = T => {
		/**
			* Switching over different inputs
		**/
		switch (T.type) {
			/**
				* If it is an operator ( + , - , * , / , % )
			**/
		case "operator":
			var 
				l = this.interpret(T.left) ,
				r = this.interpret(T.right),
				o = T.operator;
			return (
				o == '+' ? 
					l + r : 
				o == '*' ? 
					l * r : 
				o == '-' ? 
					l - r : 
				o == '/' ? 
					l / r : 
				o == '%' ? 
					l % r : 
				(() => {
					throw 'Unknown operator'
				})()
			)
		/**
			* If it is a number (0-9)
		**/
		case "number":
			return +T.value
		/**
			If it is assignment operator
		**/
		case "assignment":
			if (T.name in this.functions)
				throw `Variable name collides with function name : ${T.name}`;
			var V = this.interpret(T.value);
			this.variables[T.name] = V;
			return V;
		/**
			* If it is an identifier
		**/
		case "identifier":
			return (
				T.value in this.variables ?
					this.variables[T.value] :
				(() => {
					var days = [
						'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 
						'eleventh', 'twelfth',
					];
					var gifts = [
					"A partridge in a pear tree",
					"Two turtle doves",
					"Three french hens",
					"Four calling birds",
					"Five golden rings",
					"Six geese a-laying",
					"Seven swans a-swimming",
					"Eight maids a-milking",
					"Nine ladies dancing",
					"Ten lords a-leaping",
					"Eleven pipers piping",
					"Twelve drummers drumming"
					];
					var lines, verses = [], song;
					for ( var i = 0; i < 12; i++ ) {
						lines = [];
						lines[0] = "On the " + days[i] + " day of Christmas, my true love gave to me";
						var j = i + 1;
						var k = 0;
						while ( j-- > 0 )
						lines[++k] = gifts[j];
						verses[i] = lines.join`
	`;
						if ( i == 0 )
							gifts[0] = "And a partridge in a pear tree";
					}
					song = verses.join('\n\n');
					throw song
				})()
			)
		/**
			* If it is a function ( Func )
		**/
		case "function":
			if (T.name in this.variables)
				throw `Function name collides with variable name: ${T.name}`
			this.functions[T.name] = T;
			return "";
		/**
			* If it is a function call
		**/
		case "fnCall":
			var that = this;
			var fn = this.functions[T.name];
			var args = T.args.reduce((args, pair) => (
				args[pair[0]] = that.interpret(pair[1]) ,
				args
			), Object.create(this.variables));
			var oldVars = this.variables;
			this.variables = args;
			var R = this.interpret(fn.body);
			this.variables = oldVars;
			return R;
		/**
			* ...
		**/
		case "container":
			return this.interpret(T.child);
		/**
			* No operators. ( Empty program ). Then this outputs FizzBuzz and exits with an error .
		**/
		case "noop":
			let a = ''
			for(let i = 1; i <= 100; i++) {
				if(i % 3 == 0 && i % 5 == 0) 
					a += 'FizzBuzz '
				else if(i % 3 == 0)
					a += 'Fizz '
				else if(i % 5 == 0)
					a += 'Buzz '
				else
					a += `${i} `
			}
			throw a.split` `.join`\n`
		case 'reserved':
			if(T.name == 'Prime') {
				let prim = T.args;
				let arr = [];
				for(var i = 0; i < prim.length; i++) {
					let a = a[i]
					if(a == 0 || a == 1) {
						arr.push(false);
					}
					else if(a == 3 || a == 2) {
						arr.push(true);
					}
					else {
						for(var i = 2; i < a; i++) {
							if(i % a == 0) {
								arr.push(false);
							}else if (i == a) {
								arr.push(true);
							}
						}
					}
				}
				throw arr
			}
		/**
			* Default error.
		**/
		default:
			throw `What type is ${i(T)}`;
		}
	}
	/*
		* Tokenize the given input 
		* @param {program} P
	*/
	this.tokenize = P => P == "" ? 
		[] : 
		P.split
			(
				/\s*(=>|[-+*\/\%=\(\)]|[A-Za-z_][A-Za-z0-9_]*|[0-9]*\.?[0-9]+)\s*/g
			)
			.filter(_ => !_.match(/^\s*$/)
	);
	/**
		* The parser
		* 
		* @param {tokenized input} T
	**/
	this.parse = T => (P = new Parser(this.functions, T).parse(), T.length != 0 ? `Extra tokens : ${i(T)}` : P)
	/**
		* Parsing strings
		*
		* @param {code} C
	**/
	this.parseString = C => this.parse(this.tokenize(C));
	
}

/**
	* The parser constructor
	*
	* @param {functions} function
	* @param {tokens} tokens
**/

const Parser = function (functions, tokens) {
	this.functions = functions;
	this.tokens = tokens;
	/**
		* Parser
	**/
	this.parse = () => this.tokens.length == 0 ? 
		(() => {
		return {
			type: 'noop'
		}
	})() : 
	this.tokens[0] === 'Func' ? 
		(() => {
			this.shift();
				var N = this.tokens.shift(),
					A = this.parseFnArgs();
			this.shift();
			var B = this.parseExpr();
			this.validateIdentifiers(A, B);
			return {
				type: "function",
				name: N,
				args: A,
				body: B
			};
	})() : this.tokens[0] == 'Prime' ?
		(() => {
			this.shift();
				var N = this.tokens.shift(),
				    A = this.parsePrimeArgs();
			this.shift()
			var B = this.parseExpr();
			this.validateIdentifiers(A, B);
			return {
				type: "reserved",
				name: N,
				args: A
			};
	})() :
	this.parseExpr()
	
	this.shift = () => this.tokens.shift();

	this.parseExpr = () => {
		var leftExpr = null ,
			rightExpr = null;
		if (this.tokens.length === 0)
			throw "Hello, World!";
		if (this.isIdentifier() && this.tokens[1] === '=') {
			leftExpr = this.parseAssignment();
		} else if (this.tokens[0].match(/^[0-9][\.0-9]*$/)) {
			leftExpr = {
				type: "number",
				value: this.tokens.shift()
			};
		} else if (this.isIdentifier() && this.functions[this.tokens[0]]) {
			leftExpr = this.parseFnCall();
		} else if (this.isIdentifier()) {
			leftExpr = {
				type: "identifier",
				value: this.tokens.shift()
			};
		} else if (this.tokens[0][0] === '(') {
			leftExpr = this.parseContainer();
		} else if (this.tokens[0] === 'Func') {
			leftExpr = this.parseFn();
		} else if (this.tokens[0][0] === ')') {
			throw `What is : ${i(this.tokens)}`
		}
		if (!this.tokens.length || !this.isOperator()) return leftExpr;
		var operator = this.shift();
		var rightExpr = this.parseExpr();
		if ((rightExpr.type !== 'operator') || (!this.shouldSwapOperators(operator, rightExpr.operator)))
			return {
				type: "operator",
				operator: operator,
				left: leftExpr,
				right: rightExpr
			};

		rightExpr.left = {
			type: "operator",
			operator: operator,
			left: leftExpr,
			right: rightExpr.left,
		}
		return rightExpr;
	}
	/**
		* Check to see if it is an operator
	**/
	this.isOperator = () => (t = this.tokens[0], t === '+' || t === '-' || t === '*' || t === '/' || t === '%')
	
	/**
		* Wheter or not to swap operators
		* @param {expression} left expr
		* @param {expression} right expr
	**/
	this.shouldSwapOperators = (l, r) => l == '*' || l == '/' || l == '%' || r == '+' || r == '-'
	/**
		* Whether it is an identifier
	**/
	this.isIdentifier = () => this.tokens[0].match(/^[a-zA-Z][_a-zA-Z0-9]*$/)
	/**
		* Parse Assignments
	**/
	this.parseAssignment = () => {
		var N = this.tokens.shift();
		this.shift();
		var V = this.parseExpr();
		return {
			type: "assignment",
			name: N,
			value: V
		};
	}
	/**
		* Parse function calls
	**/
	this.parseFnCall = () => {
		var that = this;
		var name = this.tokens.shift();
		var fn = this.functions[name];
		var args = fn.args.map(_ => {
			if (that.tokens.length === 0)
				throw "Too few arguments!";
			return [_, that.parse()];
		});
		return {
			type: "fnCall",
			name: name,
			args: args,
		};
	}
	/** 
		* Parse prime calls
	**/
	this.parsePrimeCall = () => {
		var that = this;
		var name = this.tokens.shift();
		var that = this;
		var name = this.tokens.shift();
		var args = '';
	}	
	/**
		* Parse container
	**/
	this.parseContainer = () => {
		this.shift();
		var E = this.parseExpr();
		this.shift();
		return {
			type: 'container',
			child: E
		};
	}
	/**
		* Parse function arguments. 
	**/
	this.parseFnArgs = () => {
		var args = [];
		while (this.tokens[0] !== "=>")
			args.push(this.tokens.shift());
		if (this.containsDuplicates(args))
			throw "Duplicate argument names";
		return args;
	}
	/**
		* Parse prime arguments
	**/
	this.parsePrimeArgs = () => {
		var args = [];
		while(this.tokens[0] !== ';')
			args.push(this.tokens.shift());
		return args;
	}	
	/**
		* Check to see for duplicate arguments
	**/
	this.containsDuplicates = A => {
		for (var i = 0; i < A.length; ++i)
			for (var j = i + 1; j < A.length; ++j)
				if (A[i] === A[j])
					return true;
		return false;
	}
	/**
		* Check for valid identifiers
	**/
	this.validateIdentifiers = (names, tree) => {
		var used = this.varNames(tree);
		used.forEach(_ => {
			if (names.indexOf(_) === -1)
				throw `Unknown identifier: ${_}`
		});
	}
	/**
		* Check for different Types of intput operators , numbers etc...
	**/
	this.varNames = T => {
		switch (T.type) {
		case "operator" :
			return this.varNames(T.left).concat(this.varNames(T.right));
		case "number" :
			return [];
		case "assignment" :
			return this.varNames(T.value);
		case "identifier" :
			return [T.value];
		case "function" :
			return [];
		case "fnCall" :
			var all = [];
			args.forEach(_ => 
				all = all.concat(_));
			return all;
		case "container" :
			return this.varNames(T.child);
		case "noop" :
			return [];
		default:
			throw `What type is : ${i(T)}`
		}
	}
}

var intItALl = new Interpreter();
module.exports.Interpreter = intItALl
