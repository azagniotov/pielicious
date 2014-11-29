/**
 * http://stackoverflow.com/questions/3326650/console-is-undefined-error-for-internet-explorer
 */
(function () {
    "use strict";
    /*global window, Raphael, console */
    // union of Chrome, FF, IE, and Safari console methods
    var m = [
            "log", "info", "warn", "error", "debug", "trace", "dir", "group",
            "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
            "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
        ],
        index,
        noOpFunction = function () {
            return;
        };

    if (window && !window.console) {
        window.console = {};
    }
    // define undefined methods as no-ops to prevent errors
    for (index = 0; index < m.length; index += 1) {
        if (!window.console[m[index]]) {
            window.console[m[index]] = noOpFunction;
        }
    }
}());

/**
 * @license
 * Pielicious: donut-pie charting library, based on Raphaël JS by Dmitry Baranovskiy (http://raphaeljs.com)
 *
 * Copyright (c) 2014 Alexander Zagniotov
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
(function () {
    "use strict";

    function Pielicious(paper, cx, cy, R1, opts) {
        opts = opts || {};
        var RADIAN = (Math.PI / 180),
            WHITE_COLOR = "#ffffff",
            BOUNCE_EFFECT_NAME = "bounce",
            BACKOUT_EFFECT_NAME = "backOut",
            ELASTIC_EFFECT_NAME = "elastic",
            data = opts.data || [],
            wholePie = (data && data.length === 1) || false,
            slicedPie = !wholePie,
            gradient = (opts.gradient && typeof opts.gradient === 'object') || false,
            gradientDarkness = (gradient && opts.gradient.darkness ? opts.gradient.darkness : 0),
            gradientLightness = (gradient && opts.gradient.lightness ? opts.gradient.lightness : 0),
            gradientDegrees = (gradient && opts.gradient.degrees ? Math.abs(opts.gradient.degrees) : 180),
            colors = opts.colors || [],
            titles = opts.titles || [],
            handles = opts.handles || [],
            hrefs = opts.hrefs || [],
            threeD = (opts.threeD && typeof opts.threeD === 'object') || false,
            size3d = (threeD && opts.threeD.height ? Math.abs(opts.threeD.height) : 25),
            donut = (opts.donut && typeof opts.donut === 'object') || false,
            donutDiameter = (donut && opts.donut.diameter ? (Math.abs(opts.donut.diameter) > 0.9 ? 0.9 : Math.abs(opts.donut.diameter)) : 0.5),
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
            evolution = opts.evolution || false,
            easing = opts.easing || "",
            shiftDistance = (threeD ? 15 : 10),
            total = 0,
            animationDelay = (slicedPie ? 600 : 1500),
            slices = paper.set(),
            markers = paper.set(),
            descriptions = paper.set(),
            index,
            bucket = [],
            startX = cx,
            startY = cy,
            endAngle = 0,
            startAngle = endAngle,
            timeout,
            currentBucket,
            currentSliceOutline,
            currentValue,
            currentColor,
            currentLabel,
            currentTitle,
            currentHref,
            currentHandle,
            currentSliceAngle,
            currentSliceShiftX,
            currentSliceShiftY,
            Animator = function Animator(bucket, threeD, sliceAnimationOut, sliceAnimationIn, bordersAnimationOut, bordersAnimationIn) {
                if (!(this instanceof Animator)) {
                    return new Animator(bucket, threeD, sliceAnimationOut, sliceAnimationIn, bordersAnimationOut, bordersAnimationIn);
                }
                this.bucket = bucket;
                this.threeD = threeD;
                this.slice = bucket.slice;
                this.arc = bucket.arc;
                this.wallOne = bucket.wallOne;
                this.wallTwo = bucket.wallTwo;
                this.sliceAnimationOut = sliceAnimationOut;
                this.sliceAnimationIn = sliceAnimationIn;
                this.bordersAnimationOut = bordersAnimationOut;
                this.bordersAnimationIn = bordersAnimationIn;
            },

        // Adopted from https://bgrins.github.io/TinyColor/
            PieColor = function PieColor(color, gradientAngle) {
                if (!(this instanceof PieColor)) {
                    return new PieColor(color, gradientAngle);
                }
                var angle = gradientAngle,
                    rgb = Raphael.getRGB(color),
                    toHsl = function () {
                        var r = rgb.r / 255,
                            g = rgb.g / 255,
                            b = rgb.b / 255,
                            max = Math.max(r, g, b),
                            min = Math.min(r, g, b),
                            h,
                            s,
                            l = (max + min) / 2,
                            d = max - min;

                        if (max === min) {
                            h = s = 0; // achromatic
                        } else {
                            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                            if (max === r) {
                                h = (g - b) / d + (g < b ? 6 : 0);
                            } else if (max === g) {
                                h = (b - r) / d + 2;
                            } else if (max === b) {
                                h = (r - g) / d + 4;
                            }
                            h /= 6;
                        }
                        return {h: h, s: s, l: l};
                    },

                    lighten = function (amount) {
                        amount = (amount === 0 || amount < 0) ? 0 : (amount || 10);
                        var hsl = toHsl();
                        hsl.l += amount / 100;
                        hsl.l = Math.min(1, Math.max(0, hsl.l));

                        return Raphael.hsl2rgb(hsl.h, hsl.s, hsl.l);
                    },

                    darken = function (amount) {
                        amount = (amount === 0 || amount < 0) ? 0 : (amount || 10);
                        var hsl = toHsl();
                        hsl.l -= amount / 100;
                        hsl.l = Math.min(1, Math.max(0, hsl.l));

                        return Raphael.hsl2rgb(hsl.h, hsl.s, hsl.l);
                    };

                this.gradient = function (darkAmount, lightAmount) {
                    return angle + "-" + darken(darkAmount) + "-" + lighten(lightAmount);
                };
            },

            RaphaelConfigurator = function RaphaelConfigurator(paper) {
                if (!(this instanceof RaphaelConfigurator)) {
                    return new RaphaelConfigurator(paper);
                }
                var raphael = paper,
                    customAttribs = raphael.customAttributes || {},
                    calculateX = function (startX, R, angle) {
                        return startX + R * Math.cos(angle * RADIAN);
                    },
                    calculateAngledX = function (startX, R, startAngle, endAngle) {
                        return startX + R * Math.cos((startAngle + (endAngle - startAngle)) * RADIAN);
                    },
                    calculateY = function (startY, R, angle) {
                        return startY + R * Math.sin(angle * RADIAN);
                    },
                    calculateAngledY = function (startY, R, startAngle, endAngle) {
                        return startY + R * Math.sin((startAngle + (endAngle - startAngle)) * RADIAN);
                    };

                this.configure = function () {


                    customAttribs.slice = function (startX, startY, R1, startAngle, endAngle) {
                        if (startAngle === 0 && endAngle === 0) {
                            return [];
                        }

                        var R2 = threeD ? R1 / 2 : R1,
                            innerR1 = (R1 * donutDiameter),
                            innerR2 = (R2 * donutDiameter),
                            x1start = calculateX(startX, innerR1, startAngle),
                            y1start = calculateY(startY, innerR2, startAngle),
                            x1end = calculateX(startX, R1, startAngle),
                            y1end = calculateY(startY, R2, startAngle),
                            x2end = calculateX(startX, R1, endAngle),
                            y2end = calculateY(startY, R2, endAngle),
                            x2start = calculateAngledX(startX, innerR1, startAngle, endAngle),
                            y2start = calculateAngledY(startY, innerR2, startAngle, endAngle),
                            largeArcFlag = (Math.abs(endAngle - startAngle) > 180),
                            sweepFlag = 1; // positive angle

                        if (donut && !threeD) {
                            if (slicedPie) {
                                return {
                                    path: [
                                        ["M", x1start, y1start ],
                                        ["L", x1end, y1end ],
                                        ["A", R1, R2, 0, +largeArcFlag, sweepFlag, x2end, y2end ],
                                        ["L", x2start, y2start ],
                                        ["A", innerR1, innerR2, 0, +largeArcFlag, 0, x1start, y1start ],
                                        ["Z"]
                                    ]
                                };
                            }

                            return {
                                path: [
                                    ["M", startX, startY - R2 ],
                                    ["a", R1, R2, 0, 1, 0, 1, 0 ],
                                    ["M", x1start - innerR1, y1start - innerR2 ],
                                    ["a", innerR1, innerR2, 0, 1, 1, -1, 0 ]
                                ]
                            };
                        }

                        if (slicedPie) {
                            return {
                                path: [
                                    ["M", startX, startY ],
                                    ["L", x1end, y1end ],
                                    ["A", R1, R2, 0, +largeArcFlag, sweepFlag, x2end, y2end ],
                                    ["Z"]
                                ]
                            };
                        }
                        return {
                            path: [
                                ["M", startX, startY - R2],
                                ["A", R1, R2, 0, +largeArcFlag, sweepFlag, startX - 0.01, startY - R2],
                                ["Z"]
                            ]
                        };
                    };

                    customAttribs.arc = function (startX, startY, R1, startAngle, endAngle) {

                        if (startAngle === 0 && endAngle === 0) {
                            return [];
                        }

                        if (startAngle < 180 && endAngle > 180) {
                            // do not draw arced border if it finishes beyinhg the 180 degree, ie.: do not draw not visible arc
                            endAngle = 180;
                        }

                        var R2 = threeD ? R1 / 2 : R1,
                            x1start = calculateX(startX, R1, startAngle),
                            y1start = calculateY(startY, R2, startAngle),
                            y1end = calculateY(startY + size3d, R2, startAngle),
                            x2start = calculateAngledX(startX, R1, startAngle, endAngle),
                            y2start = calculateAngledY(startY, R2, startAngle, endAngle),
                            y2end = calculateAngledY(startY + size3d, R2, startAngle, endAngle),
                            largeArcFlag = (Math.abs(endAngle - startAngle) > 180),
                            sweepFlagPositiveAngle = 1,
                            sweepFlagNegativeAngle = 0;

                        return {
                            path: [
                                ["M", x1start, y1start ],
                                ["L", x1start, y1end ], // draw down
                                ["A", R1, R2, 0, +largeArcFlag, sweepFlagPositiveAngle, x2start, y2end ],
                                ["L", x2start, y2start ],
                                ["A", R1, R2, 0, +largeArcFlag, sweepFlagNegativeAngle, x1start, y1start ],
                                ["Z"]
                            ]
                        };
                    };

                    customAttribs.outline = function (startX, startY, R1, startAngle, endAngle) {
                        var innerR1 = R1 + (threeD ? 3 : 1),
                            innerR2 = (threeD ? innerR1 / 2 : innerR1),
                            outerR1 = innerR1 + (threeD ? 14 : 10),
                            outerR2 = innerR2 + (threeD ? 6 : 10),
                            x1start = calculateX(startX, innerR1, startAngle),
                            y1start = calculateY(startY, innerR2, startAngle),
                            x1end = calculateX(startX, outerR1, startAngle),
                            y1end = calculateY(startY, outerR2, startAngle),
                            x2start = calculateAngledX(startX, innerR1, startAngle, endAngle),
                            y2start = calculateAngledY(startY, innerR2, startAngle, endAngle),
                            x2end = calculateAngledX(startX, outerR1, startAngle, endAngle),
                            y2end = calculateAngledY(startY, outerR2, startAngle, endAngle),
                            flag = (Math.abs(endAngle - startAngle) > 180);

                        return {
                            path: [
                                ["M", x1start, y1start ],
                                ["L", x1end, y1end ],
                                ["A", outerR1, outerR2, 0, +flag, 1, x2end, y2end ],
                                ["L", x2start, y2start ],
                                ["A", innerR1, innerR2, 0, +flag, 0, x1start, y1start ],
                                ["Z"]
                            ]
                        };
                    };

                    customAttribs.wall = function (startX, startY, R1, angle) {
                        if (angle === 0) {
                            return [];
                        }

                        var R2 = threeD ? R1 / 2 : R1,
                            x = calculateX(startX, R1, angle),
                            y = calculateY(startY, R2, angle);

                        return {
                            path: [
                                ["M", startX, startY ],
                                ["L", startX, startY + size3d ],
                                ["L", x, y + size3d ],
                                ["L", x, y ],
                                ["Z"]
                            ]
                        };
                    };
                };
            };

        Animator.prototype = {
            bind: function () {
                var self = this,
                    sliceMouseOverHandler = function () {
                        self.slice.stop();
                        self.slice.animate(self.sliceAnimationOut);
                        if (self.threeD) {
                            self.arc.stop();
                            self.wallOne.stop();
                            self.wallTwo.stop();
                            self.arc.animateWith(self.slice, self.sliceAnimationOut, self.bordersAnimationOut.arc);
                            self.wallOne.animateWith(self.slice, self.sliceAnimationOut, self.bordersAnimationOut.wallOne);
                            self.wallTwo.animateWith(self.slice, self.sliceAnimationOut, self.bordersAnimationOut.wallTwo);

                            if (self.bucket.startAngle >= 0 && self.bucket.startAngle < 180) {
                                self.arc.toFront();
                                self.slice.toFront();
                            } else {
                                self.arc.toBack();
                            }
                        }
                    },
                    sliceMouseOutHandler = function () {
                        self.slice.animate(self.sliceAnimationIn);
                        if (self.threeD) {
                            self.arc.animateWith(self.slice, self.sliceAnimationIn, self.bordersAnimationIn.arc);
                            self.wallOne.animateWith(self.slice, self.sliceAnimationIn, self.bordersAnimationIn.wallOne);
                            self.wallTwo.animateWith(self.slice, self.sliceAnimationIn, self.bordersAnimationIn.wallTwo);
                        }
                    };

                this.slice.mouseover(sliceMouseOverHandler);
                this.slice.mouseout(sliceMouseOutHandler);
                if (self.threeD) {
                    this.arc.mouseover(sliceMouseOverHandler);
                    this.arc.mouseout(sliceMouseOutHandler);
                }
            }
        };

        function fill(color) {
            if (!gradient) {
                return color;
            }
            return new PieColor(color, gradientDegrees).gradient(gradientDarkness, gradientLightness);
        }

        function attr(shape, bucket, data) {
            var baseAttr = {
                "stroke": WHITE_COLOR,
                "stroke-width": 1.5,
                "stroke-linejoin": "round",
                "fill-rule": "evenodd",
                "fill": fill(bucket.color),
                "title": bucket.title,
                "cursor": cursor
            };
            baseAttr[shape] = data;

            return baseAttr;
        }

        function bindEffectHandlers(bucket) {
            var shortAnimationDelay = animationDelay / 4,
                shiftOutCoordinates = [bucket.shiftX, bucket.shiftY, R1, bucket.startAngle, bucket.endAngle],
                startCoordinates = [bucket.startX, bucket.startY, R1, bucket.startAngle, bucket.endAngle],
                scaleOut = {transform: "s1.1 1.1 " + startX + " " + startY},
                scaleNormal = {transform: "s1 1 " + startX + " " + startY},
                transformOut = {transform: "T" + (bucket.shiftX - cx) + ", " + (bucket.shiftY - cy)},
                transformNormal = {transform: "T 0, 0"},
                shiftOut = Raphael.animation(transformOut, shortAnimationDelay),
                shiftIn = Raphael.animation(transformNormal, shortAnimationDelay);

            if (easing === "shift-fast") {
                new Animator(bucket, threeD, shiftOut, shiftIn,
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

            } else if (easing === ELASTIC_EFFECT_NAME) {
                shiftOut = Raphael.animation(transformOut, animationDelay, ELASTIC_EFFECT_NAME);
                shiftIn = Raphael.animation(transformNormal, animationDelay, ELASTIC_EFFECT_NAME);
                new Animator(bucket, threeD, shiftOut, shiftIn,
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

            } else if (easing === "shift-slow") {
                shiftOut = Raphael.animation(transformOut, animationDelay);
                shiftIn = Raphael.animation(transformNormal, animationDelay);
                new Animator(bucket, threeD, shiftOut, shiftIn,
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

            } else if (easing === "shift-bounce") {
                new Animator(bucket, threeD,
                    Raphael.animation({slice: shiftOutCoordinates}, shortAnimationDelay),
                    Raphael.animation({slice: startCoordinates}, animationDelay, BOUNCE_EFFECT_NAME),
                    {
                        arc: Raphael.animation({arc: shiftOutCoordinates}, shortAnimationDelay),
                        wallOne: Raphael.animation({wall: [bucket.shiftX, bucket.shiftY, R1, bucket.startAngle]}, shortAnimationDelay),
                        wallTwo: Raphael.animation({wall: [bucket.shiftX, bucket.shiftY, R1, bucket.endAngle]}, shortAnimationDelay)
                    },
                    {
                        arc: Raphael.animation({arc: startCoordinates}, animationDelay, BOUNCE_EFFECT_NAME),
                        wallOne: Raphael.animation({wall: [bucket.startX, bucket.startY, R1, bucket.startAngle]}, animationDelay, BOUNCE_EFFECT_NAME),
                        wallTwo: Raphael.animation({wall: [bucket.startX, bucket.startY, R1, bucket.endAngle]}, animationDelay, BOUNCE_EFFECT_NAME)
                    }).bind();
            } else if (easing === "scale") {
                new Animator(bucket, threeD,
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
            } else if (easing === "scale-bounce") {
                new Animator(bucket, threeD,
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
            } else if (easing === "outline") {
                bucket.slice.mouseover(function () {
                    bucket.slice.outline.show();
                    bucket.slice.outline.toFront();
                });

                bucket.slice.mouseout(function () {
                    bucket.slice.outline.hide();
                });
            } else if (easing && easing !== "") {
                console.error("Unknown hover effect name: " + easing);
            }
        }

        function renderChartLegend(bucket) {
            if (bucket.label === "") {
                return;
            }
            legendLabelYstart += 10;
            var text,
                radius = 9,
                markerElement = null,
                markerAttrs = {"title": bucket.label, "fill": bucket.color, "fill-rule": "nonzero", "stroke": WHITE_COLOR, "stroke-width": "0.1", "cursor": cursor};

            if (marker === "rect") {
                markerElement = paper.path("M " + legendXstart + ", " + legendYstart + " l 28,0  0,16  -28,0  0,-16z");
            } else if (marker === "circle") {
                markerElement = paper.circle(legendXstart + (2 * radius), legendYstart + radius, radius);
            } else if (marker === "ellipse") {
                radius = 10;
                markerElement = paper.ellipse(legendXstart + (2 * radius), legendYstart + radius, 1.25 * radius, radius * 0.75);
            }

            if (markerElement) {
                markerElement.attr(markerAttrs);
                markerElement.handle = bucket.handle;
                markers.push(markerElement);
            }

            text = paper.text(legendLabelXstart, legendLabelYstart, bucket.label);
            text.attr({"title": bucket.label, "font-family": fontFamily, "font-weight": "normal", "fill": "#474747", "cursor": cursor, "font-size": fontSize, "text-anchor": "start"});
            text.handle = bucket.handle;
            descriptions.push(text);

            legendYstart += 30;
            legendLabelYstart = legendYstart;
        }

        new RaphaelConfigurator(paper).configure();

        for (index = 0; index < data.length; index += 1) {
            total += data[index];
        }

        for (index = 0; index < data.length; index += 1) {
            bucket[index] = {};
            currentValue = data[index] || 0;
            currentColor = colors[index] || "#FF0000";
            currentLabel = legendLabels[index] || "";
            currentTitle = titles[index] || "";
            currentHref = hrefs[index] || "";
            currentHandle = handles[index] || "";
            currentSliceAngle = 360 * currentValue / total;
            startAngle = endAngle;
            endAngle = startAngle + currentSliceAngle;
            currentSliceShiftX = startX + shiftDistance * Math.cos((startAngle + (endAngle - startAngle) / 2) * RADIAN);
            currentSliceShiftY = startY + shiftDistance * Math.sin((startAngle + (endAngle - startAngle) / 2) * RADIAN);

            bucket[index].color = currentColor;
            bucket[index].label = currentLabel;
            bucket[index].title = currentTitle;
            bucket[index].href = currentHref;
            bucket[index].handle = currentHandle;
            bucket[index].startAngle = startAngle;
            bucket[index].endAngle = endAngle;
            bucket[index].startX = startX;
            bucket[index].startY = startY;
            bucket[index].shiftX = currentSliceShiftX;
            bucket[index].shiftY = currentSliceShiftY;
            bucket[index].sliceOrigin = [startX, startY, R1, startAngle, endAngle];
            bucket[index].sliceOriginZero = [startX, startY, R1, 0, 0];

            if (threeD) {
                bucket[index].arcOrigin = bucket[index].sliceOrigin;
                bucket[index].wallOneOrigin = [startX, startY, R1, startAngle];
                bucket[index].wallTwoOrigin = [startX, startY, R1, endAngle];
                bucket[index].arcOriginZero = bucket[index].sliceOriginZero;
                bucket[index].wallOneOriginZero = [startX, startY, R1, 0];
                bucket[index].wallTwoOriginZero = [startX, startY, R1, 0];
            }
        }

        for (index = 0; index < data.length; index += 1) {
            currentBucket = bucket[index];
            if (threeD) {
                if (slicedPie) {
                    bucket[index].wallOne = paper.path().attr(attr("wall", currentBucket, (evolution ? currentBucket.wallOneOriginZero : currentBucket.wallOneOrigin)));
                    bucket[index].wallTwo = paper.path().attr(attr("wall", currentBucket, (evolution ? currentBucket.wallTwoOriginZero : currentBucket.wallTwoOrigin)));
                }
                bucket[index].arc = paper.path().attr(attr("arc", currentBucket, (evolution ? currentBucket.arcOriginZero : currentBucket.arcOrigin)));
            }
            bucket[index].slice = paper.path().attr(attr("slice", currentBucket, (evolution ? currentBucket.sliceOriginZero : currentBucket.sliceOrigin)));
            bucket[index].slice.handle = bucket[index].handle;
            if (slicedPie && easing.indexOf("outline") !== -1) {
                currentSliceOutline = paper.path().attr(attr("outline", currentBucket, bucket[index].sliceOrigin));
                bucket[index].slice.outline = currentSliceOutline;
                currentSliceOutline.hide();
            }
            slices.push(bucket[index].slice);

            if (slicedPie) {
                bindEffectHandlers(bucket[index]);
            }
            renderChartLegend(bucket[index]);
        }

        if (threeD) {
            for (index = 0; index < data.length; index += 1) {
                currentBucket = bucket[index];

                if (slicedPie) {
                    if (currentBucket.startAngle >= 90 && currentBucket.startAngle < 270) {
                        // the following order is important
                        currentBucket.wallOne.toBack();
                        currentBucket.wallTwo.toBack();
                    } else if (currentBucket.endAngle > 270 && currentBucket.endAngle <= 360) {
                        currentBucket.wallOne.toBack();
                    } else if (currentBucket.endAngle > 0 && currentBucket.endAngle < 90) {
                        currentBucket.wallTwo.toFront();
                    }
                }

                if (currentBucket.startAngle >= 0 && currentBucket.startAngle < 180) {
                    currentBucket.arc.toFront();
                } else {
                    currentBucket.arc.toBack();
                }
                currentBucket.slice.toFront();
            }
        }

        if (evolution) {
            timeout = window.setTimeout(function () {
                for (index = 0; index < bucket.length; index += 1) {
                    bucket[index].slice.animate({slice: bucket[index].sliceOrigin}, animationDelay, BACKOUT_EFFECT_NAME);

                    if (threeD) {
                        bucket[index].arc.animate({arc: bucket[index].arcOrigin}, animationDelay, BACKOUT_EFFECT_NAME);
                    }

                    if (threeD && slicedPie) {
                        bucket[index].wallOne.animate({wall: bucket[index].wallOneOrigin}, animationDelay, BACKOUT_EFFECT_NAME);
                        bucket[index].wallTwo.animate({wall: bucket[index].wallTwoOrigin}, animationDelay, BACKOUT_EFFECT_NAME);
                    }
                }
                window.clearTimeout(timeout);
            }, 200);
        }

        return {slices: slices.items, markers: markers.items, descriptions: descriptions.items};
    }

    Raphael.fn.pielicious = function (cx, cy, R, opts) {
        return new Pielicious(this, cx, cy, R, opts);
    };
}());
