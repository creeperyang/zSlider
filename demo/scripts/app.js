var slider1 = new Slider('#slider1', '.z-slide-item', {
    interval: 12,
    duration: 1
});
var slider2Dom = document.getElementById('slider2');
var slider2 = new Slider(slider2Dom, '.z-slide-item', {
    interval: 6,
    minPercentToSlide: 0.2
});
slider2Dom.addEventListener('tap', function() {
    var span = document.querySelector('ul.event-list li:nth-child(1) span');
    span.textContent = 'yes, time:' + Date.now();
});
slider2Dom.addEventListener('sort', function() {
    var span = document.querySelector('ul.event-list li:nth-child(2) span');
    span.textContent = 'yes, time:' + Date.now();
});
slider2Dom.addEventListener('slideend', function() {
    var span = document.querySelector('ul.event-list li:nth-child(3) span');
    span.textContent = 'yes, time:' + Date.now();
});
slider2Dom.addEventListener('sortend', function() {
    var span = document.querySelector('ul.event-list li:nth-child(4) span');
    span.textContent = 'yes, time:' + Date.now();
});
slider2Dom.addEventListener('swipestart', function() {
    var span = document.querySelector('ul.event-list li:nth-child(5) span');
    span.textContent = 'yes, time:' + Date.now();
});
slider2Dom.addEventListener('swipe', function() {
    var span = document.querySelector('ul.event-list li:nth-child(6) span');
    span.textContent = 'yes, time:' + Date.now();
});
slider2Dom.addEventListener('swipeend', function() {
    var span = document.querySelector('ul.event-list li:nth-child(7) span');
    span.textContent = 'yes, time:' + Date.now();
});