let taskList = []
let totalTaskCount = 0
let currentTaskNumber = 0
let taskHandle = null

let totalTaskCountEle = document.querySelector('#totalTaskCount')
let currentTaskNumberEle = document.querySelector('#currentTaskNumber')
let progressBarEle = document.querySelector('#progress')
let startButtonEle = document.querySelector('#startButton')
let logEle = document.querySelector('#log')

let logFragment = null
let statusRefreshScheduled = false

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

function enqueueTask (taskHandler, taskData) {
  taskList.push({
    handler: taskHandler,
    data: taskData,
  })

  totalTaskCount++

  if (!taskHandle) {
    // 如果当前没有任务处理，则开始
    taskHandle = window.requestIdleCallback(runTaskQueue, { timeout: 1000 })
  }

  // 更新界面
  scheduleStatusRefresh()
}

// 核心代码
function runTaskQueue(deadline) {
  // 到期的，不管是否有空闲时间，都要执行掉
  while (taskList.length && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
    let task = taskList.shift()
    currentTaskNumber++;

    task.handler(task.data)
    scheduleStatusRefresh()
  }

  // 当前空闲时间用完了，并且还有任务，下个空闲执行
  if (taskList.length) {
    taskHandle = requestIdleCallback(runTaskQueue, { timeout: 1000 })
  } else {
    // 停止
    taskHandle = 0
  }
}

function scheduleStatusRefresh() {
  if (!statusRefreshScheduled) {
    requestAnimationFrame(updateDisplay)
    statusRefreshScheduled = true
  }
}

function updateDisplay() {
  // 缓冲高度1
  let scrolledToEnd = logEle.scrollHeight - logEle.clientHeight <= logEle.scrollTop + 1

  if (totalTaskCount) {
    if (progressBarEle.max != totalTaskCount) {
      totalTaskCountEle.textContent = totalTaskCount
      progressBarEle.max = totalTaskCount
    }

    if (progressBarEle.value !== currentTaskNumber) {
      currentTaskNumberEle.textContent = currentTaskNumber
      progressBarEle.value = currentTaskNumber
    }
  }

  if (logFragment) {
    logEle.appendChild(logFragment)
    logFragment = null
  }

  if (scrolledToEnd) {
    logEle.scrollTop = logEle.scrollHeight - logEle.clientHeight
  }

  statusRefreshScheduled = false
}

function log(text) {
  if (!logFragment) {
    logFragment = document.createDocumentFragment()
  }

  let el = document.createElement('div')
  el.innerHTML = text
  logFragment.appendChild(el)
}

function logTaskHandler(data) {
  log('<strong>Running task #' + currentTaskNumber + '</strong>')

  for (i = 0; i < data.count; i += 1) {
    log((i + 1).toString() + '. ' + data.text)
  }
}

function decodeTechnoStuff() {
  totalTaskCount = 0
  currentTaskNumber = 0

  let n = getRandomIntInclusive(100, 200)

  for (i = 0; i < n; i++) {
    let taskData = {
      count: getRandomIntInclusive(75, 150),
      text: 'This text is from task number ' + (i + 1).toString() + ' of ' + n
    }

    enqueueTask(logTaskHandler, taskData)
  }
}

startButtonEle.addEventListener('click', decodeTechnoStuff, false)
