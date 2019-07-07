const functions = require('firebase-functions');
const request = require('request-promise');
const admin = require('firebase-admin');
admin.initializeApp();

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
  'Content-Type': 'application/json',
  Authorization : `Bearer njqYzbipxGtAvq1saQ7jpBgE2niY+dwx5uNDPw6i9zGW4v7J7bx65Gzq1QnQYK2Hp3C5bDKvx7ZwHtj7HpwGvYmdLrE+CPfb8+A4sCZ7l9dTznsMIzBZyamADZmxnzBRo7XtSRqqkhsoAfgf2WAbrwdB04t89/1O/w1cDnyilFU=`
};
const region = 'asia-east2';
const runtimeOpts = {
  timeoutSeconds: 5,
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

  console.log("Event in group")
  console.log(req.body)
  console.log("Source in Event")
  console.log(event.source)
  console.log("Event in Message")
  console.log(event.message)

  writeData(replyToken, text, userId, timeStamp);

});

const writeData = (replyToken, text, userId, timeStamp) => {

  let fullDate = timeConverter(timeStamp, 'fullDate')
  let dateMonth = timeConverter(timeStamp, 'dateMonth')

  admin.database().ref(fullDate + '/' + replyToken).set({
    'userId': userId,
    'text': text,
    'timeStamp': dateMonth
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

const timeConverter = (timeStamp, option) => {
  let a = new Date(timeStamp);
  let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let year = a.getFullYear();
  let month = months[a.getMonth()];
  let date = a.getDate();
  let hour = a.getHours() + 7;
  let min = a.getMinutes();
  let sec = a.getSeconds();
  let fullDate = date + ' ' + month + ' ' + year
  let time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;

  if(option === 'dateMonth') {
    return time
  } else if(option === 'fullDate'){
    return fullDate
  } else if(option === 'day') {
    return date
  } else if(option === 'month') {
    return month
  } else if(option === 'year') {
    return year
  } else {
    return 'not define'
  }
}
