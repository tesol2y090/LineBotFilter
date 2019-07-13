module.exports.buble = (message) => {

  let name = message.userProfile
  let groupId = message.groupId
  let text = message.text
  let time = message.timeStamp
  let urlProfile = message.urlProfile

    return {
        "type": "bubble",
        "hero": {
          "type": "image",
          "url": urlProfile,
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
              "text": name,
              "size": "xl",
              "weight": "bold"
            },
            {
              "type": "text",
              "text": groupId,
              "size": "xs",
              "weight": "bold"
            },
            {
            "type": "text",
            "text": text,
            "size": "sm",
            "weight": "bold",
            "wrap": true,
            "color": "#aaaaaa"
            },
            {
              "type": "text",
              "text": time,
              "wrap": true,
              "color": "#aaaaaa",
              "size": "xxs"
            }
          ]
        },
      }
}

module.exports.carousel = (arrayMessage) => {

  if(arrayMessage.length == 1) {
    return this.buble(arrayMessage)
  } else if(arrayMessage.length > 10) {
    arrayMessage = arrayMessage.slice(0, 10)
  }

  let arrayBuble = []

  for(i=0; i < arrayMessage.length; i++) {
    let buble = this.buble(arrayMessage[i])
    arrayBuble.push(buble)
  }

  return {
    "type": "carousel",
    "contents": arrayBuble
  }

}