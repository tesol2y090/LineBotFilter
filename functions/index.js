const functions = require('firebase-functions');
const request = require('request-promise');
const admin = require('firebase-admin');
admin.initializeApp();

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
  'Content-Type': 'application/json',
  Authorization : `Bearer access token`
};
const region = 'asia-east2';
const runtimeOpts = {
  timeoutSeconds: 4,
  memory: "2GB"
};

exports.LineBot = functions.region(region).runWith(runtimeOpts).https.onRequest((req, res) => {
  let event = req.body.events[0]
  let replyToken = event.replyToken
  let text = event.message.text
  let userId = event.source.userId
  let timeStamp = event.timestamp
  if (event.message.type !== 'text') {
      return;
  }
  if (event.message.text === 'fuck') {
    replyDefault(replyToken)
  } else {
    writeData(replyToken, text, userId, timeStamp);
    reply(req.body);  
  }
});

const writeData = (replyToken, text, userId, timeStamp) => {
  admin.database().ref('test' + replyToken).set({
    'userId': userId,
    'text': text,
    'timeStamp': timeStamp
  })
}

const replyDefault = (replyToken) => {
  return request.post({
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [
        {
          type: `text`,
          text: "I don't understand that word"
        }
	  ]
    })
  })
}

const reply = (bodyResponse) => {
  return request.post({
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.events[0].replyToken,
      messages: [
        {
          type: `text`,
          text: bodyResponse.events[0].message.text
        }
	  ]
    })
  });
};
