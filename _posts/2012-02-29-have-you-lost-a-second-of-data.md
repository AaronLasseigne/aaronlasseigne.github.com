---
title: "Have you lost a second of data?"
date: 2012-02-29 15:42 UTC
description: One of the gems I'm working on limits a range of data based on a datetime field. You see MySQL stores datetimes to a resolution of one second. Databases like SQLite and PostgreSQL store down to the microsecond (.999999). This leads to a problem.
---

<div class="panel">
  Based on some good <a href="//www.reddit.com/r/rails/comments/qberl/have_you_lost_a_second_of_data">Reddit</a> discussions I've revised the "Only use ranges." section to use a range with an exclusive end.
</div>

One of the gems I'm working on limits a range of data based on a datetime field.
I use a SQLite[^1] database in my automated testing, but ultimately it's going to run on MySQL[^2] and possibly others.
The ease of SQLite makes this a fairly common setup.
ActiveRecord[^3] helps alleviate cross database issues but it doesn't cover all cases.
You see MySQL stores datetimes to a resolution of one second.
Databases like SQLite and PostgreSQL store down to the microsecond (.999999).
This leads to a problem.
<!--more-->

### The Problem

If, like me, the bulk of your time has been spent working with MySQL then microseconds may seem reasonable but foreign.
A typical ActiveRecord `where` call would give you all results from within a second.
In SQLite that same call gives results from the exact microsecond specified.

```ruby
> Test.where(created_at: Time.zone.parse('2012-01-01 00:00:01'))

# MySQL
SELECT "tests".* FROM "tests" WHERE "tests"."created_at" = '2012-01-01 06:00:01'
4 Results

# SQLite
SELECT "tests".* FROM "tests" WHERE "tests"."created_at" = '2012-01-01 06:00:01.000000'
1 Result
```

Searching for a single second isn't too common.
How about all records from a particular day?

```ruby
> Test.where(created_at: Time.zone.parse('2012-01-01 00:00:00')..Time.zone.parse('2012-01-01 23:59:59'))
```

In databases that measure microseconds you're going to be missing any information that occurred between "23:59:59.000000" and "23:59:59.999999".
You've missed almost a full second of data.
What if your ecommerce site made a sale in that one second?

### Solutions

So, how do we handle this?

#### Build to the database you're using.

This is the most common route when building applications.
Only one brand of database is used and if it changes the process won't be seamless anyway.
What's one more to-do item on the database migration checklist? Additionally, costs are deferred until you switch databases which may never occur.
It's not an ideal option, but it's a realistic one.
For those writing publicly available gems, limiting your support limits your audience.

#### Chop all microseconds off and store everything to only a one second resolution.

I hate to lose data.
It may not matter to your application now but you can never get it back.
If you're authoring a public gem this might get you lynched.

#### Use the "%" wildcard.

You could do something with `LIKE` and string conversion where the "%" wildcard is used at the end of a datetime string.
It might be a clever idea but it breaks if you're working with time zones.
It's best to avoid this approach.

#### Customize for each database.

Embrace the differences by adding conditionals to alter the code depending on the database adapter in use (`ActiveRecord::Base.connection.class`).
Most databases record some fraction of a second, MySQL is the odd one out.
Providing a special case for MySQL and handling the rest with a default should work.
When writing a public gem, it's hard to go wrong with this approach.
In applications it'll clutter things up significantly to do this everywhere.
Make sure to create global scopes, helpers, etc to <abbr title="Don't Repeat Yourself">DRY</abbr> it up.

#### Only use ranges.

One last solution is to stick with ranges.
Notice in the example below that the range excludes the end value (3 dots rather than 2).

```ruby
> datetime = Time.zone.parse('2012-01-01')
> Test.where(created_at: datetime...(datetime.advance(days: 1))

# MySQL
SELECT "tests".* FROM "tests" WHERE ("tests"."created_at" >= '2012-01-01 00:00:00' AND "testers"."created_at" < '2012-01-02 00:00:00')

# SQLite
SELECT "tests".* FROM "tests" WHERE ("tests"."created_at" >= '2012-01-01 00:00:00.000000' AND "testers"."created_at" < '2012-01-02 00:00:00.000000')
```

That retrieves the entire days data in both MySQL and SQLite.
The `advance` function includes a variety of increments ranging from seconds to years.
Using an exclusive end rather than inclusive helps to avoid another pitfall, leap seconds.
When needed, leap seconds are added at the end of the day.
Inclusive searches to "23:59:59.999999" aren't going to catch that extra second.

### Conclusion

One day ActiveRecord might handle these differences, but for now using per database conditionals or sticking to ranges will have to do.
It's worth noting that the amount of fractional time stored does vary.
Some databases even allow you to specify a precision.
If you know of a better way to tackle this problem drop a comment below.
Let's find those missing seconds.

[^1]: Version 3.7.7
[^2]: Version 5.5.19
[^3]: Version 3.2.1
