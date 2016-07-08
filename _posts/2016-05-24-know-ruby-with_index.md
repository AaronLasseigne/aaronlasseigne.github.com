---
title: "Know Ruby: with_index"
date: 2016-05-24 03:15 UTC
description: Have you ever used `with_index`? Not `each_with_index` which is similar but slightly different. Did you know that you can do `map.with_index`?
---

<div class="panel callout">
  <a href="http://rubyweekly.com/issues/299">Included in issue #299 of Ruby Weekly</a> and <a href="https://ruby5.codeschool.com/episodes/685-episode-640-may-27th-2016/stories/5352-know-ruby-with_index">episode #640 of Ruby5.</a>
</div>

Have you ever used `with_index`?
Not `each_with_index` which is similar but slightly different.
Did you know that you can do `map.with_index`?

If you've written code like this:

```ruby
i = 0
lines.map do |line|
  i += 1
  "#{i}) #{line}"
end
```

or

```ruby
lines.each_with_index do |line, i|
  puts "#{i + 1}) #{line}"
end
```

then keep reading.

<!--more-->

### What does it do?

Adding `with_index` to an enumeration lets you enumerate that enumeration.
Say that ten times fast.
A quick example will clarify that a bit.
Let's say I have a list of three, I don't know, famous Martians.

```ruby
martians = ["Marvin", "J'onn J'onzz", "Mark Watney"]
```

I'll list them along with their current position in the array.

```ruby
> martians
*   .each
*   .with_index(1) do |martian, i|
*     puts "#{i}) #{martian}"
>   end
1) Marvin
2) J'onn J'onzz
3) Mark Watney
=> ["Marvin", "J'onn J'onzz", "Mark Watney"]
```

As I mentioned earlier, `with_index` isn't limited to `each`.
I could replace `each` with `map` in the example above.

```ruby
> martians
*   .map
*   .with_index(1) do |martian, i|
*     "#{i}) #{martian}"
>   end
=> ["1) Marvin", "2) J'onn J'onzz", "3) Mark Watney"]
```

You probably noticed that I'm passing `1` to `with_index`.
It accepts an integer offset defaulted to `0`.
I've found this to be handy when generating user-facing information.
They usually don't want their lists to be zero-indexed.
No more having to do `i + 1` inside the block.
It's also useful when you have a dynamic list that starts after some hard-coded entries.

### Can't I just use `each_with_index`?

Sure, in fact, sometimes it's better.
Deciding which to use comes down to two considerations.

In the previous section, I passed an offset of `1` to `with_index`.
You can't do this with `each_with_index`.
Both `each` and `with_index` take arguments and `each_with_index` forwards them to `each`.
At this point, you're probably thinking, "I have **never** in my life seen someone pass an argument to `each`."
Me either but it can be done.

On `IO#each` and `StringIO#each` you can pass a line separator, a line limit, or both.
The `Matrix#each` lets you provide a `which` to select the types of elements you want to iterate.
With `Prime#each` you can pass an upper bound or even your own prime generator.

```ruby
> Prime.each_with_index(10) do |prime, i|
*   puts "#{i}. #{prime}"
> end
0. 2
1. 3
2. 5
3. 7
=> Prime
```

Tell me that's not confusing.

The other thing to know is that `each_with_index` is faster than `each.with_index`.

```
Calculating -------------------------------------
     each_with_index    636.248k (± 5.0%) i/s -      3.173M in   5.000131s
     each.with_index    465.312k (± 7.6%) i/s -      2.317M in   5.009064s

Comparison:
     each_with_index:   636247.9 i/s
     each.with_index:   465312.3 i/s - 1.37x slower
```

Any time you see two methods smashed together (e.g. `reverse_each`), it's going to be faster.
Chances are you don't need the speed but if you do well, there it is.

### Halt, and be fricasseed.

Another neat feature of `with_index` is that you can keep chaining them.
Remember those famous Martians?
Let's say I want to sort them and print their initial and final position in the list.

```ruby
> ["Marvin", "J'onn J'onzz", "Mark Watney"]
*   .map.with_index(1).to_a # add the initial position
*   .sort
*   .each.with_index(1) do |(martian, initial), final|
*     puts "#{martian} moved from #{initial} to #{final}."
>   end
J'onn J'onzz moved from 2 to 1.
Mark Watney moved from 3 to 2.
Marvin moved from 1 to 3.
=> [["J'onn J'onzz", 2], ["Mark Watney", 3], ["Marvin", 1]]
```

If you chain like this don't forget to destructure the arguments (see the parentheses in the block arguments).
While fun, I don't usually need to write code like that.
I have gotten some use out of chaining `with_index` and `with_object`.
Oh yeah, if you didn't know, `with_object` is also its own thing.
Anyway, that's a story for another [Know Ruby].

[Know Ruby]: /series/know-ruby
