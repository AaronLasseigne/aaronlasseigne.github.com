---
title: Why Aren't We Using More Service Objects Already
date: 2017-11-08 15:28 UTC
description: Avdi Grimm recently wrote a post in which he lambastes the rise of service objects. As an advocate for service objects I was interested in reading about their shortcomings.
---

{% include image.html src="/images/why-arent-we-using-more-service-objects-already/mushrooms.jpg" alt="Stuffed mushrooms with herbs and goat cheese." caption="<a href=\"https://www.flickr.com/photos/21001756@N06/3660107079\">Taken by Stacy Spensley</a>" %}

Avdi Grimm recently wrote a [post] in which he lambastes the rise of service objects.
As an advocate for service objects I was interested in reading about their shortcomings.
I want to know the strengths and weaknesses of the tools I use.
That's not what I found.
Instead, I found a post that simply contradicted my own experience.

<!--more-->

Avdi starts with "an overweight controller" that's processing IPN data.
We've all run into the controller action that's too large.
It's a common problem and the kind of thing you want to fix.
He starts by creating a service object and moving most of the controller code into it.
The result is a structure like this:

```ruby
class IpnProcessor
  def process_ipn(...)
    # controller code here
  end
end
```

Avdi proceeds to point out that `IpnProcessor.new.process_ipn` smells bad.
The naming is redundant like a bad code palindrome.

`ipn processor new process ipn`

He's absolutely right.
It's a bad name.
It's also not how people name service objects.
When using service objects, teams will select a consistent method name like `call` or `run`.

```ruby
class IpnProcessor
  def call(...)
    ...
  end
end
```

The idea is that you've only got one public method so, the name of the class identifies the action that's happening.
The `IpnProcessor` object represents an action occurring in the application.
Service objects should represent our verbs like models represent our nouns.

Next, Avdi advocates what he sees as a better solution:

> Well, in my applications I usually have a module that gives the app code an overall namespace.
> In this case, the app was called “perkolator”, so the module was named `Perkolator`.

The result is a module named after the application and a method for our IPN processing.

```ruby
module Perkolator
  def self.process_ipn(...)
    # ...
  end
end
``` 

The benefits of this approach are that we'll avoid "accumulating more responsibilities" and "inter-service coupling".

He says that objects which are ill defined are dangerous.
Their ambiguous nature leaves them wide open for the addition of questionable functionality.
I agree.
Having a stash-all module named after your application sounds like exactly the kind of place to accumulate random code.
Most Rails devs can tell you about an `app/controllers/application_controller.rb` that became an island for misfit functions.

With service objects, you have a single `IpnProcessor` object and one public method to call.
Adding more methods feels wrong and will get you called out in a code review.
The only way to increase functionality is to make that one public method do more.
That also starts to feel wrong very quickly.
Kind of like having a method with a million optional arguments feels wrong.

The second major concern is "inter-service coupling".
Services will encapsulate actions in the application and eventually those actions will cross paths.
They might share a database table or be two steps in a larger process.
Isn't that the case with controllers?
How would using a module instead of a service object change that?
It doesn't.

In my experience, service objects help to define the paths through your application.
They create a listing of actions that can be easily read:

`CreateUser`, `CreateGroup`, `AddUserToGroup`, `BanUserFromGroup`, ...

If there are exact steps in a process and you want them tied together than we do what we always do.
We put them into a folder in the `services` directory and namespace them:

`Purchase::Made` and `Purchase::Redeemed`

Using service objects doesn't preclude you from using modules.
Having a module that understands and handles authorization tokens for purchases might make sense.
In that case, the service objects can leverage the module for authorization and handle the rest.
It all depends on what you're trying to do.
It's not really a toolbox if you only fill it with hammers.

### My Experience

Wow.
Not a good wow mind you.
I had just been hired by a start-up.
Dev number 4 and employee number 20 something.

They had a Rails app that was a couple of years old.
It was built by unpaid computer science majors while they were still finishing their degrees and it showed.
These were smart guys.
They just didn't have a lot of experience.
I wouldn't have done any better had I been in their place.
In fact, they had a working product and a positive cash flow.
As DHH will tell you, that's more than most.

Features were getting harder to build.
Fixing bugs was trickier than it should have been.
The site wasn't running as fast as it could be.
We needed to clean things up.

The process was laborious but we progressed.
The company grew and the team expanded.
We moved code into modules and broke apart some of the larger objects.
One day, a developer suggested we try out service objects.
It didn't take the team long to realize this was a win.

We need a way to add a user to a group.
Do we add `User#join_group` or `Group#add_member`?
Nope, we'll add a `AddGroupMember` service object that takes a group and a user.
What about the emails we need to send?
The new member should get an introductory email from the group and the group should get one about their new member.
No problem, we can queue them up as part of the process that is adding a new group member.

We had found something that helped us to avoid some of these situations.
Our actions had a place to live instead of being clumsily attached to a model.
All of this eventually led us to create [ActiveInteraction].
It worked great for us and it has for other people too.
ActiveInteraction handled our verbs like ActiveModel handled our nouns.
It was a consistent interface that the group could leverage.
We knew how to write them, how to handle errors, and how to call them.
We had a framework for making them.

Each time we carved an action out of a class, the move was straight-forward.
The code was easy to test.
We were eating the whale one bite at a time and it was delicious.

We could have done these as procedures but we would have lost that framework.
One developer might have raised Ruby errors, while another attached them to a return object, and the third sent them as part of a tuple.
When you work on a team, standardizing code is a critical part of success.

### He Might Not Be Wrong

I have a lot of respect for Avdi.
Clearly, he and I differ on this.
It might be that he sees something I don't.
It wouldn't be the first time I've been enlightened and it won't be the last.
But right now, I don't see it.

What I know is that service objects improved my work.
When I talk to people who use them, I hear overwhelmingly positive experiences.
As a freelancer, I could probably find years worth of work simply introducing teams to service objects and helping them clean their code.
I bet I'd get a lot of good reviews.

[post]: https://avdi.codes/service-objects/
[ActiveInteraction]: https://github.com/AaronLasseigne/active_interaction
