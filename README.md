# x-widget

Adds the ability to define widgets using [Alpinejs](https://alpinejs.dev/)

It's implemented using WebComponents but it favors keeping the component state in the scope of the component rather than embedding it as attributes on the dom nodes.

## Usage

```html
<!-- Step 1. Define the Widget -->
<template x-widget="x-button">
  <button x-data="xWidget({label: ''})($el, $data)" x-text="label"></button>
</template>

<!-- Step 2. Use the widget -->
<div x-data="{message: 'Click me'}">
  <x-button :label="message" @click="message='Thanks'"></x-button>
</div>
```

## Installing x-widget

1. Install x-widget npm package:

```bash
npm install x-widget
```

2. Install xWidget plugin for Alpine.js:

```js
import xWidget from 'x-widget'
Alpine.plugin(xWidget)
```

## Using Slots

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

## Widget Data

Widget data is a helper that lets you to define the properties, data types, and the defaults your widget expects.

It supports giving values for properties using attributes, as well as a new `x-prop` mechanism that makes it easy to have two-way binding of scope data and widget properties.

In the example below, clicking on "Close" will set `showDropdown` to false.

```html
<template x-widget="x-dropdown">
  <div x-data="xWidget({ open: false, items: [] })($el, $data)">
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
