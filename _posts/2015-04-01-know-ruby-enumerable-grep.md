---
title: "Know Ruby: Enumerable grep"
date: 2015-04-01 01:28 UTC
---

Most of us are familiar with the grep program.
If you work on a \*nix system you've almost certainly used it or one of its newer kin.
These programs allow for **g**lobally searching files with a **r**egular **e**xpression and **p**rinting the results.
It's so common we use it as a verb.

"Did you grep the code base before making that change?"

Are you familiar with its Ruby counterpart?
Ruby plays a bit fast and loose with the name but the underlying concept is similar.
Let's see what `grep` can do.

<!--more-->

### What is a pattern?

According to the documentation, `grep` takes a "pattern" argument and an optional block.
If you're like me that doesn't mean much.
Thankfully the documentation provides a helpful nugget of information.
It says that it checks the argument against each element with `===`.

You might have heard the triple equals referred to as "case equality".
That's because `===` is the check `case` statements use against their `when` clauses.
Now that we have some idea of what we're working with let's break down our options.

### Regexp

Legally speaking, I don't think you can call a method `grep` if it doesn't support regular expressions.

Given a list of first names let's get all the names that start with a "j".

```ruby
> %w[bob amber john jane aaron michael nikki].grep(/\Aj/)
# => ["john", "jane"]
```

The equivalent `select` statement would be:

```ruby
> %w[bob amber john jane aaron michael nikki].select { |n| n[/\Aj/] }
# => ["john", "jane"]
```

I like the brevity provided by `grep` in this case.

We've confirmed that the `grep` name isn't completely misused for this method.
What other things can it do?

### Exact Match

Finding exact matches couldn't be simpler.

```ruby
> [1, 1, 0, 0, 1].grep(1)
# => [1, 1, 1]
```

Of course, it's also not too useful.
Grouping items by values?
Useful.
Counting items by values?
Useful.
Culling a list to a single value?
Dubious.
How often does that really come up?
Either way, there it is.

### Class/Module

We can also find elements that match a specific class.

```ruby
> [1, 1.2, 'a', 2].grep(Integer)
# => [1, 2]

> [1, 1.2, 'a', 2].grep(Numeric)
# => [1, 1.2, 2]
```

We can even find elements that include a particular module.

```ruby
> [1, [], {}, 'a'].grep(Enumerable)
# => [[], {}]
```

### Range

Want to find all of the B's in a list of test scores?

```ruby
> Array.new(50) { rand(100) }.grep(80..89)
#  => [83, 87, 81, 84, 82, 81]
```

It's worth noting that under hood `===` uses `include?` rather than `cover?`.
That's usually not a concern but it's certainly something to be aware of.
If you're not familiar with the differences I would recommend checking out this [Stack Overflow question][] about it.

### Custom

Of course, defining our own meaning for `===` is an option.
Let's say we have value objects that represent various grades.

```ruby
class B < Grade
  def self.===(other_or_grade)
    self == other_or_grade || (80..89).include?(other_or_grade)
  end
end

> Array.new(50) { rand(100) }.grep(B)
# => [87, 86, 88, 83, 88]
```

### Proc/Lambda

Sometimes we'll have a complicated check and nothing above will help.
At that point `proc` (or `lambda`) steps in to save the day.

Using `===` on a `proc` actually calls it.
The value on the other side of the `===` is passed in as an argument.

```ruby
> EVEN = ->(n) { n.even? }
# => #<Proc:0x007f98031f31d0@(pry):21 (lambda)>

> EVEN === 1
# => false
> EVEN === 2
# => true
```

That's just crazy.
It should go without saying that under normal circumstances you should never do this.
It's only there for situations like this:
```ruby
> (1..10).grep(EVEN)
# => [2, 4, 6, 8, 10]
```

At this point are we better off switching to `select`?
Probably.
If we use select we can call `even?` without the `proc`.

```ruby
> (1..10).select(&:even?)
# => [2, 4, 6, 8, 10]
```

Using the shorthand `&:even?` syntax is one thing `grep` can't do.
There's a reason for that.
Remember earlier when we talked about the arguments `grep` takes?
It takes a pattern _and_ a block.

### What about the block?

Every element that makes it past the pattern filter gets sent to the block.
It's like doing a `select` and a `map` all at once.

```ruby
> (1..10).select(&:even?).map { |n| n * 2 }
# => [4, 8, 12, 16, 20]
```

Becomes:

```ruby
> (1..10).grep(EVEN) { |n| n * 2 }
# => [4, 8, 12, 16, 20]
```

Instinctually, I thought the `grep` version would be faster.
It's only looping over the elements once.
This is why we test our assumptions.
It turns out that sometimes `grep` is faster than `select`.
Sometimes it's the other way around.
It really depends on what you're doing.
Adding `map` to the mix, especially with a small number of elements, didn't change that outcome.

### Conclusion

Most of us will reach for `select` without giving it a second thought.
Next time you do take a second and consider `grep`.
It might be just the thing you need.

If you enjoyed this dive into `grep`, check out other posts in the [Know Ruby][] series.

[Stack Overflow question]: https://stackoverflow.com/questions/21608935/what-is-the-difference-between-rangeinclude-and-rangecover
[Know Ruby]: /series/know-ruby
