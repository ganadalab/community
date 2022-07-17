const gameType = Number(document.querySelector('article #gameType').value);
const roundData = document.querySelector('article input[name="round"]');
const actionButtons = document.querySelectorAll('.action .buttons button');
const infoTime = document.querySelector('.info .time');
const timesContainers = document.querySelectorAll('.game .time');
const infoRound = document.querySelector('.gameSelect .text .number');

const getChartData = (type) => {
  return new Promise((resolve, reject) => {
    const data = {
      type,
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/getChartData');
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

const getReadyGame = (type) => {
  return new Promise((resolve, reject) => {
    const data = {
      type,
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/getReadyGame');
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

const getPoint = () => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/getPoint');
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


const getRecentResult = (type) => {
  return new Promise((resolve, reject) => {
    const data = {
      type,
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/getRecentResult');
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const result = JSON.parse(xhr.responseText);
        if (result.status) {
          rewriteResult(result.datas);
        }
        resolve(result);
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  });
};

const recentResultGamesContainer = document.querySelector('.recentResult .games');

const rewriteResult = (results) => {
  let line = '';
  line += `<div class="game header">`;
  line += `<div>라운드</div>`;
  line += `<div>시간</div>`;
  line += `<div>결과</div>`;
  line += `<div>수익</div>`;
  line += `</div>`;
  results.forEach(result => {
    line += `<div class="game">`;
    line += `<div>${result.round}</div>`;
    line += `<div>${result.datetime}</div>`;
    if (result.result) {
      line += `<div class="success">적중</div>`;
      line += `<div>${result.pointCalc.toLocaleString()}</div>`;
    } else if (result.result === null) {
      line += `<div>결과 대기중</div>`;
      line += `<div></div>`;
    } else {
      line += `<div class="fail">미적중</div>`;
      line += `<div></div>`;
    }
    line += `</div>`;
  });
  recentResultGamesContainer.innerHTML = line;
};

const setGame = (data) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/setGame');
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

// statistics
const staticHeaders = document.querySelectorAll('.statistics .header div');
const underOverContainer = document.querySelector('.statistics .underOver');
const oddEvenContainer = document.querySelector('.statistics .oddEven');
let containerSelect = 'underOver';

const getStatistics = (type) => {
  return new Promise((resolve, reject) => {
    const data = {
      type,
    };
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/getStatistics');
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const result = JSON.parse(xhr.responseText);
        if (result.status) {
          rewriteStatic('underOver', result.underOver);
          rewriteStatic('oddEven', result.oddEven);
        }
      } else {
        console.error(xhr.responseText);
      }
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  });
};

const rewriteStatic = (type, datas) => {
  if (type && datas.length) {
    let line = '';
    datas.forEach(data => {
      line += `<div class="item">`;
      if (type === 'underOver') {
        if (data.status === 'under') {
          line += `<div class="status under">언더</div>`;
        } else if (data.status === 'over') {
          line += `<div class="status over">오버</div>`;
        }
      } else if (type === 'oddEven') {
        if (data.status === 'odd') {
          line += `<div class="status odd">홀</div>`;
        } else if (data.status === 'even') {
          line += `<div class="status even">짝</div>`;
        }
      }
      line += `<div class="charts">`;
      data.charts.forEach(chart => {
        line += `<div class="chart">`;
        if (data.status === 'under') {
          line += `<div class="under">${chart.round}</div>`;
        } else if (data.status === 'over') {
          line += `<div class="over">${chart.round}</div>`;
        } else if (data.status === 'odd') {
          line += `<div class="odd">${chart.round}</div>`;
        } else if (data.status === 'even') {
          line += `<div class="even">${chart.round}</div>`;
        }
        line += `</div>`;
      });
      const remain = 10 - data.charts.length;
      for (let i = 0; i < remain; i ++) {
        line += `<div class="chart"></div>`;
      }
      line += `</div>`;
      line += `</div>`;
    });
    if (type === 'underOver') {
      underOverContainer.innerHTML = line;
    } else if (type === 'oddEven') {
      oddEvenContainer.innerHTML = line;
    }
    underOverContainer.scrollLeft = underOverContainer.scrollWidth;
    oddEvenContainer.scrollLeft = oddEvenContainer.scrollWidth;
  }
};

staticHeaders.forEach(staticHeader => {
  staticHeader.addEventListener('click', () => {
    staticHeaders.forEach(item => {
      item.classList.remove('selected');
    });
    staticHeader.classList.add('selected');
    if (staticHeader.id === 'underOver') {
      underOverContainer.classList.add('selected');
      oddEvenContainer.classList.remove('selected');
      containerSelect = 'underOver';
      underOverContainer.scrollLeft = underOverContainer.scrollWidth;
    } else if (staticHeader.id === 'oddEven') {
      underOverContainer.classList.remove('selected');
      oddEvenContainer.classList.add('selected');
      containerSelect = 'oddEven';
      oddEvenContainer.scrollLeft = oddEvenContainer.scrollWidth;
    }
  });
});

(async () => {
  const timeout = document.querySelector('.timeout .number');
  const userPointContainer = document.querySelector('.userPoint .point');

  const timeChange = (time) => {
    timesContainers.forEach(timesContainer => {
      timesContainer.innerHTML = time;
    });
    infoTime.innerHTML = time;
  };

  socket.emit('chart', gameType);

  // 스크롤 최하단 이동
  const staticContainers = document.querySelectorAll('.statistics .container > div');
  staticContainers.forEach(staticContainer => {
    staticContainer.scrollLeft = staticContainer.scrollWidth;
  });

  const readyResult = await getReadyGame(gameType);
  if (readyResult.status) {
    const chart = readyResult.chart;
    infoRound.innerHTML = chart.round.toLocaleString();
    const nextTime = moment(chart.datetime).format('hh시 mm분');
    timeChange(nextTime);
  }
  const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  const getLeftTime = async () => {
    const date = new Date();
    const nowSecond = date.getSeconds();
    const leftTimeRaw = (60 * gameType) - nowSecond;
    let minute = Math.floor(leftTimeRaw / 60).toString();
    let second = (leftTimeRaw % 60).toString();
    if (minute.length === 1) minute = `0${minute}`;
    if (second.length === 1) second = `0${second}`;
    let leftTime = null;
    if (leftTimeRaw === 60 * gameType) {
      leftTime = `00:00`;
    } else if (leftTimeRaw < 10) {
      leftTime = `${minute}:${second}`;
    } else {
      leftTime = `${minute}:${second}`;
    }
    if (leftTimeRaw === 60 * gameType) {
      const readyResult = await getReadyGame(gameType);
      if (readyResult.status) {
        const chart = readyResult.chart;
        infoRound.innerHTML = chart.round.toLocaleString();
        const nextTime = moment(chart.datetime).format('hh시 mm분');
        timeChange(nextTime);
        // 게임 결과 등록
        await delay(2000);
        setUserPoint();
        getRecentResult(gameType);
        getStatistics(gameType);
      }
    }
    timeout.innerHTML = leftTime;
  };

  const setUserPoint = async () => {
    const pointResult = await getPoint();
    if (pointResult.status) {
      userPointContainer.innerHTML = pointResult.point.toLocaleString();
    } else {
      userPointContainer.innerHTML = pointResult.message;
    }
  };

  getLeftTime();
  setUserPoint();
  setInterval(getLeftTime, 1000);

  socket.on(gameType, (data) => {
    candlestickSeries.update(data);
  });

  actionButtons.forEach(button => {
    button.addEventListener('click', async () => {
      const buttonType = button.getAttribute('type');
      const pointInputs = document.querySelectorAll('.points .point input[name="point"]');
      const underOverInputs = document.querySelectorAll('.positions .position input[name="underOver"]');
      const oddEvenInputs = document.querySelectorAll('.positions .position input[name="oddEven"]');
      const gameSelects = document.querySelectorAll('input[name="game"]');
      let point = null;
      let underOver = null;
      let oddEven = null;
      pointInputs.forEach(pointInput => {
        if (pointInput.checked) {
          point = pointInput.getAttribute('point');
        }
      });
      underOverInputs.forEach(underOverInput => {
        if (underOverInput.checked) {
          underOver = underOverInput.getAttribute('position');
        }
      });
      oddEvenInputs.forEach(oddEvenInput => {
        if (oddEvenInput.checked) {
          oddEven = oddEvenInput.getAttribute('position');
        }
      });
      if (buttonType === 'buy') {
        if (point && underOver || point && oddEven) {
          const readyResult = await getReadyGame(gameType);
          if (readyResult.status) {
            const chart = readyResult.chart;
            const data = {
              gameType,
              round: chart.round,
              point,
              underOver,
              oddEven,
            };
            const result = await setGame(data);
            if (result) {
              alert(result.message);
              // 보유 포인트 업데이트
              setUserPoint();
              getRecentResult(gameType);
            } else {
              alert(result.message);
            }
          }
        } else {
          alert('포지션을 선택해주세요');
        }
      } else if (buttonType === 'reset') {
        gameSelects.forEach(gameSelect => {
          if (gameSelect.checked) {
            gameSelect.checked = false;
          }
        });
        pointInputs.forEach(pointInput => {
          pointInput.checked = false;
        });
        underOverInputs.forEach(underOverInput => {
          underOverInput.checked = false;
        });
        oddEvenInputs.forEach(oddEvenInput => {
          oddEvenInput.checked = false;
        });
      }
    });
  });

  // chart.timeScale().fitContent();
})();