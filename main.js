// Global function called when select element is changed
function onCategoryChanged() {
  var select = d3.select("#year").node();
  var category = select.value;
  console.log(category);
  // Update chart with the selected category of cereal
  updateChart(category);
}

var data;
// Load in my states data!
d3.csv("stateslived.csv").then(function (dataset) {
  data = dataset;
  updateChart("1870");
});

function updateChart(year_filter) {
  //Width and height of map
  var width = 960;
  var height = 500;

  // D3 Projection
  var projection = d3
    .geoAlbersUsa()
    .translate([width / 2, height / 2]) // translate to center of screen
    .scale([1000]); // scale things down so see entire US

  // Define path generator
  var path = d3
    .geoPath() // path generator that will convert GeoJSON to SVG paths
    .projection(projection); // tell path generator to use albersUsa projection

  // Define linear scale for output
  var color = d3.scaleLinear().range(["rgb(213,222,217)", "rgb(0,109,44)"]);

  var legendText = ["States joined", "Unclaimed"];

  // Select the existing SVG element instead of creating a new one
  var svg = d3.select("#map");

  color.domain([0, 1]); // setting the range of the input data

  // Load GeoJSON data and merge with states data
  d3.json("us-states.json", function (json) {
    // Loop through each state data value in the .csv file
    for (var i = 0; i < data.length; i++) {
      // Grab State Name
      var dataState = data[i].state;

      // Grab data value
      var dataValue = data[i].year_admitted;

      // Find the corresponding state inside the GeoJSON
      for (var j = 0; j < json.features.length; j++) {
        var jsonState = json.features[j].properties.name;

        if (dataState == jsonState) {
          // Copy the data value into the JSON
          json.features[j].properties.year_admitted = dataValue;
          // Stop looking through the JSON
          break;
        }
      }
    }

    // Bind the data to the existing SVG and create one path per GeoJSON feature
    var paths = svg.selectAll("path").data(json.features);

    // Update existing paths
    paths.style("fill", function (d) {
      // Get data value
      // 0 if year_admitted > year_filter, otherwise 1
      var value = d.properties.year_admitted > year_filter ? 0 : 1;

      if (value) {
        // If value exists…
        return color(value);
      } else {
        // If value is undefined…
        return "rgb(213,222,217)";
      }
    });

    // Add new paths
    paths
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#fff")
      .style("stroke-width", "1")
      .style("fill", function (d) {
        // Get data value
        // 0 if year_admitted > year_filter, otherwise 1
        var value = d.properties.year_admitted > year_filter ? 0 : 1;

        if (value) {
          // If value exists…
          return color(value);
        } else {
          // If value is undefined…
          return "rgb(213,222,217)";
        }
      });

    // Remove old paths
    paths.exit().remove();
    // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
    var legend = d3
      .select("body")
      .append("svg")
      .attr("class", "legend")
      .attr("width", 140)
      .attr("height", 200)
      .selectAll("g")
      .data(color.range().reverse())
      .enter()
      .append("g")
      .attr("transform", function (d, i) {
        return "translate(0," + i * 20 + ")";
      });

    legend
      .append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function (d) {
        return d;
      });

    legend
      .append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .text(function (d, i) {
        if (i == 0) {
          return "States joined";
        } else {
          return "Unclaimed";
        }
      });
  });
}
