const wordcut = require('wordcut')
wordcut.init();

let message = "สรุป วันนี้มีประชุมตอน 6 โมงนะครับ"
let textCut = wordcut.cut(message)
let textSplit = textCut.split("|").filter(word => word !== " ")


console.log(textSplit)