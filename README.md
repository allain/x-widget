# x-widget

Adds the ability to define web widgets using Alpinejs.

## Basic Usage

```html
<!-- Define the Widget using the x-widget directive -->
<template x-widget="x-button">
<button><slot><span x-text="label"></span></button>
</template>

<!-- Use the widget -->
<x-button x-data="{label: 'Click me!'}"></x-button>
<x-button x-data="{label: 'Click me!'}"></x-button>
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
  <template slot="header">
    <h1>Panel Header</h1>
  </template>
  <!-- Default Slot -->
  <template>
    <p>Panel Content</p>
  </template>
</x-panel>
```

### Optional Data Controller

The data controller is an optional feature that allows you to define the properties, their data types, and the defaults your widget expects.

It supports giving values for properties using attributes, as well as a new `x-prop` mechanism.

Normally when you bind an attribute to an element it must serialize it to a string. `x-prop:` allows you to bypass this and provide the value directly.

In addition, `x-prop` provide two way binding. In the example below, that means clicking on "close" will set showDropdown to false.

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

If you don't like the look of having the widget's spec in the DOM, you can do this:

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
