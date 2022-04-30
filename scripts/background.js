chrome.runtime.onInstalled.addListener(function () {
  chrome.runtime.onMessage.addListener(function (request) {
    if (request.name === 'post-code-review') {
      sendCodeReviewWithApi(request.data);
    } else if (request.name === 'post-code-review-thumbs-up') {
      sendReactionWithApi(request.data);
    }
  });

  chrome.browserAction.onClicked.addListener(function () {
    chrome.runtime.openOptionsPage();
  });

  chrome.storage.sync.set({
    clientId: '', // FIXME make it configurable from plugin settings
    clientSecret: '',
    channel: '#gitlack-test',
  });

  chrome.webRequest.onBeforeRequest.addListener(
    fetchAuthToken,
    { urls: ['http://localhost/gitlack/*'] },
    ['blocking']
  );
});

function sendCodeReviewWithApi(data) {
  chrome.storage.sync.get(['token', 'channel'], function (store) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://slack.com/api/chat.postMessage', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.setRequestHeader('Authorization', 'Bearer ' + store.token);
    xhr.onreadystatechange = function () {
      console.log(xhr);
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        sendEvent('code-review-message', JSON.parse(xhr.responseText));
      }
    };

    const message = JSON.stringify({
      channel: store.channel,
      text: `<${data.url}|Merge request in ${data.project}>`,
    });

    xhr.send(message);
  });
}

function sendReactionWithApi(data) {
  chrome.storage.sync.get(['token'], function (store) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://slack.com/api/reactions.add', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.setRequestHeader('Authorization', 'Bearer ' + store.token);
    xhr.onreadystatechange = function () {
      console.log(xhr);
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        console.log('reacted');
      }
    };

    const reaction = JSON.stringify({
      channel: data.channel,
      name: 'thumbsup',
      timestamp: data.reviewRequestId,
    });

    xhr.send(reaction);
  });
}

function sendEvent(name, data) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      name,
      data,
    });
  });
}

function fetchAuthToken(details) {
  const { code } = getUrlParams(details.url);
  chrome.tabs.remove(details.tabId);
  if (code) {
    chrome.storage.sync.get(['clientId', 'clientSecret'], function (store) {
      const { clientId, clientSecret } = store;
      const xhr = new XMLHttpRequest();
      xhr.open(
        'GET',
        `https://slack.com/api/oauth.v2.access?code=${code}&client_id=${clientId}&client_secret=${clientSecret}`,
        true
      );
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          chrome.storage.sync.set({ token: response.authed_user.access_token });
          chrome.runtime.openOptionsPage();
        }
      };
      xhr.send();
    });
  }
}

function getUrlParams(url) {
  const params = {};
  url
    .split('?')[1]
    .split('&')
    .forEach((pair) => {
      pair = pair.split('=');
      params[pair[0]] = pair[1];
    });
  return params;
}
