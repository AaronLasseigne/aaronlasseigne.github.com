---
title: "Clear Intentions: Do you speak 3?"
date: 2016-06-24 04:01 UTC
---

It's easy to mistake current knowledge for universal knowledge.
Decisions that were straightforward a year ago are a mystery today.
We've all done it.
Why did I pick that value?
What made them do it that way?

We check the commit history, question co-workers, and spend time learning or re-learning the domain.
Hopefully the problem isn't time critical.

One way to mitigate this is to make your code clarify your intent.

<!--more-->

### Say it out loud.

> Hi, I heard you speaking `1`.
> My `3` is terrible.
> Do you speak `3`?
> I need some help translating.

Can you picture yourself walking up to someone and saying that?
Yet, I'm sure you've seen, or maybe written, code like that.

```ruby
if person.languages.include?(1)
```

Code may tell a machine what to do but it's far from its only job.
More importantly, it explains its job to other people.

Numbers like this are sometimes called "Magic Numbers".
They aren't part of some equation or a starting point for iteration.
They do their job with no explanation.
The code works but no one looking at that line can tell you what `1` is.

```ruby
if person.languages.include?(Languages::US_ENGLISH)
```

By setting a constant or variable to the value you clarify the meaning.
Databases and APIs often use integers to save a few bytes.
It doesn't mean you have to leak them into your code.

Picture yourself saying the line out loud to a co-worker.
If it sounds good then you're headed in the right direction.
"If a person's languages include English" sounds much better than "if a person's languages include 1".

### Consider the context.

You don't have to go replacing every number you see.

```ruby
if person.age.between?(4, 8)
```

"If the person's age is between 4 and 8" sounds reasonable aloud.
Replacing those with `MIN_AGE` and `MAX_AGE` might not improve the clarity.
If you're checking that a toy is good for an age range that might be all the information you need.

It's important to consider the context in which you're using the number.
Let's look at another example.

```ruby
def can_admit?(patron)
  patron.age >= 21
end
```

"The patron can be admitted if their age is greater than or equal to 21" doesn't sound bad either.
The problem is that `21` is no ordinary number.
It's the age at which it's legal to drink alcohol in the U.S.

The code might seem obvious, if you're a U.S. citizen.
If you're from Argentina where the legal age is 18, not so much.
The knowledge that 21 is the legal drinking age is cultural.
Numbers that assume culture, experiences, or domain knowledge are great candidates for replacement.

In this case, you could replace `21` with `LEGAL_DRINKING_AGE`.

```ruby
def can_admit?(patron)
  patron.age >= LEGAL_DRINKING_AGE
end
```

Everyone has gaps in what they know.
Even a common background might not be enough to make a "Magic Number" obvious to everyone.

### Conditionals

Clarification isn't just about replacing a number (or a string or a regexp).
Conditions can be some of the worst offenders when it comes to obscuring meaning.

```ruby
if word.chars.sort == other_word.chars.sort
```

This may seem simple enough.
I've got two words and I want to see if they have the same characters.
There's a bug in that code.
You can't see it because you don't really know what it's supposed to do.

It's a check to see if two words are an anagram.
That means you can rearrange the letters of one to construct the other.
It shouldn't take letter casing into account.
It probably also shouldn't let a word be its own anagram.

Let's say you figure that out.
You add the code to fix it.
How long and unwieldy is that conditional going to be?

You could replace it with a private predicate method.

```ruby
if anagram?(word, other_word)
```

Now the intent is clear.
People reading the code won't have to decipher a cryptic conditional to know what's happening.
If someone doesn't know what an anagram is they can look it up.
Everyone wins.

### Blocks

Blocks can be just as bad as conditionals.
While skimming some code, you run across a `stats` variable that's an array containing arrays of numbers.
Something like `[[1, 4, 3, 5, 3, 3], [2, 2, 4]]`.

Take 10 seconds to look at the code below, close your eyes, and explain what it does.
Go!

```ruby
stats
  .map { |numbers|
    numbers.group_by(&:itself).max_by { |_, v| v.size }.first
  }
  .join(',')
```

How'd it go?
Don't bother re-reading it.
Instead, try again with some new code.
Ready?
Go!

```ruby
stats
  .map(&FIND_MODAL_VALUE)
  .join(',')
```

Ruby doesn't have first class functions but you can assign a lambda.

```ruby
FIND_MODAL_VALUE = ->(numbers) { ... }
```

If someone doesn't know what a modal value is they can find the constant or head to Google.
You've given them two ways to understand what's happening.

### It's not an exact science.

It's hard to come up with strict rules for this.
Your best bet is to give it a try.
Encourage your team to give it a try.
Do it a lot.
Undoing one of these changes is easy.
Over time you'll refine your taste for when it helps.

Don't make future people hunt for something that you can easily provide now.
Information can be hard to find and having to intuit the thoughts of a past developer, well... I wish you luck.
