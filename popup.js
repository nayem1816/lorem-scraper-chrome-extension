// catch div
const showContent = document.getElementById("show-content");
const showEmail = document.getElementById("show-email");
const showOthers = document.getElementById("show-others");

// catch Button
const handleContent = document.getElementById("handleContent");
const handleEmail = document.getElementById("handleEmail");
const handleOthers = document.getElementById("handleOthers");

// catch others
const contentTxt = document.getElementById("content-txt");
const emailTxt = document.getElementById("email-txt");
const othersTxt = document.getElementById("others-txt");
const emailList = document.getElementById("emailList");

// Handle to receive emails from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let content = request.content;
  let content2 = request.content2;
  if (request.content == null) {
    contentTxt.innerText = "No content found";
    contentTxt.style.textAlign = "center";
    contentTxt.style.color = "red";
    contentTxt.style.fontSize = "20px";
    contentTxt.style.marginTop = "10px";
  } else {
    content.forEach((item) => {
      showContent.innerHTML += `<div class='content-style'>
      <h2>${item.title}</h2>
      <p>${item.content}</p>
      </div>`;
    });
  }

  if (request.content2 != null) {
    showContent.innerHTML += content2;
    showContent.style.textAlign = "justify";
  }

  let emails = request.emails;

  //   display emails in popup
  if (emails == null || emails.length == 0) {
    emailTxt.innerText = "No email found";
    emailTxt.style.textAlign = "center";
    emailTxt.style.color = "red";
    emailTxt.style.fontSize = "20px";
    emailTxt.style.marginTop = "10px";
  } else {
    let i = 1;
    emails.forEach((email) => {
      showEmail.innerHTML += `<p class='email-style'>${i++}. ${email}</p>`;
    });
  }
});

document.body.onload = async () => {
  showContent.style.display = "block";
  showEmail.style.display = "none";
  showOthers.style.display = "none";

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeContentFromPage,
  });
};

// HANDLE CONTENT BUTTON
handleContent.addEventListener("click", async () => {
  showContent.innerHTML = "";
  showContent.style.display = "block";
  showEmail.style.display = "none";
  showOthers.style.display = "none";

  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeContentFromPage,
  });
});

// HANDLE EMAIL BUTTON
handleEmail.addEventListener("click", async () => {
  showEmail.innerHTML = "";
  showContent.style.display = "none";
  showEmail.style.display = "block";
  showOthers.style.display = "none";
  // get current active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Execute script to parse email on page
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: scrapeEmailFromPage,
  });
});

// HANDLE OTHERS BUTTON
handleOthers.addEventListener("click", () => {
  showContent.style.display = "none";
  showEmail.style.display = "none";
  showOthers.style.display = "block";

  othersTxt.innerText = "This feature is coming soon";
  othersTxt.style.textAlign = "center";
  othersTxt.style.color = "red";
  othersTxt.style.fontSize = "20px";
  othersTxt.style.marginTop = "10px";
});

// Function to parse content from page
function scrapeContentFromPage() {
  const storeTag = [];

  const content = document.getElementById("Panes");
  const content2 = document.getElementById("Translation");

  for (let i = 0; i < content.children.length; i++) {
    const items = {
      title: "",
      content: "",
    };
    for (let j = 0; j < content.children[i].children.length; j++) {
      if (content.children[i].children[j].tagName != "FORM") {
        if (content.children[i].children[j].tagName == "H2") {
          items.title = content.children[i].children[j].innerText;
        }
        if (content.children[i].children[j].tagName == "P") {
          items.content = content.children[i].children[j].innerText;
        }
      }
    }
    storeTag.push(items);
  }

  chrome.runtime.sendMessage({
    content: storeTag,
    content2: content2.innerHTML,
  });
}

// Function to parse email from page
function scrapeEmailFromPage() {
  const emailRegEx = /[\w\.=-]+@[\w\.-]+\.[\w]{2,3}/gim;
  const allEmails = document.body.innerHTML.match(emailRegEx);
  const emails = [...new Set(allEmails)];
  chrome.runtime.sendMessage({ emails });
}
