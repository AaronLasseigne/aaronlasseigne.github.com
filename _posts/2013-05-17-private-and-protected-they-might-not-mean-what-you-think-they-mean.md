---
title: "Private and Protected: They Might Not Mean What You Think They Mean"
date: 2013-05-25 18:49 UTC
canonical: {
  site: "the OrgSync developer blog",
  url: "http://devblog.orgsync.com/2013/05/20/private-and-protected-they-might-not-mean-what-you-think-they-mean/"
}
---

Ruby[^1], like many other languages, provides a built-in way to change method visibility.
Used properly it can help create a roadmap for others developers to follow.
The problem is that markers of the same name can vary in meaning between languages.
**If you've taken up Ruby after learning another language like C++ or Java and you haven't reexamined the meaning of "private" and "protected" then you're almost certainly not using them the right way.**
Let's spend a minute investigating their use in Ruby.
<!--more-->

### Private

**In Ruby marking a method as `private` means that it can't have an explicit receiver.**
Below we define a `Person` class that takes a first name, last name, and an age.
People don't usually mind telling you their name but some are squeamish about revealing their age.

```ruby
class Person
  attr_reader :first_name, :last_name

  def initialize(first_name, last_name, age)
    @first_name = first_name
    @last_name = last_name
    @age = age
  end

  def name
    [first_name, last_name].join(' ')
  end

  private

  attr_reader :age
end
```

Let's create a new `Person` and ask them their name.

```ruby
> john = Person.new('John', 'Doe', 31)
# => <Person:0x110800cf8 @age=31, @last_name="Doe", @first_name="John">
> john.name
# => "John Doe"
```

What happens if we ask about their age?

```ruby
> john.age
# => NoMethodError: private method `age' called for #<Person:0x110800cf8>
```

We get an error because `age` is called with the explicit receiver `john`.
We can still access `age` we just have to do it inside of `Person` and without an explicit receiver.
Let's explore this by equiping `Person` with a `birthday!` method.

```ruby
def birthday!
  age += 1

  self
end

private

attr_accessor :age
```

Now we can call `birthday!` to update their age.

```ruby
> john.birthday!
# => NoMethodError: undefined method `+' for nil:NilClass
```

Ruby thinks `age` is a local variable and it's defaulting to `nil`.
When using a setter in Ruby we're supposed to use an explicit receiver like `self`.
Here we have a private method that doesn't allow an explicit receiver.
We appear to have reached an impasse.
**In this case it turns out Ruby breaks its own rule.**

```ruby
def birthday!
  self.age += 1

  self
end
```

Now we've got it.

```ruby
> john.birthday!
# => NoMethodError: private method `age' called for #<Person:0x110800cf8>
```

Ugh.

We've used `+=` which means that `self.age` is being called as a getter and a setter.
The setter needs an explicit receiver but the getter can't have one.

```ruby
def birthday!
  self.age = age + 1

  self
end
```

One more time.

```ruby
> john.birthday!
# => #<Person:0x110800cf8 @age=32, @last_name="Doe", @first_name="John">
```

Hurrah!
Let's see the final class.

```ruby
class Person
  attr_reader :first_name, :last_name

  def initialize(first_name, last_name, age)
    @first_name = first_name
    @last_name = last_name
    @age = age
  end

  def name
    [first_name, last_name].join(' ')
  end

  def birthday!
    self.age = age + 1

    self
  end

  private

  attr_accessor :age
end
```

What if we want to inherit from `Person`?
**Those `private` methods will be available in the child class just like they are in the parent.**
Remember, Ruby's only concern is how the method is called, not who's receiving the call.

### Protected

Like `private`, `protected` also concerns itself with the receiver.
**Methods marked with `protected` can only be called using `self`, an instance of the same class as `self`, or an instance of a subclass of the class of `self`.**

Who's up for ping pong?

```ruby
class AbstractPingPongPlayer
  attr_reader :name

  def initialize(name)
    @name = name
  end

  def play(opponent)
    # Here opponent is a different instance so if
    # skill_level was private instead of protected
    # it wouldn't be accessible.
    winner = if opponent.skill_level > skill_level
        opponent
      else
        self
      end

    puts "#{winner.name} wins!"
  end

  protected

  attr_reader :skill_level
end

class AmateurPingPongPlayer < AbstractPingPongPlayer
  def initialize(*args)
    super

    @skill_level = rand(50)
  end
end

class ProPingPongPlayer < AbstractPingPongPlayer
  def initialize(*args)
    super

    @skill_level = rand(50) + 50
  end
end
```

First we'll need two players.

```ruby
> jane = ProPingPongPlayer.new('Jane')
# => #<ProPingPongPlayer:0x007fe7cb8dadf0 @name="Jane", @skill_level=95>
> susan = AmateurPingPongPlayer.new('Susan')
# => #<AmateurPingPongPlayer:0x007fe7cb8ac748 @name="Susan", @skill_level=30>
```

If you ask Jane how skilled she is you're not going to get an answer.

```ruby
> jane.skill_level
# => NoMethodError: protected method `skill_level' called for #<ProPingPongPlayer:0x007fe7cb8dadf0>`
```

Play her and you'll quickly find out.

```ruby
> susan.play(jane)
# => "Jane wins!"
```

### Rule of Thumb

If you're looking to remove something from your public interface then you're looking for `private`.
If you're looking to narrow the interface to other objects of the same type then you want `protected`.

[^1]: Version 1.9.3
