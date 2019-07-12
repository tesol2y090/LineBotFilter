const functions = require('firebase-functions');
const request = require('request-promise');
const admin = require('firebase-admin');
const wordcut = require('wordcut')
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

  if (event.message.type !== 'text') {
      return;
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

    admin.database().ref(fullDate + '/' + eventType + '/' + groupId + '/' + replyToken).set({
      'eventType': eventType,
      'userId': userId,
      'groupId': groupId,
      'userProfile': userName,
      'text': text,
      'timeStamp': dateMonth
    })
  } else {

    let eventType = 'personal'
    let userProfile = await getUserProfile(userId)
    let userName = userProfile.displayName
    admin.database().ref(fullDate + '/' + eventType + '/' + userName + '/' + replyToken).set({
      'eventType': eventType,
      'userId': userId,
      'userProfile': userName,
      'text': text,
      'timeStamp': dateMonth
    })
  }

}

const getMessage = async (key) => {
  
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

// const getGroupProfile = async (groupId) => {
//   let groupProfile = await request.get({
//     uri: `${LINE_GET_GROUP_PROFILE}/${groupId}/`,
//     headers: LINE_HEADER
//   })
//   return JSON.parse(groupProfile)
// }

const reply = (bodyResponse, message) => {
  return request.post({
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.events[0].replyToken,
      messages: [
        {
          type: `text`,
          text: message
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
