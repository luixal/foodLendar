import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

const DAYS_OF_WEEK = [
  'sunday', 'monday', 'tuesday', 'wednesday',
  'thursday', 'friday', 'saturday'
]

const MEAL_META = {
  breakfast: { label: 'Breakfast', icon: '🌅' },
  lunch:     { label: 'Lunch',     icon: '🍲' },
  dinner:    { label: 'Dinner',    icon: '🌙' }
}

const weekLabelEl = document.getElementById('week-label')
const gridEl      = document.getElementById('menu-grid')

// ── Modal ─────────────────────────────────────────────────────────────────────

const modal        = document.getElementById('ingredients-modal')
const modalTitle   = document.getElementById('modal-title')
const modalMeal    = document.getElementById('modal-meal')
const modalList    = document.getElementById('modal-list')
const modalClose   = document.getElementById('modal-close')
const modalOverlay = document.getElementById('modal-overlay')

function openModal(mealName, mealLabel, mealIcon, ingredients) {
  modalTitle.textContent = mealName
  modalMeal.textContent  = `${mealIcon} ${mealLabel}`

  modalList.innerHTML = ''
  ingredients.forEach(({ name, quantity }) => {
    const li = document.createElement('li')
    li.className = 'modal-ingredient'

    const span = document.createElement('span')
    span.className = 'ingredient-name'
    span.textContent = name

    const qty = document.createElement('span')
    qty.className = 'ingredient-qty'
    qty.textContent = quantity

    li.appendChild(span)
    li.appendChild(qty)
    modalList.appendChild(li)
  })

  modal.classList.add('is-open')
  modal.setAttribute('aria-hidden', 'false')
  modalClose.focus()
  document.body.style.overflow = 'hidden'
}

function closeModal() {
  modal.classList.remove('is-open')
  modal.setAttribute('aria-hidden', 'true')
  document.body.style.overflow = ''
}

modalClose.addEventListener('click', closeModal)
modalOverlay.addEventListener('click', closeModal)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal()
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function getTodayKey() {
  return DAYS_OF_WEEK[new Date().getDay()]
}

// ── Card builder ──────────────────────────────────────────────────────────────

function createDayCard(day, todayKey) {
  const isToday = normalize(day.day) === todayKey

  const card = document.createElement('article')
  card.className = 'day-card' + (isToday ? ' is-today' : '')
  if (isToday) card.dataset.today = ''

  // Head
  const head = document.createElement('div')
  head.className = 'day-card-head'

  const name = document.createElement('h2')
  name.className = 'day-name'
  name.textContent = day.day
  head.appendChild(name)

  if (isToday) {
    const badge = document.createElement('span')
    badge.className = 'today-badge'
    badge.textContent = 'Today'
    head.appendChild(badge)
  }
  card.appendChild(head)

  // Meal rows
  for (const mealKey of Object.keys(MEAL_META)) {
    const meal = day.meals?.[mealKey]
    if (!meal) continue

    const meta = MEAL_META[mealKey]
    // Support both new format { name, ingredients } and plain string (fallback)
    const mealName  = typeof meal === 'string' ? meal : meal.name
    const hasIngredients = Array.isArray(meal.ingredients) && meal.ingredients.length > 0

    const row = document.createElement('div')
    row.className = 'meal-row' + (hasIngredients ? ' is-clickable' : '')
    row.dataset.meal = mealKey
    if (hasIngredients) {
      row.setAttribute('role', 'button')
      row.setAttribute('tabindex', '0')
      row.setAttribute('aria-label', `View ingredients for ${mealName}`)
      const handleOpen = () => openModal(mealName, meta.label, meta.icon, meal.ingredients)
      row.addEventListener('click', handleOpen)
      row.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpen() } })
    }

    const tag = document.createElement('span')
    tag.className = 'meal-tag'

    const icon = document.createElement('span')
    icon.className = 'meal-icon'
    icon.textContent = meta.icon
    icon.setAttribute('aria-hidden', 'true')

    const label = document.createElement('span')
    label.className = 'meal-label'
    label.textContent = meta.label

    tag.appendChild(icon)
    tag.appendChild(label)

    const value = document.createElement('p')
    value.className = 'meal-text'
    value.textContent = mealName

    const rowInner = document.createElement('div')
    rowInner.className = 'meal-row-inner'
    rowInner.appendChild(tag)

    const rowBody = document.createElement('div')
    rowBody.className = 'meal-row-body'

    const imgEl = document.createElement('img')
    imgEl.className = 'meal-thumb'
    imgEl.src = `${import.meta.env.BASE_URL}images/meals/${normalize(day.day)}-${mealKey}.png`
    imgEl.alt = mealName
    imgEl.width = 52
    imgEl.height = 52
    rowBody.appendChild(imgEl)
    rowBody.appendChild(value)
    rowInner.appendChild(rowBody)

    row.appendChild(rowInner)
    card.appendChild(row)
  }

  return card
}

// ── Carousel scroll ───────────────────────────────────────────────────────────

function scrollToToday() {
  const todayCard = gridEl.querySelector('[data-today]')
  if (todayCard) {
    requestAnimationFrame(() => {
      todayCard.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' })
    })
  }
}

// ── State renderer ────────────────────────────────────────────────────────────

function renderState(message, isError = false) {
  gridEl.innerHTML = ''
  const div = document.createElement('div')
  div.className = 'state-message' + (isError ? ' is-error' : '')
  div.textContent = message
  gridEl.appendChild(div)
}

// ── Load ──────────────────────────────────────────────────────────────────────

async function loadMenu() {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/menu.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    weekLabelEl.textContent = data.week || ''

    if (!Array.isArray(data.days) || data.days.length === 0) {
      renderState('Your menu.json has no days to show yet.')
      return
    }

    const todayKey = getTodayKey()
    gridEl.innerHTML = ''
    for (const day of data.days) {
      gridEl.appendChild(createDayCard(day, todayKey))
    }

    scrollToToday()
  } catch (err) {
    console.error('Could not load the menu:', err)
    renderState(
      'Could not load the menu. Check that public/data/menu.json exists and has a valid format.',
      true
    )
  }
}

loadMenu()
