function renderSlackButton() {
  const inputToken = document.getElementById('token');
  const slackButton = document.getElementById('slack-button');
  const slackStatus = document.getElementById('slack-status');
  chrome.storage.sync.get(['token', 'clientId'], function (store) {
    if (store.token && store.token.length > 0) {
      slackButton.style.display = 'none';
      slackStatus.style.display = 'initial';
      inputToken.value = store.token;
    } else {
      slackButton.style.display = 'initial';
      slackButton.href = `https://slack.com/oauth/v2/authorize?client_id=${store.clientId}&user_scope=chat:write,reactions:write`;
      slackStatus.style.display = 'none';
      inputToken.value = '';
    }
  });
  inputToken.addEventListener('change', function (event) {
    chrome.storage.sync.set({ token: event.target.value });
  });
};

const inputChannel = document.getElementById('channel');
chrome.storage.sync.get('channel', function (store) {
  inputChannel.value = store.channel || '';
});
inputChannel.addEventListener('change', function (event) {
  chrome.storage.sync.set({ channel: event.target.value });
});

chrome.storage.onChanged.addListener(function (changes) {
  renderSlackButton();
});
renderSlackButton();