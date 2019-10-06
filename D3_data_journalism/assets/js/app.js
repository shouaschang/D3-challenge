// Defining chart area
var svgWidth = 960;
var svgHeight = 620;

var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100
};

// Calculate chart height and width
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Append a div classed chart to the HTML #scatter element
var chart = d3
  .select("#scatter")
  .append("div")
  .classed("chart", true);

// Append SVG element to the chart
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("assets/data/data.csv").then(function(cenususData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    cenususData.forEach(function(data) {
      data.poverty = +data.poverty;
  //    data.age = +data.age;
      data.healthcare = +data.healthcare;
//      data.obesity = +data.obesity;
//      data.income = +data.income;
//      data.smokes = +data.smokes;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(cenususData, d => d.poverty), d3.max(cenususData, d => d.poverty)])
      .range([0, svgWidth]);

    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(cenususData, d => d.healthcare), d3.max(cenususData, d => d.healthcare)])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(cenususData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "10")
    .attr("fill", "lightblue")
    .attr("opacity", "1.0");

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([0, -60])
      .html(function(d) {
        return (`${d.state}<br>Poverty Rate: ${d.poverty}%<br>Healthcare Rate: ${d.healthcare}%`);
      });

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels

    // State abbreviation
    chartGroup.append("text")
      .selectAll("tspan")
      .data(cenususData)
      .enter()
      .append("tspan")
      .style("font-size", "9px")
      .attr("class", "stateText")
      .attr("x", function(data) {
          return xLinearScale(data.poverty);
      })
      .attr("y", function(data) {
          return yLinearScale(data.healthcare);
      })
      .text(function(data) {
          return data.abbr
      });
    // y-Axis label
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

    // x-Axis label
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top - 10})`)
      .attr("x", 0)
      .attr("y", 20)
      .text("In Poverty (%)");
  }).catch(function(error) {
    console.log(error);
  });
