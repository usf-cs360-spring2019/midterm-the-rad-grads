function populateTotal(data) {
  var map = new Map();
  for (var i = 0; i < data.length; i++) {
    map.set(data[i].Neighborhood, Number.parseInt(data[i].total));
    //map[data[i].Neighborhood]=data[i].total;
    //delete data[i].total
  }
  return map;
}

function getMax(data) {
  var max = -1;
  for (var i = 0; i < data.length; i++) {
    if (Number.parseInt(data[i].total) > max) {
      max = data[i].total;
    }
  }
  return max;
}
String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};
var svg, g, x, y, z, tooltip, height, width, margin, graphData1;
function drawStackedBar() {
  // create the svg
  svg = d3.select("svg#svg1");
  margin = {
    top: 20,
    right: 80,
    bottom: 200,
    left: 80
  };
  width = +svg.attr("width") - margin.left - margin.right;
  height = +svg.attr("height") - margin.top - margin.bottom;
  g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set x scale
  x = d3
    .scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.3)
    .align(0.1);

  // set the colors
  z = d3.scaleOrdinal().range(["#E15759", "#F28E2B", "#EDC948", "#59A14F"]);

  // load the csv and create the chart
  d3.csv("viz3.csv").then(function(data, error) {
    var totalMap = populateTotal(data);
    var keys = data.columns.slice(1, 2).concat(data.columns.slice(3));
    graphData1 = data;
    data.sort(function(a, b) {
      if (a.Neighborhood < b.Neighborhood) {
        return -1;
      }
      if (a.Neighborhood > b.Neighborhood) {
        return 1;
      }
      return 0;
    });
    let countMin = 0,
      countMax = getMax(data);
    y = d3
      .scaleLinear()
      .domain([countMin, countMax])
      .range([height, 0])
      .nice();
    z.domain(keys);
    drawBars(data);
    g.append("g")
      .attr("class", "axis yaxis")
      .call(d3.axisLeft(y).ticks(null, "s"))
      .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start");

    var legend = g
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate( 60 ,0)")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter()
      .append("g")
      .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
      });

    legend
      .append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

    legend
      .append("text")
      .attr("class", "legend-text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) {
        return d.replaceAll("_", " ");
      });
  });
  svg
    .append("text")
    .attr("x", margin.left + 30)
    .attr("y", margin.top+10)
    .attr("text-anchor", "left")
    .style("font-size", "23px")
    .text("Neighborhoods vs Call Type Group");

  svg
    .append("text")
    .attr("x", margin.left - 360)
    .attr("y", margin.top + 10)
    .attr("text-anchor", "left")
    .attr("transform", "rotate(-90)")
    .style("font-size", "14px")
    .text("Number of Records");

  svg
    .append("text")
    .attr("x", margin.left + 280)
    .attr("y", margin.top + 35)
    .attr("text-anchor", "left")
    .style("font-size", "14px")
    .text("Neighborhoods");
  // Prep the tooltip bits, initial display is hidden
  tooltip = svg
    .append("g")
    .attr("class", "tooltip")
    .style("display", "none");

  tooltip
    .append("rect")
    .attr("width", 60)
    .attr("height", 20)
    .attr("fill", "white")
    .style("opacity", 0.5);

  tooltip
    .append("text")
    .attr("x", 30)
    .attr("dy", "1.2em")
    .style("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("font-weight", "bold");

  var caption = svg
    .append("text")
    .attr("x", margin.left - 120)
    .attr("y", 550)
    .attr("text-anchor", "right")
    .style("fill", "grey")
    .style("font-size", "12px");
  var captionText =
    "Controls: Use the text box values to sort the graph. "+
    "Mouse Hover: Displays the number of calls received from each call type group";

  caption
    .selectAll("tspan.text")
    .data(captionText.split("\n"))
    .enter()
    .append("tspan")
    .attr("class", "text")
    .text(d => d)
    .attr("x", 20)
    .attr("dx", 10)
    .attr("dy", 15);
}
function drawBars(data) {
  g.select("g.axis.xaxis").remove();
  g.select("g.stackbarsgroup").remove();
  x.domain(
    data.map(function(d) {
      return d.Neighborhood;
    })
  );
  g.append("g")
    //.select('g.axis.xaxis').remove()
    .attr("class", "axis xaxis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("y", -3)
    .attr("x", -10)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end");

  var keys = data.columns.slice(1, 2).concat(data.columns.slice(3));
  g.append("g")
    .attr("class", "stackbarsgroup")
    .selectAll("g")
    .data(d3.stack().keys(keys)(data))
    .enter()
    .append("g")
    .attr("fill", function(d) {
      return z(d.key);
    })
    .selectAll("rect")
    .data(function(d) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return x(d.data.Neighborhood);
    })
    .attr("y", function(d) {
      return y(d[1]);
    })
    .attr("height", function(d) {
      return y(d[0]) - y(d[1]);
    })
    .attr("width", x.bandwidth())
    .on("mouseover", function() {
      tooltip.style("display", null);
    })
    .on("mouseout", function() {
      tooltip.style("display", "none");
    })
    .on("mousemove", function(d) {
      var xPosition = d3.mouse(this)[0] - 5;
      var yPosition = d3.mouse(this)[1] - 5;
      tooltip.attr(
        "transform",
        "translate(" + xPosition + "," + yPosition + ")"
      );
      tooltip.select("text").text(d[1] - d[0]);
    });
}
function handleDropdown(value) {
  switch (value) {
    case "name-ascending": {
      graphData1.sort(function(a, b) {
        if (a.Neighborhood < b.Neighborhood) {
          return -1;
        }
        if (a.Neighborhood > b.Neighborhood) {
          return 1;
        }
        return 0;
      });
      drawBars(graphData1);
      break;
    }
    case "name-descending": {
      graphData1.sort(function(a, b) {
        if (a.Neighborhood > b.Neighborhood) {
          return -1;
        }
        if (a.Neighborhood < b.Neighborhood) {
          return 1;
        }
        return 0;
      });
      drawBars(graphData1);
      break;
    }
    case "frequency-ascending": {
        graphData1.sort(function(a, b) {
            return a.total - b.total
        });
        drawBars(graphData1);
        break;
      }
      case "frequency-descending": {
        graphData1.sort(function(a, b) {
            return b.total - a.total
        });
        drawBars(graphData1);
        break;
      }
    default:
      break;
  }
}
