/*
 * Donut-Pie Chart library v1.0, based on Raphaël JS by Dmitry Baranovskiy (http://raphaeljs.com)
 *
 * Copyright (c) 2014 Alexander Zagniotov
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */

(function () {
    function DonutPieChart(paper, cx, cy, r, opts) {
        opts = opts || {};
        var rad = (Math.PI / 180),
            WHITE_COLOR = "#ffffff",
            data = opts.data || [],
            colors = opts.colors || [],
            hoverTitles = opts.hoverTitles || [],
            sliceHandles = opts.sliceHandles || [],
            legendLabels = opts.legendLabels || [],
            hrefs = opts.hrefs || [],
            legendXstart = opts.legendXstart || cx + r + 30,
            legendYstart = opts.legendYstart || cy - r,
            legendLabelXstart = legendXstart + 38,
            legendLabelYstart = legendYstart,
            donut = opts.donut || false,
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
            _index;

        for (_index = 0; _index < data.length; _index++) {
            total += data[_index];
        }

        paper.customAttributes.slice = function (cx, cy, r, startAngle, endAngle) {
            var x1 = cx + r * Math.cos(startAngle * rad),
                x2 = cx + r * Math.cos(endAngle * rad),
                y1 = cy + r * Math.sin(startAngle * rad),
                y2 = cy + r * Math.sin(endAngle * rad),
                flag = (Math.abs(endAngle - startAngle) > 180);

            return {
                path: [
                    ["M", cx, cy, ],
                    ["L", x1, y1, ],
                    ["A", r, r, 0, +flag, 1, x2, y2, ],
                    ["z"]
                ]
            }
        };

        paper.customAttributes.outline = function (cx, cy, r, startAngle, endAngle) {
            var innerR = r + 1,
                outerR = r + 10,
                x1start = cx + innerR * Math.cos(startAngle * rad),
                y1start = cy + innerR * Math.sin(startAngle * rad),
                x1end = cx + outerR * Math.cos(startAngle * rad),
                y1end = cy + outerR * Math.sin(startAngle * rad),
                x2start = cx + innerR * Math.cos((startAngle + (endAngle - startAngle)) * rad),
                y2start = cy + innerR * Math.sin((startAngle + (endAngle - startAngle)) * rad),
                x2end = cx + outerR * Math.cos((startAngle + (endAngle - startAngle)) * rad),
                y2end = cy + outerR * Math.sin((startAngle + (endAngle - startAngle)) * rad),
                flag = (Math.abs(endAngle - startAngle) > 180);

            return {
                path: [
                    ["M", x1start, y1start, ],
                    ["L", x1end, y1end, ],
                    ["A", outerR, outerR, 0, +flag, 1, x2end, y2end, ],
                    ["L", x2start, y2start, ],
                    ["A", innerR, innerR, 0, +(flag), 0, x1start, y1start, ],
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
                sliceData = (growingOnLoad === true ? [cx, cy, r, 0, 0] : [cx, cy, r, startAngle, endAngle]),
                slice = paper.path()
                    .attr({slice: sliceData,
                        "stroke": WHITE_COLOR,
                        "stroke-width": 1.5,
                        "stroke-linejoin": "round",
                        "fill": color,
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

        function prepareForGrowingEffect(growingOnLoad, slice, startAngle, endAngle) {
            if (growingOnLoad) {
                sliceData = [cx, cy, r, startAngle, endAngle];
                var anim = Raphael.animation({slice: sliceData}, animationDelay);
                animations[slice.handle] = {slice: slice, animation: anim};
            }
        }

        function prepareForOutlineEffect(sliceHoverEffect, slice) {
            if (sliceHoverEffect !== "" && sliceHoverEffect === "outline") {
                var outline = paper.path()
                    .attr({outline: sliceData,
                        "stroke": WHITE_COLOR,
                        "stroke-width": 1.5,
                        "stroke-linejoin": "round",
                        "fill": color});
                slice.outline = outline;
                outline.hide();
            }
        }

        function bindSliceEffect(sliceHoverEffect, slice, startAngle, endAngle) {
            if (sliceHoverEffect === "") {
                return;
            }

            var shiftx = cx + 6 * Math.cos((startAngle + (endAngle - startAngle) / 2) * rad),
                shifty = cy + 6 * Math.sin((startAngle + (endAngle - startAngle) / 2) * rad);
            if (sliceHoverEffect === "shift") {
                slice.mouseover(function () {
                    slice.stop();
                    slice.animate({slice: [shiftx, shifty, r, startAngle, endAngle]});
                })

                slice.mouseout(function () {
                    slice.animate({slice: [cx, cy, r, startAngle, endAngle]});
                })
            } else if (sliceHoverEffect === "shift-bounce") {
                slice.mouseover(function () {
                    slice.stop();
                    slice.animate({slice: [shiftx, shifty, r, startAngle, endAngle]});
                })

                slice.mouseout(function () {
                    slice.animate({slice: [cx, cy, r, startAngle, endAngle]}, animationDelay, "bounce");
                })
            } else if (sliceHoverEffect === "scale") {
                slice.mouseover(function () {
                    slice.stop();
                    slice.animate({transform: "s1.1 1.1 " + slice.cx + " " + slice.cy});
                })

                slice.mouseout(function () {
                    slice.animate({transform: "s1 1 " + slice.cx + " " + slice.cy});
                })
            } else if (sliceHoverEffect === "scale-bounce") {
                slice.mouseover(function () {
                    slice.stop();
                    slice.animate({transform: "s1.1 1.1 " + slice.cx + " " + slice.cy});
                })

                slice.mouseout(function () {
                    slice.animate({transform: "s1 1 " + slice.cx + " " + slice.cy}, animationDelay, "bounce");
                })
            } else if (sliceHoverEffect === "outline") {
                slice.mouseover(function () {
                    slice.outline.show();
                })

                slice.mouseout(function () {
                    slice.outline.hide();
                })
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
                text.attr({"font-family": fontFamily, "font-weight": "normal", "fill": "#474747", "cursor": cursor, "font-size": fontSize, "text-anchor": "start"});
                text.handle = sliceHandle;
                descriptions.push(text);

                legendYstart += 30;
                legendLabelYstart = legendYstart;
            }
        }

        if (donut === true) {
            if (donutDiameter > 0.9) {
                donutDiameter = 0.9;
            }
            paper.circle(cx, cy, Math.ceil(r * donutDiameter)).attr({"stroke": "none", "fill": donutFill});
        }

        return {slices: slices.items, markers: markers.items, descriptions: descriptions.items};
    };

    Raphael.fn.donutpiechart = function (cx, cy, r, opts) {
        return new DonutPieChart(this, cx, cy, r, opts);
    }
})();
