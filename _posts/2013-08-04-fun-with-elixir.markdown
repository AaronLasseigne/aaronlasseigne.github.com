---
layout: post
title: "Fun with Elixir"
date: 2013-08-05 03:22 UTC
---

Most of the code I write is written in Ruby.
I work with it during the day and I play with it at night.
I'm a full stack web developer so I get to cavort with JavaScript and CoffeeScript regularly.
But every now and then I like to pick a language and take it for a spin.
I haven't done it as often as I would like but when I do it's always interesting.
Recently, I decided to take some time and toy around with [José Valim][1]'s new language [Elixir][2][^1].
I'll skip to the end and tell you this: I'm having a lot of fun.
<!--more-->

### Does it run?

If you're going to play with a language you'll need to have access to it.
You can try [Elixir out in the browser][3] but that'll only get you so far.
I want to work with it locally.
Thankfully, installing it was a breeze.
It has a variety of installers for Windows, Linux, and OSX so it should be simple on any system.
No complicated command line crap here.

### How about a development environment?

I'm a Vim guy so my first thought was to see if there was a good plugin.
It turns out that the Elixir crew has released a plugin for [Vim][4], [Emacs][5], and [TextMate][6] (which covers Sublime).
It really feels like they want people to be comfortable getting up and running.

### A brief word from Dave Thomas.

If you're in the Ruby community you know who [Dave Thomas][7] is.
Primarily because he wrote the book on Ruby.
[Literally][8].
He's currently writing a [book][9] on Elixir and he's done a free [video][10] introducing the language.

About a week ago I was fortunate enough to hear him speak on the topic and I can tell you he's passionate about Elixir and about functional programming.
It encouraged me to go home and spend some more time exploring.

### Roman Numerals

Inspired by a kata [Greg Vaughn][11] showed after Dave's talk, I prompty started coding a basic Roman numeral converter.
After writing up some tests I let the typing begin.
When it came to pattern matching I was a bit dubious.
Normally I avoid conditions if I can so I was worried it would feel like I was overusing them.
After working through the Roman numerals I didn't have that feeling.
It felt clean and tidy.
It was easy to read and reason about.

{% highlight elixir %}
defmodule RomanNumeral do
  def convert(n) when n >= 10, do: remove_and_continue(n, "X", 10)
  def convert(9),              do: "IX"
  def convert(n) when n >= 5,  do: remove_and_continue(n, "V", 5)
  def convert(4),              do: "IV"
  def convert(n),              do: String.duplicate("I", n)

  defp remove_and_continue(total, roman, number) do
    String.duplicate(roman, div(total, number)) <> convert(rem(total, number))
  end
end
{% endhighlight %}
*The full code with tests can be found [here][12].*

### Project Time

I wanted to try taking on a project.
Using the getting started guide on [elixir-lang.org][13] I decided to make something like a poor man's Memcached.
Learning about OTP, processes, supervisors, and general language whatnot proved a bit challenging.
Eventually I got my head around enough of it to finish and I'm satisfied with the final product.
You can check out the code at [{{ site.data.author.github }}/ex_cache][14].

### I haven't drank the Kool-Aid yet.

I feel very comfortable with Elixir.
I've been looking for a functional language to really sink my teeth into and I might have found it.
Having said that, Elixir does have some warts.
Guard clauses are a bit too limited especially when it comes to strings (no regular expression comparisons).
Additionally, data types are comparable (e.g. `1 < :atom # true`) which strikes me as bizarre and makes me worry about false positive comparisons in guard clauses.

Elixir is all of the power of Erlang with a Ruby inspired syntax.
It's got a chance to be something and even if it doesn't work out it'll provide a nice stepping stone into the world of functional programming and immutable data.
Personally I hope it has a lot of success because right now I'm having a lot of fun.

[^1]: Version 0.10.1

[1]: https://github.com/josevalim
[2]: http://elixir-lang.org
[3]: http://tryelixir.org
[4]: https://github.com/elixir-lang/vim-elixir
[5]: https://github.com/elixir-lang/emacs-elixir
[6]: https://github.com/elixir-lang/elixir-tmbundle
[7]: http://en.wikipedia.org/wiki/Dave_Thomas_%28programmer%29
[8]: http://pragprog.com/book/ruby/programming-ruby
[9]: http://pragprog.com/book/elixir/programming-elixir
[10]: http://www.youtube.com/watch?v=a-off4Vznjs
[11]: https://github.com/gvaughn
[12]: https://gist.github.com/{{ site.data.author.github }}/6128642
[13]: http://elixir-lang.org
[14]: https://github.com/{{ site.data.author.github }}/ex_cache
