---
title: "Know Ruby: clone and dup"
date: 2014-07-16 03:09 UTC
---

<div class="panel callout">
  <a href="//rubyweekly.com/issues/205">Included in issue #205 of Ruby Weekly</a> and <a href="//ruby5.envylabs.com/episodes/520-episode-483-july-25nd-2014">episode #483 of Ruby5.</a>
</div>

Are you familiar with `clone` and `dup`?
Quick, what's the difference?
For the uninitiated, they both create shallow copies of objects.
Well, most objects.
We'll dig into that more later.
Know this though, in a language with mutability, **these methods can be a life saver.**

<!--more-->

### What's the difference?

Let's get this part out of the way up front.
While nearly identical, `clone` does one more thing than `dup`.
In `clone`, the frozen state of the object is also copied.
In `dup`, it'll always be thawed.

{% highlight ruby %}
> f = 'Frozen'.freeze
# "Frozen"
> f.frozen?
# true

> f.clone.frozen?
# true

> f.dup.frozen?
# false
{% endhighlight %}

The most common reason to create a copy of an object is to modify it without affecting the original.
After all, it might not be yours to mess with.
In that case, leaving it frozen doesn't make much sense.
As a result, I tend to find myself using `dup` far more often than `clone`.

Going forward we'll focus on `dup`.

**Update:** Stephan Kämper [pointed out][6] that there is one more difference not originally mentioned.
When using `dup` you'll lose singleton methods added to the original object.
On the other hand, `clone` retains these methods.

{% highlight ruby %}
> obj = Object.new
# #<Object:0x007fd214a36018>

> def obj.say_hi
>   puts 'Hi'
> end
# :say_hi

> obj.say_hi
# Hi

> obj.dup.say_hi
# NoMethodError: undefined method `say_hi' for #<Object:0x007fd2142297a8>

> obj.clone.say_hi
# Hi
{% endhighlight %}

### Shallow Waters

I mentioned earlier that `dup` is shallow.
That means only the object it's called on is copied.
Everything the original object is holding is shared with the copy.
Imagine sitting down to lunch, cloning yourself, and then having to duke it out over which one of you gets to eat the sandwich you made.
Sandwich they made?
You both made?

Anyway, here's a list of books I like:
{% highlight ruby %}
> my_book_list = [
>   "Stranger in a Strange Land",
>   "Watchmen",
>   "Harry Potter and the Sorcerer's Stone"
> ]
{% endhighlight %}

Let's pretend that you like these same books.
{% highlight ruby %}
> your_book_list = my_book_list.dup
# [
#     [0] "Stranger in a Strange Land",
#     [1] "Watchmen",
#     [2] "Harry Potter and the Sorcerer's Stone"
# ]
{% endhighlight %}

Thing is, you're a Harry Potter purist.
The first book was originally released as *Harry Potter and the Philosopher's Stone* and renaming it was an egregious mistake.
{% highlight ruby %}
> your_book_list[2].sub!('Sorcerer', 'Philosopher')
# "Harry Potter and the Philosopher's Stone"
{% endhighlight %}

Problem solved, right?
Well, *your* problem is solved.
If I'm searching for "Sorcerer" then I'm the one with the problem.
{% highlight ruby %}
> my_book_list
# [
#     [0] "Stranger in a Strange Land",
#     [1] "Watchmen",
#     [2] "Harry Potter and the Philosopher's Stone"
# ]
{% endhighlight %}

The good news is we can add new titles to either list without affecting the other.
We just can't modify any of the original titles without changing both lists.

### Why should we use `dup`?

Because we're nice.
People are trusting us with their stuff.
We'd like to trust them with our stuff.
Imagine yourself iterating over an array of things and calling a method on each thing.
This method takes a hash of `options`.
{% highlight ruby %}
things.each do |thing|
  library_method(thing, options)
end
{% endhighlight %}

The method splits the options among some other methods it calls.
{% highlight ruby %}
def library_method(thing, options)
  a = options.delete(:a) { 0 }
  thing.do(a) + some_other_method(options)
end
{% endhighlight %}

After the first iteration `options` no longer has `:a` in it.
It was deleted.
All remaining iterations end up sending `0` to `do`.
I don't want to debug stuff like that.
Do you?

Why isn't this biting us all the time?
Well, we often make new copies without explicitly thinking about it.
Methods like `merge` and `map` help solve the same problem by returning new objects rather than altering the one provided.
If another method won't solve the problem then it's `dup` to the rescue.

### Can it be `dup`'d?

If you're at a standing desk or are otherwise perpendicular to the floor you might want to sit down for this next part.
Ready?
Everything responds to `dup` but not everything is `dup`able.
Take the behavior of singletons.
They'll respond to `dup` but not in the way we want.

{% highlight ruby %}
> 1.dup
# TypeError: can't dup Fixnum
{% endhighlight %}

If you find that a bit odd you're not alone.
It's been brought [up][1] to the Ruby core team and after some lengthy discussion rejected because of a lack of progress.
It was even [re-visited][2] a few months ago only to be shot down again.

What this means for us is that we can't call `dup` with reckless abandon.
If we're not sure what we're `dup`ing then we'll need a failure strategy.
{% highlight ruby %}
y = begin
      x.dup
    rescue TypeError
      x
    end
{% endhighlight %}

If you're using Rails and error catching isn't your thing they've monkey patched `duplicable?` onto all objects.
{% highlight ruby %}
y = if x.duplicable?
      x.dup
    else
      x
    end
{% endhighlight %}

### Customizing `dup` and `clone`

Pretend we've made a class that requires special `dup` and/or `clone` considerations.
Ruby doesn't want us to completely override these methods.
Instead it gives us hooks to grab onto.
After completing a copy, Ruby calls `initialize_copy` on the **newly created object** and passes the original object as an argument.
In 1.9.2 `initialize_dup` and `initialize_clone` were added for even greater control.
Each of them calls `initialize_copy` when they're done.

Let's make a class so we can see all of this in action.
{% highlight ruby %}
class CloneWatcher
  # IRB calls `inspect` but for our example
  # we're interested in knowing `object_id`.
  alias_method :inspect, :object_id

  private

  def initialize_copy(source)
    puts "Copy: #{source.inspect}"
    super
  end

  def initialize_dup(source)
    puts "Dup: #{source.inspect}"
    super
  end

  def initialize_clone(source)
    puts "Clone: #{source.inspect}"
    super
  end
end
{% endhighlight %}

We'll make a new instance of `CloneWatcher`.

*Note: The object ids start with the same digits.
In the examples below I've manually aligned and separated the output for improved readability.*

{% highlight ruby %}
> cw = CloneWatcher.new
# 70196928 058020
{% endhighlight %}

What happens when we `dup`?
{% highlight ruby %}
> cw.dup
# Dup:  70196928 058020
# Copy: 70196928 058020
#       70196928 287740
{% endhighlight %}

When we `clone`?
{% highlight ruby %}
> cw.clone
# Clone: 70196928 058020
# Copy:  70196928 058020
#        70196928 174860
{% endhighlight %}

Like I said earlier, the original object is passed in giving you complete control over what you extract from it.
You can also see that `initialize_copy` was called in each time.
If you're curious about how this might be used in the real world you can check out [Set][4] from the standard library.
It uses a hash under the hood so a copy only needs the underlying hash.

### Protective and Polite Code

I try to avoid mutation in my code when possible.
It's one less thing to account for.
If you do need to mutate something, we've seen how a new copy can help avoid headaches.
It's also the polite thing to do when given other people's objects.
If you're not sure whether to use a `dup` or not I would err on the side of caution and go for it.
It might cost you a few extra CPU cycles but most of us can spare it.
Eventually you'll get a feel for when it's need and when it's not.

Remember, cloning is good. Just ask [Dolly][3].

<img alt="Dolly the sheep" title="Baahhh!" src="/images/know-ruby-clone-and-dup/dolly.jpg">

If you enjoyed this post check out others in the [Know Ruby][5] series.

[1]: https://bugs.ruby-lang.org/issues/1844
[2]: https://bugs.ruby-lang.org/issues/9487
[3]: https://en.wikipedia.org/wiki/Dolly_%28sheep%29
[4]: https://github.com/ruby/ruby/blob/trunk/lib/set.rb#L104
[5]: /series/know-ruby
[6]: http://phvalues.wordpress.com/2014/07/24/ruby-details-clone-and-dup-2/
