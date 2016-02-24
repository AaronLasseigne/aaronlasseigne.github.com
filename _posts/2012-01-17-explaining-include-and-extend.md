---
title: "Explaining Include and Extend"
date: 2012-01-17 14:48 UTC
---

<div class="panel callout">
  <a href="//rubyweekly.com/issues/77">Included in issue #77 of Ruby Weekly.</a>
</div>

All Rubyists should be familiar with the common definitions for `include` and `extend`.
You `include` a module to add instance methods to a class and `extend` to add class methods.
Unfortunately, this common definition isn't entirely accurate.
It fails to explain why we use `instance.extend(Module)` to add methods to an instance.
Shouldn't it be `instance.include(Module)`?
To figure this out we're going to start by discussing where methods are stored.
<!--more-->

### The methods I'm storing for you and the guy holding mine.

Objects in Ruby do not store their own methods.
Instead, they create a singleton class to hold onto their methods.

```ruby
class A
  def self.who_am_i
    puts self
  end

  def speak_up(input)
    puts input.upcase
  end
end
```

The interpreter will create an `A` class and a singleton class to attach to it (we'll refer to the singleton class of an object by prepending `'` to the object name).
Any instance methods (i.e. `speak_up`) are added to the methods stored on `A`.
The class methods (i.e. `who_am_i`) are stored on `'A`.

```ruby
> A.singleton_methods # methods on 'A
# => [:who_am_i]
```

{% include image.html src="/images/explaining-include-and-extend/1.png" alt="a class and its singleton" align="left" %}

This same process happens with instance objects.
If we have an instance of `A` and we add a method to it we can't store it on the instance.
Remember, objects in Ruby do not store their own methods.

```ruby
a = A.new

def a.not_so_loud(input)
  puts input.downcase
end
```

Once again we create a singleton class for `a` to store the `not_so_loud` method.

{% include image.html src="/images/explaining-include-and-extend/2.png" alt="an instance and its singleton" align="left" %}

Now we have a method that only belongs to `a` and does not affect other instances of `A`.

### I'm my own father?

The `A` class holds the methods and knows the inheritance chain needed for `a` and all other instances of `A`.
Similarly the singleton class, `'A`, holds the methods and knows the inheritance chain for `A`.
You can think of `A` as an instance of `'A`.
The catch is that we don't talk directly to `'A`.
This means we need some way to distinguish between adding methods to `A` and `'A`.
That's where `include` and `extend` come in.

### include

When you `include` a module in an object, you're adding the methods into the inheritance chain that the object is tracking.

```ruby
class A
  include M
end
```

{% include image.html src="/images/explaining-include-and-extend/3.png" alt="include M on A" align="left" %}

We can see that this is the case by checking `A`'s ancestors.

```ruby
> A.ancestors
# => [A, M, Object, Kernel, BasicObject]
```

### extend

Using `extend` is the same as doing an `include` on the object's singleton class.

```ruby
class A
  extend M
end
```

{% include image.html src="/images/explaining-include-and-extend/4.png" alt="extend M on A" align="left" %}

Once again we can confirm this by checking `'A`'s ancestors.

```ruby
> A.singleton_class.ancestors
# => [M, Class, Module, Object, Kernel, BasicObject]
```

We can also call `extend` on an instance.

```ruby
a = A.new

a.extend(M)

> a.singleton_class.ancestors
# => [M, A, Object, Kernel, BasicObject]
```

{% include image.html src="/images/explaining-include-and-extend/5.png" alt="instance of a extended by M" align="left" %}

If you think of `extend` as a way to add class methods then what we just did doesn't make much sense.
Once you reframe it as adding methods to the singleton of an object the picture above becomes more clear.

### Included Hook

Any time you call `include` it will check the module to see if there is a method named `included`.
This method is executed when the module is included.
It's like an `initialize` for includes.
As you might suspect, `extend` has its own version of this called `extended`.
When you want to add both instance and class methods you can do so using the included hook.

```ruby
module M
  def self.included(base)
    base.extend(ClassMethods)
  end

  def speak_up(input)
    puts input.upcase
  end

  module ClassMethods
    def who_am_i
      puts self
    end
  end
end

class C
  include M
end

c = C.new
```

This works by first including `M` into `C`'s inheritance chain.

{% include image.html src="/images/explaining-include-and-extend/6.png" alt="include M on C" align="left" %}

Then we `extend` from `C` which adds the methods to `'C`'s inheritance chain.

{% include image.html src="/images/explaining-include-and-extend/7.png" alt="extend M on C" align="left" %}

### Conclusion

When you start to dig past the common uses `include` and `extend` can seem odd and intimidating.
Once you understand the underlying implementation it all starts to make better sense.
Let's define `include` and `extend` once more.

`include`: adds methods from the provided Module to the object

`extend`: calls `include` on the singleton class of the object

 If you want a more details about what the interpreter is doing I recommend watching [Patrick Farley's talk on Ruby Internals][1].

[1]: http://confreaks.com/videos/825-mwrc2008-ruby-internals
