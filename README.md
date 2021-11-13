# x-component

Adds the ability to define components using Alpinejs.

## Usage

### Definition

```html
<template x-component="x-button">
<button><slot><span x-text="$attrs.label"></span></button>
</template>
```

### Usage

```html
<x-button label="Click me!"></x-button>
```

## Features

# Slots

```html
<template x-component="x-panel">
  <div>
    <div>
      <slot name="header"></slot>
    </div>
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

## Magics

`$slots` - A way of specifying if a slot has been given.

`$attrs` - The attributes of the component.

`$props` - The properties given to the component (may not be needed).
