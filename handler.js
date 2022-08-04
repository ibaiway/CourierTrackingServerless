'use strict';
const https = require('https');
const AWS = require("aws-sdk");
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();


function getRequest() {
  const url = "https://api1.correos.es/digital-services/searchengines/api/v1/?text=PK79BN040446382T&language=EN&searchType=envio"
  //const url = 'https://www.adidas.com/api/products/HF4772';
  //const url = "https://jsonplaceholder.typicode.com/posts/1"

  const options = { 
    hostname: 'api1.correos.es',
    path: '/digital-services/searchengines/api/v1/?text=PK79CE041206283X&language=EN&searchType=envio',
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
          console.log(res.headers);
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


  try {
    const result = await getRequest();
    const shipmentStatus = result.shipment[0].events[result.shipment[0].events.length-1].summaryText;
    console.log('result is: 👉️', shipmentStatus);

    const params = {
      TableName: "shipmentsTable",
      Item: {
        shippingCode: "PK79BN040446382T",
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

  //console.log(json.pricing_information)
};
