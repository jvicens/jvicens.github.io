
function handleMouseOverUnequal(d, i) { 
  d3.select("#tu" + i)
    .style("fill", "#000")
}

function handleMouseOutUnequal(d, i) {
  d3.select("#tu" + i)
    .style("fill", function(d) { return colorScale2(d.value);})
}

var colors_blues = ['#FFFFFF', '#F4F0F9', '#E9E2F3', '#DED4ED', '#D3C6E7', '#C8B8E1', '#BDABDB', '#B29DD5', '#A790CF', '#9C83C8', '#9176C2', '#8569BC', '#7A5CB6', '#6E50B0', '#6143AA', '#5437A3', '#462B9D', '#371E97', '#240F91', '#00008B']

var width = 960
var height = 410

var margin = { top: 80, right: 100, bottom: 30, left: 180 },
    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom,
    gridSize = Math.floor(width/12),
    legendElementWidth = gridSize/2,
    buckets = 20,
    colors2 = colors_blues,
    contributed = ["0", "24", "48", "72", "96", "120"],
    cluster = ["Cluster 1", "Cluster 2", "Cluster 3"];
    datasets = [];


var svg2 = d3.select("#chart2").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(responsivefy)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var timeLabels2 = svg2.selectAll(".timeLabel")
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

svg2.append("g")
  .attr("class", "legendLinear")
  .attr("transform", "translate(-50,180)");

var colorScale2 = d3.scaleLinear()
  .domain(d3.range(0, 2, 0.1))
  .range(colors2);

var legendLinear2 = d3.legendColor()
  .shapeWidth(20)
  .cells(20)
  .orient('horizontal')
  .shapePadding(1)
  .labels(["0", "", "0.2", "", "0.4", "", "0.6", "", "0.8", "", "1", "", "1.2", "", "1.4", "", "1.6", "", "1.8", ""])
  .scale(colorScale2);

var clusterLabels = svg2.selectAll(".clusterLabel")
  .data(cluster)
  .enter().append("text")
    .text(function (d) { return d; })
    .attr("x", 0)
    .attr("y", function (d, i) { return i * gridSize; })
    .style("text-anchor", "end")
    .attr("transform", "translate(-10," + gridSize / 1.75 + ")")
    .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

svg2.select(".legendLinear").call(legendLinear2);

var heatmapChart2 = function(tsvFile) {
  d3.tsv(tsvFile,
  function(d) {
    return {
      cluster: +d.cluster,
      contributed: +d.contributed,
      value: +d.value
    };
  },
  function(error, data) {
    var domain = d3.range(0, 2, 0.1)

    var colorScale2 = d3.scaleLinear()
      .domain(domain)
      .range(colors2);

    var cards2 = svg2.selectAll(".time")
        .data(data, function(d) {return d.cluster+':'+d.contributed;});

    cards2.append("title");

    cards2.enter().append("rect")
        .attr("x", function(d) { return (d.contributed/24) * gridSize; })
        .attr("y", function(d) { return (d.cluster - 1) * gridSize; })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "time bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", colorScale2(0))
        .on("mouseover", handleMouseOverUnequal)
        .on("mouseout", handleMouseOutUnequal);;

    cards2.enter().append("text")
        .attr("id", function(d, i) { return "tu" + i;})
        .attr("x", function(d, i) { 
          if (d.cluster == 1){return (gridSize * i)}
          if (d.cluster == 2){return (gridSize * (i-6))}
          else {return gridSize * (i-12)}
        })
        .attr("y", function(d, i) { 
          return ((d.cluster-1)*gridSize) + gridSize/2
        })
        .style("fill", function(d) { return colorScale2(d.value);})
        .attr("class", "text mono")
        .attr("dx", (gridSize/4))
        .attr("dy", 4)
        .text(function(d) { return parseFloat(d.value).toFixed(2);});

    cards2.transition().duration(1000)
        .style("fill", function(d) { return colorScale2(d.value); });

    cards2.select("title").text(function(d) { return d.value; });
    
    cards2.exit().remove();
    
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

/* Buttons

var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
  .data(datasets);

datasetpicker.enter()
  .append("input")
  .attr("value", function(d){ return "Dataset " + d })
  .attr("type", "button")
  .attr("class", "dataset-button")
  .on("click", function(d) {
    heatmapChart(d);
  });
*/
  datasets.push(document.URL.split('/').slice(0, -2).join('/') + '/data/climate_paper/data1.tsv')
  datasets.push(document.URL.split('/').slice(0, -2).join('/') + '/data/climate_paper/data2.tsv')
  
  heatmapChart2(datasets[1]);
  heatmapChart2(datasets[1]);


