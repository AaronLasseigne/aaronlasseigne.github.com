---
title: "Tooling Around: MySQL's Client Config File"
date: 2012-07-29 20:50 UTC
ad: checkt
---

There are several good <abbr title="Graphical User Interface">GUI</abbr> options out there for working with MySQL.
For the <abbr title="Command-line Interface">CLI</abbr> fans or those forced to use a machine with no GUI it's possible to have a good experience using the default MySQL[^1] client.
<!--more-->

The `mysql` command accepts a variety of [options][1].
They can be passed in the initial call, set on the `mysql` terminal or permanently added in a `~/.my.cnf` file.
There are two in particular that are extremely useful.

### Prompt

As you can see, the default prompt lacks any useful information.

```sh
mysql>
```

The prompt can show time, user and server info.
You can see the full list of options on [MySQL's commands page][2].
I prefer the current time, the name of the server and the current database I'm working with.
Adding a newline provides a nice divide between queries and ensures that they all start at the same place on the screen.

*Note: The pipe below indicates the cursor.*

```sh
mysql> prompt \R:\m\_\h:\d\n)\_ 
PROMPT set to '\R:\m\_\h:\d\n)\_'
10:32 localhost:companyco_test
) |
```

Knowing that you're running <abbr title="Structured Query Language">SQL</abbr> commands on the correct server and database can help prevent painful mistakes.

### Pager

By default `mysql` doesn't do any paging.
Query data flies by as fast as it can and you're forced to scroll back if you missed something.
Most people I've come accross use `less`(418) as their default pager.
I recommend `less` with the `inSFX` options passed in.

 * `-i` Add smart case matching to your searches.
   This means that searches will only be case sensitive if you use an upper cased letter in the search.

 * `-n` Remove line numbers from the output.
   We don't need line numbers and on larger outputs `less` will run faster without them.

 * `-S` Turn off line wrapping.
   The query output will show one row per line (newlines in the data will still cause a line break).
   You can scroll horizontally through the data with the left and right arrow keys.

 * `-F` If the output fits on the screen `less` will automatically exit.
   This stops you from having to quit the pager for every little query.
   In `mysql` it must be used in combination with `-X` or you'll never see the output.

 * `-X` Do not clear output on exit.
   By default `less` will clear the screen and restore it back to the way it was before the pager was called.
   In `mysql` you probably want the output to stay on the screen so it can be easily referenced.

```sh
mysql> pager less -inSFX
PAGER set to 'less -inSFX'
```

### Config File

Working in the `mysql` terminal is a great way to find settings that work for you.
Once that's done the settings can be added to a `~/.my.cnf` file.
Put them under `[mysql]` and any time `mysql` runs it will use your preferred options.

```sh
[mysql]
pager=less -inSFX
prompt=\R:\m\_\h:\d\n)\_
```

Enjoy!

[1]: http://dev.mysql.com/doc/refman/5.5/en/mysql-command-options.html
[2]: http://dev.mysql.com/doc/refman/5.5/en/mysql-commands.html

[^1]: Version 5.5.25a
