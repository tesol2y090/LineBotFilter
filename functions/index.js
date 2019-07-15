const functions = require('firebase-functions');
const request = require('request-promise');
const admin = require('firebase-admin');
const wordcut = require('wordcut')

const flexMessage = require('./flexMessage')

admin.initializeApp();
wordcut.init();

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_GET_USER_PROFILE = 'https://api.line.me/v2/bot/profile/';
const LINE_GET_GROUP_USER_PROFILE = 'https://api.line.me/v2/bot/group/'
// const LINE_GET_GROUP_PROFILE = 'https://api.line.me/v2/bot/group/';
const LINE_HEADER = {
  'Content-Type': 'application/json',
  Authorization : `Bearer `
};
const region = 'asia-east2';
const runtimeOpts = {
  timeoutSeconds: 5,
  memory: "2GB"
};

exports.LineBot = functions.region(region).runWith(runtimeOpts).https.onRequest((req, res) => {
  
  let event = req.body.events[0]
  let text = event.message.text
  let userId = event.source.userId

  if (event.message.type !== 'text') {
    return;
  }

  if(text.split(" ")[0] === '/p' && userId === 'U8f7da99fa55c9b36794140619188a7c7') {
    replyFlex(event)
    return
  }

  writeDataToFirebase(event);
  
});

const writeDataToFirebase = async (event) => {

  let replyToken = event.replyToken
  let text = event.message.text
  let userId = event.source.userId
  let timeStamp = event.timestamp

  let fullDate = timeConverter(timeStamp, 'fullDate')
  let dateMonth = timeConverter(timeStamp, 'dateMonth')

  if(event.source.type === 'group') {

    let groupId = event.source.groupId
    let eventType = 'group'
    let userProfile = await getUserFormGroup(groupId, userId)
    let userName = userProfile.displayName
    let pictureUrl = userProfile.pictureUrl

    admin.database().ref(fullDate + '/' + eventType + '/' + groupId + '/' + replyToken).set({
      'eventType': eventType,
      'userId': userId,
      'groupId': groupId,
      'userProfile': userName,
      'pictureUrl': pictureUrl,
      'text': text,
      'timeStamp': dateMonth
    })
  } else {

    let eventType = 'personal'
    let userProfile = await getUserProfile(userId)
    let userName = userProfile.displayName
    let pictureUrl = userProfile.pictureUrl

    admin.database().ref(fullDate + '/' + eventType + '/' + userName + '/' + replyToken).set({
      'eventType': eventType,
      'userId': userId,
      'userProfile': userName,
      'pictureUrl': pictureUrl,
      'text': text,
      'timeStamp': dateMonth
    })
  }

}

const getMessage = async (event) => {

  let timeStamp = event.timestamp
  let fullDate = timeConverter(timeStamp, 'fullDate')
  let groupId = event.source.groupId

  let message = await admin.database().ref(fullDate + '/' + 'group' + '/' + groupId).orderByChild('text').once('value')
  message = message.val()
  let obj = []
    for(key in message) {
      obj.push({
        'userProfile': message[key].userProfile,
        'text': message[key].text,
        'timeStamp': message[key].timeStamp,
        'groupId': message[key].groupId,
        'urlProfile': message[key].pictureUrl
      })
    }
    return obj
}

const getUserProfile = async (userId) => {
  let userProfile = await request.get({
    uri: `${LINE_GET_USER_PROFILE}/${userId}`,
    headers: LINE_HEADER
  })
  return JSON.parse(userProfile)
}

const getUserFormGroup = async (groupId, userId) => {
  let userProfile = await request.get({
    uri: `${LINE_GET_GROUP_USER_PROFILE}/${groupId}/member/${userId}`,
    headers: LINE_HEADER
  })
  return JSON.parse(userProfile)
}

const reply = (replyToken, message) => {
  return request.post({
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [
        {
          type: `text`,
          text: JSON.stringify(message)
        }
	  ]
    })
  });
};

const replyFlex = async (event) => {

  let arrayMessage = await getMessage(event)
  let replyToken = event.replyToken

  let content = await flexMessage.carousel(arrayMessage)

  return request.post({
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [
        {
          type: 'flex',
          altText: "Important news",
          contents: content
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

const textClassified = (text) => {

}
