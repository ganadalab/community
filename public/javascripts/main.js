// Delete Button Confirm
const deleteBtn = document.querySelectorAll('button[value="delete"]');
deleteBtn.forEach(b => {
  b.addEventListener('click', (e) => {
    if (!confirm('삭제 확인')) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
});

const withdrawBtn = document.querySelector('button[value="withdraw"]');
if (withdrawBtn) {
  withdrawBtn.addEventListener('click', (e) => {
    if (!confirm('탈퇴 확인')) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
}

const getUser = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/getUser');
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const result = JSON.parse(xhr.responseText);
        resolve(result);
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
  });
};

const getBoard = (boardId) => {
  return new Promise((resolve, reject) => {
    const data = {
      boardId,
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/getBoard');
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const result = JSON.parse(xhr.responseText);
        resolve(result);
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  });
};

const getUserGroupPermission = (boardId, type) => {
  return new Promise((resolve, reject) => {
    const data = {
      boardId,
      type,
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/getUserGroupPermission');
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const result = JSON.parse(xhr.responseText);
        resolve(result);
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  });
};

const getSetting = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/getSetting');
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const result = JSON.parse(xhr.responseText);
        resolve(result);
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
  });
};

const usePermissionImage = async () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const result = JSON.parse(xhr.responseText);
        resolve(result);
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.open('GET', '/api/usePermissionImage');
    xhr.send();
  });
};

const blockWordsCheck = (content) => {
  return new Promise((resolve, reject) => {
    const data = {
      content,
    };
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const result = JSON.parse(xhr.responseText);
        resolve(result);
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.open('POST', '/api/blockWordsCheck');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  });
}

// modal
const modalContainer = document.querySelector('article #modal');
const modalBackground = document.querySelector('article #modal .background');
const modalContainers = document.querySelectorAll('article #modal .container');
const modal = {
  create (selector) {
    modalContainer.classList.add('active');
    selector.classList.add('active');
  },
  remove (selector) {
    modalContainer.classList.remove('active');
    selector.classList.remove('active');
  }
}
if (modalBackground) {
  modalBackground.addEventListener('click', () => {
    modalContainer.classList.remove('active');
    modalContainers.forEach(modalContainer => {
      modalContainer.classList.remove('active');
    });
  });
}

// report
const report = (data, reportContainer) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const result = JSON.parse(xhr.responseText);
        resolve(result);
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.open('POST', '/api/report');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  });
}

const reportContainer = document.querySelector('#modal .report');
const reportType = document.querySelector('#modal .report input[name="type"]');
const reportId = document.querySelector('#modal .report input[name="id"]');
const reportContent = document.querySelector('#modal .report textarea');
const reportCompleteBtn = document.querySelector('#modal .report button');
if (reportCompleteBtn) {
  reportCompleteBtn.addEventListener('click', async () => {
    const data = {
      reportType: reportType.value,
      reportId: reportId.value,
      content: reportContent.value,
    };
    const result = await report(data);
    if (result) {
      modal.remove(reportContainer);
      reportContent.value = '';
      alert(result.message);
    }
  });
}

// adsense
window.addEventListener('load', () => {
  const matches = document.querySelectorAll('ins.ADSENSE');
  Array.from(matches).forEach((element) => {
    const parentElement = element.parentElement;
    if (window.getComputedStyle(parentElement).getPropertyValue('display') === 'none')  { 
        element.remove(); 
    } else {
    element.classList.remove('ADSENSE');
    element.classList.add('adsbygoogle');
      (adsbygoogle = window.adsbygoogle || []).push({}); 
    }
  });
});

const getCookie = (name) => {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

const setCookie = (name, value, options = {}) => {
  options = {
    path: '/',
    ...options,
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

const deleteCookie = (name) => {
  setCookie(name, "", {
    'max-age': -1,
  });
}

// Dark Theme
const toggleThemeBtn = document.querySelector('#toggleTheme');
if (window.matchMedia("(prefers-color-scheme: dark)").matches && localStorage.getItem('colorMode') !== 'light') {
  document.body.setAttribute('data-theme', 'dark');
  localStorage.setItem('colorMode', 'dark');
  toggleThemeBtn.textContent = '라이트모드 전환';
}

toggleThemeBtn.addEventListener('click', () => {
  let colorMode = localStorage.getItem('colorMode');
  if (colorMode == 'dark') {
    document.body.removeAttribute('data-theme');
    localStorage.setItem('colorMode', 'light');
    toggleThemeBtn.textContent = '다크모드 전환';
  } else {
    document.body.setAttribute('data-theme', 'dark');
    localStorage.setItem('colorMode', 'dark');
    toggleThemeBtn.textContent = '라이트모드 전환';
  }
});