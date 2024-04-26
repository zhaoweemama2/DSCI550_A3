// Define chart dimensions and margins
const margin = { top: 20, right: 20, bottom: 60, left: 60 }; // Increased left and bottom margins
const width = 928 - margin.left - margin.right; // Adjust width to account for margins
const height = 928 - margin.top - margin.bottom; // Adjust height to account for margins

// Create SVG element
const svg = d3.select('body').append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load data
d3.json("../json_data/hexbin_data.json").then(function(data) {
    // Define logarithmic scales
    const x = d3.scaleLog()
        .domain(d3.extent(data, d => +d['Witness Count']).map(d => Math.max(1, d))) // Ensure positive non-zero minimum
        .range([0, width]);

    const y = d3.scaleLog()
        .domain([1500, 10000000]) // Domain from 1.5k to 10M
        .range([height, 0]);

    // Define the hexbin generator
    const hexbin = d3.hexbin()
        .x(d => x(+d['Witness Count']))  // Ensure values are coerced to numbers
        .y(d => y(+d['National Park Visitation Count']))  // Ensure values are coerced to numbers
        .radius(8)  // Adjust radius as necessary
        .extent([[0, 0], [width, height]]);

    // Prepare bins
    const bins = hexbin(data);

    // Define a color scale
    const color = d3.scaleSequential(d3.interpolateBuPu)
        .domain([0, d3.max(bins, d => d.length)]);

    // Draw hexagons
    svg.append("g")
        .attr("class", "hexagons")
        .selectAll(".hexagon")
        .data(bins)
        .enter().append("path")
        .attr("class", "hexagon")
        .attr("d", hexbin.hexagon())
        .attr("transform", d => `translate(${d.x}, ${d.y})`)
        .attr("fill", d => color(d.length))
        .attr("stroke", "black")
        .attr("stroke-width", 0.75);

    // Append the x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(5, ".1s"))
        .selectAll("line")
        .attr("stroke", "#ccc")  // Set color of ticks
        .attr("stroke-dasharray", "2,2");  // Set dashed pattern for ticks

    svg.append("text")
        .attr("fill", "#000")
        .attr("x", width)
        .attr("y", height + margin.bottom / 2)
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .text("Witness Count");

    // Append the y-axis
    svg.append("g")
        .call(d3.axisLeft(y).ticks(5, ".1s"))
        .selectAll("line")
        .attr("stroke", "#ccc")  // Set color of ticks
        .attr("stroke-dasharray", "2,2");  // Set dashed pattern for ticks

    svg.append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left / 2)
        .attr("dy", "-1.1em")
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .text("National Park Visitation Count");
});



