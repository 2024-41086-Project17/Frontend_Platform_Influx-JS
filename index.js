 const { InfluxDB } = require('@influxdata/influxdb-client');

// Your InfluxDB credentials
const url = 'https://us-west-2-1.aws.cloud2.influxdata.com'; // Change to your region if using InfluxDB Cloud
const token = 'your-influxdb-token'; // Replace with your token
const org = 'your-org-name'; // Replace with your organization name
const bucket = 'your-bucket-name'; // Replace with your bucket name

const client = new InfluxDB({ url, token });

const writeApi = client.getWriteApi(org, bucket);
writeApi.useDefaultTags({ location: 'home' });

const { Point } = require('@influxdata/influxdb-client');
const point = new Point('temperature')
  .tag('sensor', 'T1')
  .floatField('value', 22.5);

writeApi.writePoint(point);
writeApi
  .close()
  .then(() => {
    console.log('Data written to InfluxDB successfully');
  })
  .catch((e) => {
    console.error('Error writing data to InfluxDB:', e);
  });

// To query the data back from InfluxDB

const queryApi = client.getQueryApi(org);

const fluxQuery = `from(bucket: "${bucket}")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "temperature")`;

queryApi
  .collectRows(fluxQuery)
  .then((rows) => {
    rows.forEach((row) => {
      console.log(`Time: ${row._time}, Value: ${row._value}`);
    });
  })
  .catch((error) => {
    console.error('Error querying data:', error);
  });