// Our D3 code will go here.

// Width and Height of the whole visualization
var width = 1000;
var height = 1000;

var state = 'All';

// Create SVG
// Create SVG variable
var svg = d3.select("#chart")
   // Container class to make it responsive.
   .classed("svg-container", true) 
   .append("svg")
   // Responsive SVG needs these 2 attributes and no width and height attr.
   .attr("preserveAspectRatio", "xMinYMin meet")
   .attr("viewBox", "0 0 1000 1000")
   // Class to make it responsive.
   .classed("svg-content-responsive", true)
;

// Append empty placeholder g element to the SVG
// g will contain geometry elements
//var g = svg.append( "g" );
//var p = svg.append( "p" );

// Width and Height of the whole visualization
// Set Projection Parameters
var projection = d3.geoAlbers()
.scale( 300000 )
.rotate([-2.15,0])
.center([0, 41.38])
.translate( [width/2,height/2]);

// Colors
var colors = ["#f7ccce", "#ef9a9e", "#e7676d", "#df353d", "#d7030d", "#c1020b", "#960209", "#6b0106", "#400003"]

var color = d3.scaleThreshold()
.domain([20, 25, 30, 35, 40, 45, 50, 150])
.range(colors.slice(0, 8));
// Legend
var svg = d3.select("svg");

svg.append("g")
.attr("class", "legendLog")
.attr("transform", "translate(125,550)");

var logLegend = d3.legendColor()
.shape("path", d3.symbol().type(d3.symbolCircle).size(200)())
.shapePadding(10)
.labels(['< 20', '21 - 25', '26 - 30', '31 - 35', '36 - 40', '41 - 45', '46 - 50',  '> 50'])
.scale(color);

svg.select(".legendLog")
.call(logLegend);

// Create GeoPath function that uses built-in D3 functionality to turn
// lat/long coordinates into screen coordinates
var geoPath = d3.geoPath()
.projection(projection);

// Scale
var kilometers = d3.geoScaleBar()
  .left(.45)
  .distance(4);

var scale_bar_kilometers = svg.append("g")
.attr("class", "scaleMap");

// Add data
d3.queue()
.defer(d3.json, "../../data/xaire/bcn-geodata/districtes/districtes_topo.json")
.defer(d3.csv, "../../data/xaire/xaire_clean.csv") // Load Pollution TSV
.await(drawPollutionDistrict);

// Zoom behavior
// var zoom = d3.zoom()
// .scaleExtent([1, 8])
// .on("zoom", zoomed);

// svg.call(zoom); // delete this line to disable free zooming

// function zoomed() {
// svg.style("stroke-width", 1.5 / d3.event.transform.k + "px");
//  svg.attr("transform", d3.event.transform); // updated for d3 v4
// }

function updateData(id){
  this.state = id

  d3.queue()
    .defer(d3.json, "../../data/xaire/bcn-geodata/districtes/districtes_topo.json")
    .defer(d3.csv, "../../data/xaire/xaire_clean.csv") // Load Pollution TSV
    .await(drawPollutionDistrict);
}

function drawPollutionDistrict(error, bcn_topo, xaire) { // Add parameter for unemployment
  if (error) throw error;

  // Filtering data
  var xaire_filtered = xaire.filter(function(d) {
    console.log(this.state)
    if (this.state == 'All'){
      return ((d.tipus=='tràfic' || d.tipus=='fons' || d.tipus=='pati' || d.tipus=='aula'));
    }
    if (this.state == 'Background'){
      return ((d.tipus=='fons'));
    }
    if (this.state == 'Schools'){
      return ((d.tipus=='pati' || d.tipus=='aula'));
    }
    if (this.state == 'Traffic'){
      return ((d.tipus=='tràfic'));
    }
	});

  var total_points = Object.keys(xaire_filtered).length
  console.log('Number of Points: ' + total_points);


  // Scale
  kilometers.fitSize([width, height], topojson.feature(bcn_topo, bcn_topo.objects.districtes_geo)).projection(projection);
  scale_bar_kilometers.call(kilometers);

  svg.selectAll(".scale-bar").attr("transform", "translate(125, 800)")

  // District
  svg.append("g")
  .attr("class", "district")
  .selectAll("path")
  .data(topojson.feature(bcn_topo, bcn_topo.objects.districtes_geo).features)
  .enter().append("path")
  .attr("d", geoPath)
  //.style("opacity", "0.5")
  .style("fill", "eeeeee")
  .style("stroke", "white")
  //.on("mouseover", handleMouseOver)
  //.on("mouseout", handleMouseOut);

  // Points
  svg.selectAll(".pin")
  .data(xaire_filtered)
  .enter().append("circle", ".pin")
  .style("fill", function(d) {
    return color(d.no2_corregit);
  })
  .attr("r", 5)
  .attr("transform", function(d) {
    return "translate(" + projection([parseFloat(d.long.replace(',', '.')),parseFloat(d.lat.replace(',', '.'))]) + ")";
  })
  .on("mouseover", handleMouseOver)
  .on("mouseout", handleMouseOut);


  // Create Event Handlers for mouse
  function handleMouseOver(d, i) {  // Add interactivity

    var x = projection([parseFloat(d.long.replace(',', '.')),parseFloat(d.lat.replace(',', '.'))])[0]
    var y = projection([parseFloat(d.long.replace(',', '.')),parseFloat(d.lat.replace(',', '.'))])[1]

    // Polution over the point
    svg.append("text")
    .attr("id", "t" + i)
    .attr("x", x)
    .attr("y", y - 25)
    .attr("text-anchor", "middle")
    .attr("font-size", ".9em")
    .attr("font-weight", "bold")
    .text('NO2: ' + d.no2_corregit + ' units');

    //Opcio opacity
    //d3.select(this).style("opacity", "1.0");
    //Opcio color
    d3.select(this).attr("r", 20);

    //var coordinates = [0, 0];
    //coordinates = d3.mouse(this);

    //d3.select(this).attr("class","incident hover");
    //d3.select("path").attr("class","incident");

    // Street name
    //d3.selectAll('h3')
    //.text(d.address)
    //.style("display", "block")
    //.style("font-weight","bold")
    //.attr("top", "300px")
    //.attr("left", "300px")

    // Pollution value
    //d3.selectAll('h4')
    //.style("display", "block")
    //.text('NO2 ' + d.no2_corregit + ' units')
  }

  function handleMouseOut(d, i) {
    d3.select(this).style("fill", function(d) {
      return color(d.no2_corregit);
    })
    d3.select(this).attr("r", 5);

    // Select text by id and then remove
    d3.select("#t" + i).remove();  // Remove text location

    //Opcio opacity
    //d3.select(this).style("opacity", "0.5");
    //Opcio color
    //d3.select(this).style("fill", function(d) {
    //    return color(rateById[d.properties.codi]);
    //  })
    //d3.select("d").attr("class","hover");
  }

}

