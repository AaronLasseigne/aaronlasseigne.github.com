---
title: "Proper Regexp Anchoring"
date: 2016-06-10 03:10 UTC
---

In regular expressions, `^` does **not** match the start of a string.
It might in other languages but not Ruby.
That's part of what makes this mistake so common.
While we're on the topic, `$` doesn't match the end of a string.

<!--more-->

### How do you check the start of a string?

The `^` anchors the match to the start of a **line not a string**.
When I say "line", I'm talking about sections of the string separated by newlines.

```ruby
> "aardvark\nbeaver" =~ /^a/
=> 0
> "aardvark\nbeaver" =~ /^b/
=> 9
```

Both tests found a match.
The `/^a/` found the first line with "aardvark".
The `/^b/` found the second line with "beaver".
If I want only the start of the string, I'll need to use `\A`.

```ruby
> "aardvark\nbeaver" =~ /\Aa/
=> 0
> "aardvark\nbeaver" =~ /\Ab/
=> nil
```

Now that I'm checking the string rather than the line, `/\Ab/` fails to match.

### What about the end of a string?

I mentioned earlier that `$` also works on lines not strings.
I can demonstrate this by matching the "k" in "aardvark" and the "r" in "beaver".

```ruby
> "aardvark\nbeaver" =~ /k$/
=> 7
> "aardvark\nbeaver" =~ /r$/
=> 14
```

So, if `\A` matches the start of a string then `\Z` must match the end, right?
That's *mostly* true.
The `\Z` anchor matches the end of the string **excluding** any final newline.

```ruby
> "aardvark\nbeaver" =~ /r\Z/
=> 14
> "aardvark\nbeaver\n" =~ /r\Z/
=> 14
> "aardvark\nbeaver\n\n" =~ /r\Z/
=> nil
```

The `\Z` can be useful for capturing text without worrying about a newline.

```ruby
> "aardvark\nbeaver\n"[/^(.+)\Z/, 1]
=> "beaver"
```

*Note: If you don't recognize that use of `[]` check out [Know Ruby: String Accessor].*

The actual end of the string can be found with `\z`.

```ruby
> "aardvark\nbeaver" =~ /r\z/
=> 14
> "aardvark\nbeaver\n" =~ /r\z/
=> nil
> "aardvark\nbeaver\n"[/^(.+)\z/, 1]
=> nil
> "aardvark\nbeaver\n"[/^(.+)\n\z/, 1]
=> "beaver"
```

Most of the time I find myself using `\A` and `\z`.
If I need to worry about a newline I'm inclined to use `\n?\z`.
It's easier to modify and there's less chance of confusion.

### Save your data.

Have you ever used a regular expression for validation?
Let's say you have a Rails app and a form that accepts a zip code.
The form accepts zip codes with or without the four digit extension.

You search Google for "rails validate zip code" and the first results leads you to a [Stack Overflow] answer.
In the answer `/^\d{5}(-\d{4})?$/` is suggested.
A few months later, another dev shows you a zip code in the database that reads `"Beverly Hills, CA\n90210"`.
Whoops.

I've had to fix bad data.
It is not fun.
For this case, removing the bad data is fairly easy.
That won't always be the case.
Be careful with your regexp anchors.

[Know Ruby: String Accessor]: {% post_url 2014-06-04-know-ruby-string-accessor %}
[Stack Overflow]: https://stackoverflow.com/questions/8212378/validate-us-zip-code-format-with-rails
