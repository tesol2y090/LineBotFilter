const wordcut = require('wordcut')
wordcut.init();

const MAX_SEQUENCE_LENGTH = 113;

const wordPrep = word => {
    word = word.replace(/[-|.|,|\?|\!]+/g, '');
    word = word.toLowerCase();
    if (word != '') {
      return word;
    } else {
      return '.'
    }
}

function makeSeq(wordArray) {
    let sequence = [];
    
    wordArray.slice(0, MAX_SEQUENCE_LENGTH).forEach(function(word) {
    word = wordPrep(word);
    sequence.push(word);
  });

  // pad sequence
  if (sequence.length < MAX_SEQUENCE_LENGTH) {
    let pad_array = Array(MAX_SEQUENCE_LENGTH - sequence.length);
    pad_array.fill("");
    sequence = sequence.concat(pad_array);
  }

  return sequence;
}

let message = "📣📣 VIDWEEK IS COMINGและตอนนี้เทศกาลรับน้องใหม่ คณะวิทยาศาสตร์หรือว่า VIDWEEK 2019 ของเราก็ใกล้เข้ามาทุกที่แล้วนะครับ ก่อนอื่นเลย เราต้องมาประกาศธีมก่อนก่อนเลยว่า VIDWEEK ของเราในปีนี้นั้น มาในธีม!🌌 “VIDYA AGRABAH”🌌 ‼️ซึ่ง อ่านว่า วิทยา อัคราบานะครับ อัคราบาก็คือเมืองของเจ้าหญิงจัสมินกับเจ้าชายอลาดินในเรื่องอลาดินนั่นเอง"
let wordArray = wordcut.cut(message).split("|").filter(word => word !== " ")
if (wordArray.length < MAX_SEQUENCE_LENGTH) {
    let pad_array = Array(MAX_SEQUENCE_LENGTH - wordArray.length);
    pad_array.fill("");
    wordArray = wordArray.concat(pad_array);
  }

console.log(wordArray)