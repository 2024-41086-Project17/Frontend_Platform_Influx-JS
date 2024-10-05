import * as d3 from 'd3';
import { InfluxDB } from '@influxdata/influxdb-client';

// InfluxDB connection details (same as above)
const url = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;
const org = process.env.INFLUXDB_ORG;
const bucket = process.env.INFLUXDB_BUCKET;

const queryApi = new InfluxDB({url, token}).getQueryApi(org);

// Store data points
let dataPoints = [];

const query = `from(bucket: "${bucket}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")
  |> filter(fn: (r) => r._field == "value")`;

queryApi.queryRows(query, {
  next(row, tableMeta) {
    const data = tableMeta.toObject(row);
    // Push each row of data to the array in a format usable by D3
    dataPoints.push({
      time: new Date(data._time),  // Convert InfluxDB time to JavaScript Date
      value: parseFloat(data._value)  // Ensure the value is a float
    });
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

// D3 Visualization: A basic line chart
function visualizeData(data) {
  const margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = 800 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime()
              .domain(d3.extent(data, d => d.time))
              .range([0, width]);

  const y = d3.scaleLinear()
              .domain([0, d3.max(data, d => d.value)])
              .range([height, 0]);

  const line = d3.line()
                 .x(d => x(d.time))
                 .y(d => y(d.value));

  // X-axis
  svg.append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x));

  // Y-axis
  svg.append("g")
     .call(d3.axisLeft(y));

  // Line path
  svg.append("path")
     .datum(data)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 1.5)
     .attr("d", line);
}