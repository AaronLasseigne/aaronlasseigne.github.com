---
title: "Battery Life in the Land of Tmux"
date: 2012-10-15 03:59 UTC
---

<div class="panel">
  The code for this can be found on <a href="https://github.com/{{ site.data.author.github }}/tmux_battery_charge_indicator">GitHub</a>.
</div>

From time to time I find myself immersed in my terminal.
Bouncing around in Tmux[^1] between vim, console and whatever else I'm doing.
With my terminal in fullscreen mode I don't notice the power draining from my battery.

{% include image.html
  src="/images/battery-life-in-the-land-of-tmux/osx-battery-warning.jpg"
  alt="OSX Battery Warning"
  height=156
  width=440
%}

This is a fixable problem.
<!--more-->

Tmux provides a constant status bar at the bottom of the screen.
Let's add a battery indicator to right side of the status bar.
While we're adding that we might as well tack on the time and date.

{% highlight bash %}
# status prompt
set -g status-right '#(~/bin/tmux_battery_charge_indicator.sh) #[bg=white,fg=colour240] %H:%M #[bg=colour240,fg=white] %Y-%m-%d '
set -g status-utf8 on
{% endhighlight %}

Of course for this to work we need a script that outputs an indication of how much battery we have remaining.

*Note: The script works in Moutain Lion and on linux.*

{% highlight bash %}
#!/bin/bash

HEART='♥'

if [[ `uname` == 'Linux' ]]; then
  current_charge=$(cat /proc/acpi/battery/BAT1/state | grep 'remaining capacity' | awk '{print $3}')
  total_charge=$(cat /proc/acpi/battery/BAT1/info | grep 'last full capacity' | awk '{print $4}')
else
  battery_info=`ioreg -rc AppleSmartBattery`
  current_charge=$(echo $battery_info | grep -o '"CurrentCapacity" = [0-9]\+' | awk '{print $3}')
  total_charge=$(echo $battery_info | grep -o '"MaxCapacity" = [0-9]\+' | awk '{print $3}')
fi

charged_slots=$(echo "(($current_charge/$total_charge)*10)+1" | bc -l | cut -d '.' -f 1)
if [[ $charged_slots -gt 10 ]]; then
  charged_slots=10
fi

echo -n '#[fg=red]'
for i in `seq 1 $charged_slots`; do echo -n "$HEART"; done

if [[ $charged_slots -lt 10 ]]; then
  echo -n '#[fg=white]'
  for i in `seq 1 $(echo "10-$charged_slots" | bc)`; do echo -n "$HEART"; done
fi
{% endhighlight %}

There are many ways to display power remaining.
I decided an homage to Zelda was the only reasonable way to go.

{% include image.html
  src="/images/battery-life-in-the-land-of-tmux/tmux-status-screenshot.png"
  alt="Tmux Screen Shot with Heart Based Battery Indicator"
  height=128
  width=440
%}

I've only got 40% of my battery left.

Time to plug in.

[^1]: Version 1.7
