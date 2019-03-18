var draw = function(data)
{
  let mouseCoor = [0,0];
  let dimensionList = ["Response Time","Priority","Hospital Transport Time"];
  let svg = d3.select("body").select("svg");
  let bounds = svg.node().getBoundingClientRect();
  let margin = {
    top:    45,
    right:  20,
    bottom: 5,
    left:   50
  };

  let plotWidth = bounds.width - margin.right - margin.left;
  let plotHeight = bounds.height - margin.top;

  var x = d3.scaleBand()
      .range([margin.left+45, plotWidth+400]),
      y = {},
      dragging = {};

  var line = d3.line(),
      axis = d3.axisLeft(),
      background,
      foreground;
  var min = 0;
  var max = 23;
  //E50003
  //0006BF
  var colors = d3.scaleLinear().domain([min, max])
        //.range(["#1750E8", '#D9FA00'])
        //.range(["#e81831", '#c2bb12'])
        .range(["#00F4FF", '#FF14AD'])
        .interpolate(d3.interpolateRgb);
  //Making the legend
  //source: https://stackoverflow.com/questions/39023154/how-to-make-a-color-gradient-bar-using-d3js
  var defs = svg.append('defs');
  var lg = defs.append('linearGradient')
       .attr('id', 'Gradient2')
       .attr('x1', 0)
       .attr('x2', 0)
       .attr('y1', 0)
       .attr('y2', 1);
  lg.append('stop')
       .attr('offset', '0%')
       //.attr('stop-color', '#e81831');
       .attr('stop-color', '#00F4FF');
  lg.append('stop')
       .attr('offset', '100%')
       //.attr('stop-color', '#c2bb12');
       .attr('stop-color', '#FF14AD');
  let hourScale = d3.scaleLinear().domain([0,119]).range([0,23]);
  svg.append('rect').attr("transform", "translate(" + (plotWidth*.97) + "," + (plotHeight*0.5) + ")")
       .attr('width', 20)
       .attr('height', 120)
       .style("fill", "url(#Gradient2)")
       .on("click", function() {
         hour = d3.event.pageY - 771;
         //make everything that IS NOT THAT COLOR, invisible
         filterColor = colors(Math.round(hourScale(hour)));
         var lineshide = svg.selectAll('.foreground path').filter(function(p){
           return d3.select(this).attr("stroke") != filterColor;
         }).attr("visibility", "hidden");
         var lineshow = svg.selectAll('.foreground path').filter(function(p){
           return d3.select(this).attr("stroke") == filterColor;
         }).attr("visibility", "visible");
         d3.event.stopPropagation();
       });
  svg.append("g")
    .attr("transform", "translate(" + margin.right+ "," + margin.top + ")");
  svg.append("text")
    .text("Time of day (24 hrs)")
    .style("text-anchor", "middle")
    .attr("font-size", "15px")
    .attr("fill", "white")
    .attr("transform", "translate(" + (plotWidth*.97)+ "," + (plotHeight*.47) + ")");
  svg.append("text")
    .text("0")
    .style("text-anchor", "middle")
    .attr("font-size", "15px")
    .attr("fill", "white")
    .attr("transform", "translate(" + (plotWidth*.96)+ "," + (plotHeight*.505) + ")");
  svg.append("text")
    .text("23")
    .style("text-anchor", "middle")
    .attr("font-size", "15px")
    .attr("fill", "white")
    .attr("transform", "translate(" + (plotWidth*.96)+ "," + (plotHeight*.505 + 120) + ")");
  //source:https://bl.ocks.org/jasondavies/1341281
  //extract the list of dimensions and create a scale for each (in the correct order)
  x.domain(dimensions = dimensionList.filter(function(d){
            return dimensionList.includes(d) && (y[d] = d3.scaleLinear()
              .domain(d3.extent(data, function(p){
                    return +p[d];}))
              .range([plotHeight+20, margin.top]));
  }));
  //Draw the lines
/*  background = svg.append("g")
    .attr("class", "background")
    .selectAll("path")
    .data(data)
    .enter().append("path")
    .attr("d", path)
    .attr("stroke-width","0.3px")
    .attr("visibility", "hidden");*/

  foreground = svg.append("g")
      .attr("class", "foreground")
      .selectAll("path")
      .data(data)
      .enter().append("path")
      .attr("d", path)
      .attr("stroke",function (d) {
        return colors(d["Hour data"]) ;
      })
      .attr("stroke-width","0.3px");

  function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
  }

  // Returns the path for a given data point.
  function path(d) {
    return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
  }
  //draw the axis
  var g = svg.selectAll(".dimension")
      .data(dimensions)
      .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; });
  //draw the labels
  g.append("g")
    .attr("class", "axis")
    .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", 30)
    .attr("font-size", "15px")
    .text(function(d) {
      var output = "";
      switch(d)
      {
        case dimensionList[0]: output = "Response Time (minutes)";break;
        case dimensionList[1]: output = "Priority";break;
        case dimensionList[2]: output = "Hospital Transport Time (minutes)";break;
      }
      return output; });
  svg.on('click', function() {
      frontlines = svg.selectAll("path").attr("visibility", "visible");
      console.log( "Clicked");
    });
}
