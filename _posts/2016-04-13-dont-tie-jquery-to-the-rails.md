---
title: Don't tie jQuery to the Rails
date: 2016-04-13 04:38 UTC
---

{% include image.html src="/images/dont-tie-jquery-to-the-rails/tracks.jpg" alt="rail road tracks" caption="Photo by <a href=\"https://www.flickr.com/photos/kevisdope/25597390633/in/photolist-EZXjrg-74d5QK-pQidVy-fJqS9d-dC1Qif-nbF7Rf-kku4Np-gTBk5o-nxrtiS-dyQCz6-ps2h9H-9AUKNQ-ocyxtK-qCVBCH-petTtr-qEBJwZ-pDvf18-i2hrMm-9B2Cbx-8jDFey-eaEGiQ-fxUkW1-9omXDs-fs96Gp-6idqms-bDXRU5-bNqyng-2Rho6-dEsJtw-5NPfru-oz44tM-bYjcVG-4i5Dtc-odqgbu-9rEyae-fwz785-gxR9er-jAaDtN-7Vurn1-nZd45Z-bEEK3w-4zABBh-5R8Dp1-bCUoaF-pEn3RB-dttMrZ-huA9Do-6Hbavb-p8M7hg-f4QUXH\">Kevin Moreira</a> licensed under <a href=\"https://creativecommons.org/licenses/by/2.0/\">CC</a>. The photo has been modified." %}

It's time for jQuery to go.
It's a great library but it's not a part of Rails.

I was recently auditing a site for dependencies.
Skimming the list of JavaScript libraries I blew right by jQuery.
Then a thought popped into my head.
The bits of dynamic front-end were built using React.
Where was jQuery being used?

<!--more-->

### jQuery joins Rails

Rails 3.1 was unleashed in 2011.
With it came a [switch] from Prototype to jQuery.
At that time everyone was using jQuery.
It was the only thing that made JavaScript even slightly palatable.

Rails leveraged it to create unobtrusive JavaScript (UJS).
It still powers features like remote forms, the `data-confirm` attribute, and CSRF protection.

Life was good.

### The fall of jQuery

When jQuery arrived it was amazing.
It worked across browsers.
Ajax was simple.
Events were handled sanely.
CSS selectors saved us all from the hell of DOM navigation.

Today, many of these features are built into JavaScript.
Developers are avoiding manual DOM manipulation in favor of frameworks like Angular, Ember, and React.
jQuery has shifted from required to optional.

That optional dependency is 32kB minified and gzipped.
The only thing Rails needs it for is 556 lines of UJS.
I decided to suggest removing it.

### Cutting it loose from the Rails

As it turned out, Benoit Bénézech had beat me to it.
He opened an [issue on jquery-ujs] outlining its removal.
Rails projects use Google Groups rather than GitHub issues to discuss features so it was closed.
Unable to find a post about it in the Rails core group I [opened one].

I received a quick reply.
Rails was considering this as a [Google Summer of Code project].
It turns out having original ideas is tricky.

So, it looks like 2016 might be the year Rails and jQuery go their separate ways.
In the mean time you can try out [Vanilla UJS].
It'll be smaller for now and with any luck it won't be need for long.

[switch]: http://weblog.rubyonrails.org/2011/5/22/rails-3-1-release-candidate/
[issue on jquery-ujs]: https://github.com/rails/jquery-ujs/issues/447
[opened one]: https://groups.google.com/forum/#!topic/rubyonrails-core/CacR1mkVmcI
[Google Summer of Code project]: https://github.com/railsgsoc/ideas/wiki/2016-Ideas#implement-ujs-using-native-javascript
[Vanilla UJS]: https://github.com/Ximik/vanilla-ujs
