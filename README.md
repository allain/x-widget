# x-widget

Adds the ability to define widgets using [Alpinejs](https://alpinejs.dev/)

It's implemented using WebComponents but it favors keeping the component state in the scope of the component rather than embedding it as attributes on the dom nodes.

## Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <title>x-button example</title>
    <script type="module">
      import Alpinejs from 'https://jspm.dev/alpinejs@3.5.1'
      import xWidget from 'https://unpkg.com/x-widget@0.1.1/dist/x-widget-all.min.mjs'

      Alpinejs.plugin(xWidget)
      Alpinejs.start()
    </script>
  </head>
  <body x-data>
    <!-- Define the Widget -->
    <template x-widget="x-button">
      <button x-data="xWidget({label: ''})($el, $data)" x-text="label"></button>
    </template>

    <div x-data="{message: 'Click me'}">
      <!-- Use the widget -->
      <x-button :label="message" @click="message='Thanks'"></x-button>
    </div>
  </body>
</html>
```

## Features

### Slots

```html
<template x-widget="x-panel">
  <div>
    <template x-if="$slots.header">
      <div class="header">
        <slot name="header"></slot>
      </div>
    </template>
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<x-panel>
  <!-- Named Slot -->
  <template slot="header">
    <h1>Panel Header</h1>
  </template>
  <!-- Default Slot -->
  <template>
    <p>Panel Content</p>
  </template>
</x-panel>
```

### Widget Properties

Widget data is a helper that lets you to define the properties, data types, and the defaults your widget expects.

It supports giving values for properties using attributes, as well as a new `x-prop` mechanism that makes it easy to two way bind of scope data to widget properties.

In the example below, clicking on "Close" will set `showDropdown` to false.

```html
<template x-widget="x-dropdown">
  <div
    x-data="xWidget({
      open: false, // define show as a boolean with default value of false
      items: [], // define items as an array with default value of []
    })($el, $data)"
  >
    <div x-show="open">
      <button @click="open = false">Close</button>
      <template x-for="item of items">
        <option :value="item.value" x-text="item.label"></option>
      </template>
    </div>
  </div>
</template>

<div x-data="{showDropdown: true}">
  <x-dropdown
    x-prop:open="showDropdown"
    x-prop:items="[{value: 1, label: 'One'}, {value: 2, label: 'Two'}]"
  ></x-dropdown>
</div>
```

If you don't like the look of having the widget's spec in the DOM, you can use the following approach too:

```html
<script>
  import { xWidgetData } from 'x-widget'

  Alpine.data(
    'xDropdown',
    xWidgetData({
      open: false, // define show as a boolean with default value of false
      items: [] // define items as an array with default value of []
    })
  )
</script>

<template x-widget="x-dropdown">
  <div x-data="xDropdown($el, $data)">
    <div x-show="open">
      <button @click="open = false"></button>
      <template x-for="item of items">
        <option :value="item.value" x-text="item.label"></option>
      </template>
    </div>
  </div>
</template>
```
