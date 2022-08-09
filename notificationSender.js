'use strict';
const AWS = require("aws-sdk");
AWS.config.update({region: "eu-west-1"})

const STATUS_PHASES = {
  1: {
    "es": "Pre-registrado",
    "en": "Pre-registered"
  },
  2: {
    "es": "En transito",
    "en": "In transit"
  },
  3: {
    "es": "En reparto",
    "en": "Being delivered"
  },
  4: {
    "es": "Entregado",
    "en": "Delivered"
  }
}




module.exports.notifications = async (event, context) => {

  const time = new Date();
  console.log(`Your notification function "${context.functionName}" ran at ${time}`);
  console.log(event)
  console.log(event.Records[0].dynamodb)
  const oldStatus = event.Records[0].dynamodb.OldImage.status["N"]
  const newStatus = event.Records[0].dynamodb.NewImage.status["N"]
  if (oldStatus === newStatus){
    console.log("Function finished, oldStatus equals newStatus ---> value: ",oldStatus)
    return
  }
  const shipmentID = event.Records[0].dynamodb.NewImage.shippingCode["S"]
  const statusMessage = STATUS_PHASES[newStatus].en
  const message = "Shipment "+shipmentID+" new status is: "+statusMessage;
  var params = {
    Message: message,
    TopicArn: 'arn:aws:sns:eu-west-1:547538558190:ShipmentChange'
  };
  console.log(event.Records[0].dynamodb.NewImage.status["N"])
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


