const socket = io();

const chatContainer = document.querySelector('#chat');
if (chatContainer) {
  const chatInput = chatContainer.querySelector('#msg');
  const chatButton = chatContainer.querySelector('#send');
  const chatList = chatContainer.querySelector('#chatList');
  
  const chatExpand = chatContainer.querySelector('#chatExpand');
  const chatBox = chatContainer.querySelector('#chatBox');
  
  if (chatExpand) {
    chatExpand.addEventListener('click', () => {
      chatBox.style.height = '300px';
    });
  }
  
  socket.on('userCount', (count) => {
    const userCount = document.querySelector('#userCount');
    const customCounters = document.querySelectorAll('#customCounter');
    if (userCount) {
      userCount.innerHTML = `(${count})`;
    }
    customCounters.forEach(customCounter => {
      customCounter.innerHTML = `${Number(count).toLocaleString()}`;
    });
  });
  
  const getChats = () => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/getChats');
      xhr.onload = () => {
        const result = JSON.parse(xhr.responseText);
        resolve(result);
      };
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send();
    });
  };
  
  (async () => {
    // 기존 채팅 추가
    const datas = await getChats();
    const usePermissionImageBoolean = await usePermissionImage();
    let html = '';
    datas.forEach(data => {
      html += `<li class="chat" userId="${data.user.id}">`;
      html += `<span class="nickName">`
      if (usePermissionImageBoolean) html += `<img src="${data.user.permissionImage}">`;
      html += `${data.user.nickName}</span>`;
      html += `<span class="message">${data.message}</span>`;
      html += `</li>`;
    });
    chatList.innerHTML = chatList.innerHTML + html;
  
    // 스크롤 최하단 이동
    chatList.scrollTop = chatList.scrollHeight;

    let scrollDownStatus = true;
    const chatEnd = chatContainer.querySelector('#chatEnd');
    const observer = new IntersectionObserver((entires, observer) => {
      entires.forEach((entry) => {
        if (entry.isIntersecting) {
          scrollDownStatus = true;
          newMessagePopup.classList.remove('active');
        } else {
          scrollDownStatus = false;
        }
      });
    });
    
    observer.observe(chatEnd);

    const newMessagePopup = chatContainer.querySelector('#newMessage');
    newMessagePopup.addEventListener('click', () => {
      chatList.scrollTop = chatList.scrollHeight;
      newMessagePopup.classList.remove('active');
    });
  
    // 새 채팅 추가
    socket.on('updateMessage', (data) => {
      let html = '';
      html += `<li class="chat" userId="${data.user.id}">`;
      html += `<span class="nickName">`;
      if (usePermissionImageBoolean) html += `<img src="${data.user.permissionImage}">`;
      html += `${data.user.nickName}</span>`;
      html += `<span class="message">${data.message}</span>`;
      html += `</li>`;
      chatList.innerHTML = chatList.innerHTML + html;
      // 스크롤 최하단 이동
      if (scrollDownStatus) {
        chatList.scrollTop = chatList.scrollHeight;
      } else {
        newMessagePopup.classList.add('active');
      }
      addChatEvent();
    });
  
    const addChatEvent = () => {
      const chats = chatList.querySelectorAll('.chat');
      chats.forEach(chat => {
        const userId = chat.getAttribute('userId');
        const nickName = chat.querySelector('.nickName');
        const popUp = chat.querySelector('ul');
        nickName.addEventListener('click', () => {
          if (popUp) popUp.classList.toggle('active');
        });
      });
    };
      
    const user = await getUser();
    chatButton.addEventListener('click', async () => {
      let message = chatInput.value;
      const tagRegex = new RegExp(/<[^>]*>/g);
      message = message.replace(tagRegex, '');
      message = message.replace(/\n/ig, '<br>');
      if (message !== '') {
        socket.emit('sendMessage', {
          user,
          message,
        });
        chatInput.value = '';
        chatInput.focus();
      }
    });
  
    addChatEvent();
  })();
}

const moveFocus = (next) => {
  if (window.event.keyCode === 13) {
    chatInput.focus();
    if (next === 'send') {
      chatButton.click();
    }
  }
};