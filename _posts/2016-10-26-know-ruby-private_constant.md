---
title: "Know Ruby: private_constant"
date: 2016-10-26 03:46 UTC
---

Constants are a part of your public interface.
They can be an efficient way to share static values.
But what if you don't want to share?
Some constants, like some methods, are intended for internal use only.

To find the constants associated with a class or module you can call `constants` on it.
The `Float` class provides a lot of useful information via constants.

<!--more-->

```ruby
> Float.constants
=> [:ROUNDS,
 :RADIX,
 :MANT_DIG,
 :DIG,
 :MIN_EXP,
 :MAX_EXP,
 :MIN_10_EXP,
 :MAX_10_EXP,
 :MIN,
 :MAX,
 :EPSILON,
 :INFINITY,
 :NAN]
```

Floats depend on the native architecture's implementation of double-precision floating point numbers.
Most of these constants expose the details of that underlying implementation.
In addition, it provides `NAN` and `INFINITY`.
Every now and then I find `INFINITY` to be useful for max/min defaults or infinite ranges.

```ruby
> vegetables.zip(1..Float::INFINITY) do |veg, num|
*   puts "#{num}. #{veg}"
* end
1. broccoli
2. brussel sprout
3. carrot
...
```

That `vegetables` enumerable can be an arbitrarily long list of delicious veggies.
Don't make that face.
Not everything can be bacon.

In my post, [5 Tips for Writing a Legible Regexp], I demonstrate the use of a constant to name a regexp.

```ruby
GITHUB_COM = %r{https?://(?:www\.)?github\.com}i
```

Extracting a regexp, a lambda, or a static value into a constant can improve readability.
They also encourage reuse within a class or module.
Sometimes that value extends beyond the class but other times it doesn't.

If you want a constant to remain private, use `private_constant`.
You can name the constants by passing one or more symbols or strings.

```ruby
class Broccoli
  FAMILY = 'cabbage'
  WORST_PART = 'stem'
  private_constant :WORST_PART
end
```

Outside of `Broccoli` you won't be able to reference `WORST_PART`.
You also can't discover it via the `constants` list.

```ruby
> Broccoli::FAMILY
=> "cabbage"
> Broccoli::WORST_PART
NameError: private constant Broccoli::WORST_PART referenced
> Broccoli.constants
=> [:FAMILY]
```

Consider the usefulness of constants in your code.
When you use them, treat them like methods and evaluate their visibility.
If they need to be private, now you know how to do it.

[5 Tips for Writing a Legible Regexp]: {% post_url 2016-07-08-5-tips-for-writing-a-legible-regexp %}
