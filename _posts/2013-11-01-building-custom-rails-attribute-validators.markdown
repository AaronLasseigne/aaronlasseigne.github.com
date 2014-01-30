---
layout: post
title: "Building Custom Rails Attribute Validators"
date: 2013-11-01 01:21 UTC
---

The validation that ships with Rails is useful, albeit generic.
It leaves us to construct our own validators as dictated by our domains.
Most of our domains share some common data types like emails or phone numbers.
Individually they might require SSNs, SINs, credit card numbers, URIs, or any other of a million types of data.
The good news is that Rails gives us the tools necessary to build our own validators.
<!--more-->

### The Setup

We're going to validate user-added HTML (we can debate the merits of letting users enter HTML at a later time).
In particular we want to know if the HTML has text in it.
Is there something there to see?
For example, if a user inputs `<p></p>` we're going to fail it.

Basically we want the ability to check for `presence` like we would with regular text.
If we have an email model with a message body, the validation would look like this:
{% highlight ruby %}
validates :body, html: {presence: true}
{% endhighlight %}

### Construction

Let's start with the basic structure of a validator.
It inherits from `ActiveModel::EachValidator` and defines a `validate_each` instance method.
The method is provided with a record (an instance of the model), the name of the attribute, and the value being set.
{% highlight ruby %}
# app/validators/html_validator.rb
class HtmlValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
  end
end
{% endhighlight %}

The class also contains an `options` attribute which represents everything that was passed to `:html` in the `validates` call.
Let's fill in `validate_each` so it checks for the presence of HTML.
{% highlight ruby %}
class HtmlValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    if options.key?(:presence) && blank?(value)
      record.errors.add(attribute, :blank)
    end
  end

  private

  def blank?(value)
    # Is the HTML blank?
  end
end
{% endhighlight %}

The guts of `validate_each` are straight forward.
We check to see if the `presence` key is used and then check to see if our HTML is blank.
If the HTML is blank then we add an error to the record using the standard Rails blank message.

Now we need to define `blank?`.
We'll use [Nokogiri](http://nokogiri.org) to grab text blocks and see if we find any visible text (it could still be hidden by styling, but let's keep it simple).
Nokogiri is fast, but even so, let's make sure there's something there before we start parsing.
{% highlight ruby %}
def blank?(value)
  value.blank? || Nokogiri::HTML(value).
    search('//text()').
    map(&:text).
    join.
    blank?
end
{% endhighlight %}

We've implemented our check and things are going well.
What if we don't like the default message?
Sometimes it's helpful to pass in a message tailored to the situation.
{% highlight ruby %}
validates :body, html: {
  presence: true,
  message: 'must display text before we can send it'
}
{% endhighlight %}

Since the error message code is about to get a little more complicated, let's pull it out of `validate_each`.
Now we check the `options` hash for a `message` key and return the custom message or the default error message.
{% highlight ruby %}
def validate_each(record, attribute, value)
  if options.key?(:presence) && blank?(value)
    record.errors.add(attribute, error_message)
  end
end

private

def error_message
  options.fetch(:messages, :blank)
end
{% endhighlight %}

Putting all of that together we get:
{% highlight ruby %}
# app/validators/html_validator.rb
class HtmlValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    if options.key?(:presence) && blank?(value)
      record.errors.add(attribute, error_message)
    end
  end

  private

  def blank?(value)
    value.blank? || Nokogiri::HTML(value).
      search('//text()').
      map(&:text).
      join.
      blank?
  end

  def error_message
    options.fetch(:messages, :blank)
  end
end
{% endhighlight %}

### Testing

Like all code in our application we want to test our validator.
Let's go over a few example tests.
We'll check that `<p> </p>` fails and `<p>A</p>` passes.
We'll also check that the default message is right and make sure custom messages work.
{% highlight ruby %}
describe HtmlValidator do
  describe '#validates_each(record, attribute, value)' do
    let(:test_model) do
      # ...
    end

    it 'fails when there is no text' do
      test_model.html = '<p> </p>'

      expect(test_model).to have(1).errors_on(:html)
    end

    it 'passes when text is in the HTML' do
      test_model.html = '<p>A</p>'

      expect(test_model).to be_valid
    end

    it 'returns the default error message' do
      test_model.html = ' '
      test_model.valid?

      expect(
        test_model.errors.full_messages
      ).to eq I18n.t('errors.messages.blank')
    end

    context 'options' do
      context 'contains a custom error message' do
        it 'adds the custom message' do
          test_model.html = ''
          test_model.valid?

          expect(
            test_model.errors.full_messages
          ).to eq [custom_message]
        end
      end
    end
  end
end
{% endhighlight %}

You might have noticed that I left `test_model` empty.
We need to build a class that we can use to test our validator.
Actually, we're going to need two so we can test one with the `:message` option set and one without it set.
What if we add new options and we need to test those?
Hard coding classes for each test feels cumbersome.

What we need is a way to easily build classes with different validation options.
To do this we'll add a method to our spec file that takes an `options` hash and returns a custom built class.
The class will quack like a non-persisted `ActiveRecord::Base`.
Anonymous classes don't have names and Rails is going to expect the class to respond to `name`.
Fixing this is as easy as adding a class method `name`.
{% highlight ruby %}
def html_validator_class(options)
  Class.new do
    extend ActiveModel::Naming
    include ActiveModel::Conversion
    include ActiveModel::Validations

    def new_record?
      true
    end

    def persisted?
      false
    end

    def self.name
      'Validator'
    end

    attr_accessor :html

    validates :html, html: options
  end
end
{% endhighlight %}

Odds are good that you're going to build more than one validator so, you'll want to extract the generic parts of your class.
It'll also help to expose the parts of the custom class that are important to the tests.
{% highlight ruby %}
# This class would exist in a helper file.
class ValidationTester
  extend ActiveModel::Naming
  include ActiveModel::Conversion
  include ActiveModel::Validations

  def new_record?
    true
  end

  def persisted?
    false
  end

  def self.name
    'Validator'
  end
end

# app/validators/html_validator.rb
def html_validator_class(options)
  Class.new(ValidationTester) do
    attr_accessor :html

    validates :html, html: options
  end
end
{% endhighlight %}

Now we go back and fill in `test_model` using our new `html_validator_class` method.
{% highlight ruby %}
describe HtmlValidator do
  describe '#validates_each(record, attribute, value)' do
    let(:options)    { {presence: true} }
    let(:test_model) { html_validator_class(options).new }

    it 'fails when only whitespace is in the HTML' do
      test_model.html = '<p>    </p>'

      expect(test_model).to have(1).errors_on(:html)
    end

    it 'passes when text is in the HTML' do
      test_model.html = '<p>A</p>'

      expect(test_model).to be_valid
    end

    it 'returns the default error message' do
      test_model.html = ' '
      test_model.valid?

      expect(
        test_model.errors[:html]
      ).to eq [I18n.t('errors.messages.blank')]
    end

    context 'with a custom error message' do
      let(:custom_message) { 'this is a custom message' }
      before { options.merge!(message: custom_message) }

      it 'adds the custom message' do
        test_model.html = ''
        test_model.valid?

        expect(
          test_model.errors[:html]
        ).to eq [custom_message]
      end
    end
  end
end
{% endhighlight %}

### Validate All the Things

Validators are a critical part of any application.
They provide a way to ensure the accuracy and consistency of your data.
Using the same validator across models stops your team from littering your application with different ideas about what constitutes a valid phone number.
Validators are worth every bit of effort you put into them.
Anyone who's written migrations to fix bad data can attest to that.

<div class="panel">
  Originally published on the <a href="http://devblog.orgsync.com/building-custom-rails-attribute-validators">OrgSync developer blog</a>.
</div>
