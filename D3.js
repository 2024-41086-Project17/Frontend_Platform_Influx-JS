import * as d3 from 'd3';
import { InfluxDB } from '@influxdata/influxdb-client';

// InfluxDB connection details
const url = process.env.INFLUXDB_URL; // Your InfluxDB URL
const token = process.env.INFLUXDB_TOKEN; // Your InfluxDB API token
const org = process.env.INFLUXDB_ORG; // Your InfluxDB organization
const bucket = process.env.INFLUXDB_BUCKET; // Your InfluxDB bucket

const queryApi = new InfluxDB({ url, token }).getQueryApi(org); 

// Store data for each measurement field
let dataPoints = {
  temperature: [],
  humidity: [],
  pressure: [],
  radar_height: [],
  ultrasonic_height: []
};

// Query multiple fields from InfluxDB
const query = `from(bucket: "${bucket}")
  |> range(start: -1h)
  |> filter(fn: (r) => 
      r._field == "temperature" or 
      r._field == "humidity" or 
      r._field == "pressure" or 
      r._field == "radar_height" or 
      r._field == "ultrasonic_height")`;

queryApi.queryRows(query, {
  next(row, tableMeta) {
    const data = tableMeta.toObject(row);
    const time = new Date(data._time);
    const value = parseFloat(data._value);

    // Add data to respective arrays based on field
    if (data._field === "temperature") dataPoints.temperature.push({ time, value });
    if (data._field === "humidity") dataPoints.humidity.push({ time, value });
    if (data._field === "pressure") dataPoints.pressure.push({ time, value });
    if (data._field === "radar_height") dataPoints.radar_height.push({ time, value });
    if (data._field === "ultrasonic_height") dataPoints.ultrasonic_height.push({ time, value });
  },
  error(error) {
    console.error(error);
  },

   complete() {
    console.log('Data fetched, ready to visualize');

    // Handle empty data case
    if (dataPoints.temperature.length === 0 && 
        dataPoints.humidity.length === 0 && 
        dataPoints.pressure.length === 0 && 
        dataPoints.radar_height.length === 0 && 
        dataPoints.ultrasonic_height.length === 0) {
        console.error('No data returned from InfluxDB.');
        return; // Prevent visualization if no data is available
    }
     
  complete() {
    console.log('Data fetched, ready to visualize');
    // Call D3 visualization functions after data is fetched
    visualizeEnvironmentData(dataPoints);
    visualizeWaterHeightData(dataPoints);
  },
});

// D3 Visualization for Environmental Data (Temperature, Humidity, Pressure)
function visualizeEnvironmentData(data) {
  const svg = d3.select("#environment-graph");
  
  // Set up dimensions and margins for the graph
  const margin = { top: 20, right: 30, bottom: 30, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
  
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  
  // Line generators for each field
  const lineTemperature = d3.line()
    .x(d => x(d.time))
    .y(d => y(d.value));
  
  const lineHumidity = d3.line()
    .x(d => x(d.time))
    .y(d => y(d.value));
  
  const linePressure = d3.line()
    .x(d => x(d.time))
    .y(d => y(d.value));
  
  // Append the svg object to the body
  svg.attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
    .append("g")
     .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Set the domains based on the data
  x.domain(d3.extent(data.temperature, d => d.time));  // Assuming all measurements share the same time range
  y.domain([0, d3.max(data.temperature.concat(data.humidity, data.pressure), d => d.value)]);  // Adjust this for multiple fields if needed
  
  // Add the temperature line
  svg.append("path")
    .datum(data.temperature)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", lineTemperature);
  
  // Add the humidity line
  svg.append("path")
    .datum(data.humidity)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 1.5)
    .attr("d", lineHumidity);
  
  // Add the pressure line
  svg.append("path")
    .datum(data.pressure)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 1.5)
    .attr("d", linePressure);
  
  // Add the x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));
  
  // Add the y-axis
  svg.append("g")
    .call(d3.axisLeft(y));
}

// D3 Visualization for Water Height Data (Radar and Ultrasonic)
function visualizeWaterHeightData(data) {
  const svg = d3.select("#water-height-graph");
  
  // Set up dimensions and margins for the graph
  const margin = { top: 20, right: 30, bottom: 30, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
  
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);
  
  // Line generators for radar and ultrasonic
  const lineRadarHeight = d3.line()
    .x(d => x(d.time))
    .y(d => y(d.value));
  
  const lineUltrasonicHeight = d3.line()
    .x(d => x(d.time))
    .y(d => y(d.value));
  
  // Append the svg object to the body
  svg.attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom)
    .append("g")
     .attr("transform", `translate(${margin.left},${margin.top})`);
  
  // Set the domains based on the data
  x.domain(d3.extent(data.radar_height, d => d.time));  // Assuming radar and ultrasonic share the same time range
  y.domain([0, d3.max(data.radar_height.concat(data.ultrasonic_height), d => d.value)]);  // Adjust this for both fields
  
  // Add the radar water height line
  svg.append("path")
    .datum(data.radar_height)
    .attr("fill", "none")
    .attr("stroke", "purple")
    .attr("stroke-width", 1.5)
    .attr("d", lineRadarHeight);
  
  // Add the ultrasonic water height line
  svg.append("path")
    .datum(data.ultrasonic_height)
    .attr("fill", "none")
    .attr("stroke", "teal")
    .attr("stroke-width", 1.5)
    .attr("d", lineUltrasonicHeight);
  
  // Add the x-axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));
  
  // Add the y-axis
  svg.append("g")
    .call(d3.axisLeft(y));
}
