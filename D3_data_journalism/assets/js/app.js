// Defining SVG area for scatter plot
var svgWidth = 960;
var svgHeight = 500;

// Defining margin borders
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Calculating chart height and width
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Appending visual to the 'scatter' HTML element
var chart = d3.select("#scatter").append("div").classed("chart", true);

// Create an SVG wrapper and append SVG group that will hold our chart,
var svg = chart.append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // Create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

function yScale(data, chosenYAxis) {
  // Create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// Function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// Function used for updating yAxis var upon click on axis label
function renderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// Function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", dataset => newXScale(dataset[chosenXAxis]))
    .attr("cy", dataset => newYScale(dataset[chosenYAxis]));

  return circlesGroup;
}

// Function used for updating state labels with a transition to new circles
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(1000)
    .attr("x", dataset => newXScale(dataset[chosenXAxis]))
    .attr("y", dataset => newYScale(dataset[chosenYAxis]));
}

// Function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === 'poverty') {
    var label = "Poverty: ";
  }
  else (chosenXAxis === 'income'){
    var label = "Income: ";
  }

// Tooltip
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis], chosenXAxis}<br>${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

// Event mouseover
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/datadata.csv").then(function(dataset, err) {
  if (err) throw err;

  // Print data to console
  console.log(dataset);

  // Parse data
  dataset.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale and yLinearScale function above csv import
  var xLinearScale = xScale(dataset, chosenXAxis);
//  var yLinearScale = yScale(dataset, chosenYAxis)

  // Create y scale function
//  var yLinearScale = d3.scaleLinear()
//    .domain([0, d3.max(dataset, d => d.healthcare)])
//    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // Append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var hairLengthLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty %");

  var albumsLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(hairData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          albumsLabel
            .classed("active", true)
            .classed("inactive", false);
          hairLengthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});
