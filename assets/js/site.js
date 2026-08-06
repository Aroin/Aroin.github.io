const $ = (selector, parent = document) => parent.querySelector(selector)

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[character])

const renderTeam = members => {
  $('#team-grid').innerHTML = members.map(member => {
    const image = member.avatar
      ? `<img src="${escapeHtml(member.avatar)}" alt="تصویر ${escapeHtml(member.name)}" loading="lazy">`
      : `<div class="member-placeholder" aria-label="تصویر موقت">${escapeHtml(member.initials)}</div>`
    const github = member.github
      ? `<a class="member-github" href="${escapeHtml(member.github)}" target="_blank" rel="noopener" aria-label="گیت‌هاب ${escapeHtml(member.name)}">GH</a>`
      : member.linkPending ? '<span class="member-github pending" aria-label="لینک به‌زودی">…</span>' : ''
    return `<article class="member reveal">
      <div class="member-photo">${image}${github}</div>
      <div class="member-info">
        <h3>${escapeHtml(member.name)}</h3>
        <span class="member-role">${escapeHtml(member.role)}</span>
        <p>${escapeHtml(member.description)}</p>
      </div>
    </article>`
  }).join('')
}

const renderTimeline = milestones => {
  $('#timeline').innerHTML = milestones.map((milestone, index) => {
    const classes = ['milestone', milestone.origin && 'origin', milestone.recent && 'recent', milestone.breakAfter && 'era-break'].filter(Boolean).join(' ')
    const title = milestone.url
      ? `<a href="${escapeHtml(milestone.url)}" target="_blank" rel="noopener">${escapeHtml(milestone.title)} <span>↗</span></a>`
      : escapeHtml(milestone.title)
    return `<article class="${classes}">
      <span class="milestone-number">${new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2 }).format(milestones.length - index)}</span>
      <time>${escapeHtml(milestone.date)}</time>
      <h3>${title}</h3>
    </article>`
  }).join('')
}

const reveal = () => {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    }
  }), { threshold: 0.08 })
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element))
}

const loadContent = async () => {
  const page = document.body.dataset.page
  try {
    if (page === 'team') {
      const response = await fetch('/data/team.json')
      if (!response.ok) throw new Error('content')
      renderTeam(await response.json())
    }
    if (page === 'journey') {
      const response = await fetch('/data/timeline.json')
      if (!response.ok) throw new Error('content')
      renderTimeline(await response.json())
    }
    reveal()
  } catch {
    const grid = $('#team-grid') || $('#timeline')
    if (grid) grid.innerHTML = '<p class="error">نمایش محتوا در حال حاضر ممکن نیست.</p>'
    reveal()
  }
}

const header = $('.site-header')
const menu = $('.menu-button')
const nav = $('nav')
window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 24), { passive: true })
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open')
  menu.setAttribute('aria-expanded', String(open))
})
nav.addEventListener('click', () => {
  nav.classList.remove('open')
  menu.setAttribute('aria-expanded', 'false')
})
$('#year').textContent = new Intl.NumberFormat('fa-IR', { useGrouping: false }).format(new Date().getFullYear())
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/service-worker.js')
reveal()
loadContent()
