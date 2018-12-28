var width_chart3 = 400;
var height_chart3 = 300;

var margins_chart3 = {top: 10, right: 60, bottom: 50, left: 60}
var height_chart3 = height_chart3 - margins_chart3.left - margins_chart3.right,
    width_chart3 = width_chart3 - margins_chart3.top - margins_chart3.bottom,
    barPadding = 10

var colors_blue = ['#FFFFFF', '#F4F0F9', '#E9E2F3', '#DED4ED', '#D3C6E7', '#C8B8E1', '#BDABDB', '#B29DD5', '#A790CF', '#9C83C8', '#9176C2', '#8569BC', '#7A5CB6', '#6E50B0', '#6143AA', '#5437A3', '#462B9D', '#371E97', '#240F91', '#00008B']
var colors_red = ['#FFFFFF', '#FBF2F0', '#F7E5E1', '#F3D9D2', '#EECCC4', '#E9C0B5', '#E4B3A7', '#DFA799', '#D99B8B', '#D48F7E', '#CD8371', '#C77764', '#C06B57', '#B95E4A', '#B2523E', '#AB4632', '#A33926', '#9B2B1A', '#931A0E', '#8B0000']


/* Render */
render()

function render() {

  var dataset = document.URL.split('/').slice(0, -2).join('/') + '/data/climate_paper/data3.tsv'

  var dataset_absolute = []
  d3.tsv(dataset, function(data) {
      for (var i = 0; i < data.length; i++) {
          dataset_absolute.push({"endowment": data[i].endowment +'', 
                                 "contribution_absolute": data[i].absolute,
                                 "contribution_relative": data[i].relative,
                                 "treatment": data[i].treatment,
                                 "color": data[i].color})
      }

    document.getElementById("button_relative").setAttribute("class", "button-viz");
    document.getElementById("button_absolute").setAttribute("class", "button-viz-selected");

    // Create a scale for the y-axis based on data
    // >> Domain - min and max values in the dataset
    // >> Range - physical range of the scale (reversed)
    var yScale = d3.scaleLinear()
                   .domain([0, 4])
                   .range([height_chart3, 0]);

    // Implements the scale as an actual axis
    // >> Orient - places the axis on the left of the graph
    // >> Ticks - number of points on the axis, automated
    var yAxis = d3.axisLeft(yScale).ticks(5);


    // Creates a scale for the x-axis based on endowment names
    var xScale = d3.scaleBand()
                   .domain(dataset_absolute.map(function(d){
                      return d.endowment;
                    }))
                   .rangeRound([0, width_chart3], .1);


    // Creates an axis based off the xScale properties
    var xAxis = d3.axisBottom(xScale);

    // Creates the initial space for the chart
    // >> Select - grabs the empty <div> above this script
    // >> Append - places an <svg> wrapper inside the div
    // >> Attr - applies our height & width values from above
    var chart3 = d3.select('#chart3')
                  .append('svg')
                  .attr('width', width_chart3 + margins_chart3.left + margins_chart3.right)
                  .attr('height', height_chart3 + margins_chart3.top + margins_chart3.bottom)
                  .call(responsivefy)
                  .append('g')
                  .attr('transform', 'translate(' + margins_chart3.left + ',' + margins_chart3.top + ')');

    // For each value in our dataset, places and styles a bar on the chart

    // Step 1: selectAll.data.enter.append
    // >> Loops through the dataset and appends a rectangle for each value
    chart3.selectAll('rect')
         .data(dataset_absolute)
         .enter()
         .append('rect')

    // Step 2: X & Y
    // >> X - Places the bars in horizontal order, based on number of
    //        points & the width of the chart
    // >> Y - Places vertically based on scale
         .attr('x', function(d, i){
            return xScale(d.endowment) + barPadding/2;
          })
         .attr('y', function(d){
            return yScale(d.contribution_absolute);
          })

    // Step 3: Height & Width
    // >> Width - Based on barpadding and number of points in dataset
    // >> Height - Scale and height of the chart area
          .attr('width', (width_chart3 / dataset_absolute.length) - barPadding)
          .attr('height', function(d){
            return height_chart3 - yScale(d.contribution_absolute);
          })
          .attr('fill', function(d,i){
             if (d.treatment=="Equal"){return colors_red[4]}
             if (d.treatment=="Unequal"){return colors_blue[4]}
           })
          .attr("stroke", function(d,i){
             if (d.treatment=="Equal"){return colors_red[16]}
             if (d.treatment=="Unequal"){return colors_blue[16]}
           })
          .attr("stroke-width", '2')
    // Step 4: Info for hover interaction
          .attr('class', function(d){
            return d.endowment;
          })
          .attr('id', function(d){
            return d.contribution_absolute;
          })
          .on("mouseover", function (d) { showPopover.call(this, d); })
          .on("mouseout",  function (d) { removePopovers(); });

    // Renders the yAxis once the chart is finished
    // >> Moves it to the left 10 pixels so it doesn't overlap
    chart3.append('g')
         .attr('class', 'yaxis')
         .attr('transform', 'translate(-10, 0)')
         .style("font-size", ".6em")
         .call(yAxis);

    // Appends the yAxis
    chart3.append('g')
         .attr('class', 'xaxis')
         .attr('transform', 'translate(0,' + (height_chart3 + 10) + ')')
         .style("font-size", ".6em")
         .call(xAxis);

    // Adds yAxis title
    chart3.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -95)
      .attr("dy", ".6em")
      .style("font-size", ".5em")
      .style("text-anchor", "middle")
      .text("Contribution (MUs)"); 

    chart3.append("text")
      .attr("transform", "rotate(0)")
      .attr("y", 215)
      .attr("x", 170)
      .attr("dy", ".6em")
      .style("font-size", ".5em")
      .style("text-anchor", "middle")
      .text("Endowment (MUs)"); 


    $('rect').mouseenter(function(){
      $('#endowment').html(this.className.animVal);
      $('#inches').html($(this).attr('id'));
    });

  });
}

function updateRelative() {

  var dataset = document.URL.split('/').slice(0, -2).join('/') + '/data/climate_paper/data3.tsv'

  var dataset_relative = []

  d3.tsv(dataset, function(data) {
      for (var i = 0; i < data.length; i++) {
          dataset_relative.push({"endowment": data[i].endowment +'', 
                                 "contribution_absolute": data[i].absolute,
                                 "contribution_relative": data[i].relative,                                 
                                 "treatment": data[i].treatment,
                                 "color": data[i].color})
      }

      document.getElementById("button_relative").setAttribute("class", "button-viz-selected");
      document.getElementById("button_absolute").setAttribute("class", "button-viz");

      // Create a scale for the y-axis based on data
      // >> Domain - min and max values in the dataset
      // >> Range - physical range of the scale (reversed)
      yScale = d3.scaleLinear()
          .domain([0, 1])
          .range([height_chart3, 0]);

      // Implements the scale as an actual axis
      // >> Orient - places the axis on the left of the graph
      // >> Ticks - number of points on the axis, automated
      yAxis = d3.axisLeft(yScale).ticks(5);

      // Creates a scale for the x-axis based on endowment names
      xScale = d3.scaleBand()
          .domain(dataset_relative.map(function(d){
            return d.endowment;
          }))
          .rangeRound([0, width_chart3], .1);

      // Creates an axis based off the xScale properties
      xAxis = d3.axisBottom(xScale);

      // Creates the initial space for the chart
      // >> Select - grabs the empty <div> above this script
      // >> Append - places an <svg> wrapper inside the div
      // >> Attr - applies our height & width values from above
      chart3 = d3.select('#chart3');


      // For each value in our dataset, places and styles a bar on the chart

      // Step 1: selectAll.data.enter.append
      // >> Loops through the dataset and appends a rectangle for each value
      chart3.selectAll('rect')
           .data(dataset_relative)
           .transition()
           .attr('x', function(d, i){
              return xScale(d.endowment) + barPadding/2;
            })
           .attr('y', function(d){
              return yScale(d.contribution_relative);
            })
           .attr('width', (width_chart3 / dataset_relative.length) - barPadding)
           .attr('height', function(d){
             return height_chart3 - yScale(d.contribution_relative);
           })
           .attr('fill', function(d,i){
             if (d.treatment=="Equal"){return colors_red[4]}
             if (d.treatment=="Unequal"){return colors_blue[4]}
           })
           .attr("stroke", function(d,i){
             if (d.treatment=="Equal"){return colors_red[16]}
             if (d.treatment=="Unequal"){return colors_blue[16]}
           })
           .attr("stroke-width", '2')
           .attr('class', function(d){
              return d.endowment;
           })
           .attr('id', function(d){
              return d.contribution_relative;
           })
           //.on("mouseover", function (d) { showPopover.call(this, d); })
           //.on("mouseout",  function (d) { removePopovers(); })
           ;

      chart3.selectAll("g.xaxis")
           .transition()
           .call(xAxis);
      chart3.selectAll("g.yaxis")
           .transition()
           .call(yAxis);
  });
}


function updateAbsolute() {
  
  var dataset = document.URL.split('/').slice(0, -2).join('/') + '/data/climate_paper/data3.tsv'

  var dataset_absolute = []
  
  d3.tsv(dataset, function(data) {
    for (var i = 0; i < data.length; i++) {
      dataset_absolute.push({"endowment": data[i].endowment +'', 
                             "treatment": data[i].treatment,
                             "contribution_absolute": data[i].absolute,
                             "contribution_relative": data[i].relative,
                             "color": data[i].color})
    }

  document.getElementById("button_absolute").setAttribute("class", "button-viz-selected");
  document.getElementById("button_relative").setAttribute("class", "button-viz");

    // Create a scale for the y-axis based on data
    // >> Domain - min and max values in the dataset
    // >> Range - physical range of the scale (reversed)
    yScale = d3.scaleLinear()
        .domain([0, 4])
        .range([height_chart3, 0]);

    // Implements the scale as an actual axis
    // >> Orient - places the axis on the left of the graph
    // >> Ticks - number of points on the axis, automated
    yAxis = d3.axisLeft(yScale).ticks(5);

    // Creates a scale for the x-axis based on endowment names
    xScale = d3.scaleBand()
        .domain(dataset_absolute.map(function(d){
          return d.endowment;
        }))
        .rangeRound([0, width_chart3], .1);

    // Creates an axis based off the xScale properties
    xAxis = d3.axisBottom(xScale);

    // Creates the initial space for the chart
    // >> Select - grabs the empty <div> above this script
    // >> Append - places an <svg> wrapper inside the div
    // >> Attr - applies our height & width values from above
    chart3 = d3.select('#chart3');

    // For each value in our dataset, places and styles a bar on the chart

    // Step 1: selectAll.data.enter.append
    // >> Loops through the dataset and appends a rectangle for each value
    chart3.selectAll('rect')
         .data(dataset_absolute)
         .transition()
         .attr('x', function(d, i){
            return xScale(d.endowment)  + barPadding/2;
          })
         .attr('y', function(d){
            return yScale(d.contribution_absolute);
          })
         .attr('width', (width_chart3 / dataset_absolute.length) - barPadding)
         .attr('height', function(d){
           return height_chart3 - yScale(d.contribution_absolute);
         })
         .attr('fill', function(d,i){
             if (d.treatment=="Equal"){return colors_red[4]}
             if (d.treatment=="Unequal"){return colors_blue[4]}
           })
         .attr("stroke", function(d,i){
             if (d.treatment=="Equal"){return colors_red[16]}
             if (d.treatment=="Unequal"){return colors_blue[16]}
           })
         .attr("stroke-width", '2')
         .attr('class', function(d){
            return d.endowment;
         })
         .attr('id', function(d){
            return d.contribution_absolute;
         })
         //.on("mouseover", function (d) { showPopover.call(this, d); })
         //.on("mouseout",  function (d) { removePopovers(); })
         ;

    chart3.selectAll("g.xaxis")
         .transition()
         .call(xAxis);
    chart3.selectAll("g.yaxis")
         .transition()
         .call(yAxis);
  });
}

function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
      width_chart3 = parseInt(svg.style("width")),
      height_chart3 = parseInt(svg.style("height")),
      aspect_chart3 = width_chart3 / height_chart3;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr("viewBox", "0 0 " + width_chart3 + " " + height_chart3)
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
        svg.attr("height", Math.round(targetWidth / aspect_chart3));
  }
}


function removePopovers () {
  $('.popover').each(function() {
    $(this).remove();
  }); 
}

function showPopover (d) {
  console.log($(this))
  $(this).popover({
    title: d.treatment + " Treatment <br/>" +d.endowment,
    placement: 'top',
    container: 'body',
    trigger: 'manual',
    html : true,
    content: "Absolute " +parseFloat(d.contribution_absolute).toFixed(2) + "" + "<br/>" + "Relative " + parseFloat(d.contribution_relative).toFixed(2)});
  $(this).popover('show')
}
