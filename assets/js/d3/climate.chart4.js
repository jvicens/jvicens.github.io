var duration = 250;

var width_chart4 = 400;
var height_chart4 = 300;

var margins_chart4 = {top: 20, right: 20, bottom: 25, left: 35}
var height_chart4 = height_chart4 - margins_chart4.left - margins_chart4.right,
    width_chart4 = width_chart4 - margins_chart4.top - margins_chart4.bottom;

var lineOpacity = "0.25";
var lineOpacityHover = "0.9";
var otherLinesOpacityHover = "0.1";
var lineStroke = "1px";
var lineStrokeHover = "2px";

var circleOpacity = '0.9';
var circleOpacityOnLineHover = "0.25"
var othercircleOpacityHover = "0.1";
var circleRadius = 2;
var circleRadiusHover = 6;

var color = d3.scaleOrdinal(d3.schemeCategory10);

var dataset = document.URL.split('/').slice(0, -2).join('/') + '/data/climate_paper/data4.csv'

// Get the data
d3.csv(dataset, function(error, data) {
  if (error) throw error;
  // trigger render
  var labelVar = 'round';
  
  var varNames = d3.keys(data[0]).filter(function (key) { 
    return key !== labelVar;
  });
  color.domain(varNames);
  var seriesData = varNames.map(function (name) {
    return {
      name: 'Session '+name,
      values: data.map(function (d) {
        return {name: name, label: d[labelVar], value: +d[name]};
      })
    };
  });
  draw(seriesData)
});
        

function draw(data){
    /* Scale */
    var xScale = d3.scaleLinear()
      .domain([1,10])
      .range([0, width_chart4-(margins_chart4.right+margins_chart4.left)]);

    var yScale = d3.scaleLinear()
      .domain([0, 180])
      .range([height_chart4-(margins_chart4.top+margins_chart4.bottom), 0]);

    /* Add SVG */
    var svg = d3.select("#chart4").append("svg")
      .attr("width", (width_chart4+margins_chart4.right)+"px")
      .attr("height", (height_chart4+margins_chart4.top)+"px")
      .call(responsivefy)
      .append('g')
      .attr("transform", `translate(${margins_chart4.left}, ${margins_chart4.top})`);

    /* Gridlines in y axis function */
    var yGrid = d3.axisLeft(yScale)
                  .ticks(6)
                  .tickSize(-width_chart4)

    svg.append("g")     
        .attr("class", "grid")
        .attr("transform", "translate(0, 10)")
        .call(yGrid)
        .append('text')
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", -30)
        .attr("x", -100)
        .attr("dy", ".6em")
        .style("font-size", ".8em")
        .style("text-anchor", "middle")
        .text("Contribution per session (MUs)");

    /* Add line into SVG */
    var line = d3.line()
      .x(d => xScale(d.label))
      .y(d => yScale(d.value));

    let lines = svg.append('g')
      .attr('class', 'lines');

    lines.selectAll('.line-group')
      .data(data).enter()
      .append('g')
      .attr('class', 'line-group')  
      .attr("transform", "translate(10,10)")
      .on("mouseover", function(d, i) {
          svg.append("text")
            .attr("class", "title-text")
            .style("fill", color(i))        
            .text(d.name)
            .attr("text-anchor", "middle")
            .attr("x", (width_chart4-(margins_chart4.left+margins_chart4.right))/2)
            .attr("y", 20);
        })
      .on("mouseout", function(d) {
          svg.select(".title-text").remove();
        })
      .append('path')
      .attr('class', 'line')  
      .attr("d", function (d) { 
        return line(d.values); 
      })
      .style('stroke', (d, i) => color(i))
      .style('opacity', lineOpacity)
      .on("mouseover", function(d) {
          d3.selectAll('.line')
              .style('opacity', otherLinesOpacityHover);
          d3.selectAll('.circle')
              .style('opacity', circleOpacityOnLineHover);
          d3.select(this)
            .style('opacity', lineOpacityHover)
            .style("stroke-width", lineStrokeHover)
            .style("cursor", "pointer");
        })
      .on("mouseout", function(d) {
          d3.selectAll(".line")
              .style('opacity', lineOpacity);
          d3.selectAll('.circle')
              .style('opacity', circleOpacity);
          d3.select(this)
            .style("stroke-width", lineStroke)
            .style("cursor", "none");
        });


    /* Add circles in the line */
    lines.selectAll("circle-group")
      .data(data).enter()
      .append("g")
      .style("fill", (d, i) => color(i))
      .selectAll("circle")
      .data(d => d.values).enter()
      .append("g")
      .attr("class", "circle")  
      .attr("transform", "translate(10,10)")
      .on("mouseover", function(d) {
          d3.select(this)     
            .style("cursor", "pointer")
            .append("text")
            .attr("class", "text")
            .text(`${d.value}`)
            .attr("x", d => xScale(d.label) + 5)
            .attr("y", d => yScale(d.value) - 10);
        })
      .on("mouseout", function(d) {
          d3.select(this)
            .style("cursor", "none")  
            .transition()
            .duration(duration)
            .selectAll(".text").remove();
        })
      .append("circle")
      .attr("cx", d => xScale(d.label))
      .attr("cy", d => yScale(d.value))
      .attr("r", circleRadius)
      .style('opacity', circleOpacity)
      .on("mouseover", function(d) {
            d3.select(this)
              .transition()
              .duration(duration)
              .attr("r", circleRadiusHover);
          })
        .on("mouseout", function(d) {
            d3.select(this) 
              .transition()
              .duration(duration)
              .attr("r", circleRadius);  
          });


    /* Add Axis into SVG */
    var xAxis = d3.axisBottom(xScale).ticks(10);

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(10, ${height_chart4-margins_chart4.bottom})`)
      .call(xAxis)
      .append('text')
      .attr("fill", "#000")
      .attr("transform", "rotate(0)")
      .attr("y", 20)
      .attr("x", (width_chart4-(margins_chart4.left+margins_chart4.right))/2)
      .attr("dy", ".6em")
      .style("font-size", ".8em")
      .style("text-anchor", "middle")
      .text("Round");

    /*
    var yAxis = d3.axisLeft(yScale).ticks(10);

    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0, -10)")
      .call(yAxis)
      .append('text')
      .attr("y", 15)
      .attr("transform", "rotate(-90)")
      .attr("fill", "#000")
      .text("Total values");
      */

    }



