# Symbl Personal Assistant Meeting App


[![Telephony](https://img.shields.io/badge/Symbl-Telephony-brightgreen)](https://docs.symbl.ai/docs/telephony/overview/post-api)

Symbl's APIs empower developers to enable: 
- **Real-time** analysis of free-flowing discussions to automatically surface highly relevant summary discussion topics, contextual insights, suggestive action items, follow-ups, decisions, and questions.
- **Voice APIs** that makes it easy to add AI-powered conversational intelligence to either [telephony][telephony] or [WebSocket][websocket] interfaces.
- **Conversation APIs** that provide a REST interface for managing and processing your conversation data.
- **Summary UI** with a fully customizable and editable reference experience that indexes a searchable transcript and shows generated actionable insights, topics, timecodes, and speaker information.

<hr />

## Enable Symbl for Zoom Meetings

<hr />

 * [Introduction](#introduction)
 * [Pre-requisites](#pre-requisites)
 * [Setup and Deploy](#setupanddeploy)
 * [Dependencies](#dependencies)
 * [Community](#community)

## Introduction

This is a sample app that lets you invite Symbl to your Zoom meeting by providing a zoom invite.

## Pre-requisites

* JS ES6+
* Node.js
* npm (or your favorite package manager)
* Zoom Account [Zoom](https://zoom.us/signup)

## Setup and Deploy
The first step to getting setup is to [sign up][signup]. 

Update the .env file with the following:
1. Your App Id that you can get from [Platform](https://platform.symbl.ai)
2. Your App Secret that you can get from [Platform](https://platform.symbl.ai)

Run the follwing npm commands:
1. `npm install` to download all the node modules
2. `node app.js` to start the node server

Navigate to localhost:5000 to view the app
1. Enter the email address you would like the meeting summary sent to
2. Enter a Meeting Name Identifier
3. Paste the full meeting invite for the Zoom meeting you wish to connect to. Ex.
     ```
        Symbl is inviting you to a scheduled Zoom meeting.

        Topic: Symbl Personal Meeting Room

        Join Zoom Meeting
        https://us02web.zoom.us/j/55555555?pwd=<meeting-password>

        Meeting ID: 555 5555 555
        Passcode: 55555
        One tap mobile
        +16699009128,,2323522600# US (San Jose)
        +12532158782,,2323522600# US (Tacoma)

        Dial by your location
                +1 669 900 9128 US (San Jose)
                +1 253 215 8782 US (Tacoma)
                +1 346 248 7799 US (Houston)
                +1 646 558 8656 US (New York)
                +1 301 715 8592 US (Washington D.C)
                +1 312 626 6799 US (Chicago)
        Meeting ID: 232 352 2600
        Find your local number: https://us02web.zoom.us/u/kz2YbGRTL

        Join by SIP
        5555555555@zoomcrc.com

        Join by H.323
        162.255.37.11 (US West)
        162.255.36.11 (US East)

        Passcode: 555555
    ```
4.  Submit and Symbl will join via Telephony API dial in from PSTN 12015947998

## Dependencies

```json
  "dependencies": {
    "body-parser": "^1.19.0",
    "dotenv": "^8.2.0",
    "express": "^4.17.1",
    "lodash": "^4.17.15",
    "path": "^0.12.7",
    "request": "^2.88.2",
    "request-promise": "^4.2.5",
    "symbl-node": "^1.0.3",
    "url": "^0.11.0"
  }
```

## Community

If you have any questions, feel free to reach out to us at devrelations@symbl.ai, through our Community [Slack][slack], or [developer community][developer_community]

This guide is actively developed, and we love to hear from you! Please feel free to [create an issue][issues] or [open a pull request][pulls] with your questions, comments, suggestions and feedback.  If you liked our integration guide, please star our repo!

This library is released under the [MIT License][license]

[license]: LICENSE.txt
[telephony]: https://docs.symbl.ai/docs/telephony/overview/post-api
[websocket]: https://docs.symbl.ai/docs/streamingapi/overview/introduction
[developer_community]: https://community.symbl.ai/?_ga=2.134156042.526040298.1609788827-1505817196.1609788827
[signup]: https://platform.symbl.ai/?_ga=2.63499307.526040298.1609788827-1505817196.1609788827
[issues]: https://github.com/symblai/symbl-for-zoom/issues
[pulls]: https://github.com/symblai/symbl-for-zoom/pulls
[slack]: https://join.slack.com/t/symbldotai/shared_invite/zt-4sic2s11-D3x496pll8UHSJ89cm78CA