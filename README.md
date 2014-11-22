Raphaël Donut Pie Chart library
=========

Based on Raphaël JS by Dmitry Baranovskiy (http://raphaeljs.com)

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
var pie = paper.donutpiechart(cx, cy, r, opts);
```

### Pie Options
- `data` (array): values used to plot
- `colors` (array): array of string colors used to plot each value pie slice
- `hoverTitles` (array): array of strings representing tooltip texts when mouse hovers each pie slice
- `sliceHandles` (array): array of strings assigned to each Raphaël element representing a pie slice
- `hrefs` (array): string urls to set up clicks on pie slices
- `legendLabels` (array): array of strings that will be used in a pie legend
- `legendXstart` (integer): x coordinate of the legend
- `legendYstart` (integer): y coordinate of the legend
- `cursor` (string): cursor type displayed when mouse hovers the slice. [default: `normal`]
- `marker` (string): legend marker. Available options are `rect`, `circle` & `ellipse`. [default: `circle`]
- `fontFamily` (string): legend font type. [default: `Arial`]
- `fontSize` (string): legend font size. [default: `14`]
- `donut` (boolean): whether or not to render donut chart instead of pie chart. [default: `false`]
- `donutFill` (string): fill color of the donut center [default: `#ffffff`]
- `donutDiameter` (float): number between 0.1 - 0.9. Determines the donut thickness [default: `0.5`]
- `growingOnLoad` (boolean): whether or not to animate pie rendering slice after slice. [default: `false`]
- `sliceHoverEffect` (string): slice hover effect. [default: no hover effect]. Available options are: 
  - `shift`: pie slice shifts away from the pie center [see Screenshots](#screenshots)
  - `shift-bounce`: same as above. When mouse leaves the slice, the slice bounces back inside the pie
  - `scale`: pie slice scales up
  - `scale-bounce`: same as above. When mouse leaves the slice, the slice bounces to normal size
  - `outline`: outline appears near the outer slice edge [see Screenshots](#screenshots)

##### Screenshots
![Pie](screenshots/pie.png?raw=true) Pie chart
![Donut](screenshots/donut.png?raw=true) Donut chart
![Growing](screenshots/growing.png?raw=true) Growing effect

![Scale](screenshots/scale.png?raw=true) Scale effect
![Shift](screenshots/shift.png?raw=true) Shift effect
![Outline](screenshots/outline.png?raw=true) Outline effect
  
### Compatibility
Raphaël v2.1.2

### Dependencies
Raphaël JS. There is no need for G Raphaël JS

Changelog
---------

**v1.0**

 * Initial version
 
