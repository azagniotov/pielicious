Raphaël Donut Pie Chart library
=========

Based on Raphaël JS by Dmitry Baranovskiy (http://raphaeljs.com)

How to Use
==========

### Method
Paper.donutpiechart(cx, cy, r, opts)

##### Method Parameters
 - cx (number) x coordinate of the pie
 - cy (number) y coordinate of the pie
 - r (integer) radius of the pie
 - opts (object) [pie options](#pie-ptions)
 
##### Method Return Value 
JSON object of Raphaël elements: `{slices: [array], markers: [array], descriptions: [array]}`
- `slices`: array of `Paper.path` representing pie slice
- `markers`: array of `Paper.path` representing pie legend marker 
- `descriptions`: array of `Paper.text` representing pie legend item
 
### Pie Options
- `data` (array): values used to plot
- `colors` (array): colors used to plot each value pie slice
- `hoverTitles` (array): array of strings representing tooltip texts when mouse hovers each pie slice
- `sliceHandles` (array): array of strings assigned to each Raphaël element representing a pie slice
- `hrefs` (array): string urls to set up clicks on pie slices
- `legendLabels` (array): array of strings that will be used in a pie legend
- `legendXstart` (integer): x coordinate of the legend
- `legendYstart` (integer): y coordinate of the legend
- `cursor` (string): the type of cursor that should be displayed when mouse hover the slice. [default `normal`]
- `marker` (string): legend marker. Available options are `rect`, `circle` & `ellipse`. [default `circle`]
- `fontFamily` (string): legend font type. [default `Arial`]
- `fontSize` (string): legend font size. [default `14`]
- `donut` (boolean): whether or not to render donut chart instead of pie chart. [default `false`]
- `donutFill` (string): color of the donut center fill [default `#ffffff`]
- `donutDiameter` (float): number between 0.1 - 0.9 [default `0.5`]
- `growingOnLoad` (boolean): whether or not to render the pie slices one by one ('growing' effect). [default `false`]
- `sliceHoverEffect` (string): slice hover effect. [default no hover effect]. Available options are: 
  - `shift`: pie slice shifts away from the pie center
  - `shift-bounce`: same as above. When mouse leaves the slice, the slice bounces back to the pie
  - `scale`: pie slice scales up
  - `scale-bounce`: same as above. When mouse leaves the slice, the slice scales to normal size
  - `outline`: outline appears near the outer slice edge
 
### Usage Example
```
var paper = new Raphael("canvas", 500, 500);
var pie = paper.donutpiechart(cx, cy, r, opts);
```


Changelog
---------

**v1.0**

 * Initial version
 
