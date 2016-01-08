---
title: "Ruby's New &.!= Operator"
date: 2016-01-04 05:28 UTC
---

Well, it's actually two operators.
Sue me.
The 2.3.0 release of Ruby included the safe navigation operator, `&.`.
It does the same thing as `try!` in Rails.
You can chain method calls together and bail early if you hit a `nil`.

In Ruby some things you don't normally think of as method calls are in fact just that.
For example, operators like `!=`.

<!--more-->

### A Brief Overview of Safe Navigation

Let's say we have an array of integers.
We want to know if the first one is positive.
To check we might do something like:

{% highlight ruby %}
> some_array.first.positive?
# => true
{% endhighlight %}

*Note: `positive?` is another new 2.3.0 method.*

What happens if `some_array` is empty?

{% highlight ruby %}
> [].first.positive?
# => NoMethodError: undefined method `positive?' for nil:NilClass
{% endhighlight %}

The call to `first` returns `nil` and `nil` doesn't have a `positive?` method.
Before 2.3.0 we might have done something like:

{% highlight ruby %}
(value = some_array.first) && value.positive?
{% endhighlight %}

Now we can use `&.` to solve our problem.

{% highlight ruby %}
some_array.first&.positive?
{% endhighlight %}

If `first` returns `nil` then the entire expression returns `nil`.
If not then we'll continue down the method chain and call `positive?`.

### Brilliant or Abusive?

I run [libgrader.com][] which helps Ruby developers find quality libraries.
Two pieces of data that I record for each library are homepage and source code URLs.
On occasion they turn out to be the same link.
In that case, to reduce noise, I only show the homepage.
In the template I show the source URL if it exists and is different than the homepage.

{% highlight ruby %}
if lib.source_url && lib.source_url != lib.homepage_url
  # display source url
end
{% endhighlight %}

I can use the safe navigation operator to perform the same check.

{% highlight ruby %}
if lib.source_url &.!= lib.homepage_url
  # display source url
end
{% endhighlight %}

I like that I've DRYed my code.
Less code means less chance for me or future me to muck it up.
On the other hand, I value readability.
At the moment it just looks odd.
Someone who's not seen it before would have a hard time figuring out what it means.
Anyone who's tried to google code symbols can attest to how frustrating it can be.
Still, we use things like `!!` and eventually everyone gets used to it.
I'm going to leave it and see if I get used to it.
In the near future, maybe code like `&.&`, `&.<<`, and `&.+` will be something we're all used to.

[libgrader.com]: http://www.libgrader.com
