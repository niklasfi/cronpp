#about 
cronpp is a flexible rule-based framework for determining and scheduling events
#philosophy
cronpp contains so called conditions which are initialized with a list of
possible values. For example `dow('sat')` is a condition matching all saturdays,
`month(['apr', 'jun'])` matches all `Date` objects either in April or June.
Conditions are functions themselves, and when initialized with a `start` time
return the next matching date after `start`. The call

    month(['apr', 'jun'])(new Date(2016, 0, 18))

returns 

    Fri Apr 01 2016 00:00:00 GMT+0200 (CEST).
There are multiple condition functions to choose from:

 - **`month`** - matches months. **Arguments**: `['jan', 'feb', 'mar', 'apr',
   'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']` or `[0..11]`
(beware, JS uses zero-indexing on months). 
 - **`month_week`** - n-th week in month. **Arguments**: `[1..5]`.
 - **`day`** - calendar day in month. **Arguments**: `[1..31]`.
 - **`dow`** - day of the week. **Arguments**: `['sun', 'mon', 'tue', 'wed',
   'thu', 'fri', 'sat', 'sun']` or `[0..6]`.
 - **`hour`** - time of day in 24-hour format. **Arguments**: `[0..23]`.
 - **`min`** - minute within the hour. **Arguments**: `[0..59]`.
 - **`sec`** - second. **Arguments**: `[0..59]`.

Each of these take either a list containining a subset of the values listed in
the arguments section or a value from the arguments section as an argument.
Therefore `dow('sun')` and `dow(['sun', 'mon'])` are both syntactically correct.

All conditions accept a second parameter `strict`, which determines, wether the
input time is a suitable result.
   

     month(['apr', 'jun'])(new Date(2016, 3, 18))
     //note 'apr' == 3

returns 

    Fri Apr 01 2016 00:00:00 GMT+0200 (CEST),

whereas
  

    month(['apr', 'jun'])(new Date(2016, 3, 18), true)
    //note second argument
returns 

    Fri Jun 01 2016 00:00:00 GMT+0200 (CEST).

Additionally, there are two meta conditions, which can be used to match other
conditions:

- `allof(condition1, condition2, ...)` results in a time which matches all
  conditions passed as arguments.
- `minof(condition1, condition2, ...)` gives earliest time satisfying any one of
  the passed conditions.

Finally, cronpp contains two utility functions which can be used to schedule
events

- `at(time, cb)` calls `cb` at time `time`.
- `after(time, cb)` thin wrapper around `setTimeout` for interface constistency
