/**
 * Protect window.console method calls, e.g. console is not defined on IE
 * unless dev tools are open, and IE doesn't define console.debug
 * http://stackoverflow.com/questions/3326650/console-is-undefined-error-for-internet-explorer
 */
(function () {
    if (!window.console) {
        window.console = {};
    }
    // union of Chrome, FF, IE, and Safari console methods
    var m = [
        "log", "info", "warn", "error", "debug", "trace", "dir", "group",
        "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
        "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
    ];
    // define undefined methods as noops to prevent errors
    for (var i = 0; i < m.length; i++) {
        if (!window.console[m[i]]) {
            window.console[m[i]] = function () {
            };
        }
    }
})();

/**
 * Donut-Pie Chart library v1.0, based on Raphaël JS by Dmitry Baranovskiy (http://raphaeljs.com)
 *
 * Copyright (c) 2014 Alexander Zagniotov
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
(function () {
    function DonutPieChart(paper, cx, cy, R1, opts) {
        opts = opts || {};
        var rad = (Math.PI / 180),
            WHITE_COLOR = "#ffffff",
            BOUNCE_EFFECT_NAME = "bounce",
            data = opts.data || [],
            colors = opts.colors || [],
            gradient = opts.gradient || false,
            hoverTitles = opts.hoverTitles || [],
            handles = opts.handles || [],
            hrefs = opts.hrefs || [],
            make3d = (opts.make3d && typeof opts.make3d === 'object') || false,
            size3d = (make3d && opts.make3d.height ? Math.abs(opts.make3d.height) : 25),
            R2 = make3d ? R1 / 2 : R1,
            donut = (opts.donut && typeof opts.donut === 'object') || false,
            donutFill = (donut && opts.donut.fill ? opts.donut.fill : WHITE_COLOR),
            donutDiameter = (donut && opts.donut.diameter ? Math.abs(opts.donut.diameter) : 0.5),
            legend = (opts.legend && typeof opts.legend === 'object') || false,
            legendLabels = (legend && opts.legend.labels ? opts.legend.labels : []),
            legendXstart = (legend && opts.legend.x ? opts.legend.x : cx + R1 + 30),
            legendYstart = (legend && opts.legend.y ? opts.legend.y : cy - R1),
            legendLabelXstart = legendXstart + 38,
            legendLabelYstart = legendYstart,
            fontSize = (legend && opts.legend.fontSize ? opts.legend.fontSize : "14"),
            fontFamily = (legend && opts.legend.fontFamily ? opts.legend.fontFamily : "Arial"),
            cursor = opts.cursor || "normal",
            marker = opts.marker || "circle",
            growingOnLoad = opts.growingOnLoad || false,
            sliceHoverEffect = opts.sliceHoverEffect || "",
            shiftDistance = 25,
            total = 0,
            animationDelay = 600,
            slices = paper.set(),
            markers = paper.set(),
            descriptions = paper.set(),
            _index,
            bucket = [];

        for (_index = 0; _index < data.length; _index++) {
            total += data[_index];
        }

        for (_index = 0; _index < data.length; _index++) {
            bucket[_index] = {};

            var startx = cx, starty = cy,
                value = data[_index] || 0,
                color = colors[_index] || "#FF0000",
                label = legendLabels[_index] || "",
                title = hoverTitles[_index] || "",
                href = hrefs[_index] || "",
                handle = handles[_index] || "",
                sliceAngle = 360 * value / total,
                endAngle = (_index === 0 ? 0 : endAngle),
                startAngle = endAngle,
                endAngle = startAngle + sliceAngle,
                shiftx = startx + shiftDistance * Math.cos((startAngle + (endAngle - startAngle) / 2) * rad),
                shifty = starty + shiftDistance * Math.sin((startAngle + (endAngle - startAngle) / 2) * rad);

            bucket[_index].color = color;
            bucket[_index].label = label;
            bucket[_index].title = title;
            bucket[_index].href = href;
            bucket[_index].handle = handle;
            bucket[_index].startAngle = startAngle;
            bucket[_index].endAngle = endAngle;
            bucket[_index].startx = startx;
            bucket[_index].starty = starty;
            bucket[_index].shiftx = shiftx;
            bucket[_index].shifty = shifty;
            bucket[_index].sliceOrigin = [startx, starty, R1, startAngle, endAngle];
            bucket[_index].sliceOriginZero = [startx, starty, R1, 0, 0];

            if (make3d) {
                bucket[_index].arcOrigin = bucket[_index].sliceOrigin;
                bucket[_index].wallOneOrigin = [startx, starty, R1, startAngle];
                bucket[_index].wallTwoOrigin = [startx, starty, R1, endAngle];
                bucket[_index].arcOriginZero = bucket[_index].sliceOriginZero;
                bucket[_index].wallOneOriginZero = [startx, starty, R1, 0];
                bucket[_index].wallTwoOriginZero = [startx, starty, R1, 0];
            }
        }

        paper.customAttributes.slice = function (startx, starty, R1, startAngle, endAngle) {

            if (startAngle === 0 && endAngle === 0) {
                return [];
            }

            var R2 = make3d ? R1 / 2 : R1,
                x1 = startx + R1 * Math.cos(startAngle * rad),
                x2 = startx + R1 * Math.cos(endAngle * rad),
                y1 = starty + R2 * Math.sin(startAngle * rad),
                y2 = starty + R2 * Math.sin(endAngle * rad),
                largeArcFlag = (Math.abs(endAngle - startAngle) > 180),
                sweepFlag = 1; // positive angle

            return {
                path: [
                    ["M", startx, starty ],
                    ["L", x1, y1 ],
                    ["A", R1, R2, 0, +largeArcFlag, sweepFlag, x2, y2 ],
                    ["Z"]
                ]
            };
        }

        paper.customAttributes.arc = function (startx, starty, R1, startAngle, endAngle) {

            if (startAngle === 0 && endAngle === 0) {
                return [];
            } else if (startAngle < 180 && endAngle > 180) {
                endAngle = 180;
            }

            var R2 = make3d ? R1 / 2 : R1,
                x1start = startx + R1 * Math.cos(startAngle * rad),
                y1start = starty + R2 * Math.sin(startAngle * rad),
                x1end = startx + R1 * Math.cos(startAngle * rad),
                y1end = (starty + size3d) + R2 * Math.sin(startAngle * rad),
                x2start = startx + R1 * Math.cos((startAngle + (endAngle - startAngle)) * rad),
                y2start = starty + R2 * Math.sin((startAngle + (endAngle - startAngle)) * rad),
                x2end = startx + R1 * Math.cos((startAngle + (endAngle - startAngle)) * rad),
                y2end = (starty + size3d) + R2 * Math.sin((startAngle + (endAngle - startAngle)) * rad),
                largeArcFlag = (Math.abs(endAngle - startAngle) > 180),
                sweepFlagPositiveAngle = 1,
                sweepFlagNegativeAngle = 0;

            return {
                path: [
                    ["M", x1start, y1start ],
                    ["L", x1end, y1end ],
                    ["A", R1, R2, 0, +largeArcFlag, sweepFlagPositiveAngle, x2end, y2end ],
                    ["L", x2start, y2start ],
                    ["A", R1, R2, 0, +largeArcFlag, sweepFlagNegativeAngle, x1start, y1start ],
                    ["Z"]
                ]
            };
        }

        paper.customAttributes.outline = function (startx, starty, R1, startAngle, endAngle) {
            var innerR1 = R1 + (make3d ? 3 : 1),
                innerR2 = (make3d ? innerR1 / 2 : innerR1),
                outerR1 = innerR1 + (make3d ? 14 : 10),
                outerR2 = innerR2 + (make3d ? 6 : 10),
                x1start = cx + innerR1 * Math.cos(startAngle * rad),
                y1start = cy + innerR2 * Math.sin(startAngle * rad),
                x1end = cx + outerR1 * Math.cos(startAngle * rad),
                y1end = cy + outerR2 * Math.sin(startAngle * rad),
                x2start = cx + innerR1 * Math.cos((startAngle + (endAngle - startAngle)) * rad),
                y2start = cy + innerR2 * Math.sin((startAngle + (endAngle - startAngle)) * rad),
                x2end = cx + outerR1 * Math.cos((startAngle + (endAngle - startAngle)) * rad),
                y2end = cy + outerR2 * Math.sin((startAngle + (endAngle - startAngle)) * rad),
                flag = (Math.abs(endAngle - startAngle) > 180);

            return {
                path: [
                    ["M", x1start, y1start ],
                    ["L", x1end, y1end ],
                    ["A", outerR1, outerR2, 0, +flag, 1, x2end, y2end ],
                    ["L", x2start, y2start ],
                    ["A", innerR1, innerR2, 0, +(flag), 0, x1start, y1start ],
                    ["Z"]
                ]
            }
        };

        paper.customAttributes.wall = function (startx, starty, R1, angle) {
            if (angle === 0) {
                return [];
            }

            var R2 = make3d ? R1 / 2 : R1,
                x = startx + R1 * Math.cos(angle * rad),
                y = starty + R2 * Math.sin(angle * rad);

            return {
                path: [
                    ["M", startx, starty ],
                    ["L", startx, starty + size3d ],
                    ["L", x, y + size3d ],
                    ["L", x, y ],
                    ["Z"]
                ]
            };
        }

        for (_index = 0; _index < data.length; _index++) {
            var obj = bucket[_index];
            var grow = growingOnLoad === true;
            if (make3d) {
                bucket[_index].wallOne = paper.path().attr(attr("wall", obj, (grow ? obj.wallOneOriginZero : obj.wallOneOrigin)));
                bucket[_index].wallTwo = paper.path().attr(attr("wall", obj, (grow ? obj.wallTwoOriginZero : obj.wallTwoOrigin)));
                bucket[_index].arc = paper.path().attr(attr("arc", obj, (grow ? obj.arcOriginZero : obj.arcOrigin)));
            }
            bucket[_index].slice = paper.path().attr(attr("slice", obj, (grow ? obj.sliceOriginZero : obj.sliceOrigin)));
            bucket[_index].slice.handle = bucket[_index].handle;
            if (sliceHoverEffect.indexOf("outline") !== -1) {
                var outline = paper.path().attr(attr("outline", obj, bucket[_index].sliceOrigin));
                bucket[_index].slice.outline = outline;
                outline.hide();
            }
            slices.push(bucket[_index].slice);

            bindEffectHandlers(bucket[_index]);
            renderChartLegend(bucket[_index]);
        }

        if (make3d) {
            for (_index = 0; _index < data.length; _index++) {
                var obj = bucket[_index];
                if (obj.startAngle >= 90 && obj.startAngle < 270) {
                    // order is important
                    bucket[_index].wallOne.toBack();
                    bucket[_index].wallTwo.toBack();
                } else if (obj.endAngle > 270 && obj.endAngle <= 360) {
                    bucket[_index].wallOne.toBack();
                } else if (obj.endAngle > 0 && obj.endAngle < 90) {
                    bucket[_index].wallTwo.toFront();
                }

                if (obj.startAngle >= 0 && obj.startAngle < 180) {
                    bucket[_index].arc.toFront();
                } else {
                    bucket[_index].arc.toBack();
                }
                bucket[_index].slice.toFront();
            }
        }

        function attr(shape, bucket, data) {
            var baseAttr = {
                "stroke": WHITE_COLOR,
                "stroke-width": 1.5,
                "stroke-linejoin": "round",
                "fill": fill(bucket.color),
                "title": bucket.title,
                "cursor": cursor};
            baseAttr[shape] = data;

            return baseAttr;
        }

        if (growingOnLoad) {
            var timeout = setTimeout(function () {

                for (_index = 0; _index < bucket.length; _index++) {
                    bucket[_index].slice.animate({slice: bucket[_index].sliceOrigin}, animationDelay, "backOut");

                    if (make3d) {
                        bucket[_index].arc.animate({arc: bucket[_index].arcOrigin}, animationDelay, "backOut");
                        bucket[_index].wallOne.animate({wall: bucket[_index].wallOneOrigin}, animationDelay, "backOut");
                        bucket[_index].wallTwo.animate({wall: bucket[_index].wallTwoOrigin}, animationDelay, "backOut");
                    }
                }
                clearTimeout(timeout);
            }, 200);
        }

        function bindEffectHandlers(bucket) {
            var shortAnimationDelay = animationDelay / 6,
                shiftOutCoordinates = [bucket.shiftx, bucket.shifty, R1, bucket.startAngle, bucket.endAngle],
                startCoordinates = [bucket.startx, bucket.starty, R1, bucket.startAngle, bucket.endAngle],
                scaleOut = {transform: "s1.1 1.1 " + startx + " " + starty},
                scaleNormal = {transform: "s1 1 " + startx + " " + starty},
                transformOut = {transform: "T" + (bucket.shiftx - cx) + "," + (bucket.shifty - cy)},
                transformNormal = {transform: "T" + 0 + "," + 0};

            if (sliceHoverEffect === "shift-fast") {
                var shiftOut = Raphael.animation(transformOut, shortAnimationDelay);
                var shiftIn = Raphael.animation(transformNormal, shortAnimationDelay);
                Animator(bucket, make3d, shiftOut, shiftIn,
                    {
                        arc: shiftOut,
                        wallOne: shiftOut,
                        wallTwo: shiftOut
                    },
                    {
                        arc: shiftIn,
                        wallOne: shiftIn,
                        wallTwo: shiftIn
                    }).bind();

            } else if (sliceHoverEffect === "shift-slow") {
                var shiftOut = Raphael.animation(transformOut, animationDelay);
                var shiftIn = Raphael.animation(transformNormal, animationDelay);
                Animator(bucket, make3d, shiftOut, shiftIn,
                    {
                        arc: shiftOut,
                        wallOne: shiftOut,
                        wallTwo: shiftOut
                    },
                    {
                        arc: shiftIn,
                        wallOne: shiftIn,
                        wallTwo: shiftIn
                    }).bind();

            } else if (sliceHoverEffect === "shift-bounce") {
                Animator(bucket, make3d,
                    Raphael.animation({slice: shiftOutCoordinates}, shortAnimationDelay),
                    Raphael.animation({slice: startCoordinates}, animationDelay, BOUNCE_EFFECT_NAME),
                    {
                        arc: Raphael.animation({arc: shiftOutCoordinates}, shortAnimationDelay),
                        wallOne: Raphael.animation({wall: [bucket.shiftx, bucket.shifty, R1, bucket.startAngle]}, shortAnimationDelay),
                        wallTwo: Raphael.animation({wall: [bucket.shiftx, bucket.shifty, R1, bucket.endAngle]}, shortAnimationDelay)
                    },
                    {
                        arc: Raphael.animation({arc: startCoordinates}, animationDelay, BOUNCE_EFFECT_NAME),
                        wallOne: Raphael.animation({wall: [bucket.startx, bucket.starty, R1, bucket.startAngle]}, animationDelay, BOUNCE_EFFECT_NAME),
                        wallTwo: Raphael.animation({wall: [bucket.startx, bucket.starty, R1, bucket.endAngle]}, animationDelay, BOUNCE_EFFECT_NAME)
                    }).bind();
            } else if (sliceHoverEffect === "scale") {
                Animator(bucket, make3d,
                    scaleOut,
                    scaleNormal,
                    {
                        arc: scaleOut,
                        wallOne: scaleOut,
                        wallTwo: scaleOut
                    },
                    {
                        arc: scaleNormal,
                        wallOne: scaleNormal,
                        wallTwo: scaleNormal
                    }).bind();
            } else if (sliceHoverEffect === "scale-bounce") {
                Animator(bucket, make3d,
                    scaleOut,
                    Raphael.animation(scaleNormal, animationDelay, BOUNCE_EFFECT_NAME),
                    {
                        arc: scaleOut,
                        wallOne: scaleOut,
                        wallTwo: scaleOut
                    },
                    {
                        arc: Raphael.animation(scaleNormal, animationDelay, BOUNCE_EFFECT_NAME),
                        wallOne: Raphael.animation(scaleNormal, animationDelay, BOUNCE_EFFECT_NAME),
                        wallTwo: Raphael.animation(scaleNormal, animationDelay, BOUNCE_EFFECT_NAME)
                    }).bind();
            } else if (sliceHoverEffect === "outline") {
                bucket.slice.mouseover(function () {
                    bucket.slice.outline.show();
                    bucket.slice.outline.toFront();
                });

                bucket.slice.mouseout(function () {
                    bucket.slice.outline.hide();
                });
            } else {
                console.error("Unknown hover effect name: " + sliceHoverEffect);
            }
        }

        if (donut && !make3d) {
            if (donutDiameter > 0.9) {
                donutDiameter = 0.9;
            }
            paper.ellipse(cx, cy, Math.ceil(R1 * donutDiameter), Math.ceil(R2 * donutDiameter)).attr({"stroke": "none", "fill": donutFill});
        }

        function renderChartLegend(bucket) {
            var label = bucket.label,
                color = bucket.color;
            if (label !== "") {
                legendLabelYstart += 10;
                var radius = 9;
                var markerElement = null;
                var markerAttrs = {"title": label, "fill": color, "fill-rule": "nonzero", "stroke": WHITE_COLOR, "stroke-width": "0.1", "cursor": cursor};
                if (marker === "rect") {
                    markerElement = paper.path("M " + legendXstart + ", " + legendYstart + " l 28,0  0,16  -28,0  0,-16z");
                } else if (marker === "circle") {
                    markerElement = paper.circle(legendXstart + (2 * radius), legendYstart + radius, radius);
                } else if (marker === "ellipse") {
                    radius = 10;
                    markerElement = paper.ellipse(legendXstart + (2 * radius), legendYstart + radius, 1.25 * radius, radius * 0.75);
                }

                if (markerElement != null) {
                    markerElement.attr(markerAttrs);
                    markerElement.handle = bucket.handle;
                    markers.push(markerElement);
                }

                var text = paper.text(legendLabelXstart, legendLabelYstart, label);
                text.attr({"title": label, "font-family": fontFamily, "font-weight": "normal", "fill": "#474747", "cursor": cursor, "font-size": fontSize, "text-anchor": "start"});
                text.handle = bucket.handle;
                descriptions.push(text);

                legendYstart += 30;
                legendLabelYstart = legendYstart;
            }
        }

        function fill(color) {
            if (!gradient) {
                return color;
            } else {
                return PieColor(color, 90).gradient(20, 14);
            }
        }

        return {slices: slices.items, markers: markers.items, descriptions: descriptions.items};
    };

    var Animator = function Animator(bucket, make3d, sliceAnimationOut, sliceAnimationIn, bordersAnimationOut, bordersAnimationIn) {
        if (!(this instanceof Animator)) {
            return new Animator(bucket, make3d, sliceAnimationOut, sliceAnimationIn, bordersAnimationOut, bordersAnimationIn);
        }
        this._bucket = bucket;
        this._make3d = make3d;
        this._slice = bucket.slice;
        this._arc = bucket.arc;
        this._wallOne = bucket.wallOne;
        this._wallTwo = bucket.wallTwo;
        this._sliceAnimationOut = sliceAnimationOut;
        this._sliceAnimationIn = sliceAnimationIn;
        this._bordersAnimationOut = bordersAnimationOut;
        this._bordersAnimationIn = bordersAnimationIn;
    };

    Animator.prototype = {
        bind: function () {
            var self = this;
            this._slice.mouseover(function () {
                self._slice.stop();
                self._slice.animate(self._sliceAnimationOut);
                if (self._make3d) {
                    self._arc.stop();
                    self._wallOne.stop();
                    self._wallTwo.stop();
                    self._arc.animateWith(self._slice, self._sliceAnimationOut, self._bordersAnimationOut.arc);
                    self._wallOne.animateWith(self._slice, self._sliceAnimationOut, self._bordersAnimationOut.wallOne);
                    self._wallTwo.animateWith(self._slice, self._sliceAnimationOut, self._bordersAnimationOut.wallTwo);

                    if (self._bucket.startAngle >= 0 && self._bucket.startAngle < 180) {
                        self._arc.toFront();
                        self._slice.toFront();
                    } else {
                        self._arc.toBack();
                    }
                }
            });

            this._slice.mouseout(function () {
                self._slice.animate(self._sliceAnimationIn);
                if (self._make3d) {
                    self._arc.animateWith(self._slice, self._sliceAnimationIn, self._bordersAnimationIn.arc);
                    self._wallOne.animateWith(self._slice, self._sliceAnimationIn, self._bordersAnimationIn.wallOne);
                    self._wallTwo.animateWith(self._slice, self._sliceAnimationIn, self._bordersAnimationIn.wallTwo);
                }
            });
        }
    }

    var PieColor = function PieColor(color, gradientAngle) {
        if (!(this instanceof PieColor)) {
            return new PieColor(color, gradientAngle);
        }
        this._originalColor = color;
        this._gradientAngle = gradientAngle;
        this._rgb = Raphael.getRGB(color);
    };

    // Adopted from https://bgrins.github.io/TinyColor/
    PieColor.prototype = {
        toHsl: function () {
            var r = this._rgb.r / 255,
                g = this._rgb.g / 255,
                b = this._rgb.b / 255,
                max = Math.max(r, g, b),
                min = Math.min(r, g, b),
                h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }
            return {h: h, s: s, l: l};
        },

        lighten: function (amount) {
            amount = (amount === 0 || amount < 0) ? 0 : (amount || 10);
            var hsl = this.toHsl();
            hsl.l += amount / 100;
            hsl.l = Math.min(1, Math.max(0, hsl.l));

            return Raphael.hsl2rgb(hsl.h, hsl.s, hsl.l)
        },

        darken: function (amount) {
            amount = (amount === 0 || amount < 0) ? 0 : (amount || 10);
            var hsl = this.toHsl();
            hsl.l -= amount / 100;
            hsl.l = Math.min(1, Math.max(0, hsl.l));

            return Raphael.hsl2rgb(hsl.h, hsl.s, hsl.l)
        },

        gradient: function (darkAmount, lightAmount) {
            return this._gradientAngle + "-" + this.darken(darkAmount) + "-" + this.lighten(lightAmount);
        }
    }

    Raphael.fn.donutpiechart = function (cx, cy, R, opts) {
        return new DonutPieChart(this, cx, cy, R, opts);
    }
})();
