---
title: "Building Identicons and Playing with Clojure"
date: 2013-08-18 18:58 UTC
---

I've been playing with Clojure on and off for a little while now.
I've worked through problems on [4 Clojure][1] and [Exercism.io][2] but I've been looking for a small project to take on.
Last Wednesday when GitHub announced [identicons][3] for users without avatars and I found my project.
My goal was to take a string and output an identicon for it.
For identicons a particular input should always generate the same identicon.
Also, the identicons should be unique for each input.
<!--more-->

### How do I make an image?

First I needed to figure out how to generate an image in Clojure[^1].
After a brief search it looked like my best bet was to outsource this task to Java.

Start by creating a `BufferedImage`:

{% highlight clojure %}
icon (BufferedImage. 120 120 BufferedImage/TYPE_INT_RGB)
{% endhighlight %}

Then get a `Graphics2D` so you can draw on the image:

{% highlight clojure %}
draw (.createGraphics icon)
{% endhighlight %}

From there you can draw lines, fill in rectangles, and color like a blissful two-year-old.

{% highlight clojure %}
;; draw a white 8x8 square drawn in the upper left corner
(.setColor draw (Color/WHITE))
(.fillRect draw 0 0 8 8)))
{% endhighlight %}

When you're done, saving is easy:

{% highlight clojure %}
(ImageIO/write icon "png" (File. "some-file-name.png"))
{% endhighlight %}

### How do I generate a more consistent identifier?

Knowing that I could make images I turned my attention to an identifier.
I was expecting to receive a string but that could contain anything and be of any length.
In order to simplify things I needed a consistent format to work with.
Hashing the input was the easiest solution.
Even though it has collision issues I decided to use [MD5][4].
It's fast and close enough to unique for the purposes of my project.
MD5 generates a 32 digit string of hexidecimal numbers regardless of what input you give it.
Clojure was ready for me this time with a library called [Digest][5].

{% highlight clojure %}
> (digest/md5 "Aaron")
;; "1c0a11cc4ddc0dbd3fa4d77232a4e22e"
{% endhighlight %}

### How do I translate an MD5 string into an image?

#### A Sequence of Booleans

With the basics out of the way it was time to bring it all together.
I needed a way to turn the MD5 into a unique image.
My identicon, like GitHub's, is a grid of blocks.
I could turn the MD5 into a sequence of on/off flags.
Then I could leverage that to turn on certain blocks.
Since each characters represents a hexidecimal digit converting them to booleans was easy.
All I had to do was check to see if the digit was between 0-7 or 8-15.

{% highlight clojure %}
;; to-numbers converts the provided MD5 into a sequence of integers
(map #(> % 7) (to-numbers md5))
{% endhighlight %}

#### Mapping to the Grid

GitHub made their identicons symmetrical.
I think it creates a more appealing visual so I decided to do the same.
This meant that I was only generating half of the grid and then mirroring it.
It also means that on a 6x6 grid I'm only using 18 of my 32 hexidecimal digits.
Now I've really increased the chance of a collision but this isn't production so I'm fine with it.

{% highlight clojure %}
(def tiles-per-side 6)

(defn- in-row
  "Return the row for a particular position in the seq."
  [pos]
  (quot pos (/ tiles-per-side 2)))
 
(defn- in-col
  "Return the column for a particular position in the seq."
  [pos]
  (rem pos (/ tiles-per-side 2)))

(defn- draw-tile
  "Fill in a tile at a particular position starting from the left of the image."
  [draw tile-size pos]
  (.fillRect draw
    (* (in-col pos) tile-size)
    (* (in-row pos) tile-size)
    tile-size tile-size))
{% endhighlight %}

The code above only draws half of the grid.
There's another function called `draw-mirror-tile` that takes the same inputs and draws the mirrored version of the tile.
I imagine there is a way to draw one half and mirror it using the underlying Java library but drawing twice was easier in the moment.

#### Generating the Identicon

I made a function called `generate` that accepts an identifier and a size.
The size needs to be a multiple of 6 so that it fits the grid properly.

{% highlight clojure %}
(identicon.core/generate "Aaron" 120)
{% endhighlight %}

![Black and white identicon for "Aaron"](/images/building-identicons-and-playing-with-clojure/1c0a11cc4ddc0dbd3fa4d77232a4e22e-120-bw.png)

### How do I add color?

The identicon would look better with colors.
Back in the Java docs I found that I could add color with `setColor`.
I couldn't figure out the proper way to set a background color so I started by drawing a white rectangle over the entire image.

{% highlight clojure %}
;; size passed as the second argument to generate
(.setColor draw (Color/WHITE))
(.fillRect draw 0 0 size size)))
{% endhighlight %}

Then I found a 16 color pastel palette and used the first digit of the hexidecimal sequence to pick one.

{% highlight clojure %}
(defn- get-color
  [pos]
  (nth '(
    (246 150 121) ;; Pastel Red
    (249 173 129) ;; Pastel Red Orange
    ...
    (244 154 193) ;; Pastel Magenta
    (245 152 157) ;; Pastel Magenta Red
  ) pos))'))

;; in the generate function
(let
  [r g b] (get-color (first (to-numbers md5)))
  color   (Color. r g b)
  (do
    (.setColor draw color)
    ;; other stuff))
{% endhighlight %}

There's probably a better way to destructure the sequence that `get-color` returns and pass it directly to the `Color` constructor but I got sick of trying to figure it out.

Now when we run the same command from earlier we get a colorized version.

![Color identicon for "Aaron"](/images/building-identicons-and-playing-with-clojure/1c0a11cc4ddc0dbd3fa4d77232a4e22e-120.png)

If you want to see all of the code together you can find it [here][6].

### Takeaway

Building identicons turned out to be a good project.
It gave me a chance to dive into Clojure in a way that I hadn't done before.
However, I did hit some bumps along the way.

Reaching for Java felt wrong.
I can't help but wonder how often the community looks to Java to solve their problems.
It's nice having fast, reliable, well built libraries for free, but Java is a different paradigm and it feels like it bleeds through.
In my `generate` function I call a number of methods that modify `draw` and don't return anything of use.
It feels like the wrong approach in a language that lauds immutability.
It might be that I'm not experienced enough and there are ways around these issues that I will find as I learn.
I certainly hope so because I plan to continue exploring.

[^1]: Version 1.5.1

[1]: http://www.4clojure.com
[2]: http://exercism.io
[3]: https://github.com/blog/1586-identicons
[4]: http://en.wikipedia.org/wiki/Md5
[5]: https://github.com/tebeka/clj-digest
[6]: https://gist.github.com/{{ site.data.author.github }}/6255278
