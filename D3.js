import * as d3 from 'd3';
import { InfluxDB } from '@influxdata/influxdb-client';

// InfluxDB connection details
const url = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG;
const bucket = process.env.INFLUXDB_BUCKET;

const queryApi = new InfluxDB({ url, token }).getQueryApi(org);

// Store data for each field
let dataPoints = {
  temperature: [],
  humidity: [],
  pressure: [],
  waterHeight: [],
};

// Query multiple fields in InfluxDB
const query = `from(bucket: "${bucket}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "environment")
  |> filter(fn: (r) => r._field == "temperature" or r._field == "humidity" or r._field == "pressure" or r._field == "waterHeight")`;

queryApi.queryRows(query, {
  next(row, tableMeta) {
    const data = tableMeta.toObject(row);
    const time = new Date(data._time);
    const value = parseFloat(data._value);
    
    // Add data to respective arrays based on field
    if (data._field === "temperature") dataPoints.temperature.push({ time, value });
    if (data._field === "humidity") dataPoints.humidity.push({ time, value });
    if (data._field === "pressure") dataPoints.pressure.push({ time, value });
    if (data._field === "waterHeight") dataPoints.waterHeight.push({ time, value });
  },
  error(error) {
    console.error(error);
  },
  complete() {
    console.log('Data fetched, ready to visualize');
    // Call D3 visualization function after data is complete
    visualizeData(dataPoints);
  },
});

// D3 Visualization: Multi-line chart for multiple fields
function visualizeData(data) {
  const margin = { top: 20, right: 50, bottom: 30, left: 50 },
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

  const svg = d3.select("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

  // X Scale (Time)
  const x = d3.scaleTime()
              .domain(d3.extent(data.temperature, d => d.time))  // Use temperature data as base for time
              .range([0, width]);

  // Y Scale (Values)
  const y = d3.scaleLinear()
              .domain([0, d3.max([
                d3.max(data.temperature, d => d.value),
                d3.max(data.humidity, d => d.value),
                d3.max(data.pressure, d => d.value),
                d3.max(data.waterHeight, d => d.value)
              ])])
              .range([height, 0]);

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

  const linewaterHeight = d3.line()
                          .x(d => x(d.time))
                          .y(d => y(d.value));

  // Draw X-axis
  svg.append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x));

  // Draw Y-axis
  svg.append("g")
     .call(d3.axisLeft(y));

  // Draw lines for each field
  svg.append("path")
     .datum(data.temperature)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 1.5)
     .attr("d", lineTemperature);

  svg.append("path")
     .datum(data.humidity)
     .attr("fill", "none")
     .attr("stroke", "orange")
     .attr("stroke-width", 1.5)
     .attr("d", lineHumidity);

  svg.append("path")
     .datum(data.pressure)
     .attr("fill", "none")
     .attr("stroke", "green")
     .attr("stroke-width", 1.5)
     .attr("d", linePressure);

  svg.append("path")
     .datum(data.waterHeight)
     .attr("fill", "none")
     .attr("stroke", "red")
     .attr("stroke-width", 1.5)
     .attr("d", lineWindSpeed);
}