var number = require('./providers/number');


var array_of = function(times, generator) {
	var result = [];

	for (var i = 0; i < times; ++i) {
		result.push(generator());
	}

	return result;
};

var random_element = function(array) {
	var index = this.integer(0, array.length - 1);
	return array[index];
};

var random_key = function(object) {
	var keys = Object.keys(object);
	return this.random_element(keys);
};

var random_value = function(object) {
	return object[this.random_key(object)];
};

var random_string = function({min_length=0, max_length=1, extras = [], exclude_digits=false, exclude_letters=false}) {
	var casual = this;
	if (!(extras instanceof Array)){
		throw new TypeError('Argument "extras" is not an Array');
	}
	if (!(Number.isInteger(min_length) && min_length >= 0)){
		throw new TypeError('Argument "min" is not an Integer');
	}
	if (!(Number.isInteger(max_length) && max_length >= 0)){
		throw new TypeError('Argument "max" is not an Integer');
	}
	if (!(typeof exclude_digits == "boolean")) {
		throw new TypeError('Argument "exclude_digits" is not an true/false');
	}
	if (!(typeof exclude_letters == "boolean")) {
		throw new TypeError('Argument "exclude_letters" is not true/false');
	}

	_length = casual.integer(from = min_length, to = max_length)
	return this.randify({format: "#".repeat(_length), extras: extras, exclude_digits: exclude_digits, exclude_letters: exclude_letters}) 
};

var register_provider = function(provider) {
	for (var i in provider) {
		this.define(i, provider[i]);
	}
};

var extend = function(a, b) {
	for (var i in b) {
		a[i] = b[i];
	}

	return a;
};

var define = function(name, generator) {
	if (typeof generator != 'function') {
		this[name] = generator;
		return;
	}

	if (generator.length) {
		this[name] = generator.bind(this);
	} else {
		Object.defineProperty(this, name, { 
			get: generator,
			configurable: true
		});
	}

	this['_' + name] = generator.bind(this);
};

var numerify = function(format) {
	return format.replace(/#/g, this._digit);
};

var letterify = function(format) {
	return format.replace(/X/g, this._letter);
};

var randify = function({format="##-##-##", extras = [], exclude_digits=false, exclude_letters=false}) {	
	var casual = this;
	if (!(extras instanceof Array)){
		throw new TypeError('Argument "extras" is not an Array');
	} if (!extras.every(function (e) { return e.toString().length == 1;})){
		throw new TypeError('Argument "extras" is not an Array containing only chars. ie; strings with length 1');
	}

	_bucket = []
	if (extras.length) {
		_bucket.push(function() {return casual.random_element(extras)})
	}
	if (!(exclude_digits)) {
		_bucket.push(casual._digit)
	}
	if (!(exclude_letters)) {
		_bucket.push(casual._letter)
	}
	
	if (!(_bucket.length)){
		return false
	}

	return format.replace(/#/g, function() {
		return casual.random_element(_bucket)();
	});
};

var join = function() {
	var tokens = Array.prototype.slice.apply(arguments);
	return tokens.filter(Boolean).join(' ');
};

var populate = function(format) {
	var casual = this;
	return format.replace(/\{\{(.+?)\}\}/g, function(match, generator) {
		return casual['_' + generator]();
	});
};

var populate_one_of = function(formats) {
	return this.populate(this.random_element(formats));
};

module.exports = {
	array_of: array_of,
	random_element: random_element,
	random_value: random_value,
	random_key: random_key,
	register_provider: register_provider,
	extend: extend,
	define: define,
	numerify: numerify,
	letterify:letterify,
	join: join,
	populate: populate,
	populate_one_of: populate_one_of,
	randify: randify,
	random_string: random_string
};
