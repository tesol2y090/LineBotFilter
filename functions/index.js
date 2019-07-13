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
  let text = event.message.text

  if (event.message.type !== 'text') {
    return;
  }

  if(text.split(" ")[0] === '/p') {
    let replyToken = event.replyToken
    replyFlex(replyToken, "gang")
    // getMessage(event)
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
  let replyToken = event.replyToken

  admin.database().ref(fullDate + '/' + 'group' + '/' + groupId).orderByChild('text').on('value', (snap) => {
    let data = snap.val()
    let message = []

    for(key in data) {
      message.push({
        'from': data[key].userProfile,
        'text': data[key].text,
        'time': data[key].timeStamp
      })
    }

    reply(replyToken, message);

  })

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

const replyFlex = (replyToken, message) => {
  return request.post({
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: replyToken,
      messages: [
        {
          type: 'flex',
          altText: message,
          contents: {
            "type": "bubble",
            "hero": {
              "type": "image",
              "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_2_restaurant.png",
              "size": "full",
              "aspectRatio": "20:13",
              "aspectMode": "cover"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "spacing": "md",
              "contents": [
                {
                  "type": "text",
                  "text": "GGAANNGG",
                  "size": "xl",
                  "weight": "bold"
                },
                {
                  "type": "text",
                  "text": "GGAANNGG",
                  "size": "xs",
                  "weight": "bold"
                },
                {
                "type": "text",
                "text": "ทุกคนงานvidweek  ปีนี้คณะเรามีให้ถ่ายรูปเพื่อให้เอาไปเปลี่ยนพร้อมกรอบในfacebook ให้เข้าตรีม มีใครอยากไปถ่ายป่าว มีเวลาตามนี้",
                "size": "sm",
                "weight": "bold",
                "wrap": true,
                "color": "#aaaaaa"
                },
                {
                  "type": "text",
                  "text": "13 Jul 2019 10:01:51",
                  "wrap": true,
                  "color": "#aaaaaa",
                  "size": "xxs"
                }
              ]
            }
          }
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
