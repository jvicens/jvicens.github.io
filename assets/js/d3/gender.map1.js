
var width_map1 = 500;
var height_map1 = 600;

var margins_map1 = {top: 20, right: 20, bottom: 20, left: 20}
var height_map1 = height_map1 - margins_map1.left - margins_map1.right;
var width_map1 = width_map1 - margins_map1.top - margins_map1.bottom;

// set projection
var projection = d3.geoAlbers()
    .scale( 180000 )
    .rotate([-2.15,0])
    .center([0,41.38])
    .translate( [width_map1/2,height_map1/2]);

// create svg variable

var map1 = d3.select("#map1")
  .append("svg")
  .attr('width', width_map1)
  .attr('height', height_map1)
  .call(responsivefy)
  .append('g')
  .attr('transform', 'translate(' + margins_map1.left*2 + ',' + margins_map1.top*2 + ')');

// create path variable
var path = d3.geoPath()
    .projection(projection);

// Colors
var color = d3.scaleQuantize()
    .domain([-15,25])
    .range(colorbrewer.Greens[8]);

// Legend
// https://d3-legend.susielu.com/
map1.append("g")
    .attr("class", "legendLog")
    .attr("transform", "translate(0,300)");

var logLegend = d3.legendColor()
    .shapePadding(5)
//   .title('% women differential')
    .scale(color);

map1.selectAll(".legendLog")
    .call(logLegend);

var dataset_unemployment = document.URL.split('/').slice(0, -2).join('/') + '/data/gender_map/2018_atur_per_sexe.csv'
var topo_bcn = document.URL.split('/').slice(0, -2).join('/') + '/data/bcn-geodata/barris/barris_topo.json'

// Add data
d3.queue()
  .defer(d3.json, topo_bcn)
  .defer(d3.csv, dataset_unemployment) // Load Pollution TSV
  .await(mapBarris);

// Show bar chart
showBar();

function mapBarris(error, topo, unenployment) {
  
  if (error) throw error;

  // unenployment = processUnemploymentData(unenployment)

  neighbourhood = topojson.feature(topo, topo.objects.barris_geo).features

  // add states from topojson
  map1.selectAll("path")
    .data(neighbourhood).enter()
    .append("path")
    .attr("class", "feature")
    .style("fill", "lightgrey")
    .attr("d", path)
    .style("fill", function(d) {
        return color(getNeighbourhoodData(d.properties.codi,unenployment)['differential']);
    })
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  // put boarder around states 
  map1.append("path")
    .datum(topojson.mesh(topo, topo.objects.barris_geo, function(a, b) { return a !== b; }))
    .attr("class", "mesh")
    .attr("d", path);

  // Create Event Handlers for mouse
    function handleMouseOver(d, i) {  // Add interactivity
        // Fill grey
        d3.select(this).style("fill","lightgrey");


        // Barri id and name
        // d3.selectAll('h3')
        //     .text(d.properties.codi +'- '+d.properties.barri)
        //     .style("display", "block")
        //     .style("font-weight","bold")

        // Unenployment data
        u = getNeighbourhoodData(d.properties.codi,unenployment)

        d3.selectAll('h4')
            .text('M: '+ u['male'] +' F: '+ u['female'] +' Diff: '+u['differential'].toFixed(2))
            .style("display", "block")
            .style("font-weight","bold")

        $('#neighbourhood').html(d.properties.barri);
        if (u['differential'].toFixed(2)>0){
          $('#value').html('+' + u['differential'].toFixed(2)+ '%');
          $('#differential').html('unemployed women');
        }else{
          $('#value').html(u['differential'].toFixed(2)+ '%');
          $('#differential').html('unemployed women');
        }

        var color_neighbourhood = color(getNeighbourhoodData(d.properties.codi,unenployment)['differential'])
        
        changeData(u, color_neighbourhood)

        document.getElementById('table_values').style.backgroundColor = color_neighbourhood;

    }

    function handleMouseOut(d, i) {
        //Opcio opacity
        //d3.select(this).style("opacity", "0.5");
        //Opcio color
        d3.select(this).style("fill", function(d) {
            return color(getNeighbourhoodData(d.properties.codi,unenployment)['differential']);
          })
        d3.select("d").attr("class","hover");
        // Select text by id and then remove
        //d3.select("#t" + i).remove();  // Remove text location
        //d3.select("#r" + i).remove();  // Remove rectangle location

    }
}

function processUnemploymentData(unenployment){

  // Total barris a Barcelona
  n_barris = 73

  total_male = 0
  total_female = 0

  var array_unenployment = []
 
  for (i = 1; i < n_barris; i++) {
    var u = {id_barri:"", name_barri:"", male:0, female:0, total:0};
    unenployment.forEach(function(d) {
      if (d.Any==2018 & d.Mes==9 & d.Codi_Barri==i & d.Demanda_ocupacio == "Atur registrat"){
        u['id_barri'] = d.Codi_Barri
        u['name_barri'] = d.Nom_Barri
        if (d.Sexe == 'Homes'){
          u['male'] = parseInt(d.Nombre)
          total_male = total_male + parseInt(d.Nombre)
        }
        if (d.Sexe == 'Dones'){
          u['female'] = parseInt(d.Nombre)
          total_female = total_female + parseInt(d.Nombre)
        }
        u['total'] = parseInt(u['male']) + parseInt(u['female'])
        u['differential'] = ((parseInt(u['male']) - parseInt(u['female'])) / (parseInt(u['male']) + parseInt(u['female'])))*100
      }
  })
  array_unenployment.push(u)
  }
  u['id_barri'] = 1000;
  u['name_barri'] = 'Barcelona';
  u['male'] = total_male;
  u['female'] =  total_female;
  u['total'] = total_male + total_female;
  u['differential'] = ((parseInt(u['male']) - parseInt(u['female'])) / (parseInt(u['male']) + parseInt(u['female'])))*100
  
  array_unenployment.push(u)

  return array_unenployment

}

function getNeighbourhoodData(nid,unenployment){

  // Total barris a Barcelona
  n_barris = 73
  min_index = 100
  max_index = -100

  var array_unenployment = []
  
    var u = {id_barri:"", name_barri:"", male:0, female:0, total:0};
    unenployment.forEach(function(d) {

      if (d.Any==2018 & d.Mes==9 & parseInt(d.Codi_Barri)==parseInt(nid) & d.Demanda_ocupacio == "Atur registrat"){
        u['id_barri'] = d.Codi_Barri
        u['name_barri'] = d.Nom_Barri
        if (d.Sexe == 'Homes'){
          u['male'] = parseInt(d.Nombre)
        }
        if (d.Sexe == 'Dones'){
          u['female'] = parseInt(d.Nombre)
        }
        u['total'] = parseInt(u['male']) + parseInt(u['female'])
        u['perc_male'] = (parseInt(u['male']) / (parseInt(u['male']) + parseInt(u['female'])))*100
        u['perc_female'] = (parseInt(u['female']) / (parseInt(u['male']) + parseInt(u['female'])))*100
        u['differential'] = ((parseInt(u['female']) - parseInt(u['male'])) / (parseInt(u['male']) + parseInt(u['female'])))*100

      }
  })
  return u
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadUnemplomentRates() {
}

function changeData(data, color){

  console.log(data)
  var dataset = [
  {"gender": "Female", "number": data.perc_female},
  {"gender": "Male", "number": data.perc_male},
  ]
  var margins = {top: 100, right: 50, bottom: 50, left: 50}
var height = 300 - margins.top - margins.bottom,
    width = 300 - margins.left - margins.right,
    barPadding = 2

  var chart = d3.select("#chart1").call(responsivefy)


  var yScale = d3.scaleLinear()
  .domain([0,100])
  //.domain([0, d3.max(dataset, function(d){
  //  return d.number;
  //})])
  .range([height, 0]);

// Implements the scale as an actual axis
// >> Orient - places the axis on the left of the graph
// >> Ticks - number of points on the axis, automated
var yAxis = d3.axisLeft(yScale)
              .ticks(4);


// Creates a scale for the x-axis based on gender
var xScale = d3.scaleOrdinal()
  .domain(dataset.map(function(d){
    return d.gender;
  }))
  .range([0, width-100], .1);

// Creates an axis based off the xScale properties
  var xAxis = d3.axisBottom(xScale);

  chart.selectAll('rect')
  .data(dataset)
  .transition()
  .attr('x', function(d, i){
    return xScale(d.gender);
  })
  .attr('y', function(d){
    return yScale(d.number);
  })

  // Step 3: Height & Width
  // >> Width - Based on barpadding and number of points in dataset
  // >> Height - Scale and height of the chart area
  .attr('width', (width / dataset.length) - barPadding)
  .attr('height', function(d){
    return height - yScale(d.number);
  })
  .attr('fill', color);

}

function showBar(){

    var dataset = [
    {"gender": "Female", "number": 0},
    {"gender": "Male", "number": 0},
    ]

    // Dimensions for the chart: height, width, and space b/t the bars
    var margins = {top: 100, right: 50, bottom: 50, left: 50}
    var height = 300 - margins.top - margins.bottom,
      width = 300 - margins.left - margins.right,
      barPadding = 2

    // Create a scale for the y-axis based on data
    // >> Domain - min and max values in the dataset
    // >> Range - physical range of the scale (reversed)
    var yScale = d3.scaleLinear()
    .domain([0,100])
    //.domain([0, d3.max(dataset, function(d){
    //  return d.number;
    //})])
    .range([height, 0]);

    // Implements the scale as an actual axis
    // >> Orient - places the axis on the left of the graph
    // >> Ticks - number of points on the axis, automated
    var yAxis = d3.axisLeft(yScale).ticks(4);

    // Creates a scale for the x-axis based on gender
    var xScale = d3.scaleOrdinal()
    .domain(dataset.map(function(d){
      return d.gender;
    }))
    .range([0, width-100], .1);

    // Creates an axis based off the xScale properties
    var xAxis = d3.axisBottom(xScale);

    // Creates the initial space for the chart
    // >> Select - grabs the empty <div> above this script
    // >> Append - places an <svg> wrapper inside the div
    // >> Attr - applies our height & width values from above
    var chart = d3.select("#chart1").append('svg')
    .attr('width', width + margins.left + margins.right)
    .attr('height', height + margins.top + margins.bottom)
    .call(responsivefy)
    .append('g')
    .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');


    // For each value in our dataset, places and styles a bar on the chart

    // Step 1: selectAll.data.enter.append
    // >> Loops through the dataset and appends a rectangle for each value
    chart.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')

    // Step 2: X & Y
    // >> X - Places the bars in horizontal order, based on number of
    //        points & the width of the chart
    // >> Y - Places vertically based on scale
    .attr('x', function(d, i){
      return xScale(d.gender);
    })
    .attr('y', function(d){
      return yScale(d.number);
    })

    // Step 3: Height & Width
    // >> Width - Based on barpadding and number of points in dataset
    // >> Height - Scale and height of the chart area
    .attr('width', (width / dataset.length) - barPadding)
    .attr('height', function(d){
      return height - yScale(d.number);
    })
    .attr('fill', 'black');


    // Renders the yAxis once the chart is finished
    // >> Moves it to the left 10 pixels so it doesn't overlap
    chart.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(-10, 0)')
    .call(yAxis);

    // text label for the y axis
    chart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left - 30)
      .attr("x",0 - (height / 2))
      .attr("dy", ".7em")
      .style("font-size", ".7em")
      .style("text-anchor", "middle")
      .text("% unemployment by gender");      

    // Appends the yAxis
    chart.append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate('+ margins.left +',' + (height + 10) + ')')
    .call(xAxis);

    // Adds yAxis title
    chart.append('text')
    .text('')
    .attr('transform', 'translate(0, 0)');

}

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
