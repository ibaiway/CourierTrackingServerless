'use strict';
const AWS = require("aws-sdk");
AWS.config.update({region: "eu-west-1"})


module.exports.notifications = async (event, context) => {

  const time = new Date();
  console.log(`Your notification function "${context.functionName}" ran at ${time}`);
  console.log(event.Records[0].dynamodb)
  const status = event.Records[0].dynamodb.NewImage.status["S"]
  const shipmentID = event.Records[0].dynamodb.NewImage.shippingCode["S"]
  const message = "Shipment "+shipmentID+" new status is: "+status;
  var params = {
    Message: message,
    TopicArn: 'arn:aws:sns:eu-west-1:547538558190:ShipmentChange'
  };
  console.log(event.Records[0].dynamodb.NewImage.status["S"])
  console.log("Los parametros"+params)
  
// Create promise and SNS service object
var publishTextPromise = new AWS.SNS({apiVersion: '2010-03-31'}).publish(params).promise();


// Handle promise's fulfilled/rejected states
return publishTextPromise.then(
  function(data) {
    console.log(`Message ${params.Message} sent to the topic ${params.TopicArn}`);
    console.log("MessageID is " + data.MessageId);
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });

  
  }


