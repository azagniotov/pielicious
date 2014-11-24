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
            tilt2d = opts.tilt2d || false,
            R2 = tilt2d ? R1 / 2 : R1,
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
            explodeDistance = 25,
            cursor = opts.cursor || "normal",
            marker = opts.marker || "circle",
            fontFamily = opts.fontFamily || "Arial",
            fontSize = opts.fontSize || "14",
            donutFill = opts.donutFill || WHITE_COLOR,
            donutDiameter = Math.abs(opts.donutDiameter) || 0.5,
            growingOnLoad = opts.growingOnLoad || false,
            sliceHoverEffect = opts.sliceHoverEffect || "",
            total = 0,
            animationDelay = 500,
            slices = paper.set(),
            markers = paper.set(),
            descriptions = paper.set(),
            animations = {},
            donutHole = null,
            _index;

        for (_index = 0; _index < data.length; _index++) {
            total += data[_index];
        }

        paper.customAttributes.slice = function (cx, cy, R1, startAngle, endAngle) {
            var x1 = cx + R1 * Math.cos(startAngle * rad),
                x2 = cx + R1 * Math.cos(endAngle * rad),
                y1 = cy + R2 * Math.sin(startAngle * rad),
                y2 = cy + R2 * Math.sin(endAngle * rad),
                flag = (Math.abs(endAngle - startAngle) > 180);

            return {
                path: [
                    ["M", cx, cy, ],
                    ["L", x1, y1, ],
                    ["A", R1, R2, 0, +flag, 1, x2, y2, ],
                    ["z"]
                ]
            }
        };

        paper.customAttributes.outline = function (cx, cy, R1, startAngle, endAngle) {
            var innerR1 = R1,
                innerR2 = (tilt2d ? R1 / 2 : R1),
                outerR1 = innerR1 + 10,
                outerR2 = innerR2 + (tilt2d ? 6 : 10),
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
                    ["M", x1start, y1start, ],
                    ["L", x1end, y1end, ],
                    ["A", outerR1, outerR2, 0, +flag, 1, x2end, y2end, ],
                    ["L", x2start, y2start, ],
                    ["A", innerR1, innerR2, 0, +(flag), 0, x1start, y1start, ],
                    ["z"]
                ]
            }
        };

        for (_index = 0; _index < data.length; _index++) {
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
                sliceData = (growingOnLoad === true ? [cx, cy, R1, 0, 0] : [cx, cy, R1, startAngle, endAngle]),
                slice = paper.path()
                    .attr({slice: sliceData,
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
        }

        if (growingOnLoad) {
            var timeout = setTimeout(function () {
                var handle;
                var animation;
                for (handle in animations) {
                    animation = animations[handle];
                    animation.slice.animate(animation.animation, animationDelay);
                }
                clearTimeout(timeout);
            }, 200);
        }

        if (donut === true) {
            if (donutDiameter > 0.9) {
                donutDiameter = 0.9;
            }
            donutHole = paper.ellipse(cx, cy, Math.ceil(R1 * donutDiameter), Math.ceil(R2 * donutDiameter)).attr({"stroke": "none", "fill": donutFill});
        }

        function prepareForGrowingEffect(growingOnLoad, slice, startAngle, endAngle) {
            if (growingOnLoad) {
                sliceData = [cx, cy, R1, startAngle, endAngle];
                if (exploded) {
                    var shiftx = cx + explodeDistance * Math.cos((startAngle + (endAngle - startAngle) / 2) * rad),
                        shifty = cy + explodeDistance * Math.sin((startAngle + (endAngle - startAngle) / 2) * rad);
                    sliceData = [shiftx, shifty, R1, startAngle, endAngle];
                }
                var anim = Raphael.animation({slice: sliceData}, animationDelay, "backOut");
                animations[slice.handle] = {slice: slice, animation: anim};
            }
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

            var startx = cx, starty = cy, shiftDistance = 10;
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
                slice.mouseover(function () {
                    slice.stop();
                    slice.animate({slice: [shiftx, shifty, R1, startAngle, endAngle]});
                });

                slice.mouseout(function () {
                    slice.animate({slice: [startx, starty, R1, startAngle, endAngle]}, animationDelay, "bounce");   
                });
            } else if (sliceHoverEffect === "shift-smooth") {
                slice.mouseover(function () {
                    slice.stop();
                    var sliceAnimation = Raphael.animation({transform : "T" + (shiftx - cx)+ "," + (shifty - cy)}, 500);
                    slice.animate(sliceAnimation);         
                });

                slice.mouseout(function () {
                    var sliceAnimation = Raphael.animation({transform : "T" + 0 + "," + 0}, 500);
                    slice.animate(sliceAnimation);
                });
            } else if (sliceHoverEffect === "scale") {
                slice.mouseover(function () {
                    slice.stop();
                    slice.animate({transform: "s1.1 1.1 " + startx + " " + starty});
                });

                slice.mouseout(function () {
                    slice.animate({transform: "s1 1 " + startx + " " + starty}, function() {
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
            if (!gradient) {
                return color;
            } else {
                var lighterShade = interpolate(0.3, color);
                var darkerShade = interpolate(-0.1, color);
                return "90-" + darkerShade + "-" + lighterShade;
            }
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
})();
