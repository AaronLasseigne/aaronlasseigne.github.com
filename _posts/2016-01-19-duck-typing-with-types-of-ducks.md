---
title: "Duck Typing with Types of Ducks"
date: 2016-01-19 15:07 UTC
---

One of the most insidious destroyers of code is the `nil`.
Raise your hand if you've had to sift through piles of functions and files to track down an unexpected `nil`.

Me too.

Ruby doesn't come with a way to create explicit interfaces.
Instead, we create implicit interfaces.
These interfaces are built one method at a time.
Each method sent to an object adds to that interface.
If the object provided adheres to the interface then we accept it.
We duck type.
Our only safety net is `NoMethodError`.

We can use this net to protect ourselves.
We can defend against `nil`.

<!--more-->

### Rouen vs Muscovy

If it quacks like a duck, it's a duck.
That's the idea anyway.
While that is true we can shape the type of duck doing the quacking.
We can hone our interface to pick the right duck.
It's not a duck, it's a Muscovy duck.

{% include image.html src="/images/duck-typing-with-types-of-ducks/muscovy.jpg" alt="Muscovy Duck" height=300 width=400 %}

Let's take a moment to consider the [bacon cannon][].
You'll find that `=~` works with pretty much anything you give it.

{% highlight ruby %}
> 'abc' =~ /a/
# => 0

> true =~ /a/
# => nil

> (1..10) =~ /a/
# => nil

> nil =~ /a/
# => nil
{% endhighlight %}

The bacon cannon is unstoppable!
Which is bad news for us.
Image a method designed to see if a string starts with a vowel.

{% highlight ruby %}
def starts_with_vowel?(text)
  text =~ /\A[aeiou#{'y' if rand > 0.5}]/i
end
{% endhighlight %}
*That's how "and sometimes y" works, right?*

Our method will happily take any object given and roll with it.
Really though, we wanted a `String` or something similar.
We weren't looking to take `nil` or a `Range`.
If we [remember back], you can use the accessor method to match against a `String`.
It's worth noting that `[]` isn't so kind to strangers.

{% highlight ruby %}
def starts_with_vowel?(text)
  text[/\A[aeiou#{'y' if rand > 0.5}]/i]
end
{% endhighlight %}

Let's run through that first list again.

{% highlight ruby %}
> 'abc'[/a/]
# => "a"

> true[/a/]
# => NoMethodError: undefined method `[]' for true:TrueClass

> (1..10)[/a/]
# => NoMethodError: undefined method `[]' for 1..10:Range

> nil[/a/]
# => NoMethodError: undefined method `[]' for nil:NilClass
{% endhighlight %}

By using `[]` instead of `=~` we've kept the integrity of the method while adding specificity.
We've specified the type of duck more accurately.

### Getting Our Ducks in a Row

There's no easy formula to follow here.
In fact the example above can be thwarted with a `Hash`.
Even so, we've narrowed the options and stopped a `nil` from propagating.
With practice and mindfulness we'll start finding methods that help enforce intent.
The key is intentionality.
We must understand that the methods we call shape the objects we allow.

[bacon cannon]: https://twitter.com/j3/status/481513178266734592
[remember back]: {% post_url 2014-06-04-know-ruby-string-accessor %}#regexp-capture
