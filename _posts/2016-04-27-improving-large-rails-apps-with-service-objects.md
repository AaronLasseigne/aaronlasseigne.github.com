---
title: Improving Large Rails Apps with Service Objects
date: 2016-04-27 03:28 UTC
---

Nothing has improved my Rails apps more than service objects.
A couple of weeks ago, I was asked to help out with an established Rails app.
I found a `User` model that included 28 modules.
All but 8 were namespaced under `Users`.
A core object in your system, used everywhere, and it's thousands of lines long.
How many features have been bolted onto this model?
When you look at a method, which feature does it belong to?

Madness like this can be sidestepped with service objects.

Let's start at a time before 28 includes.
Let's start at the beginning.
Imagine you've started a SaaS business.
It's a help desk.
Soon you have clients signing up.
Then *their* users are creating accounts and receiving support.

Want to make your clients happy?
Make their users happy.
You've decided to add a welcome email for those users.
It'll provide a friendly hello and tips on how to use the help desk.

Where does your new code go?

<!--more-->

### Put it in the controller.

Code usually makes its first appearance in a controller.
You add the welcome notification, the users are happy, and your clients are thrilled.

```ruby
def new
  @user = User.new
end

def create
  @user = User.create(params[:user])

  if @user.valid?
    Notifications.welcome(@user).deliver_later

    redirect_to(@user)
  else
    render 'new'
  end
end
```

Looks pretty harmless.
There's a problem though.
Software tends to grow.

Fast forward a year.
You've added user groups, a customizable default group, and clients are notified of sign ups.
Once small, the code no longer fits on a screen.
But let's not jump too far ahead.

Some clients don't want an open sign up.
They want to wait until an account is created in their software and auto-enroll users.
They want an API.

You use the new `ActionController::API` feature to make an endpoint.
Currently, all your business logic for signing up users is in the `UserController`.
Trying to reuse controller code is tricky.
Ask anyone who's ever had a `DoubleRenderError`.

### Put it in the model.

Now that you need the code in two places you push it into the `User` model.
You add it as a callback on creation and *ding* a user's got mail.

What happens to `User` as you add more features?
It begins to grow, and grow, and grow.
Maybe you'll group features into modules to separate the code.
Then you'll have 28 modules.
Once again I digress.

Your existing clients love the API.
Your prospective clients are excited to switch from competitors.
There's just one thing.
Your prospects want to bulk import their existing users.
They also want to send their *own* welcome email explaining the transition.

Now you have to skip the welcome email callback you added.
Have fun trying to figure that out.

### Put it in a service object.

ActiveModel wants to represent a record.
It wants to map to a table and persist data.
It influences the way you think about models.
It makes you think of them as nouns.

`User`, `Group`, `Issue`, `Cart`, ...

What happens when you need a verb?
You add it to a noun.

`User.sign_up`, `Group.invite`, `Issue.comment`, `Cart.purchase`, ...

Before long, each noun is a mass of business logic.
Some interactions spread across models making them difficult to wrap your head around.
Service objects fix this.
They're models that are designed to be verbs.

Interactions are contained in their own classes.
Making them easier to test, document, change, and remove.

You could use plain old Ruby objects.
I wanted my objects to feel like a part of Rails.
I wanted a sibling to ActiveModel.
I wanted the team to have a consistent approach.
This led to the creation of [ActiveInteraction].

Instead of `User.sign_up` you'll have `SignUp`.
Each interaction is called with `run` and passed a `Hash` of arguments.

```ruby
SignUp.run(
  client: Client.find(1),
  name: 'Aaron',
  email: 'aaron.lasseigne@gmail.com',
  password: 'supersecure'
)
```

In a controller you might directly pass `params`.

```ruby
SignUp.run(params.merge(client: current_client))
```

The interaction itself looks like this:

```ruby
class SignUp < ActiveInteraction::Base
  object :client
  string :name, :email, :password

  def execute
    user = User.create(
      client: client,
      name: name,
      email: email,
      password: password
    )

    if user.valid?
      Notifications.welcome(user).deliver
    else
      errors.merge!(user.errors)
    end

    user
  end
end
```

Calling `run` kicks off three steps.

First, there is a check to see if all the necessary arguments were passed.
In `SignUp` that means a `:client` (an instance of `Client`), `:name`, `:email`, and `:password`.
They need to be the right type or convertible to the right type.
If you mark a field as a `date` and provide a `String` it will convert to a `Date`.
You can also indicate optional arguments.

Second, validations are run.
There are no validations in this example but you already know how they work.
They're ActiveModel validations straight out of the heart of Rails.

Finally, if the first two steps pass, `execute` is run.

Calling `run` returns an "outcome".
It's an instance of `SignUp` that quacks like an ActiveModel.
It even works with Rails forms like an ActiveModel.
If you need the return value from `execute` all you have to do is call `result` on your instance.

Using it in your controller will also look familiar.

```ruby
def new
  @sign_up = SignUp.new
end

def create
  @sign_up = SignUp.run(params[:user])

  if @sign_up.valid?
    user = @sign_up.result
    redirect_to(user)
  else
    render 'new'
  end
end
```

Now you have a sign up process that is contained, easy to use, and easily reusable.
I almost forgot, you needed the ability to skip the notification for bulk imports.

```diff
 class SignUp < ActiveInteraction::Base
   object :client
   string :name, :email, :password
+  boolean :notify,
+    default: true

   def execute
     user = User.create(
       client: client,
       name: name,
       email: email,
       password: password
     )

     if user.valid?
+      if notify
         Notifications.welcome(user).deliver
+      end
     else
       errors.merge!(user.errors)
     end

     user
   end
 end
```

### What are you waiting for?

You don't need a greenfield app to reap these benefits.
I've used service objects to break big models back down to their basics.
Piece by piece you can extract functionality and take control.

Whether you use [ActiveInteraction] or roll your own give it a try.
You'll have an app that's simpler to maintain and easier to understand.

[Activeinteraction]: https://github.com/orgsync/active_interaction/
