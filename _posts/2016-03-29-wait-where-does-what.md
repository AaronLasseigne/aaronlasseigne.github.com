---
title: Wait, where does what?
date: 2016-03-29 14:10 UTC
---

No matter how much I know there are always bits that slip by.
I've used Rails for years.
Which means I've queried models using `where` for years.
Even so, I recently saw someones code and thought, "that can't work."

I was wrong.

<!--more-->

Imagine a review site where people can comment and optionally leave a rating between 1 and 5.
If I want the highest rated reviews I'll pass `rating` with a value of `5`.

```rb
> Review.where(rating: 5).to_sql
# ... WHERE "reviews"."rating" = 5
```

If I want all unrated records I'll pass `nil`.
ActiveRecord (the part of Rails that handles this) knows SQL doesn't allow equality checks on `NULL` and properly uses `IS NULL`.

```rb
> Review.where(rating: nil).to_sql
# ... WHERE "reviews"."rating" IS NULL
```

I decide to query for two different ratings and give it an array.
ActiveRecord is smart enough to use an `IN`.

```rb
> Review.where(rating: [1, 2]).to_sql
# ... WHERE "reviews"."rating" IN (1, 2)
```

What I saw was an array that contained `nil`.
My immediate, subconscious reaction was doubt.
I figured it would mess up and try something like `IN (1, 2, NULL)`.

```rb
> Review.where(rating: [1, 2, nil]).to_sql
# ... WHERE ("reviews"."rating" IN (1, 2) OR "reviews"."rating" IS NULL)
```

I underestimated `where`.
The docs for `where` don't cover this exact case but it works.

I was pleasantly surprised.
I was also reminded.
It reminded me of how easy it is to slip into the trap of assumptions.
How previous experience, while valuable, can harden a mind and eschew exploration.

I look at the code now and it's obvious.
In the moment, I wouldn't have done it that way.
I would have taken some other more complicated route.
It would have worked, but it wouldn't have been the simplest solution.

No matter how much I know, I need to remember to step back and try to forget everything.
Who knows, I might just learn something.
