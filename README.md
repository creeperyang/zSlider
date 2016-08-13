# zSlider

> A pure JavaScript Carousel/Slider plugin that works well at Mobile/PC.

## Getting Started
This plugin wrote in pure JavaScript and has no dependencies like `jQuery`.

Install the plugin via bower

```shell
bower install zSlider --save
```

Once the plugin has been installed, you can use it easily:


## Usage

### Overview
You can just generate a slider with one line:

```js
var slider = new Slider('#slider1', '.z-slide-item');
```

```html
<div class="z-slide-wrap top" id='slider1'>
    <ul class="z-slide-content">
        <li class="z-slide-item"></li>
        <li class="z-slide-item"></li>
        <li class="z-slide-item"></li>
    </ul>
</div>
```

### Options

When init with `new Slider(container, slideItems, option);`, a optional config can be used. What can be config?

```js
var option = {
    'current': 0, // which to show when init
    'duration': 0.8, // animation duration, seconds
    'minPercentToSlide': null, // percent to decide to slide
    'autoplay': true, // autoplay?
    'direction': 'left', // autoplay direction
    'interval': 5 // seconds
};
```

### Usage Examples

There is a built-in demo:

```shell
git clone git@github.com:creeperyang/zSlider.git
cd zSlider
npm install
grunt serve
```

## Release History
2015-04-30&nbsp;&nbsp;&nbsp;&nbsp;`v0.0.1`&nbsp;&nbsp;&nbsp;&nbsp;init

## License
Copyright (c) 2015 creeperyang. Licensed under the MIT license.
