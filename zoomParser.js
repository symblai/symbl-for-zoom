const request = require("request-promise");
const url = require("url");
const { get } = require("lodash");

const regex = /(.*).*[.,\s].*Meeting ID:[\s]*([\d\s]+)?/gm;
const phoneNumberRegex = /[+][\s,0-9].*/gm;
const urlRegex = /.*https:\/\/.*[.]*zoom.us\/j\/(\d+)/gm;
const passwordRegex = /Password:[\s]*([\d]+)/gim;
const joiningInstructionsRegex = /Joining instructions:(.*)/gim;

const standardPhoneNumbers = { US: ["+16465588656", "+14086380968"] };

const keys = ["Meeting ID:", "Joining instructions", "zoom.us/j/"];

const getPhoneNumbers = async (content, resetRegex = true) => {
  if (resetRegex) {
    phoneNumberRegex.lastIndex = 0;
  }

  let match;
  const phoneNumbers = [];
  let country = null;

  while ((match = phoneNumberRegex.exec(content)) !== null) {
    const splitStr = match[0].replace(/[\\,]+/g, " ").split(" ");
    //Add check for length of phone number
    splitStr[0].length > 9 &&
      phoneNumbers.push(splitStr[0].trim().replace(/ /g, ""));
    if (splitStr.length >= 3 && !country) country = splitStr[2].trim();
  }

  return {
    country: country,
    phoneNumbers: phoneNumbers,
  };
};

const getJoiningInstructions = async (joiningInstructionsUrl) => {
  if (joiningInstructionsUrl) {
    const zoomJoiningInstructionsUrl = get(
      url.parse(joiningInstructionsUrl, true),
      "query.q",
      null
    );

    if (zoomJoiningInstructionsUrl) {
      const requestOptions = {
        uri: zoomJoiningInstructionsUrl,
        method: "GET",
        resolveWithFullResponse: true,
      };

      const response = await request(requestOptions);
      if (response && response.statusCode === 200) {
        return response.body;
      } else {
        return null;
      }
    } else {
      logger.info("Joining Instructions URL not found", {
        joiningInstructionsUrl,
      });
    }
  }

  return null;
};

const isNumeric = (str) => {
  return /^\d+$/.test(str);
};

const getPasswordFromPayload = async (payload, resetRegex = true) => {
  if (resetRegex) {
    passwordRegex.lastIndex = 0;
  }

  let meetingPasswordData;
  while ((meetingPasswordData = passwordRegex.exec(payload)) != null) {
    if (
      meetingPasswordData &&
      meetingPasswordData.length === 2 &&
      isNumeric(meetingPasswordData[1])
    ) {
      return meetingPasswordData[1];
    }
  }
};

const constructJoiningDetails = async ({
  country,
  phoneNumbers,
  content,
  meetingPassword,
  meetingId,
}) => {
  let extraStandardNumbers = standardPhoneNumbers[country] || [];

  extraStandardNumbers = extraStandardNumbers.filter(
    (number) => !phoneNumbers.includes(number)
  );

  if (extraStandardNumbers.length > 0) {
    extraStandardNumbers.forEach((number) => phoneNumbers.push(number));
  }

  const dtmfFromUrl = urlRegex.exec(content);
  let dtmf =
    dtmfFromUrl && dtmfFromUrl.length === 2
      ? dtmfFromUrl[1].trim().includes("?")
        ? dtmfFromUrl[1].trim().split("?")[0].concat("#")
        : dtmfFromUrl[1].trim().concat("#")
      : meetingId.trim().replace(/ /g, "").concat("#");

  if (meetingPassword) {
    dtmf = dtmf.concat(`,,${meetingPassword}#`);
  }

  return {
    joiningDetails: [
      {
        country,
        phoneNumbers,
        dtmf,
      },
    ],
  };
};

const zoomParser = () => {
  const patternToParser = {};
  patternToParser[keys[0]] = async (content) => {
    if (content) {
      const result = regex.exec(content);

      if (result && result.length === 3) {
        let { country, phoneNumbers } = await getPhoneNumbers(content, false);

        let meetingPassword = await getPasswordFromPayload(content, false);

        const joiningInstructionsUrl = get(
          joiningInstructionsRegex.exec(content),
          "[1]",
          null
        );
        let joiningInstructions = null;

        if (joiningInstructionsUrl)
          joiningInstructions = await getJoiningInstructions(
            joiningInstructionsUrl
          );

        if (
          (!phoneNumbers || phoneNumbers.length <= 0) &&
          joiningInstructions
        ) {
          const data = await getPhoneNumbers(joiningInstructions);

          phoneNumbers = data.phoneNumbers;
          country = data.country;
        }

        if (!meetingPassword) {
          meetingPassword = await getPasswordFromPayload(joiningInstructions);
        }

        if (!country) country = "US";

        return await constructJoiningDetails({
          country,
          phoneNumbers,
          meetingPassword,
          content,
          meetingId: result[2],
        });
      }
    }
    return null;
  };

  patternToParser[keys[1]] = async (content) => {
    if (content) {
      let joiningInstructions = null;
      const joiningInstructionsUrl = get(
        joiningInstructionsRegex.exec(content),
        "[1]",
        null
      );

      if (joiningInstructionsUrl) {
        joiningInstructions = await getJoiningInstructions(
          joiningInstructionsUrl
        );
        if (joiningInstructions) {
          let meetingPassword = await getPasswordFromPayload(
            joiningInstructions,
            false
          );
          let { phoneNumbers, country } = await getPhoneNumbers(
            joiningInstructions,
            false
          );

          if (!country) country = "US";

          const meetingId = get(regex.exec(joiningInstructions), "[2]", null);
          return await constructJoiningDetails({
            country,
            phoneNumbers,
            meetingPassword,
            content: joiningInstructions,
            meetingId,
          });
        }
      }
    }

    return null;
  };

  patternToParser[keys[2]] = async (content) => {
    if (content) {
      const result = urlRegex.exec(content.trim());
      if (result && result.length === 2) {
        let dtmf = result[1].trim();
        if (dtmf.includes("?")) {
          dtmf = dtmf.split("?")[0];
        }

        dtmf = dtmf.concat("#");

        const meetingPasswordData = passwordRegex.exec(content);
        let meetingPassword =
          meetingPasswordData && meetingPasswordData.length === 2
            ? meetingPasswordData[1]
            : null;
        if (meetingPassword) {
          dtmf = dtmf.concat(`,,${meetingPassword}#`);
        }

        return {
          joiningDetails: [
            {
              country: "US",
              phoneNumbers: standardPhoneNumbers["US"],
              dtmf,
            },
          ],
        };
      }
      return null;
    }
  };

  return {
    isValid(content) {
      return content && keys.filter((key) => content.includes(key)).length > 0;
    },

    async parse(content) {
      if (content) {
        let parser = null;
        keys.some((key, index) => {
          if (content.toLowerCase().includes(key.toLowerCase())) {
            parser = patternToParser[keys[index]];
            return true;
          }

          return false;
        });

        if (parser) {
          regex.lastIndex = 0;
          urlRegex.lastIndex = 0;
          phoneNumberRegex.lastIndex = 0;
          passwordRegex.lastIndex = 0;
          joiningInstructionsRegex.lastIndex = 0;

          return await parser(content);
        }
      } else {
        return null;
      }
    },
  };
};

// const sample = "Aditya W is inviting you to a scheduled Zoom meeting.\n" +
//     "\n" +
//     "Join Zoom Meeting\n" +
//     "https://zoom.us/j/996291789\n" +
//     "\n" +
//     "One tap mobile\n" +
//     "+16465588656,,996291787# US (New York)\n" +
//     "+14086380968,,996291787# US (San Jose)\n" +
//     "\n" +
//     "Dial by your location\n" +
//     "       +1 646 558 8656 US (New York)\n" +
//     "       +1 408 638 0968 US (San Jose)\n" +
//     "Meeting ID: 996 291 787" +
//     "Find your local number: https://zoom.us/u/acLLoulOb";
// const parser = zoomParser();
// if (parser.isValid(sample)) {
//     const res = parser.parse(sample);
//     console.log(res);
// }

module.exports = zoomParser;

// const sample = `Hi there,
//
//                     Toshish Jawale is inviting you to a scheduled Zoom meeting.
//
//                     Join from PC, Mac, Linux, iOS or Android: https://zoom.us/j/476452611
//
//                     Or iPhone one-tap :
//                 US: +16465588665,,476452611#  or +14086380986,,476452611#
//                     Or Telephone:
//                     Dial(for higher quality, dial a number based on your current location):
//                 US: +1 646 558 8665  or +1 408 638 0986
//                 Meeting ID: 476 452 611
//                 International numbers available: https://zoom.us/u/yeuSXkkN`;
//
// const parser = zoomParser();
// if (parser.isValid(sample)) {
//     const res = parser.parse(sample);
//     console.log(res);
// }
//

// const sample1 = `You have been invited to the following event.\n\nTitle: Again + with pass+ pro\nWhen: Mon Apr 6, 2020 4pm – 5pm India Standard Time - Kolkata\n\nJoining info: Join Zoom Meeting\nhttps://zoom.us/j/6237467470?pwd=dmdZUGVCZGRQMGpaTzVFanFzY0ZmUT09 (ID: 6237467470, password: abhay)\n\nJoin by phone\n(US) +1 312-626-6799\n\nJoining instructions: https://www.google.com/url?q=https://applications.zoom.us/addon/invitation/detail?meetingUuid%3DM6vt6D0HTyO52941hhamBg%253D%253D%26signature%3Daa6880d40d38c68cbbc61fd1caad26b3dd428a9ee160ff8be2f6b74dc116c85a&sa=D&usg=AOvVaw3ur1l5U69uEB2MWcCPJcLx
// \n\nJoining notes: Password: abhay\n\nCalendar: meetinginsights@meet-hub.symbl.ai\nWho:\n    * abhay.dalvi@symbl.ai - organizer\n    * arjun.chouhan@symbl.ai\n    * meetinginsights@meet-hub.symbl.ai - optional\n\nYour attendance is optional.\n\nEvent details: https://www.google.com/calendar/event?action=VIEW&eid=NmswbG40MnEyMTJlZXZkamlvOW1raHAzNTAgbWVldGluZ2luc2lnaHRzQG1lZXQtaHViLnN5bWJsLmFp&tok=MjAjYWJoYXkuZGFsdmlAc3ltYmwuYWkwNTc3NGUwZTdjZjUwOWRjOGE2M2EzYzFkYmU3ZjAxYzYyMjdlZWJh&ctz=Asia%2FKolkata&hl=en&es=0\n\nInvitation from Google Calendar: https://www.google.com/calendar/\n\nYou are receiving this courtesy email at the account meetinginsights@meet-hub.symbl.ai because you are an attendee of this event.\n\nTo stop receiving future updates for this event, decline this event. Alternatively you can sign up for a Google account at https://www.google.com/calendar/ and control your notification settings for your entire calendar.\n\nForwarding this invitation could allow any recipient to send a response to the organizer and be added to the guest list, or invite others regardless of their own invitation status, or to modify your RSVP. Learn more at https://support.google.com/calendar/answer/37135#forwarding\n" {"htmlDecodedContent":"You have been invited to the`;

// const sample1 = `Zoom logo
// Arjun Chouhan is inviting you to a scheduled Zoom meeting.
//
// Topic: This is a calendar meeting
// Time: Apr 6, 2020 01:44 PM India
//
// Join Zoom Meeting
// https://zoom.us/j/222349200?pwd=VGFKNUZUMmYrT2NIbTFUdkxCc2hVdz09
//
// Meeting ID: 222 349 200
// Password: gh7zfz
//
// One tap mobile
// +12532158782,,222349200# US
// +13017158592,,222349200# US
//
// Dial by your location
// +1 253 215 8782 US
// +1 301 715 8592 US
// +1 312 626 6799 US (Chicago)
// +1 346 248 7799 US (Houston)
// +1 646 558 8656 US (New York)
// +1 669 900 9128 US (San Jose)
// Meeting ID: 222 349 200
// Password: 526261
// Find your local number: https://zoom.us/u/aNEntYu01`;
//
// if (parser.isValid(sample1)) {
//     parser.parse(sample1).then(res => {
//         console.log(res, res.joiningDetails[0].phoneNumbers)
//     });
// }
