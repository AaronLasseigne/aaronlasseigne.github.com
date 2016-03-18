---
title: "Software to Maximize Your Keyboard (OS X)"
date: 2016-03-18 02:38 UTC
---

Last time I talked about buying yourself a [better keyboard].
Better hardware is a great step but it's only half of the equation.
There's a lot that can be done on the software side.
I'll provide some tips and tricks that have helped me.

<!--more-->

### Use Existing Shortcuts

The obvious first step is to know about the keyboard shortcuts that are already there.
You can find a good list on [Dan Rodney]'s site.
I also recommend trying out [CheatSheet].
It's a free application that lists out all keyboard shortcuts for any given program.
It reads the options in the application menu and presents them all at once.

{% include image.html src="/images/software-to-maximize-your-keyboard-os-x/cheatsheet.jpg" alt="CheatSheet screenshot" width=500 %}

### OS X System Options

OS X provides a few tweaks right in the Keyboard section of the System Preferences.
You'll notice that you can adjust the "Key Repeat" and "Delay Until Repeat".
"Delay Until Repeat" determines how long between the first character being displayed and the infinite others that may follow as you continue holding the key.
Once the flow starts, "Key Repeat" determines how quickly the repeating characters arrive.
I like to speed up the repeat and minimize the delay.

You can also change your modifier keys via the button in the bottom right.
Notice that these changes are per-keyboard.
This can be nice for changing the built-in while leaving your [WTF external keyboard] alone.
I prefer to have my <kbd>caps lock</kbd> act like <kbd>control</kbd>.

{% include image.html src="/images/software-to-maximize-your-keyboard-os-x/modifier_keys.png" alt="modifier key settings" width=600 %}

It's rare that I type in all caps but I use <kbd>control</kbd> all the time.
This makes it easier to reach and not having caps lock is no great loss.

Next, check out the "Shortcuts" tab.
Here you can change existing system shortcuts to anything you like.
I wanted to be able to switch spaces using <kbd>control</kbd> + <kbd>H</kbd> to move left and <kbd>control</kbd> + <kbd>L</kbd> to move right.
Double clicking on the existing shortcut allows you to enter your own key combination.

{% include image.html src="/images/software-to-maximize-your-keyboard-os-x/system_shortcuts.png" alt="system shortcuts highlighting space switching" width=500 %}

My favorite part of this area is the last section on the left, "App Shortcuts".
Here you're allowed to override shortcuts in the applications you use.
For example, most apps can be made full screen using <kbd>&#8984;</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd>.
In iTerm you get to full screen via <kbd>&#8984;</kbd> + <kbd>&crarr;</kbd>.
If you wanted it to work that way everywhere you can change the shortcut for all applications.

{% include image.html src="/images/software-to-maximize-your-keyboard-os-x/app_shortcuts.png" alt="app shortcuts highlighting enter and exit full screen" width=500 %}

The process is simple.
Press the "+" button to add a new shortcut.
Select the app, type the text of the menu item, and add the new shortcut key combination.
If you wanted to go the other way and change iTerm, that's easy enough.

{% include image.html src="/images/software-to-maximize-your-keyboard-os-x/add_app_shortcut.png" alt="adding a shortcut for iTerm" width=400 %}

Have handy menu items that don't have a shortcut?
Add one.
Constantly triggering the wrong command because different apps use the same shortcut?
Change it.
It's a handy tool.

### Karabiner

No discussion of keyboard software is complete without [Karabiner].
The level of control it gives you is astounding.
The options are so numerous that a search is provided.
I recommend looking it over yourself and seeing what it has to offer.
I'll tell you about two changes I've made and another I'm considering.

The first is one of the more common key "hacks".
I have my left <kbd>control</kbd> (which you'll remember replaced <kbd>caps lock</kbd>) set to act as <kbd>esc</kbd> when tapped and <kbd>control</kbd> when held down.
It's two keys in one!

The other is a similar effect but in this case the left and right <kbd>shift</kbd> act normally when held and output the appropriate parenthesis when tapped.
I've only recently added this.
Time will tell if it sticks.

I'm mulling an option that swaps the affect of shift on the number keys.
So, pressing <kbd>8</kbd> would output "*" while <kbd>shift</kbd> + <kbd>8</kbd> would give me an "8".

Really, what you can do gets crazy.

### Keyboard Friendly Software

The right software can make a lot more of your system keyboard accessible.
Here are a few I find useful on a daily basis.

#### Alfred

[Alfred] is a command line for OS X.
It's a more powerful Spotlight.
I use it regularly to do quick math, find out how to spell a word, peruse my clipboard history, and oh, I launch apps with it.
It's free to try but I recommend paying for the Powerpack.
The major addition there is workflows.
These are extensions, built by the community, that add all sorts of wonderful features.
You can quickly check [caniuse.com], see what color a hex value is and find its RGB equivalent, generate lorem ipsum text, and the list goes on.

{% include image.html src="/images/software-to-maximize-your-keyboard-os-x/alfred_color_plugin.png" alt="alfred searching for a color" width=500 %}

#### Any Window Manager

Window management in OS X isn't great to begin with.
I've written about this [before].
My approach involves using Hammerspoon.
For some, that might be like using a rocket launcher to hunt a duck.

Simpler solutions like [Divvy] and [SizeUp] will also do a fine job.
Particularly because they let you setup shortcuts to move windows around.

{% include image.html src="/images/software-to-maximize-your-keyboard-os-x/divvy_shortcuts.png" alt="shorcuts in Divvy" width=250 %}

The advantages here aren't limited to using the keyboard.
It's faster and more precise than trying to do it with a mouse.

#### Vimperator / Vimium

My browser is always open.
I want my keyboard to be valuable there as well.
I use [Vimperator] because I like Firefox.
I've heard [Vimium] (the Chrome equivalent) is also good.

With Vimperator I can use familar (to me anyway) vim bindings to move around.
I can scroll, jump to the top or bottom of the page, switch tabs, search a document, and then there's my personal favorite.
You can mark a location on the webpage with a keystroke, move way, and hop right back there with another key combo.
It's fantastic.

Vimperator also has a configuration file so you can permanently disable it for certain sites.

### Hammerspoon

I mentioned [Hammerspoon] earlier for handling windows but it can do so much more.
You should be able to use it make your keys do just about anything you want.

Do you really like using ¯\\\_(ツ)_/¯ in conversations?

```lua
hs.hotkey.bind({"cmd", "alt"}, "s", function()
  hs.eventtap.keyStrokes('¯\\_(ツ)_/¯')
end)
```

A quick <kbd>&#8984;</kbd> + <kbd>option</kbd> + <kbd>S</kbd> and you're shrugging everything in sight.

### Not All at Once

There's one critical step to this process.
Take your time.
Try to do all of this at once and you'll likely Hulk smash your keyboard, laptop, and monitor.
Do one change at a time.
Give yourself a while to adjust before adding another.
If you build this up over time you'll be much better off.
In this case, slow and steady wins the race.

[better keyboard]: {% post_url 2016-03-03-buy-a-better-keyboard-already %}
[Dan Rodney]: http://www.danrodney.com/mac/
[CheatSheet]: https://www.mediaatelier.com/CheatSheet/?lang=en
[Karabiner]: https://pqrs.org/osx/karabiner/
[Alfred]: https://www.alfredapp.com/
[caniuse.com]: http://caniuse.com
[before]: {% post_url 2016-02-16-switching-from-slate-to-hammerspoon %}
[Divvy]: http://mizage.com/divvy/
[SizeUp]: http://www.irradiatedsoftware.com/sizeup/
[WTF external keyboard]: {% post_url 2016-03-03-buy-a-better-keyboard-already %}#layout
[Vimperator]: https://addons.mozilla.org/en-US/firefox/addon/vimperator/
[Vimium]: https://chrome.google.com/webstore/detail/vimium/dbepggeogbaibhgnhhndojpepiihcmeb?hl=en
[Hammerspoon]: http://www.hammerspoon.org/
