var assert = require('assert');
var c = require('./cronpp');
// tests

var t = c.sec([12,17])(new Date(2015, 11, 17, 18, 59, 15));
assert.equal(t.valueOf(), new Date(2015, 11, 17, 18, 59, 17).valueOf());

var t = c.month(1)(new Date(2015, 0, 1, 18, 49, 15));
assert.equal(t.valueOf(), new Date(2015, 1, 1, 0, 0, 0).valueOf());

var t = c.month([4, 8])(new Date(2015, 5, 1, 18, 49, 15));
assert.equal(t.valueOf(), new Date(2015, 8, 1, 0, 0, 0).valueOf());

var t = c.allof(c.month([4, 8]))(new Date(2015, 5, 1, 18, 49, 15));
assert.equal(t.valueOf(), new Date(2015, 8, 1, 0, 0, 0).valueOf());

var t = c.allof(c.min(13))(new Date(2015, 0, 31, 13, 16));
assert.equal(t.valueOf(), new Date(2015, 0, 31, 14, 13).valueOf())

var t = c.allof(c.min(13), c.hour(15))(new Date(2015, 0, 31, 13, 16));
assert.equal(t.valueOf(), new Date(2015, 0, 31, 15, 13).valueOf());

var t = c.allof(c.min(13), c.hour(15), c.day([16, 30]))(new Date(2015, 0, 31, 13, 16));
assert.equal(t.valueOf(), new Date(2015, 1, 16, 15, 13).valueOf());

var t = c.allof(c.min(13), c.hour(15), c.day([16, 30]), c.month(['jan', 'feb', 'mar']))(new Date(2015, 0, 31, 13, 16));
assert.equal(t.valueOf(), new Date(2015, 1, 16, 15, 13).valueOf());

var t = c.allof(c.min(13), c.hour(15), c.day(30), c.month(['jan', 'feb', 'mar']))(new Date(2015, 0, 31, 13, 16));
assert.equal(t.valueOf(), new Date(2015, 2, 30, 15, 13).valueOf());

var t = c.allof(c.min(13), c.hour(15), c.month('aug'), c.dow(['mon', 'tue']))(new Date(2015, 7, 30, 16, 00))
assert.equal(t.valueOf(), new Date(2015, 7, 31, 15, 13).valueOf());

var t = c.min(00)(new Date(2015, 7, 30, 16, 01));
assert.equal(t.valueOf(), new Date(2015, 7, 30, 17, 00).valueOf());

var t = c.hour(15)(new Date(2015, 7, 30, 16, 01));
assert.equal(t.valueOf(), new Date(2015, 7, 31, 15, 00).valueOf());

var t = c.day(31)(new Date(2015, 8, 30, 16, 01));
assert.equal(t.valueOf(), new Date(2015, 9, 31, 0, 0).valueOf());

var t = c.month('feb')(new Date(2015, 8, 30, 16, 01));
assert.equal(t.valueOf(), new Date(2016, 1, 1, 0, 0).valueOf());

var t = c.dow('mon')(new Date(2015, 7, 30, 16, 01));
assert.equal(t.valueOf(), new Date(2015, 7, 31, 0, 0).valueOf());

var t = c.dow('sun')(new Date(2015, 6, 31, 16, 01));
assert.equal(t.valueOf(), new Date(2015, 7, 2, 0, 0).valueOf());

var t = c.dow('sun')(new Date(2015, 7, 31, 16, 01));
assert.equal(t.valueOf(), new Date(2015, 8, 6, 0, 0).valueOf());

var t = c.minof(
      c.month('feb'),
      c.day(31)
    )(new Date(2015, 8, 30))
assert.equal(t.valueOf(), new Date(2015, 9, 31, 0, 0).valueOf()) 

var t = c.allof(
      c.month('feb'),
      c.allof(c.min(15), c.hour(8), c.day(6))
    )(new Date(2015, 8, 30))
assert.equal(t.valueOf(), new Date(2016, 1, 6, 8, 15).valueOf())

//strictness

var t = c.dow('sun')(new Date(2016, 0, 17, 21, 42, 17), false);
assert.equal(t.valueOf(), new Date(2016, 0, 17, 21, 42, 17).valueOf());

var t = c.dow('sun')(new Date(2016, 0, 17, 21, 42, 17), true);
assert.equal(t.valueOf(), new Date(2016, 0, 24, 0, 0, 0).valueOf());

var t = c.weekmod(2, 0)(new Date(2015, 7, 30, 15, 12))
assert.equal(t.valueOf(), new Date(2015, 7, 30, 15, 12).valueOf())

var t = c.weekmod(2, 1)(new Date(2015, 7, 30, 15, 12))
assert.equal(t.valueOf(), new Date(2015, 8, 6, 0, 0).valueOf())

var t = c.weekmod(2, 1)(new Date(2015, 7, 29, 23, 59))
assert.equal(t.getTime(), new Date(2015, 7, 29, 23, 59).getTime())

var t = c.weekmod(2, 1)(new Date(2015, 7, 30, 00, 00))
assert.equal(t.valueOf(), new Date(2015, 8, 6, 0, 0).valueOf())

var t = c.weekmod(2, 1)(new Date(2015, 7, 30, 00, 01))
assert.equal(t.valueOf(), new Date(2015, 8, 6, 0, 0).valueOf())

var t = c.weekmod(2, 0)(new Date(2015, 7, 30, 00, 01))
assert.equal(t.valueOf(), new Date(2015, 7, 30, 0, 1).valueOf())

//tz change dates for germany:
//crontime(0, 2, [25, 26, 27, 28, 29, 30, 31], 'mar', 'sun'])
//crontime(0, 3, [25, 26, 27, 28, 29, 30, 31], 'oct', 'sun'])
