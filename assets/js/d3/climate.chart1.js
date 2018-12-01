
function handleMouseOverEqual(d, i) { 
  d3.select("#te" + i)
    .style("fill", "#000")
}

function handleMouseOutEqual(d, i) {
  d3.select("#te" + i)
    .style("fill", function(d) { return colorScale1(d.value);})
}

var colors_red = ['#FFFFFF', '#FBF2F0', '#F7E5E1', '#F3D9D2', '#EECCC4', '#E9C0B5', '#E4B3A7', '#DFA799', '#D99B8B', '#D48F7E', '#CD8371', '#C77764', '#C06B57', '#B95E4A', '#B2523E', '#AB4632', '#A33926', '#9B2B1A', '#931A0E', '#8B0000']

var width = 960
var height = 350

var margin = { top: 80, right: 100, bottom: 30, left: 180 },
    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom,
    gridSize = Math.floor(width/12),
    legendElementWidth = gridSize/2,
    buckets = 20,
    colors1 = colors_red,
    contributed = ["0", "24", "48", "72", "96", "120"],
    cluster = ["Cluster 1", "Cluster 2"];
    datasets = [];


var svg1 = d3.select("#chart1").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(responsivefy)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var timeLabels1 = svg1.selectAll(".timeLabel")
    .data(contributed)
    .enter().append("text")
      .text(function(d) { return d; })
      .attr("x", function(d, i) { return i * gridSize; })
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 100 + ", -10)")
      .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

/* Legend */

//var margin_bottom_legend = height-(height/2)
//console.log(margin_bottom_legend)

svg1.append("g")
  .attr("class", "legendLinear")
  .attr("transform", "translate(-50,125)");

var colorScale1 = d3.scaleLinear()
  .domain(d3.range(0, 1, 0.05))
  .range(colors1);

var legendLinear1 = d3.legendColor()
  .shapeWidth(20)
  .cells(20)
  .orient('horizontal')
  .shapePadding(1)
  .labels(["0", "", "0.1", "", "0.2", "", "0.3", "", "0.4", "", "0.5", "", "0.6", "", "0.7", "", "0.8", "", "0.9", "", "1.0", ""])
  .scale(colorScale1);

var clusterLabels = svg1.selectAll(".clusterLabel")
  .data(cluster)
  .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", 0)
    .attr("y", function (d, i) { return i * gridSize; })
    .style("text-anchor", "end")
    .attr("transform", "translate(-10," + gridSize / 1.75 + ")")
    .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

svg1.select(".legendLinear").call(legendLinear1);

var heatmapChart1 = function(tsvFile) {
  d3.tsv(tsvFile,
  function(d) {
    return {
      cluster: +d.cluster,
      contributed: +d.contributed,
      value: +d.value
    };
  },
  function(error, data) {

    var colorScale1 = d3.scaleLinear()
      .domain(d3.range(0, 1, 0.05))
      .range(colors1);

    var cards1 = svg1.selectAll(".time")
        .data(data, function(d) {return d.cluster+':'+d.contributed;});

    cards1.append("title");

    cards1.enter().append("rect")
        .attr("x", function(d) { return (d.contributed/24) * gridSize; })
        .attr("y", function(d) { return (d.cluster - 1) * gridSize; })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "time bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", colorScale1(0))
        .on("mouseover", handleMouseOverEqual)
        .on("mouseout", handleMouseOutEqual);;

    cards1.enter().append("text")
        .attr("id", function(d, i) { return "te" + i;})
        .attr("x", function(d, i) { 
          if (d.cluster == 1){return (gridSize * i)}
          else {return gridSize * (i-6)}
        })
        .attr("y", function(d, i) { 
          if (d.cluster == 1){return gridSize/2}
          else {return gridSize + gridSize/2}
        })
        .style("fill", function(d) { return colorScale1(d.value);})
        .attr("class", "text mono")
        .attr("dx", (gridSize/4))
        .attr("dy", 4)
        .text(function(d) { return parseFloat(d.value).toFixed(2);});

    cards1.transition().duration(1000)
        .style("fill", function(d) { return colorScale1(d.value); });

    cards1.select("title").text(function(d) { return d.value; });
    
    cards1.exit().remove();
    
   });  
};


function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    // to register multiple listeners for same event type, 
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}

  datasets.push(document.URL.split('/').slice(0, -2).join('/') + '/data/climate_paper/data1.tsv')
  datasets.push(document.URL.split('/').slice(0, -2).join('/') + '/data/climate_paper/data2.tsv')
  
  heatmapChart1(datasets[0]);

/* Buttons

var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
  .data(datasets);

datasetpicker.enter()
  .append("input")
  .attr("value", function(d){ return "Dataset " + d })
  .attr("type", "button")
  .attr("class", "dataset-button")
  .on("click", function(d) {
    updateLegend(d);
    heatmapChart(d);
  });
*/


