---
title: "Faster ActiveRecord Migrations Using <code>change_table :bulk</code>"
date: 2012-06-05 03:48 UTC
excerpt: Instead of individual alter statements we combine them inside <code>change_table</code> with <code>:bulk => true</code>.
---

A migration:

```ruby
def up
  add_column :table, :useful_foreign_key, :integer
  add_index :table, :useful_foreign_key
  add_column :table, :summary, :string
end
```

Executed on a large table:

```sh
==  Table: migrating ===============================
-- add_column(:table, :useful_foreign_key, :integer)
  -> 2731.1005s
-- add_index(:table, :useful_foreign_key)
  -> 2704.8428s
-- add_column(:table, :summary, :string)
  -> 2819.9803s
==  Table: migrated (8255.9236s) ======================
```

According to my made up but based on having done this a bunch of times numbers that's almost 2.5 hours!
Production is going to have to go down for hours to run this.
Co-workers will unsuspectingly migrate and you'll be blamed for a massive loss of productivity.

The wise know that grouping alter statements can significantly speed up a migration (at least in MySQL).
Time to break out `execute` and do it by hand, right?

Nope, there's a better option.

```ruby
def up
  change_table :table, :bulk => true do |t|
    t.integer :useful_foreign_key
    t.index   :useful_foreign_key
    t.string  :summary
  end
end
```

Instead of individual alter statements we combine them inside `change_table` and pass `:bulk => true`.

Now when we execute:

```sh
==  Table: migrating =================
-- change_table(:table, {:bulk=>true})
  -> 2774.1011s
==  Table: migrated (2774.1011s) ========
```

The alter statements have been combined into one statement and the total time to migrate is slightly more than running just one of the alters (again this is with MySQL).

I'm not sure what kind of improvement you'll get on non-MySQL databases but I suspect it'll be faster for any database that allows grouped alter statements.
As a side note, `:bulk` will be ignored if the database can't handle it.
Which makes me wonder why it's not `true` by default.

Happy migrating!
