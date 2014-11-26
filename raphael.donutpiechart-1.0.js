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
            WHITE_COLOR = "#ffffff",
            data = opts.data || [],
            colors = opts.colors || [],
            gradient = opts.gradient || false,

            make3d = opts.make3d || false,
            size3d = opts.size3d || 25,


            R2 = make3d ? R1 / 2 : R1,
            hoverTitles = opts.hoverTitles || [],
            sliceHandles = opts.sliceHandles || [],
            legendLabels = opts.legendLabels || [],
            hrefs = opts.hrefs || [],
            legendXstart = opts.legendXstart || cx + R1 + 30,
            legendYstart = opts.legendYstart || cy - R1,
            legendLabelXstart = legendXstart + 38,
            legendLabelYstart = legendYstart,
            donut = opts.donut || false,
            exploded = opts.exploded || false,
            cursor = opts.cursor || "normal",
            marker = opts.marker || "circle",
            fontFamily = opts.fontFamily || "Arial",
            fontSize = opts.fontSize || "14",
            donutFill = opts.donutFill || WHITE_COLOR,
            donutDiameter = Math.abs(opts.donutDiameter) || 0.5,
            growingOnLoad = opts.growingOnLoad || false,
            sliceHoverEffect = opts.sliceHoverEffect || "",
            shiftDistance = 25,
            explodeDistance = 10,
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

            if (exploded) {
                startx = startx + explodeDistance * Math.cos((startAngle + (endAngle - startAngle) / 2) * rad),
                starty = starty + explodeDistance * Math.sin((startAngle + (endAngle - startAngle) / 2) * rad);
                shiftDistance += explodeDistance;
            }

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

            if (make3d) {
                points[_index].wallOne = paper.path().attr(attr("wall", obj, (growingOnLoad === true ? obj.wallOneOriginZero : obj.wallOneOrigin)));
                points[_index].wallTwo = paper.path().attr(attr("wall", obj, (growingOnLoad === true ? obj.wallTwoOriginZero : obj.wallTwoOrigin)));
                points[_index].arc = paper.path().attr(attr("arc", obj, (growingOnLoad === true ? obj.arcOriginZero : obj.arcOrigin)));
            }
            points[_index].slice = paper.path().attr(attr("slice", obj, (growingOnLoad === true ? obj.sliceOriginZero : obj.sliceOrigin)));
            slices.push(points[_index].slice);

            bind(points[_index]);
            buildSliceLegendlabel(points[_index].label, points[_index].color);
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

                if (obj.startAngle >= 0 && obj.startAngle < 180 ) {
                    points[_index].arc.toFront();
                }  else {
                    points[_index].arc.toBack();
                }
                points[_index].slice.toFront();
            }
        }

        function baseAttr(bucket) {
            return {
                "stroke": WHITE_COLOR,
                "stroke-width": 1.5,
                "stroke-linejoin": "round",
                "fill": fill(bucket.color),
                "title": bucket.title,
                "cursor": cursor};
        }

        function attr(shape, bucket, data) {
            var attr = baseAttr(bucket);

            attr[shape] = data;
            return attr;
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

        function bind(point) {

            var animationOutParams = [point.shiftx, point.shifty, R1, point.startAngle, point.endAngle];
            var animationInParams = [point.startx, point.starty, R1, point.startAngle, point.endAngle];

            var sliceShiftOut = Raphael.animation({slice: animationOutParams});
            var sliceShiftIn = Raphael.animation({slice: animationInParams}, animationDelay, "bounce");

            var slice = point.slice;
            var arc = point.arc;
            var wallOne = point.wallOne;
            var wallTwo = point.wallTwo;

            if (sliceHoverEffect === "shift-smooth") {
                var shiftOut = Raphael.animation({transform: "T" + (point.shiftx - cx) + "," + (point.shifty - cy)}, 500);
                var shiftIn = Raphael.animation({transform: "T" + 0 + "," + 0}, 500);

                slice.mouseover(function () {
                    slice.stop();
                    slice.animate(shiftOut);
                    if (arc) {
                        arc.stop();
                        arc.animateWith(slice, shiftOut, shiftOut);
                    }
                    if (wallOne) {
                        wallOne.stop();
                        wallOne.animateWith(slice, shiftOut, shiftOut);
                    }
                    if (wallTwo) {
                        wallTwo.stop();
                        wallTwo.animateWith(slice, shiftOut, shiftOut);
                    }
                });

                slice.mouseout(function () {
                    slice.animate(shiftIn);
                    if (arc) {
                        arc.stop();
                        arc.animateWith(slice, shiftIn, shiftIn);
                    }
                    if (wallOne) {
                        wallOne.stop();
                        wallOne.animateWith(slice, shiftIn, shiftIn);
                    }
                    if (wallTwo) {
                        wallTwo.stop();
                        wallTwo.animateWith(slice, shiftIn, shiftIn);
                    }

                });

            } else if (sliceHoverEffect === "shift-bounce") {
                slice.mouseover(function () {
                    slice.stop();
                    slice.animate(sliceShiftOut);
                    if (arc) {
                        arc.stop();
                        arc.animateWith(slice, sliceShiftOut, Raphael.animation({arc: animationOutParams}));
                    }
                    if (wallOne) {
                        wallOne.stop();
                        wallOne.animateWith(slice, sliceShiftOut, Raphael.animation({wall: [point.shiftx, point.shifty, R1, point.startAngle]}));
                    }
                    if (wallTwo) {
                        wallTwo.stop();
                        wallTwo.animateWith(slice, sliceShiftOut, Raphael.animation({wall: [point.shiftx, point.shifty, R1, point.endAngle]}));
                    }
                });

                slice.mouseout(function () {
                    slice.stop();
                    slice.animate(sliceShiftIn);
                    if (arc) {
                        arc.animateWith(slice, sliceShiftIn, Raphael.animation({arc: animationInParams}, animationDelay, "bounce"));
                    }
                    if (wallOne) {
                        wallOne.animateWith(slice, sliceShiftIn, Raphael.animation({wall: [point.startx, point.starty, R1, point.startAngle]}, animationDelay, "bounce"));
                    }
                    if (wallTwo) {
                        wallTwo.animateWith(slice, sliceShiftIn, Raphael.animation({wall: [point.startx, point.starty, R1, point.endAngle]}, animationDelay, "bounce"));
                    }
                });
            }
        }

        /*
         for (_index = 0; _index < 0; _index++) {
         var value = data[_index] || 0,
         color = colors[_index] || "#FF0000",
         label = legendLabels[_index] || "",
         title = hoverTitles[_index] || "",
         href = hrefs[_index] || "",
         sliceHandle = sliceHandles[_index] || "",
         sliceAngle = 360 * value / total,
         endAngle = (_index === 0 ? 0 : endAngle),
         startAngle = endAngle,
         endAngle = startAngle + sliceAngle,
         sliceData = (growingOnLoad === true ? [cx, cy, R1, 0, 0] : [cx, cy, R1, startAngle, endAngle]);

         var slice = paper.path()
         .attr({
         "slice": sliceData,
         "stroke": WHITE_COLOR,
         "stroke-width": 1.5,
         "stroke-linejoin": "round",
         "fill": fill(color),
         "title": title,
         "cursor": cursor});

         if (href !== "") {
         var attrs = slice.attr();
         attrs["href"] = href;
         slice.attr(attrs);
         }
         slice.handle = sliceHandle;
         slice.cx = cx;
         slice.cy = cy;

         buildSliceLegendlabel(label, color);
         prepareForGrowingEffect(growingOnLoad, slice, startAngle, endAngle);
         prepareForOutlineEffect(sliceHoverEffect, slice);
         bindSliceEffect(sliceHoverEffect, slice, startAngle, endAngle);
         slices.push(slice);
         }     */

        if (donut === true) {
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
            if (exploded) {
                startx = startx + explodeDistance * Math.cos((startAngle + (endAngle - startAngle) / 2) * rad),
                    starty = starty + explodeDistance * Math.sin((startAngle + (endAngle - startAngle) / 2) * rad);
                shiftDistance += explodeDistance;
            }


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
            } else if (sliceHoverEffect === "shift-bounce") {
                var sliceShiftOut = Raphael.animation({slice: [shiftx, shifty, R1, startAngle, endAngle]});
                var sliceShiftIn = Raphael.animation({slice: [startx, starty, R1, startAngle, endAngle]}, animationDelay, "bounce");

                var borderShiftOut = Raphael.animation({sliceOuterRoundBorder: [shiftx, shifty, R1, startAngle, endAngle]});
                var borderShiftIn = Raphael.animation({sliceOuterRoundBorder: [startx, starty, R1, startAngle, endAngle]}, animationDelay, "bounce");

                var innerSideOneShiftOut = Raphael.animation({sliceInnerSideBorder: [shiftx, shifty, R1, startAngle]});
                var innerSideTwoShiftOut = Raphael.animation({sliceInnerSideBorder: [shiftx, shifty, R1, endAngle]});

                var innerSideOneShiftIn = Raphael.animation({sliceInnerSideBorder: [startx, starty, R1, startAngle]}, animationDelay, "bounce");
                var innerSideTwoShiftIn = Raphael.animation({sliceInnerSideBorder: [startx, starty, R1, endAngle]}, animationDelay, "bounce");

                slice.mouseover(function () {
                    slice.stop();
                    slice.animate(sliceShiftOut);
                });

                slice.mouseout(function () {
                    slice.animate(sliceShiftIn);
                });

            } else if (sliceHoverEffect === "shift-smooth") {
                var shiftOut = Raphael.animation({transform: "T" + (shiftx - cx) + "," + (shifty - cy)}, 500);
                var shiftIn = Raphael.animation({transform: "T" + 0 + "," + 0}, 500);

                slice.mouseover(function () {
                    slice.stop();
                    slice.animate(shiftOut);
                });

                slice.mouseout(function () {
                    slice.animate(shiftIn);
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

        function buildSliceLegendlabel(label, color) {
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
            var rgb = Raphael.getRGB(color);
            var hsl = toHsl(rgb.r, rgb.g, rgb.b);
            var rgb2 = Raphael.hsl2rgb(hsl.h, hsl.s, hsl.l);
            if (!gradient) {
                return color;
            } else {
                var lighterShade = interpolate(0.3, color);
                var darkerShade = interpolate(-0.1, color);
                return "90-" + darkerShade + "-" + lighterShade;
            }
        }

        function toHsl(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;

            var max = Math.max(r, g, b),
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
        }

        // http://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
        function interpolate(percentageOfDistance, c0, c1) {
            // Higher positive percentage - the lighter the color wll be
            // Higher negative percentage - the darker the color wll be
            var n = percentageOfDistance < 0 ? percentageOfDistance * -1 : percentageOfDistance, round = Math.round, int = parseInt;
            if (c0.length > 7) {
                var rgb = c0.split(","), t = (c1 ? c1 : percentageOfDistance < 0 ? "rgb(0,0,0)" : "rgb(255,255,255)").split(","), R = int(rgb[0].slice(4)), G = int(rgb[1]), B = int(rgb[2]);
                return "rgb(" + (round((int(t[0].slice(4)) - R) * n) + R) + "," + (round((int(t[1]) - G) * n) + G) + "," + (round((int(t[2]) - B) * n) + B) + ")"
            } else {
                var hex = int(c0.slice(1), 16), t = int((c1 ? c1 : percentageOfDistance < 0 ? "#000000" : "#FFFFFF").slice(1), 16), R1 = hex >> 16, G1 = hex >> 8 & 0x00FF, B1 = hex & 0x0000FF;
                return "#" + (0x1000000 + (round(((t >> 16) - R1) * n) + R1) * 0x10000 + (round(((t >> 8 & 0x00FF) - G1) * n) + G1) * 0x100 + (round(((t & 0x0000FF) - B1) * n) + B1)).toString(16).slice(1)
            }
        }

        return {slices: slices.items, markers: markers.items, descriptions: descriptions.items};
    };

    Raphael.fn.donutpiechart = function (cx, cy, R, opts) {
        return new DonutPieChart(this, cx, cy, R, opts);
    }
})
    ();
