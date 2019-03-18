String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
var plot, incidentCountScale, tooltip, plotHeight, plotWidth, graphData;

function getMax(data) {
    var max = -Infinity;
    for (var i = 0; i < data.length; i++) {
        if (Number.parseFloat(data[i].TravelTime) > max) {
            max = Number.parseFloat(data[i].TravelTime);
        }
    }
    return max;
}

function barChart() {
    //let incidents = map.keys();
    svg = d3.select("body").select("svg#svg2");
    var countMin = 0,
        margin;
    d3.csv("viz4.csv").then(function (data, error) {
        graphData = data;
        let countMax = getMax(data);
        margin = {
            top: 15,
            bottom: 190,
            right: 20,
            left: 65
        };
        let bounds = svg.node().getBoundingClientRect();
        plotWidth = bounds.width - margin.left - margin.right;
        plotHeight = bounds.height - margin.top - margin.bottom;
        incidentCountScale = d3
            .scaleLinear()
            .domain([countMin, countMax])
            .range([plotHeight, 0])
            .nice();

        plot = svg.select("g#plot");
        if (plot.size() < 1) {
            plot = svg.append("g").attr("id", "plot");
            plot.attr(
                "transform",
                "translate(" + margin.left + "," + margin.top + ")"
            );
        }
        drawBarChart(data);
        let yAxis = d3.axisLeft(incidentCountScale);
        let yGroup = plot.append("g").attr("id", "y-axis");
        yGroup.call(yAxis);

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
            .attr("y", 560)
            .attr("text-anchor", "right")
            .style("fill", "grey")
            .style("font-size", "12px");
        var captionText =
        "Controls: Use the text box values to sort the graph. "+
        "Mouse Hover: Displays the travel time for the Neighborhood";

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
        svg
            .append("text")
            .attr("x", plotWidth/2 - 220)
            .attr("y", margin.top+10)
            .attr("text-anchor", "left")
            .style("font-size", "20px")
            .text("Average travel time for potentially life threatening emergency calls");

        svg
            .append("text")
            .attr("x", margin.left - 360)
            .attr("y", margin.top + 10)
            .attr("text-anchor", "left")
            .attr("transform", "rotate(-90)")
            .style("font-size", "13px")
            .text("Average Travel Time");
        svg
            .append("text")
            .attr("x", margin.left + 280)
            .attr("y", margin.top + 35)
            .attr("text-anchor", "left")
            .style("font-size", "13px")
            .text("Neighborhoods-Analysis Boundaries");
    });
}

function drawBarChart(chartData) {
    plot.select(".xaxis").remove();
    plot.select(".bars").remove();
    let incidents = chartData.map(a => a.Neighborhooods);
    let incidentScale = d3.scaleBand()
        .domain(incidents)
        .rangeRound([0, plotWidth])
        .paddingInner(0.2);

    let xAxis = d3.axisBottom(incidentScale);
    plot
        .append("g").attr("id", "x-axis")
        .attr('class', "xaxis")
        .call(xAxis)
        .attr("transform", "translate(0," + plotHeight + ")")
        .selectAll("text")
        .attr("y", -3)
        .attr("x", -10)
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "end");

    //let bars = plot.selectAll("rect").data(chartData);
    plot
        .append("g").attr("class", "bars")
        .selectAll("rect")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("width", incidentScale.bandwidth())
        .attr("height", function (d) {
            return plotHeight - incidentCountScale(d.TravelTime);
        })
        .attr("x", function (d) {
            return incidentScale(d.Neighborhooods);
        })
        .attr("y", function (d) {
            return incidentCountScale(d.TravelTime);
        }).on("mouseover", function () {
            tooltip.style("display", "block");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
        })
        .on("mousemove", function (d) {
            var xPosition = d3.mouse(this)[0] - 5;
            var yPosition = d3.mouse(this)[1] - 5;
            tooltip.attr(
                "transform",
                "translate(" + xPosition + "," + yPosition + ")"
            );
            tooltip.select("text").text(d.TravelTime)
                .attr('z-index', 999999);
        });

}

function handleDropdownChange(value) {
    switch (value) {
        case "name-ascending":
            {
                graphData.sort(function (a, b) {
                    if (a.Neighborhooods < b.Neighborhooods) {
                        return -1;
                    }
                    if (a.Neighborhooods > b.Neighborhooods) {
                        return 1;
                    }
                    return 0;
                });
                drawBarChart(graphData);
                break;
            }
        case "name-descending":
            {
                graphData.sort(function (a, b) {
                    if (a.Neighborhooods > b.Neighborhooods) {
                        return -1;
                    }
                    if (a.Neighborhooods < b.Neighborhooods) {
                        return 1;
                    }
                    return 0;
                });
                drawBarChart(graphData);
                break;
            }
        case "traveltime-ascending":
            {
                graphData.sort(function (a, b) {
                    return a.TravelTime - b.TravelTime
                });
                drawBarChart(graphData);
                break;
            }
        case "traveltime-descending":
            {
                graphData.sort(function (a, b) {
                    return b.TravelTime - a.TravelTime
                });
                drawBarChart(graphData);
                break;
            }
        default:
            break;
    }
}
