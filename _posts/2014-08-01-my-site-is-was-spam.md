---
title: "My site <del>is</del> was spam."
date: 2014-08-01 02:58 UTC
---

One of my recent posts, [Know Ruby: String Accessor][1], met with some success.
I initially [posted][3] it to [r/ruby][11] where it received a good number of upvotes.
People responded with comments like "Useful stuff here." and "I found it to be very informative!"

The following Thursday I found out the post had made its way into [Ruby Weekly][2].
With that came a lot more views and even more positive feedback on Twitter.

It was quite an effort to research and write so I was thrilled to see people reading and enjoying it.

Then I got an email from Ruby Weekly's curator, [Peter Cooper][7], and my day took a turn.
There was a problem.
The latest issue was being marked as spam in Gmail.
My site was to blame.

<!--more-->

Peter let me know that he'd done some tests and my domain appeared to be the problem.
Any email he sent with my domain got the message marked as spam.
I was stunned.
I thanked Peter for letting me know what was going on.
It would have been easy to simply ban my domain from future issues and quietly move on.

I tried to think of what might have caused this.
Outside of posting to sites like Reddit I don't advertise.
I've never sent even a single email from this domain.
What was going on?
How had this happened?

I quickly learned that there are two types of spam blacklists.
First, mail servers can be blacklisted.
The idea is that mail servers sending out lots of spam are punished by having all of their emails blocked.
Second, domains can be blacklisted for participating in spam.
The domain blacklist (DBL) is designed to stop domains from hiring other people to spam on their behalf.
Had my domain somehow made its way into one of these lists?

The good news is there are places you can find out.
I put my domain into [URIBL][4], [SURBL][5], and [Spamhaus DBL][6].
Each site responded the same.
I wasn't on any list.
Even so, emails inside Gmail containing my domain were marked as spam.

I understand that this isn't malevolent on their part.
Some algorithm marked my site in what I hope was a false positive.
The problem is there's no way for me to know.
No list to check.
No person to talk to.
The best I could manage was a [post][8] to their product forum.
It's been over a month and no one has responded.
Of course the message ended up in my spam folder in Gmail.
Probably theirs as well.

There is a happy ending of sorts.
Another of my posts, [Know Ruby: clone and dup][9], made it to issue [205][10] of Ruby Weekly.
I emailed Peter to see if he had any problems this time around.
Everything was fine.

Even with this turnaround I feel frustrated and helpless.
At the very least, companies like Google need to provide a way to check the status of a site.
Ideally there would be a mechanism for requesting a reassessment of the property.
In spite of my hopes, I suspect it will remain a black box with no transparency and no mercy.

[1]: {% post_url 2014-06-04-know-ruby-string-accessor %}
[2]: http://rubyweekly.com/issues/198
[3]: http://www.reddit.com/r/ruby/comments/27ajc1/know_ruby_string_accessor_a_deep_dive_that_might/
[4]: https://lookup.uribl.com/
[5]: http://www.surbl.org/surbl-analysis
[6]: http://www.spamhaus.org/query/domain/aaronlasseigne.com
[7]: http://peterc.org/
[8]: https://productforums.google.com/forum/#!mydiscussions/gmail/ARJ1iWN2l_U
[9]: {% post_url 2014-07-16-know-ruby-clone-and-dup %}
[10]: http://rubyweekly.com/issues/205
[11]: http://reddit.com/r/ruby
