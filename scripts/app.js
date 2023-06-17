'use strict';

// State
let habbits = []
const HABBIT_KEY = 'HABBIT_KEY'
let globalActiveHabbitId

// Page
const page = {
  menu: document.querySelector('.menu__list'),
  header: {
    h1: document.querySelector('.h1'),
    progressPercent: document.querySelector('.progress__percent'),
    progressCoverBar: document.querySelector('.progress__cover-bar'),
  },
  content: {
    daysContainer: document.getElementById('days'),
    nextDay: document.querySelector('.habbit__day'),
  },
  popup: {
    index: document.getElementById('add-habbit-popup'),
    iconField: document.querySelector('.popup__form input[name="icon"]'),
    form: document.querySelector('.popup__form'),
  }
}

// Utils
function loadData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY)
  const habbitsArray = JSON.parse(habbitsString)

  if (Array.isArray(habbitsArray)) {
    habbits = habbitsArray
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits))
}

function togglePopup() {
  if (!page.popup.index.classList.contains('cover_hidden')) {
    page.popup.index.classList.add('cover_hidden')
  } else {
    page.popup.index.classList.remove('cover_hidden')
  }
}

function validateAndGetFormData(form, fields) {
  const formData = new FormData(form)
  const res = {}

  for (const field of fields) {
    const fieldValue = formData.get(field)
    form[field].classList.remove('error')
    if (!fieldValue) {
      form[field].classList.add('error')
    }
    res[field] = fieldValue
  }
  let isValid = true

  for (const field of fields) {
    if (!res[field]) {
      isValid = false
    }
  }

  if (!isValid) return

  return res
}

// Render
function rerenderMenu(activeHabbit) {
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`)
    if (!existed) {
      const element = document.createElement('button')
      element.setAttribute('menu-habbit-id', habbit.id)
      element.classList.add('menu__item')
      element.addEventListener('click', () => rerender(habbit.id))
      element.innerHTML = `<img src='/images/${habbit.icon}.svg' alt='${habbit.name}'/>`
      if (activeHabbit.id === habbit.id) {
        element.classList.add('menu__item_active')
      }
      page.menu.appendChild(element)
      continue
    }

    if (activeHabbit.id === habbit.id) {
      existed.classList.add('menu__item_active')
    } else {
      existed.classList.remove('menu__item_active')
    }
  }
}

function rerenderHead(activeHabbit) {
  page.header.h1.innerText = activeHabbit.name

  const progress = activeHabbit.days.length / activeHabbit.target > 1 ? 100 : activeHabbit.days.length / activeHabbit.target * 100
  page.header.progressPercent.innerText = progress.toFixed(0) + '%'
  page.header.progressCoverBar.setAttribute('style', `width:${progress}%`)
}

function rerenderContent(activeHabbit) {
  page.content.daysContainer.innerHTML = ''
  activeHabbit.days.forEach((day, index) => {
    const element = document.createElement('div')
    element.classList.add('habbit')
    element.innerHTML = `<div class="habbit__day">День ${index + 1}</div>
      <div class="habbit__comment">${day.comment}</div>
      <button class="habbit__delete" onclick="deleteDay(${index})">
        <img src="./images/delete.svg" alt="Удалить день ${index + 1}" />
      </button>`
    page.content.daysContainer.appendChild(element)
  })
  page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`
}

function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId
  const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId)
  if (!activeHabbit) return

  document.location.replace(document.location.pathname + '#' + activeHabbitId)
  rerenderMenu(activeHabbit)
  rerenderHead(activeHabbit)
  rerenderContent(activeHabbit)
}

// Work with days
function addDays(event) {
  event.preventDefault()
  const form = event.target
  const data = validateAndGetFormData(form, ['comment'])
  if (!data) return

  habbits = habbits.map(habbit => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{comment: data.comment}])
      }
    }
    return habbit
  })
  form.reset()
  rerender(globalActiveHabbitId)
  saveData()
}

function deleteDay(index) {
  habbits = habbits.map(habbit => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days.splice(index, 1)
      return {
        ...habbit,
        days: habbit.days
      }
    }
    return habbit
  })
  rerender(globalActiveHabbitId)
  saveData()
}

// Work with habbits
function setIcon(context, icon) {
  page.popup.iconField.value = icon
  const activeIcon = document.querySelector('.icon.icon_active')
  activeIcon.classList.remove('icon_active')
  context.classList.add('icon_active')
}

function addHabbit(event) {
  event.preventDefault()
  const form = event.target
  const data = validateAndGetFormData(form, ['name', 'target', 'icon'])
  if (!data) return

  const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0)

  habbits.push({
    id: maxId + 1,
    icon: data.icon,
    name: data.name,
    target: +data.target,
    days: []
  })

  form.reset()
  togglePopup()
  rerender(maxId + 1)
  saveData()
}

// Init
(() => {
  loadData()
  const hashId = Number(document.location.hash.replace('#', ''))
  const urlHabbit = habbits.find(habbit => habbit.id === hashId)

  if (urlHabbit) {
    rerender(urlHabbit.id)
  } else {
    rerender(habbits[0].id)
  }
})()
