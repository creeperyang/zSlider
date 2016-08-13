/**
 * @name zSlider
 * @version 0.0.1
 * @author creeperyang<yangcreeper@hotmail.com>
 * @description A pure JavaScript Carousel/Slider plugin that works well at Mobile/PC.
*/
'use strict';

(function(root, factory) {
    if(typeof define === 'function' && define.amd) {
        // amd
        define([], factory);
    } else if(typeof exports === 'object') {
        // cmd
        module.exports = factory();
    } else {
        // global. In browser, root will be window
        root.Slider = factory();
    }
})(this, function() {

    /**
     * defaults: Slider default config
    */
    var defaults = {
        'current': 0, // which to show when init
        'duration': 0.8, // seconds
        'minPercentToSlide': null, // percent to decide to slide
        'autoplay': true, // autoplay?
        'direction': 'left', // autoplay direction
        'interval': 5 // seconds
    };

    var nextTick = function(fn) {
        setTimeout(fn, 0);
    };

    var capitalizeFirstLetter = function(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    var setCompatibleStyle = (function(style) {
        var prefixes = ['-moz-', '-webkit-', '-o-', '-ms-'];
        var domPrefixes = ['Moz', 'Webkit', 'O', 'ms'];
        var len = prefixes.length;
        function getGoodProp(prop) {
            if(prop in style) {
                return {
                    prop: prop,
                    prefix: prefixes[1] // enforce add `-webkit-`
                };
            } else {
                prop = capitalizeFirstLetter(prop);
                var tmpProp;
                var prefix;
                for(var i = 0; i < len; i++) {
                    tmpProp = domPrefixes[i] + prop;
                    if(tmpProp in style) {
                        prefix = prefixes[i];
                        break;
                    }
                }
                return {
                    prop: tmpProp,
                    prefix: prefix
                };
            }
        }
        return function(el, prop, value) {
            var res = getGoodProp(prop);
            el.style[res.prop] = value;
            if (value) {
                el.style[res.prop] = res.prefix + value;
            }
        };
    })(document.body.style);

    // old way to create event
    var createEvent = function(type, bubbles, cancelable) {
        var e;

        e = document.createEvent('Event');
        e.initEvent(type, bubbles, cancelable);

        return e;
    };

    var setTransition = function(pre, cur, next, preTransition, curTransition, nextTransition) {
        if(typeof preTransition === 'undefined') {
            preTransition = '';
        }
        if(typeof curTransition === 'undefined') {
            curTransition = preTransition;
        }
        if(typeof nextTransition === 'undefined') {
            nextTransition = curTransition;
        }
        setCompatibleStyle(pre, 'transition', preTransition);
        setCompatibleStyle(cur, 'transition', curTransition);
        setCompatibleStyle(next, 'transition', nextTransition);
    };

    var move = function(pre, cur, next, distance, width) {
        setCompatibleStyle(cur, 'transform', 'translate3d(' + distance + 'px, 0, 0)' );
        setCompatibleStyle(pre, 'transform', 'translate3d(' + (distance - width) + 'px, 0, 0)' );
        setCompatibleStyle(next, 'transform', 'translate3d(' + (distance + width) + 'px, 0, 0)' );
    };

    var prepareSlideItem = function(slider, container, list, count, index, width) {
        var realCount = count;
        var lastIndex;
        var item;
        var clone;
        var i;

        if(count === 2) { // clone and insert to dom
            clone = list[0].cloneNode(true);
            container.appendChild(clone);
            list.push(clone);

            clone = list[1].cloneNode(true);
            container.appendChild(clone);
            list.push(clone);

            count = 4;
        }

        lastIndex = count - 1;

        if(index > lastIndex || index < 0) {
            index = 0;
        }
        if(index !== 0) {
            list = list.splice(index, count - index).concat(list);
        }

        list[0].uuid = 0;
        list[lastIndex].uuid = lastIndex;
        setCompatibleStyle(list[0], 'transform', 'translate3d(0, 0, 0)');
        setCompatibleStyle(list[lastIndex], 'transform', 'translate3d(-' + width + 'px, 0, 0)');

        for (i = 1; i < lastIndex; i++) {
            item = list[i];
            item.uuid = i;
            setCompatibleStyle(item, 'transform', 'translate3d(' + width + 'px, 0, 0)');
        }

        slider.container = container;
        slider.list = list;
        slider.realCount = realCount;
        slider.count = count;
        slider.current = index;
    };

    // create and layout indicators
    // http://jsperf.com/createnode-vs-clonenode, use clone instead create
    var prepareIndicator = function(slider, wrapClassName, className, howMany, activeIndex, activeClass) {
        var item = document.createElement('span');
        var indicatorWrap = document.createElement('div');
        var indicators = [];
        var i;

        indicatorWrap.className = wrapClassName || 'z-slide-indicator';

        item.className = className || 'z-slide-dot';
        for(i = 1; i < howMany; i++) {
            indicators.push(indicatorWrap.appendChild(item.cloneNode(false)));
        }
        indicators.push(indicatorWrap.appendChild(item));
        indicators[activeIndex].className = 'z-slide-dot ' + activeClass;

        slider.indicatorWrap = indicatorWrap;
        slider.indicators = indicators;
        slider.container.appendChild(indicatorWrap);

        nextTick(function() {
            indicatorWrap.style.left = (slider.width - getComputedStyle(indicatorWrap).width.replace('px', '')) / 2 + 'px';
        });
    };

    // update indicator style
    var updateIndicator = function(indicators, pre, cur) {
        indicators[pre].className = 'z-slide-dot';
        indicators[cur].className = 'z-slide-dot active';
    };

    // invocated when resize
    var resetStyle = function(slider) {
        var lastIndex = slider.count - 1;
        var width = slider.width;
        var list = slider.list;
        var i;
        var indicatorWrap = slider.indicatorWrap;

        setCompatibleStyle(list[lastIndex], 'transform', 'translate3d(-' + width + 'px, 0, 0)');
        for (i = 1; i < lastIndex; i++) {
            setCompatibleStyle(list[i], 'transform', 'translate3d(' + width + 'px, 0, 0)');
        }
        indicatorWrap.style.left = (width - getComputedStyle(indicatorWrap).width.replace('px', '')) / 2 + 'px';
    };

    // swipestart handler
    var startHandler = function(ev, slider) {
        if(slider.options.autoplay) {
            clearTimeout(slider.timeId);
        }
    };

    // swipemove handler
    var moveHandler = function(ev, slider, diffX) {
        var list = slider.list;
        var cur = list[0];
        var pre = list[list.length - 1];
        var next = list[1];
        setTransition(pre, cur, next, '');
        move(pre, cur, next, diffX, slider.width);
    };

    // swipeend handler
    var endHandler = function(ev, slider, diffX) {
        var direction;
        if(Math.abs(diffX) < slider.compareDistance) {
            direction = 'restore';
        } else {
            direction = diffX < 0 ? 'left' : 'right';
        }
        slider.slide(direction, diffX);
        if(slider.options.autoplay) {
            slider.autoplay();
        }
    };

    // 控件行为添加(Interact with user's touch/mousedown)
    // Bind events compatible with pc and Generate custom events like 'swipe','tap', ...
    // refer to http://blog.mobiscroll.com/working-with-touch-events/
    var bindEvents = function(slider, startHandler, moveHandler, endHandler) {
        var container = slider.container;
        var startX, startY;
        var endX, endY;
        var diffX, diffY;
        var touch;
        var action;
        var scroll;
        var sort;
        var swipe;
        var sortTimer;

        function getCoord(e, c) {
            return /touch/.test(e.type) ? (e.originalEvent || e).changedTouches[0]['page' + c] : e['page' + c];
        }

        function testTouch(e) {
            if (e.type === 'touchstart') {
                touch = true;
            } else if (touch) {
                touch = false;
                return false;
            }
            return true;
        }

        function onStart(ev) {
            if(action || !testTouch(ev)) {
                return;
            }
            action = true;
            startX = getCoord(ev, 'X');
            startY = getCoord(ev, 'Y');
            diffX = 0;
            diffY = 0;
            sortTimer = setTimeout(function() {
                sort = true;
            }, 200);
            startHandler(ev, slider);

            // swipestart
            this.dispatchEvent(createEvent('swipestart', true, true));

            if (ev.type === 'mousedown') {
                ev.preventDefault();
                document.addEventListener('mousemove', onMove, false);
                document.addEventListener('mouseup', onEnd, false);
            }
        }

        function onMove(ev) {
            var customEvent;
            if(!action) {
                return;
            }
            endX = getCoord(ev, 'X');
            endY = getCoord(ev, 'Y');
            diffX = endX - startX;
            diffY = endY - startY;

            if (!sort && !swipe && !scroll) {
                if (Math.abs(diffY) > 10) { // It's a scroll
                    scroll = true;
                    // Android 4.0(maybe more?) will not fire touchend event
                    customEvent = createEvent('touchend', true, true);
                    this.dispatchEvent(customEvent);
                } else if (Math.abs(diffX) > 7) { // It's a swipe
                    swipe = true;
                }
            }
            if (swipe) {
                ev.preventDefault(); // Kill page scroll
                moveHandler(ev, slider, diffX); // Handle swipe
                customEvent = createEvent('swipe', true, true);
                customEvent.movement = {
                    diffX: diffX,
                    diffY: diffY
                };
                container.dispatchEvent(customEvent);
            }
            if(sort) {
                ev.preventDefault();
                customEvent = createEvent('sort', true, true);
                container.dispatchEvent(customEvent);
            }

            if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
                clearTimeout(sortTimer);
            }
        }

        function onEnd(ev) {
            var customEvent;
            if(!action) {
                return;
            }
            action = false;
            if (swipe) {
                // Handle swipe end
                endHandler(ev, slider, diffX);

                // trigger 'swipeend'
                customEvent = createEvent('swipeend', true, true);
                customEvent.customData = {
                    diffX: diffX,
                    diffY: diffY
                };
                container.dispatchEvent(customEvent);
            } else if (sort) {
                // trigger 'sortend'
                customEvent = createEvent('sortend', true, true);
                container.dispatchEvent(customEvent);
            } else if (!scroll && Math.abs(diffX) < 5 && Math.abs(diffY) < 5) { // Tap
                if (ev.type === 'touchend') { // Prevent phantom clicks
                    // ev.preventDefault();
                    // let elements like `a` do default behavior
                }
                // trigger 'tap'
                customEvent = createEvent('tap', true, true);
                container.dispatchEvent(customEvent);
            }
            swipe = false;
            sort = false;
            scroll = false;

            clearTimeout(sortTimer);

            if (ev.type === 'mouseup') {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onEnd);
            }
        }

        container.addEventListener('mousedown', onStart, false);
        container.addEventListener('touchstart', onStart, false);
        container.addEventListener('touchmove', onMove, false);
        container.addEventListener('touchend', onEnd, false);
        container.addEventListener('touchcancel', onEnd, false);
    };

    var resizeHandler = function(slider) {
        if(slider.options.autoplay && slider.timeId !== null) {
            clearTimeout(slider.timeId);
            slider.timeId = null;
        }
        if(slider.resizeTimeId) {
            clearTimeout(slider.resizeTimeId);
        }
        slider.resizeTimeId = setTimeout(function() {
            slider.width = slider.container.clientWidth;
            if(slider.options.minPercentToSlide) {
                slider.compareDistance = slider.width * slider.options.minPercentToSlide;
            }
            resetStyle(slider);
            if(slider.options.autoplay) {
                slider.autoplay();
            }
        }, 200);
    };

    /**
     * @name    Slider 轮播
     * @param   {String/DOM}  containerSelector  container选择器，或DOM元素。
     * @param   {String/Array}  itemSelector  item选择器，或DOM元素数组。
     * @param   {Object}  配置项，可选。
     * @return  {Object}  Slider实例
     */
    function Slider(containerSelector, itemSelector, options) {
        var container;
        var list;
        var count;
        var width;
        var self;

        if(!containerSelector || !itemSelector) {
            console.error('Slider: arguments error.');
            return this;
        }
        container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
        if(!container) {
            console.error('Slider: cannot find container.');
            return this;
        }
        list = typeof itemSelector === 'string' ? container.querySelectorAll(itemSelector) : itemSelector;
        if(!list || !list.length) {
            console.error('Slider: no item inside container.');
            return this;
        }

        self = this;
        // extend options
        options = options || {};
        for (var name in defaults) {
            if (options[name] === undefined) {
                options[name] = defaults[name];
            }
        }
        // list is a StaticNodeList rather than a real array, convert it.
        list = Array.prototype.slice.call(list);
        count = list.length;
        if(count === 1) {
            return;
        }
        // container width
        width = container.clientWidth;
        this.options = options;
        this.compareDistance = 0;
        this.timeId = null;
        this.width = width;
        if(options.minPercentToSlide) {
            this.compareDistance = width * options.minPercentToSlide;
        }

        // setup slider
        prepareSlideItem(this, container, list, count, options.current, width);
        prepareIndicator(this, 'z-slide-indicator', 'z-slide-dot', this.realCount || count, this.current, 'active');
        bindEvents(this, startHandler, moveHandler, endHandler);

        // resize
        window.addEventListener('resize', function() {
            resizeHandler(self);
        }, false);
        // auto play
        if(options.autoplay) {
            this.interval = Math.max(2000, options.interval * 1000);
            this.autoplay();
        }
    }

    Slider.version = '0.0.1';
    Slider.defaults = defaults;

    Slider.prototype.autoplay = function() {
        var interval = this.interval;
        var self = this;
        this.timeId = setTimeout(function() {
            self.slide();
            self.autoplay();
        }, interval);
    };

    Slider.prototype.slide = function(direction, diffX) {
        var list = this.list;
        var current = this.current;
        var count = this.count;
        var width = this.width;
        var duration = this.options.duration;
        var transitionText;
        var cur, pre, next, customEvent;
        direction = direction || this.options.direction;
        diffX = diffX || 0;

        if(direction === 'left') {
            list.push(list.shift());
            this.current = (current + 1) % count;
            duration *= 1 - Math.abs(diffX) / width;
        } else if(direction === 'right'){
            list.unshift(list.pop());
            this.current = (current - 1 + count) % count;
            duration *= 1 - Math.abs(diffX) / width;
        } else {
            duration *= Math.abs(diffX) / width;
        }
        cur = list[0];
        pre = list[count - 1];
        next = list[1];

        transitionText = 'transform ' + duration + 's linear';
        if(direction === 'left' || (direction === 'restore' && diffX > 0)) {
            setTransition(pre, cur, next, transitionText, transitionText, '');
        } else if(direction === 'right' || (direction === 'restore' && diffX < 0)) {
            setTransition(pre, cur, next, '', transitionText, transitionText);
        }
        move(pre, cur, next, 0, width);

        if(this.realCount === 2) {
            this.current = this.current % 2;
            updateIndicator(this.indicators, current % 2 , this.current);
        } else {
            updateIndicator(this.indicators, current, this.current);
        }

        customEvent = createEvent('slideend', true, true);
        customEvent.slider = this;
        customEvent.currentItem = cur;
        this.container.dispatchEvent(customEvent);
    };

    return Slider;
});