Raphaël Donut Pie Chart library
=========

Based on Raphaël JS (cross-browser JavaScript library that draws scalable vector graphics) by Dmitry Baranovskiy (http://raphaeljs.com).
The library can generate 2D & 3D charts. Various configuration options available for better user experience.

How to Use
==========

### Method
Paper.donutpiechart(cx, cy, r, opts)

##### Method Parameters
 - cx (integer) x coordinate of the pie
 - cy (integer) y coordinate of the pie
 - r (integer) radius of the pie
 - opts (object) [pie options](#pie-options)
 
##### Method Return Value 
Object of Raphaël elements: `{slices: [array], markers: [array], descriptions: [array]}`
- `slices`: array of `Paper.path` representing pie slice
- `markers`: array of `Paper.path` representing pie legend marker 
- `descriptions`: array of `Paper.text` representing pie legend item

### Usage Example
```
var paper = new Raphael("canvas", 500, 500);
var pie = paper.donutpiechart(150, 150, 100, {
    data: data,
    colors: colors,
    titles: titles,
    handles: handles,
    gradient: {darkness: 12, lightness: 9, degrees: 180},
    cursor: "pointer",
    marker: "rect",
    threeD: {height: 30},
    donut: {diameter: 0.4},
    legend: {labels: labels, x: 290, y: 90, fontSize: 14, fontFamily: "Verdana"},
    evolution: true,
    easing: "shift-fast"
});
```

### Pie Options

Coming very VERY SOON!

##### Screenshots
![Pie](screenshots/pie.png?raw=true) Pie
![3D Pie](screenshots/3d.png?raw=true) 3D Pie
![Donut](screenshots/donut.png?raw=true) Donut

![Gradient](screenshots/gradient.png?raw=true) Gradient
![Growing](screenshots/growing.png?raw=true) Growing
![Scale](screenshots/scale.png?raw=true) Scale

![Shift](screenshots/shift.png?raw=true) Shift
![Outline](screenshots/outline.png?raw=true) Outline
  
### Compatibility
Raphaël v2.1.2

### Dependencies
Raphaël JS ONLY. There is no need for g.Raphaël JS library

Changelog
---------

**v2.0**

 * Added 3D support
 * Minor cosmetic changes, overall code cleanup

**v1.0**

 * Initial version
