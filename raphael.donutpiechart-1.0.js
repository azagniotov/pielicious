/*
 * Donut-Pie Chart library v1.0, based on Raphaël JS by Dmitry Baranovskiy (http://raphaeljs.com)
 *
 * Copyright (c) 2014 Alexander Zagniotov
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */

(function () {
    function DonutPieChart(paper, cx, cy, R1, opts) {
        opts = opts || {};
        var rad = (Math.PI / 180),
            R2 = make3d ? R1 / 2 : R1,
            WHITE_COLOR = "#ffffff",
            data = opts.data || [],
            colors = opts.colors || [],
            gradient = opts.gradient || false,
            hoverTitles = opts.hoverTitles || [],
            sliceHandles = opts.sliceHandles || [],
            hrefs = opts.hrefs || [],
            make3d = (opts.make3d && typeof opts.make3d === 'object') || false,
            size3d = (make3d && opts.make3d.size ? opts.make3d.size : 25),
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
            animationDelay = 500,
            slices = paper.set(),
            markers = paper.set(),
            descriptions = paper.set(),
            donutHole = null,
            _index,
            points = [];

        for (_index = 0; _index < data.length; _index++) {
            total += data[_index];
        }

        for (_index = 0; _index < data.length; _index++) {
            points[_index] = {};

            var startx = cx, starty = cy,
                value = data[_index] || 0,
                color = colors[_index] || "#FF0000",
                label = legendLabels[_index] || "",
                title = hoverTitles[_index] || "",
                href = hrefs[_index] || "",
                sliceHandle = sliceHandles[_index] || "",
                sliceAngle = 360 * value / total,
                endAngle = (_index === 0 ? 0 : endAngle),
                startAngle = endAngle,
                endAngle = startAngle + sliceAngle;

            var shiftx = startx + shiftDistance * Math.cos((startAngle + (endAngle - startAngle) / 2) * rad),
                shifty = starty + shiftDistance * Math.sin((startAngle + (endAngle - startAngle) / 2) * rad);

            points[_index].color = color;
            points[_index].label = label;
            points[_index].title = title;
            points[_index].href = href;
            points[_index].handle = sliceHandle;
            points[_index].startAngle = startAngle;
            points[_index].endAngle = endAngle;
            points[_index].startx = startx;
            points[_index].starty = starty;
            points[_index].shiftx = shiftx;
            points[_index].shifty = shifty;
            points[_index].sliceOrigin = [startx, starty, R1, startAngle, endAngle];
            points[_index].sliceOriginZero = [startx, starty, R1, 0, 0];

            if (make3d) {
                points[_index].arcOrigin = points[_index].sliceOrigin;
                points[_index].wallOneOrigin = [startx, starty, R1, startAngle];
                points[_index].wallTwoOrigin = [startx, starty, R1, endAngle];
                points[_index].arcOriginZero = points[_index].sliceOriginZero;
                points[_index].wallOneOriginZero = [startx, starty, R1, 0];
                points[_index].wallTwoOriginZero = [startx, starty, R1, 0];
            }
        }

        paper.customAttributes.slice = function (startx, starty, R1, startAngle, endAngle) {
            var R2 = make3d ? R1 / 2 : R1,
                x1 = startx + R1 * Math.cos(startAngle * rad),
                x2 = startx + R1 * Math.cos(endAngle * rad),
                y1 = starty + R2 * Math.sin(startAngle * rad),
                y2 = starty + R2 * Math.sin(endAngle * rad),
                largeArcFlag = (Math.abs(endAngle - startAngle) > 180),
                sweepFlag = 1; // positive angle

            if (startAngle === 0 && endAngle === 0) {
                return [];
            }
            return {
                path: [
                    ["M", startx, starty, ],
                    ["L", x1, y1, ],
                    ["A", R1, R2, 0, +largeArcFlag, sweepFlag, x2, y2, ],
                    ["Z"]
                ]
            };
        }

        paper.customAttributes.arc = function (startx, starty, R1, startAngle, endAngle) {
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

            if (startAngle === 0 && endAngle === 0) {
                return [];
            }
            return {
                path: [
                    ["M", x1start, y1start, ],
                    ["L", x1end, y1end, ],
                    ["A", R1, R2, 0, +largeArcFlag, sweepFlagPositiveAngle, x2end, y2end, ],
                    ["L", x2start, y2start, ],
                    ["A", R1, R2, 0, +largeArcFlag, sweepFlagNegativeAngle, x1start, y1start, ],
                    ["Z"]
                ]
            };
        }

        paper.customAttributes.wall = function (startx, starty, R1, angle) {
            var R2 = make3d ? R1 / 2 : R1,
                x = startx + R1 * Math.cos(angle * rad),
                y = starty + R2 * Math.sin(angle * rad);

            if (angle === 0) {
                return [];
            }
            return {
                path: [
                    ["M", startx, starty, ],
                    ["L", startx, starty + size3d, ],
                    ["L", x, y + size3d, ],
                    ["L", x, y, ],
                    ["Z"]
                ]
            };
        }

        for (_index = 0; _index < data.length; _index++) {
            var obj = points[_index];
            var grow = growingOnLoad === true;
            if (make3d) {
                points[_index].wallOne = paper.path().attr(attr("wall", obj, (grow ? obj.wallOneOriginZero : obj.wallOneOrigin)));
                points[_index].wallTwo = paper.path().attr(attr("wall", obj, (grow ? obj.wallTwoOriginZero : obj.wallTwoOrigin)));
                points[_index].arc = paper.path().attr(attr("arc", obj, (grow ? obj.arcOriginZero : obj.arcOrigin)));
            }
            points[_index].slice = paper.path().attr(attr("slice", obj, (grow ? obj.sliceOriginZero : obj.sliceOrigin)));
            slices.push(points[_index].slice);

            bindEffectHandlers(points[_index]);
            renderChartLegend(points[_index].label, points[_index].color);
        }

        if (make3d) {
            for (_index = 0; _index < data.length; _index++) {
                var obj = points[_index];
                if (obj.startAngle >= 90 && obj.startAngle < 270) {
                    // order is important
                    points[_index].wallOne.toBack();
                    points[_index].wallTwo.toBack();
                } else if (obj.endAngle > 270 && obj.endAngle <= 360) {
                    points[_index].wallOne.toBack();
                } else if (obj.endAngle > 0 && obj.endAngle < 90) {
                    points[_index].wallTwo.toFront();
                }

                if (obj.startAngle >= 0 && obj.startAngle < 180) {
                    points[_index].arc.toFront();
                } else {
                    points[_index].arc.toBack();
                }
                points[_index].slice.toFront();
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

                for (_index = 0; _index < points.length; _index++) {
                    points[_index].slice.animate({slice: points[_index].sliceOrigin}, animationDelay, "backOut");

                    if (make3d) {
                        points[_index].arc.animate({arc: points[_index].arcOrigin}, animationDelay, "backOut");
                        points[_index].wallOne.animate({wall: points[_index].wallOneOrigin}, animationDelay, "backOut");
                        points[_index].wallTwo.animate({wall: points[_index].wallTwoOrigin}, animationDelay, "backOut");
                    }
                }
                clearTimeout(timeout);
            }, 200);
        }

        function bindEffectHandlers(point) {
            var animationOutParams = [point.shiftx, point.shifty, R1, point.startAngle, point.endAngle];
            var animationInParams = [point.startx, point.starty, R1, point.startAngle, point.endAngle];

            var sliceShiftOut = Raphael.animation({slice: animationOutParams});
            var sliceShiftIn = Raphael.animation({slice: animationInParams}, animationDelay, "bounce");

            var slice = point.slice;
            var arc = point.arc;
            var wallOne = point.wallOne;
            var wallTwo = point.wallTwo;

            if (sliceHoverEffect === "shift-smooth") {
                var shiftOut = Raphael.animation({transform: "T" + (point.shiftx - cx) + "," + (point.shifty - cy)}, animationDelay);
                var shiftIn = Raphael.animation({transform: "T" + 0 + "," + 0}, animationDelay);

                slice.mouseover(function () {
                    slice.stop();
                    slice.animate(shiftOut);
                    if (make3d) {
                        arc.stop();
                        wallOne.stop();
                        wallTwo.stop();
                        arc.animateWith(slice, shiftOut, shiftOut);
                        wallOne.animateWith(slice, shiftOut, shiftOut);
                        wallTwo.animateWith(slice, shiftOut, shiftOut);
                    }
                });

                slice.mouseout(function () {
                    slice.animate(shiftIn);
                    if (make3d) {
                        arc.animateWith(slice, shiftIn, shiftIn);
                        wallOne.animateWith(slice, shiftIn, shiftIn);
                        wallTwo.animateWith(slice, shiftIn, shiftIn);
                    }
                });

            } else if (sliceHoverEffect === "shift-bounce") {
                slice.mouseover(function () {
                    slice.stop();
                    slice.animate(sliceShiftOut);
                    if (make3d) {
                        arc.stop();
                        wallOne.stop();
                        wallTwo.stop();
                        arc.animateWith(slice, sliceShiftOut, Raphael.animation({arc: animationOutParams}));
                        wallOne.animateWith(slice, sliceShiftOut, Raphael.animation({wall: [point.shiftx, point.shifty, R1, point.startAngle]}));
                        wallTwo.animateWith(slice, sliceShiftOut, Raphael.animation({wall: [point.shiftx, point.shifty, R1, point.endAngle]}));
                    }
                });

                slice.mouseout(function () {
                    slice.animate(sliceShiftIn);
                    if (make3d) {
                        arc.animateWith(slice, sliceShiftIn, Raphael.animation({arc: animationInParams}, animationDelay, "bounce"));
                        wallOne.animateWith(slice, sliceShiftIn, Raphael.animation({wall: [point.startx, point.starty, R1, point.startAngle]}, animationDelay, "bounce"));
                        wallTwo.animateWith(slice, sliceShiftIn, Raphael.animation({wall: [point.startx, point.starty, R1, point.endAngle]}, animationDelay, "bounce"));
                    }
                });
            }
        }

        /*
         prepareForOutlineEffect(sliceHoverEffect, slice);
         bindSliceEffect(sliceHoverEffect, slice, startAngle, endAngle);
         }     */

        if (donut && !make3d) {
            if (donutDiameter > 0.9) {
                donutDiameter = 0.9;
            }
            donutHole = paper.ellipse(cx, cy, Math.ceil(R1 * donutDiameter), Math.ceil(R2 * donutDiameter)).attr({"stroke": "none", "fill": donutFill});
        }

        function prepareForOutlineEffect(sliceHoverEffect, slice) {
            if (sliceHoverEffect !== "" && sliceHoverEffect.indexOf("outline") !== -1) {
                var outline = paper.path()
                    .attr({outline: sliceData,
                        "stroke": WHITE_COLOR,
                        "stroke-width": 1.5,
                        "stroke-linejoin": "round",
                        "fill": fill(color)});
                slice.outline = outline;
                outline.hide();
            }
        }

        function bindSliceEffect(sliceHoverEffect, slice, startAngle, endAngle) {
            if (sliceHoverEffect === "") {
                return;
            }

            var startx = cx, starty = cy, shiftDistance = 30;

            var shiftx = startx + shiftDistance * Math.cos((startAngle + (endAngle - startAngle) / 2) * rad),
                shifty = starty + shiftDistance * Math.sin((startAngle + (endAngle - startAngle) / 2) * rad);

            if (sliceHoverEffect === "shift") {
                slice.mouseover(function () {
                    slice.stop();
                    slice.animate({slice: [shiftx, shifty, R1, startAngle, endAngle]});
                });

                slice.mouseout(function () {
                    slice.animate({slice: [startx, starty, R1, startAngle, endAngle]});
                });
            } else if (sliceHoverEffect === "scale") {
                slice.mouseover(function () {
                    slice.stop();
                    slice.animate({transform: "s1.1 1.1 " + startx + " " + starty});
                });

                slice.mouseout(function () {
                    slice.animate({transform: "s1 1 " + startx + " " + starty}, function () {
                        slice.attr({fill: fill(color)});
                    });
                });
            } else if (sliceHoverEffect === "scale-bounce") {
                slice.mouseover(function () {
                    slice.stop();
                    slice.animate({transform: "s1.1 1.1 " + startx + " " + starty});
                });

                slice.mouseout(function () {
                    slice.animate({transform: "s1 1 " + startx + " " + starty}, animationDelay, "bounce");
                });
            } else if (sliceHoverEffect === "outline") {
                slice.mouseover(function () {
                    slice.outline.show();
                });

                slice.mouseout(function () {
                    slice.outline.hide();
                });
            } else if (sliceHoverEffect === "outline-bounce") {
                slice.mouseover(function () {
                    slice.outline.show();
                    slice.outline.animate({outline: [startx, starty, R1 + 5, startAngle, endAngle]});
                });

                slice.mouseout(function () {
                    slice.outline.animate({outline: [startx, starty, R1, startAngle, endAngle]}, animationDelay, "bounce", function () {
                        slice.outline.hide();
                    });
                });
            } else if (sliceHoverEffect === "shadow") {
                slice.mouseover(function () {
                    if ("undefined" == typeof slice.activeGlow || slice.activeGlow == null) {
                        var glow = slice.glow({opacity: "0.4", width: "1"});
                        slice.activeGlow = glow;
                    }
                    slice.activeGlow.show();
                    slice.activeGlow.toFront();
                    slice.toFront();
                    if (donut && donutHole) {
                        donutHole.toFront();
                    }
                });

                slice.mouseout(function () {
                    if (slice.activeGlow != null) {
                        slice.activeGlow.hide();
                    }
                });
            }

        }

        function renderChartLegend(label, color) {
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
                    markerElement.handle = sliceHandle;
                    markers.push(markerElement);
                }

                var text = paper.text(legendLabelXstart, legendLabelYstart, label);
                text.attr({"title": label, "font-family": fontFamily, "font-weight": "normal", "fill": "#474747", "cursor": cursor, "font-size": fontSize, "text-anchor": "start"});
                text.handle = sliceHandle;
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

    var PieColor = function PieColor(color, gradientAngle) {
        if (color instanceof PieColor) {
            return color;
        }

        if (!(this instanceof PieColor)) {
            return new PieColor(color, gradientAngle);
        }
        this._originalColor = color,
            this._gradientAngle = gradientAngle;
        this._rgb = Raphael.getRGB(color);
    };

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
