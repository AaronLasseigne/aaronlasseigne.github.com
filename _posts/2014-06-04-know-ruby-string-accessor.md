---
title: "Know Ruby: String Accessor"
date: 2014-06-04 04:38 UTC
description: Surely you've used the `[]` method but are you aware of all that it can do? Its plethora of signatures make it the Swiss Army Knife of `String` methods. Let's delve in.
---

<div class="panel callout">
  <a href="http://rubyweekly.com/issues/198">Included in issue #198 of Ruby Weekly.</a>
</div>

I've decided to travel deep into the land of Ruby[^1] so that I may better know its secrets.
I'll be scouring it for the interesting, the useful and the inane.
Re-examining parts that I thought I knew.
Exploring forgotten methods and learning whatever I can.
Rather than go it alone I hope you'll join me.

We'll start our journey with the deceptively simple `String` accessor.
**Surely you've used the `[]` method but are you aware of all that it can do?**
Its plethora of signatures make it the Swiss Army Knife of `String` methods.
Let's delve in.

<!--more-->

### Index

The first signature needs no introduction.
Given an `Integer` it'll return the character located at that index.
Of course, it hasn't always been that way.
Prior to 1.9.1 it would return the ASCII code.

```ruby
> 'Aaron'[0]
# 1.9.1+: "A"
# 1.8.7:  65
```

I for one am glad those dark days are behind us.
There is however a vestigial remnant from this past.
Within the current syntax lies the `?`.
Followed by a character, `?` would return the ASCII value for that character.

```ruby
> ?A
# 65
```
No more late nights memorizing the ASCII table.
The `?` was particularly useful when comparing values returned from `[]`.

```ruby
> 'Aaron'[0] == ?A
# true
```
After 1.9.1, `?` became the equivalent of a single character `String`.

```ruby
> ?A
# "A"
```
Because of this, existing equality checks worked seamlessly through the transition.
Its value these days is... questionable.
It does save a character when code golfing.
So, I guess it's not entirely useless.

Continuing on, we can throw a negative `Integer` at `[]` to read from the back.

```ruby
> 'Aaron'[-1]
# "n"
```

Stepping beyond the bounds will net us a `nil` for our efforts.

```ruby
> 'Aaron'[5]
# nil

> 'Aaron'[-6]
# nil
```

### Start, Length

Looking for a group of characters?
Simply provide a starting position and the number in your party.
**Note that I said position this time and not index.**
Unlike before, we're not locating a character.
We're locating the space next to a character.
For example, `'Aaron'` has the following 6 positions `'(0)A(1)a(2)r(3)o(4)n(5)'`.

Starting at position `0` and requesting `2` characters gets us `'Aa'`.

```ruby
> 'Aaron'[0, 2]
# "Aa"
```

If we ask for nothing, we'll get nothing.

```ruby
> 'Aaron'[0, 0]
# ""
```

Get greedy and the method will give us what it can.

```ruby
> 'Aaron'[0, 10]
# "Aaron"
```

Negative starting positions work backwards from the end.
In the negative direction our positions are `'(-5)A(-4)a(-3)r(-2)o(-1)n'`.

```ruby
> 'Aaron'[-2, 2]
# "on"
```

Negative lengths well... there's no such thing.

```ruby
> 'Aaron'[2, -1]
# nil
```

Once again, anything beyond the bounds yields a `nil`.

```ruby
> 'Aaron'[6, 0]
# nil

> 'Aaron'[-6, 0]
# nil
```

What if we take the last position and ask for a character?

```ruby
> 'Aaron'[5, 1]
# ""
```
As long as our starting position is valid and our length isn't negative, we're guaranteed a `String`.

### Range

The trickster of the bunch.

Passing a `Range` might seem straight forward enough.
Begin and end with the character indexes you're looking for.

```ruby
> 'Aaron'[0..2]
# "Aar"
```

**But what we've just seen is a lie.**
The beginning and end of the `Range` are positional.
In "Aaron", the highest index is `4` but the highest position is `5`.
If it's an index, starting with `5` should return a `nil`.

```ruby
> 'Aaron'[5..5]
# ""
```

We have to go to `6` to get `nil`.

```ruby
> 'Aaron'[6..6]
# nil
```

There's one more thing to know.
**The end isn't really the end.**
The `Range` always steals one more character.

```ruby
> 'Aaron'[0..0]
# "A"
```

Before you decide to write off `Range` entirely, there are three easy rules to conquer the madness:

<ol>
<li>
Valid beginning positions guarantee a <code>String</code>.
(Remember, the positions are <code>'(0)A(1)a(2)r(3)o(4)n(5)'</code> and <code>'(-5)A(-4)a(-3)r(-2)o(-1)n'</code>.)

```ruby
> 'Aaron'[0..2]
# "Aar"

> 'Aaron'[3..10]
# "on"

> 'Aaron'[3..-10]
# ""
```
</li>

<li>
Invalid beginning positions guarantee a <code>nil</code>.

```ruby
> 'Aaron'[6..10]
# nil

> 'Aaron'[-6..10]
# nil
```
</li>

<li>
Valid beginning positions with equal or later ending positions return a non-empty <code>String</code>. (Remember, it's positionally later not numerically higher.)

```ruby
> 'Aaron'[3..-2] # 3 and -2 are positionally equal
# "o"

> 'Aaron'[2..3]
# "ro"

> 'Aaron'[2..-2]
# "ro"

> 'Aaron'[-3..-2]
# "ro"

> 'Aaron'[-3..3]
# "ro"
```
</li>
</ol>

Even with these rules we should avoid `Range` unless we have a very compelling case for it.

### String

Oh good, an easy one.
Passing a `String` either finds it or doesn't.

Found.

```ruby
> 'Aaron'['ron']
# "ron"
```

Not Found.

```ruby
> 'Aaron'['z']
# nil
```

Easy.

### Regexp, [Capture]

Let's start by ignoring the optional capture argument.
Given a regular expression, `[]` returns the match or `nil`.

```ruby
> 'Aaron'[/[a-z]+/]
# "aron"

> 'Aaron'[/z/]
# nil
```

It looks a lot like the string matching we saw a moment ago.

Let's explore the optional capture argument.

```ruby
> 'Aaron'[/([a-z]+)([a-z])/, 0]
# "aron"
```

Using `0` returns the entire match.
**It's the same thing we get with no capture argument.**
Not the most useful but, it might be handy if the capture group is determined dynamically.

Everything after `0` returns an individual capture.

```ruby
> 'Aaron'[/A([a-z]+)([a-z])/, 1]
# "aro"

> 'Aaron'[/A([a-z]+)([a-z])/, 2]
# "n"
```

Everything before `0` returns an individual capture starting from the back.

```ruby
> 'Aaron'[/A([a-z]+)([a-z])/, -1]
# "n"

> 'Aaron'[/A([a-z]+)([a-z])/, -2]
# "aro"
```

As of 1.9.2 we can also do named captures.

```ruby
> 'Aaron'[/A(?<middle>[a-z]+)(?<last>[a-z])/, 'middle']
# "aro"
```

If we ask for a capture that doesn't exist we'll get `nil`.

```ruby
> 'Aaron'[/A([a-z]+)([a-z])/, 3]
# nil

> 'Aaron'[/A([a-z]+)([a-z])/, -3]
# nil
```

Unless it's a named capture.

```ruby
> 'Aaron'[/A(?<middle>[a-z]+)(?<last>[a-z])/, 'does_not_exist']
# IndexError: undefined group name reference: does_not_exist
```

It feels inconsistent but it's not the accessors fault.
`Regexp` just works that way.

If we only want one part of a `String`, `[]` can be a **concise and fast** way to get it done.

Benchmark:

```ruby
require 'benchmark'

N = 100_000
R = /(brown)/
S = 'The quick brown fox.'

Benchmark.bmbm do |bm|
  bm.report('match') { N.times { R.match(S).captures.first } }
  bm.report('=~')    { N.times { S =~ R; $1 } }
  bm.report('[]')    { N.times { S[R, 1] } }
end
```

Results:

```sh
            user     system      total        real
match   0.110000   0.000000   0.110000 (  0.116550)
=~      0.050000   0.000000   0.050000 (  0.047954)
[]      0.040000   0.000000   0.040000 (  0.041006)
```

We shouldn't be suprised that `=~` and `[]` are faster.
Using `match` generates a `MatchData` object with lots of other information.
That takes time.

### We made it.

Hopefully you've learned something about the `String` accessor.
I certainly picked up a few nuggets of knowledge along the way.
I thought `Range` was treated like a series of indexes.
Imagine trying to hunt down a bug and overlooking a line because you expect `'Aaron'[5..5]` to be falsely (i.e. return `nil` rather than `""`).
That's the danger of mental models that don't match reality.

Come back for more as we continue to get to [Know Ruby][1].

[^1]: Version 2.1.1

[1]: /series/know-ruby
