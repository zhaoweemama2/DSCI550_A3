// Define chart dimensions and margins
const width = 975;
const height = 610;
const margin = { top: 10, right: 10, bottom: 10, left: 10 };

// Create SVG element
const svg = d3.select('body').append('svg')
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "width: 100%; height: auto; height: intrinsic;");

// Load geographic and population data
Promise.all([
    d3.json("../json_data/us.json"), // Ensure this path correctly points to your geographic data
    d3.json("../json_data/bubblemap_data.json") // Ensure this path correctly points to your population data
]).then(async function([us, population]) {

    // Filter out Alaska and Hawaii from the map
    us.objects.lower48 = {
        type: "GeometryCollection",
        geometries: us.objects.states.geometries.filter(d => d.id !== "02" && d.id !== "15")
    };

    countymap = new Map(topojson.feature(us, us.objects.counties).features.map(d => [d.id, d]))
    console.log("CountyMap ", countymap);

    // Join the geographic shapes and the population data.
    const data = population.map(d => ({
        ...d,
        county: countymap.get(d.state + d.county) // Adjust this if the FIPS code construction is different
    })).filter(d => d.county && d.county.geometry);

    // Construct the radius scale.
    const radius = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.population)])
        .range([0, 40]);

    // Construct a path generator.
    const path = d3.geoPath();

    // Draw counties
    svg.selectAll(".county")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("class", "county")
        .attr("d", path)
        .attr("fill", "#ddd");

    // Add a circle for each county, positioned by centroids
    svg.append("g")
        .selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => {
            try {
                const centroid = path.centroid(d.county);
                return centroid[0];
            } catch (error) {
                console.error("Failed to calculate centroid for:", d);
                return 0; // Default position if centroid calculation fails
            }
        })
        .attr("cy", d => {
            try {
                return path.centroid(d.county)[1];
            } catch (error) {
                return 0; // Default position if centroid calculation fails
            }
        })
        .attr("r", d => radius(d.population))
        .attr("fill", "brown")
        .attr("fill-opacity", 0.5)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.5)
        .append("title")
        .text(d => `${d.county.properties.name}, Population: ${d.population}`);
}).catch(error => {
    console.error("Failed to load data:", error);
});
