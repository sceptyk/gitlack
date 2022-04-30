# Gitlack extension

Simple chrome plugin adding basic slack integration

## Installation

Go to slack and install Gitlack app

Go to `chrome://extensions`
Enable dev mode
Click `Load unpacked` select root folder of this repository
Go to extension options and add slack token

## Usage

The extension does the following:

- injects `Request review` button which will post a message with a link to MR to code review channel
- listens for click on `thumbs up` and will mirror this reaction in slack channel
