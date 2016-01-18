var assert = require('assert');
var bounds = require('binary-search-bounds');

var clean = function(rule, map){
  var id = function(x){
    assert(typeof x == 'number');
    return x;
  };
  var indexmap = function(index){
    return function(x){
      if(typeof x == 'number') return x;
      var i = index.indexOf(x.toLowerCase());
      assert(i != -1, 'could not find ' + x + ' in index ' + index);
      return i;
    }
  };
  var mapf = map instanceof Array ? indexmap(map) : id;
  if(rule instanceof Array){
    assert(rule.length > 0, "you passed an empty array as a mapping rule");
    for(var i in rule){
      rule[i] = mapf(rule[i]);
    }
    return rule.sort();
  }
  else { //we assert rule is a single, mappable value, e.g. 'jul'
    return [mapf(rule)];
  }
};

//conditions

//condition_prototype:
//condition: args \mapsto (next: time, strict \mapsto time)

//functions in cond_props should fulfill:
//next(floor(t), false) <= floor(t) <= t <= next(t, false) <= next(t, true)

var generic_condition = function(cond_props){
  return function(list){
    var clist = clean(list, cond_props.map);
    assert(clist instanceof Array);

    var next = function(time, strict){
      //console.log('input: ' + time);
      var t = new Date(time); //don't modify incoming time.
      if(!strict && bounds.eq(clist, cond_props.needle(t)) != -1){
        //console.log('check_return: ' + t);
        return t;
      }
      cond_props.floor(t);
      //console.log('floor: ' + t);
      var index = bounds.gt(clist, cond_props.needle(t));
      //console.log('index: ' + index, clist, 'needle: ' + cond_props.needle(t));
      if (index != clist.length && cond_props.set(t,clist[index])){
        //index != -1 ==> entry exists in clist
        //set(t, clist[index]) == true ==> set was successful
        //console.log('ret: ' + t);
        return t;
      }
      else {
        cond_props.carry(t);
        //console.log('carry: ' + t);
        return next(t, false);
      }
    };

    return next;
  };
};

var month = generic_condition({
  map: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
  floor: function(time){
    time.setDate(1);
    time.setHours(0, 0, 0, 0);
  },
  needle: function(time){
    return time.getMonth();
  },
  set: function(time, value){
    assert(0 <= value && value < 12);
    time.setMonth(value);
    return true;
  },
  carry: function(time){
    time.setFullYear(time.getFullYear() + 1, 0);
  }
});

var month_week = generic_condition({
  map: null,
  floor: function(time){
    time.setDate(Math.floor((time.getDate() -  1)/7) * 7 + 1);
    time.setHours(0, 0, 0, 0);
  },
  needle: function(time){
    return Math.floor((time.getDate() - 1)/ 7);
  },
  set: function(time, value){
    assert(0 <= value && value < 6);
    var t = new Date(time);
    var d = (value - 1) * 7 + 1
    t.setDate(d);

    if(t.getMonth() === time.getMont()){
      time.setDate(d);
      return true;
    }
    return false;
  },
  carry: function(time){
    time.setMonth(time.getMonth() + 1, 1);
  }
});

var day = generic_condition({
  map: null,
  floor: function(time){
    time.setHours(0, 0, 0, 0);
  },
  needle: function(time){
    return time.getDate();
  },
  set: function(time, value){
    assert(1 <= value && value <= 31);
    var t = new Date(time);
    t.setDate(value);

    //console.log(value, time, t);
    if(t.getMonth() === time.getMonth()){
      time.setDate(value);
      return true;
    }
    return false;
  },
  carry: function(time){
    time.setMonth(time.getMonth() + 1, 1);
  }
});

var dow = generic_condition({
  map: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
  floor: function(time){
    time.setHours(0, 0, 0, 0);
  },
  needle: function(time){
    return time.getDay();
  },
  set: function(time, value){
    assert(0 <= value && value < 7);
    time.setDate(time.getDate() - time.getDay() + value);
    return true;
  },
  carry: function(time){
    time.setDate(time.getDate() - time.getDay() + 7);
  }
});

var hour = generic_condition({
  map: null,
  floor: function(time){
    time.setMinutes(0, 0, 0);
  },
  needle: function(time){
    return time.getHours();
  },
  set: function(time, value){
    assert(0 <= value && value < 24);
    time.setHours(value);
    return true;
  },
  carry: function(time){
    time.setDate(time.getDate() + 1);
    time.setHours(0);
  }
});

var min = generic_condition({
  map: null,
  floor: function(time){
    time.setSeconds(0, 0);
  },
  needle: function(time){
    return time.getMinutes();
  },
  set: function(time, value){
    assert(0 <= value && value < 60);
    time.setMinutes(value);
    return true;
  },
  carry: function(time){
    time.setHours(time.getHours() + 1, 0);
  }
});

var sec = generic_condition({
  map: null,
  floor: function(time){
    time.setMilliseconds(0);
  },
  needle: function(time){
    return time.getSeconds();
  },
  set: function(time, value){
    assert(0 <= value && value < 60);
    time.setSeconds(value);
    return true;
  },
  carry: function(time){
    time.setMinutes(time.getMinutes() + 1, 0);
  }
});

var weekmod = function(mod, choices){
  var WEEK_DURATION = 7 * 24 * 60 * 60 * 1000
  var SUNDAY_OFFSET = 3

  var weekno = function(t){
    var t_base = new Date(t)
    t_base.setDate(t_base.getDate() - SUNDAY_OFFSET)
    t_base.setMinutes(t_base.getMinutes() - t_base.getTimezoneOffset())
    return Math.floor(t_base.getTime() / WEEK_DURATION)
  }

  assert.equal(weekno(new Date(2015, 7, 29, 21, 59)), weekno(new Date(2015, 7, 29, 23, 59)))
  assert.notEqual(weekno(new Date(2015, 7, 29, 23, 59, 59)), weekno(new Date(2015, 7, 30, 00, 00, 01)))
  assert.equal(weekno(new Date(2015, 7, 30, 00, 01)), weekno(new Date(2015, 7, 30, 02, 01)))

  var week_to_date = function(week){
    var t_base = new Date(week * WEEK_DURATION)
    t_base.setDate(t_base.getDate() + SUNDAY_OFFSET)
    t_base.setMinutes(t_base.getMinutes() + t_base.getTimezoneOffset())
    return t_base
  }

  if (typeof choices == 'number'){
    choices = [choices]
  }

  return function(after, strict){
    var week = weekno(after)
    if(!strict && choices.indexOf(week % mod) != -1){
      return after
    }
    else {
      while(choices.indexOf(week % mod) == -1){
        week++
      }
      after = week_to_date(week)
      return after
    }
  }
}

var allof = function(){
  var fns = arguments;
  return function(time, strict){
    var t = new Date(time);
    var inp;
    do {
      inp = new Date(t)
      //console.log('allof loop begin: t = ' + t);
      for(var i = 0; i < fns.length; ++i){
        t = fns[i](t, strict);
        strict = false;
        //strict may only be true on the very first run.
        //this is sufficient to ensure strictness for the whole function.
        //console.log('allof loop cont:  t = ' + t);
      }
    } while (inp.valueOf() != t.valueOf());
    return t;
  }
}

var minof = function(){
  var fns = arguments
  return function(time, strict){
    var dates = []
    for(var i = 0; i < fns.length; ++i){
      dates.push(fns[i](time, strict))
    }
    return new Date(Math.min.apply(null,dates))
  }
}

var at = function(time, cb){
  var diff = time.getTime() - Date.now();
  log('tme', 'dbg')('at register', time.getTime(), Date.now(), diff);
  return setTimeout(function(){
    log('tme', 'dbg')('at fired', time);
    cb();
  }, diff);
};

var after = function(duration, cb){
  var d = new Date()
  d.setMilliseconds(d.getMilliseconds() + duration);
  log('tme', 'dbg')('after register', d);
  return setTimeout(function(){
    log('tme', 'dbg')('after fired', d);
    cb();
  }, duration);
};

var legacy = function(obj){
  conditions = [];
  for(var key in obj){
    if(key === 'month'){
      conditions.push(month(obj[key]));
    }
    else if(key === 'day'){
      conditions.push(day(obj[key]));
    }
    else if(key === 'dow'){
      conditions.push(dow(obj[key]));
    }
    else if(key === 'hour'){
      conditions.push(hour(obj[key]));
    }
    else if(key === 'min'){
      conditions.push(min(obj[key]));
    }
    else if(key === 'sec'){
      conditions.push(sec(obj[key]));
    }
    else{
      assert(false, 'could not match key ' + key);
    }
  }
  return allof.apply(null, conditions);
}

module.exports.month = month;
module.exports.month_week = month_week;
module.exports.day = day;
module.exports.dow = dow;
module.exports.hour = hour;
module.exports.min = min;
module.exports.sec = sec;
module.exports.weekmod = weekmod;

module.exports.allof = allof;
module.exports.minof = minof;

module.exports.at = at;
module.exports.after = after;

module.exports.legacy = legacy;
