'use strict';
const https = require('https');
const AWS = require("aws-sdk");
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();


function getRequest(shippingCode) {

  const options = { 
    hostname: 'api1.correos.es',
    path: `/digital-services/searchengines/api/v1/?text=${shippingCode}&language=EN&searchType=envio`,
    method: 'GET',
    headers: {'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'},
    maxRedirects: 20
};
  return new Promise((resolve, reject) => {
    const req = https.get(options, res => {
      let rawData = '';

      res.on('data', chunk => {
        rawData += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(rawData));
        } catch (err) {
          reject(new Error(err));
        }
      });
    });

    req.on('error', err => {
      reject(new Error(err));
    });
  });
}


module.exports.run = async (event, context) => {

  const time = new Date();
  console.log(`Your cron function "${context.functionName}" ran at ${time}`);
  console.log(event)
  
  const shippingCode = event.shippingCode

  try {
    const result = await getRequest(shippingCode);
    const phase = result.shipment[0].events[result.shipment[0].events.length-1].phase;
    console.log('result is: 👉️', phase);
    let shipmentStatus = 0;

    switch (phase) {
      case "1":
        shipmentStatus = 1;
        break;
      case "2":
        shipmentStatus = 2;
        break;
      case "3":
        shipmentStatus = 3;
        break;
      case "4":
        shipmentStatus = 4;
    
      default:
        break;
    }

    const params = {
      TableName: "shipmentsTable",
      Item: {
        shippingCode,
        status: shipmentStatus,
      },
    };

    try {
      await dynamoDbClient.put(params).promise();
      console.log("Write to DB success")
    } catch (error) {
      console.log(error);
    }

    //console.log('result is: 👉️', result.pricing_information);

    
  } catch (error) {
    console.log('Error is: 👉️', error);
    
  }

};
