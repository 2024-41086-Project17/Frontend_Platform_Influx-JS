// Add this function to create the legend for environmental measurements
function createEnvironmentLegend() {
    const legend = d3.select("#environment-legend");

    const legendData = [
        { label: "Temperature", color: "steelblue" },
        { label: "Humidity", color: "orange" },
        { label: "Pressure", color: "green" }
    ];

    const legendItems = legend.selectAll("div")
        .data(legendData)
        .enter()
        .append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("margin", "5px 0");

    legendItems.append("div")
        .style("width", "20px")
        .style("height", "20px")
        .style("background-color", d => d.color)
        .style("margin-right", "10px");

    legendItems.append("div")
        .text(d => d.label)
        .style("color", "#000");
}

// Add this function to create the legend for water height measurements
function createWaterHeightLegend() {
    const legend = d3.select("#water-height-legend");

    const legendData = [
        { label: "Radar Height", color: "purple" },
        { label: "Ultrasonic Height", color: "teal" }
    ];

    const legendItems = legend.selectAll("div")
        .data(legendData)
        .enter()
        .append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("margin", "5px 0");

    legendItems.append("div")
        .style("width", "20px")
        .style("height", "20px")
        .style("background-color", d => d.color)
        .style("margin-right", "10px");

    legendItems.append("div")
        .text(d => d.label)
        .style("color", "#000");
}

// Call the legend creation functions after data is fetched
complete() {
    console.log('Data fetched, ready to visualize');
    // Call D3 visualization functions after data is fetched
    visualizeEnvironmentData(dataPoints);
    visualizeWaterHeightData(dataPoints);
    createEnvironmentLegend(); // Create the environment legend
    createWaterHeightLegend(); // Create the water height legend
}
