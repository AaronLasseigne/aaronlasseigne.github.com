---
title: 5 Tips for Writing a Legible Regexp
date: 2016-07-08 05:32 UTC
---

Regular expressions can be tricky to write and downright impossible to read.
They can also be incredibly useful.
Striking a balance between power and legibility is achievable.
Here are five of the best ways I know to do it.

<!--more-->

### %r

For starters, if my regexp has "/" in it, I avoid using the `/` syntax.
Ruby provides an alternate `%r` syntax for constructing regexps.
Checking file paths or URLs (consider using [URI] instead) often means lots of escaping.
A regexp to extract a GitHub username from a URL might look like:

```ruby
/\Ahttps?:\/\/(?:www\.)?github\.com\/([^\/]+)\/?\z/i
```

Using `%r` allows me to avoid those escapes.

```ruby
%r{\Ahttps?://(?:www\.)?github\.com/([^/]+)/?\z}i
```

Notice that I can still use options like `i` at the end to control case sensitivity.
Speaking of options, let's talk about `x`.

### x option

This is a great one.
The `x` option ignores whitespace and comments inside of a regexp.
Below I've created a regexp that looks through a markdown document and extracts headers.

```ruby
doc.scan(/^ *(\#{1,6}) *(.+?) *\#* *$/)
```

It's complicated and could benefit from some explanation.
With `x`, the regexp can be broken into separate lines and each line can be commented on.
Since whitespace is no longer accounted for I'll have to explicitly check for it.
This means spaces need to be called out with `[  ]`.

```ruby
doc.scan(/
  ^[ ]*     # the line can start with whitespace
  (\#{1,6}) # the leading hashes indicating header size
  [ ]*
  (.+?)     # the header name
  [ ]*
  \#*       # optional decorative header closing
  [ ]*$     # whitespace only until end of the line
/x)
```

Looking at both of those, I know which one I'd rather come back to in six months.
Of course, there's one thing better than comments.
Code!

### Interpolation

Earlier I showed you a regexp that extracted a username from a GitHub URL.
The focal point of that regexp wasn't the domain, it was extracting the username.
Like a double quoted string, a regexp can use interpolation.
Removing and naming the less significant part lets the reader focus on what's important.
The interpolation accepts anything that can be stringified.
Even better, I can use another regexp.

```ruby
GITHUB_COM = %r{https?://(?:www\.)?github\.com}i
%r{\A#{GITHUB_COM}/([^/]+)/?\z}o
```

The first expression uses the case insensitive flag while the other doesn't.
The final regexp will respect that flag but only for the portion represented by `GITHUB_COM`.
The `o` flag at the end optimizes the regexp by only doing the interpolation once.
Each time after that the run time uses the cached version.
As you'd expect, it makes subsequent checks faster.

```
Calculating -------------------------------------
    with o      1.726M (± 7.2%) i/s -   8.667M in   5.046005s
 without o     37.652k (± 6.4%) i/s - 187.779k in   5.007575s

Comparison:
    with o:  1726471.5 i/s
 without o:    37652.5 i/s - 45.85x slower
```

Make sure you don't use `o` with dynamic content.
Not even on accident.
Debugging that can be... painful.

Aside from that, using variables has all the usual advantages you'd expect.
You can extract common parts of the regexp and provide names for otherwise difficult to decipher terms.

### Don't capture what you don't need.

There's no reason to capture unused data.
Unused captures take more memory, slow your code, and contaminate your results.
They happen because parentheses serve two purposes.
Parentheses group a series of terms into a single unit **and** they capture the resulting match.
Back to the GitHub username extraction.

```ruby
%r{\Ahttps?://(?:www\.)?github\.com/([^/]+)/?\z}i
```

It accounts for the optional "www" subdomain.
Doing this means looking for `(www\.)?`.
This creates a capture that I don't care about.

I solve this by using a `(?:` to open the grouping.
This indicates the use of a group **without** a capture.
Now the only capture is the one I want.

### Name your matches.

Sometimes a single regexp will capture several pieces of information.
Instead of capturing a username consider the case where I want a username and project.

```ruby
%r{\A#{GITHUB_COM}/([^/]+)/([^/]+)/?\z}o
```

After matching, I'm forced to reference the captures positionally.

```ruby
> r = %r{\A#{GITHUB_COM}/([^/]+)/([^/]+)/?\z}o
> m = r.match('http://github.com/AaronLasseigne/dotfiles')
=> #<MatchData "http://github.com/AaronLasseigne/dotfiles" 1:"AaronLasseigne" 2:"dotfiles">
> m[1]
=> "AaronLasseigne"
> m[2]
=> "dotfiles"
```

Instead I could use named captures to label my results.
Starting a group with `(?<some_name>` means it can be referenced by name.

```ruby
> r = %r{\A#{GITHUB_COM}/(?<username>[^/]+)/(?<project>[^/]+)/?\z}o
> m = r.match('http://github.com/AaronLasseigne/dotfiles')
=> #<MatchData "http://github.com/AaronLasseigne/dotfiles" username:"AaronLasseigne" project:"dotfiles">
> m[:username]
=> "AaronLasseigne"
> m[:project]
=> "dotfiles"
```

Reading `:project` is much better than backtracking to figure out what `2` references.
It has the added benefit of being immune to changes in the capture order.

Follow these tips and you'll find your regular expressions are more legible and maintainable.

[URI]: http://ruby-doc.org/stdlib-2.3.1/libdoc/uri/rdoc/URI.html
