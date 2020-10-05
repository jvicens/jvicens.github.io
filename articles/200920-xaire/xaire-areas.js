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

// Add location

var svg = d3.select("svg")

svg.append("text")
  .attr("x", 0)             
  .attr("y", 100)
  .attr("text-anchor", "left")  
  .style("font-size", "16px") 
  .style("font-weight","bold")
  .style("text-decoration", "underline")  
  .text("location")
  .attr("id", "location");

// Add NO2 level

var svg = d3.select("svg")

svg.append("text")
  .attr("x", 0)             
  .attr("y", 120)
  .attr("text-anchor", "left")  
  .style("font-size", "16px") 
  .style("font-family", "Lato")
  //.style("text-decoration", "underline")  
  .text("location")
  .attr("id", "level");

// 

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
//.defer(d3.json, "../../data/xaire/bcn-geodata/barris/barris_topo.json")
//.defer(d3.tsv, "../../data/xaire/neighborhoods_xaire.tsv") // Load Pollution TSV
.defer(d3.json, "../../data/xaire/bcn-geodata/districtes/districtes_topo.json")
.defer(d3.tsv, "../../data/xaire/districts_xaire.tsv") // Load Pollution TSV
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
    //.defer(d3.json, "../../data/xaire/bcn-geodata/barris/barris_topo.json")
    //.defer(d3.tsv, "../../data/xaire/neighborhoods_xaire.tsv") // Load Pollution TSV
    .defer(d3.json, "../../data/xaire/bcn-geodata/districtes/districtes_topo.json")
    .defer(d3.tsv, "../../data/xaire/districts_xaire.tsv") // Load Pollution TSV
    .await(drawPollutionDistrict);
}

function drawPollutionDistrict(error, bcn_topo, xaire) { // Add parameter for unemployment
  if (error) throw error;

  // Filtering data
 //  var xaire_filtered = xaire.filter(function(d) {
 //    console.log(this.state)
 //    if (this.state == 'All'){
 //      return ((d.tipus=='tràfic' || d.tipus=='fons' || d.tipus=='pati' || d.tipus=='aula'));
 //    }
 //    if (this.state == 'Background'){
 //      return ((d.tipus=='fons'));
 //    }
 //    if (this.state == 'Schools'){
 //      return ((d.tipus=='pati' || d.tipus=='aula'));
 //    }
 //    if (this.state == 'Traffic'){
 //      return ((d.tipus=='tràfic'));
 //    }
	// });

  // Pollution dataset
      var rateById = {}; // Create empty object for holding dataset
      xaire.forEach(function(d) {
        console.log(d);
        if (d.Value != ''){
          //rateById[d.C_Barri] = +d.Value;
          rateById[d.C_Distri] = +d.Value;
        }else{
          //rateById[d.C_Barri] = 999;
          rateById[d.C_Distri] = 999;
        }
         // Create property for each ID, give it value from rate
      });

      // add states from topojson
      svg.append("g")
      //.attr("class", "neighborhoods")
      .attr("class", "districts")
      .selectAll("path")
      //.data(topojson.feature(bcn_topo, bcn_topo.objects.barris_geo).features)
      .data(topojson.feature(bcn_topo, bcn_topo.objects.districtes_geo).features)
      .enter().append("path")
      .attr("d", geoPath)
      //.style("opacity", "0.5")
      .style("fill", function(d) {
        if (rateById[d.properties.codi] != 999){
          return color(rateById[d.properties.codi]);
        }else{
          return '#eeeeee';
        }
      })
      .style("stroke", "white")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);
  // Create Event Handlers for mouse
  
  function handleMouseOver(d, i) {  // Add interactivity
    //Opcio opacity
    //d3.select(this).style("opacity", "0.8");
    //Opcio color
    d3.select(this).style("fill","white");
    d3.select(this).style("stroke", "eeeeee");
    d3.select(this).attr("class","incident hover");
    d3.select("path").attr("class","incident");

    // Location district name
    d3.select("#location")
      .style("display", "block")
      //.text(d.properties.barri);
      .text(d.properties.districte);

    //console.log('Barri: ' + d.properties.barri)
    console.log('Districte: ' + d.properties.districte)

    // Pollution level
    
    xaire.forEach(function(p) {
    //if (p.C_Barri==d.properties.codi) {
    if (p.C_Distri==d.properties.codi) {

      if (isNaN(p.Value)){
        console.log('No Value');
      }

      console.log('NO2: ' + p.Value)
      d3.select("#level")
        .style("display", "block")
        .text('NO2: ' + p.Value + ' units');
    }
    });
  }

  function handleMouseOut(d, i) {
  //Opcio opacity
    //d3.select(this).style("opacity", "1");
    //Opcio color
    d3.select(this).style("fill", function(d) {
    if (rateById[d.properties.codi] != 999){
      return color(rateById[d.properties.codi]);
    }else{
      return 'eeeeee';
    }
    })
    d3.select(this).style("stroke", "white");
    d3.select("d").attr("class","hover");

    d3.select("#location")
      .style("display", "block")
      .text('');

    d3.select("#level")
      .style("display", "block")
      .text('');

  }

}

