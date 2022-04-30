console.log('Slack manager');

const buttonsContainer = document.querySelector('.issue-btn-group');
const postButton = createPostButton();

buttonsContainer.prepend(postButton);

addThumbsUpListener();

chrome.runtime.onMessage.addListener(function (request) {
  if (request.name === 'code-review-message') {
    commentReviewRequest(request.data);
  }
});

function commentReviewRequest(data) {
  const noteTextArea = document.getElementById('note-body');
  noteTextArea.value = `Code review request: ${data.channel}_${data.ts}`;
  noteTextArea.dispatchEvent(new Event('change'));
  const submitButton = document.querySelector('.qa-comment-button');
  submitButton.dispatchEvent(new Event('click'));
}

function createPostButton() {
  const postButton = document.createElement('button');
  postButton.classList.add('btn');
  postButton.classList.add('btn-grouped');
  postButton.textContent = 'Request review';

  postButton.onclick = function () {
    const author = document.querySelector('.author').textContent;
    const url = window.location.href;
    const project = window.location.pathname.split('/')[2];
    sendEvent('post-code-review', {
      author,
      project,
      url,
    });
  };

  return postButton;
}

function addThumbsUpListener() {
  const thumbsUpButton = document.querySelector(
    'button.award-control > [data-name="thumbsup"]'
  ).parentElement;
  thumbsUpButton.onclick = function () {
    let reviewRequestId;
    let channel;
    document.querySelectorAll('.note-text').forEach(function (noteElement) {
      const matches = noteElement.textContent.match(
        /Code review request: (.*)_(\d*\.\d*)/
      );
      if (matches) {
        channel = matches[1];
        reviewRequestId = matches[2];
      }
    });
    if (!thumbsUpButton.classList.contains('active')) {
      console.log('up');
      sendEvent('post-code-review-thumbs-up', {
        reviewRequestId,
        channel,
      });
    }
  };
}

function sendEvent(name, data) {
  chrome.runtime.sendMessage({
    name,
    data,
  });
}
