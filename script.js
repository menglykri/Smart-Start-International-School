// Page markup lives in each HTML file. This script adds interactive behavior.
document.documentElement.classList.add('js');
// Anchor relative links and assets before normalizing the address bar.
const siteBase=new URL('.',document.currentScript.src);
let base=document.querySelector('base');
if(!base){base=document.createElement('base');document.head.prepend(base)}
base.href=siteBase.href;
const relativePath=location.pathname.slice(siteBase.pathname.length);
const route=relativePath.split('/').filter(Boolean)[0]?.replace(/\.html$/, '')||'';
let key=['about','programs','activities','stories','event-details','teachers','news','events','gallery','rankings','contact','apply'].includes(route)?route:'home';
if(location.protocol!=='file:'){
  const canonicalPath=siteBase.pathname+(key==='home'?'':key);
  if(location.pathname!==canonicalPath){
    history.replaceState(null,'',canonicalPath+location.search+location.hash);
  }
}

let setPageLanguage;
async function initializePage() {
  // Show the last successful layout immediately, then check for edits.
  await Promise.all(Array.from(document.querySelectorAll('[data-include]'), async placeholder => {
    const file = placeholder.dataset.include;
    const url = new URL(file, siteBase);
    const cacheKey = 'ssi-layout:' + url.href;
    let cached;
    let nodes = [];
    function render(html) {
      const template = document.createElement('template');
      template.innerHTML = html;
      template.content.querySelectorAll('script').forEach(script => script.remove());
      const nextNodes = Array.from(template.content.childNodes);
      if (nodes.length) {
        nodes[0].before(template.content);
        nodes.forEach(node => node.remove());
      } else {
        placeholder.replaceWith(template.content);
      }
      nodes = nextNodes;
    }
    try { cached = sessionStorage.getItem(cacheKey); } catch {}
    if (cached) render(cached);
    try {
      const response = await fetch(url, {cache: 'no-cache'});
      if (!response.ok) throw new Error('Unable to load ' + file + ': ' + response.status);
      const html = await response.text();
      if (html !== cached) render(html);
      try { sessionStorage.setItem(cacheKey, html); } catch {}
    } catch (error) {
      if (!cached) throw error;
      console.warn('Using saved shared layout:', error);
    }
  }));
  document.querySelectorAll('[data-current-year]').forEach(element => {
    element.textContent = new Date().getFullYear();
  });
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animatedElements = Array.from(document.querySelectorAll([
    'main .reveal','main .card','main .stat','main .section-head','main .split > *',
    'main .timeline article','main .gallery > button','main .activity-showcase',
    'main .story-content','main .story-image','main .event-experience-content',
    'main .event-experience-image','main .ranking-class','main .form','main .info-card'
  ].join(',')));
  animatedElements.forEach((element, index) => {
    element.classList.add('motion-reveal');
    element.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
  });
  const pageMain = document.querySelector('main');
  if (pageMain) {
    pageMain.classList.remove('page-ready');
    requestAnimationFrame(() => pageMain.classList.add('page-ready'));
  }
  if (reduceMotion || !('IntersectionObserver' in window)) {
    animatedElements.forEach(element => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, {threshold: 0.12, rootMargin: '0px 0px -45px'});
    animatedElements.forEach(element => revealObserver.observe(element));
  }
  document.querySelectorAll('.links a').forEach(link => {
    const active = link.dataset.i18n === key;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

// Both dictionaries translate original text without replacing page elements.
const dictionaries = {en: {}, km: window.KHMER_TEXT, zh: window.CHINESE_TEXT};
// Keep submitted select values stable while their displayed labels are translated.
document.querySelectorAll('form option:not([value])').forEach(option => {
  option.value = option.textContent.trim();
});
const pageText = new Map();
const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
while (walker.nextNode()) {
  const node = walker.currentNode;
  if (node.textContent.trim() && !node.parentElement.closest('script, style, .lang')) {
    pageText.set(node, node.textContent);
  }
}
const pageAttributes = [];
document.querySelectorAll('[alt], [aria-label], [title], meta[name="description"]').forEach(element => {
  ['alt', 'aria-label', 'title', 'content'].forEach(attribute => {
    if (element.hasAttribute(attribute)) {
      pageAttributes.push({element, attribute, original: element.getAttribute(attribute)});
    }
  });
});
function localeText(text) {
  return dictionaries[document.documentElement.lang]?.[text] || text;
}
function updateLanguage(language) {
  const selected = dictionaries[language] ? language : 'en';
  const text = dictionaries[selected];
  document.documentElement.lang = selected;
  // Restore text nodes directly rather than replacing elements containing links or icons.
  pageText.forEach((original, node) => {
    const normalized = original.trim().replace(/\s+/g, ' ');
    const translated = text[normalized];
    node.textContent = translated ? original.replace(original.trim(), translated) : original;
  });
  pageAttributes.forEach(({element, attribute, original}) => {
    element.setAttribute(attribute, text[original] || original);
  });
  document.querySelectorAll('.field .error').forEach(element => {
    if (element.dataset.message) element.textContent = localeText(element.dataset.message);
  });
  document.querySelector('.lang').value = selected;
}
setPageLanguage = updateLanguage;
updateLanguage(localStorage.getItem('ssi-lang') || 'en');

document.querySelector('.menu').onclick=e=>{let n=document.querySelector('.links');n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',n.classList.contains('open'))};document.querySelector('.lang').onchange=e=>{localStorage.setItem('ssi-lang',e.target.value);updateLanguage(e.target.value)};

const galleryItems = Array.from(document.querySelectorAll('.gallery > button'));
const galleryBatchSize = 10;
galleryItems.forEach((item, index) => {
  item.hidden = index >= galleryBatchSize;
  item.onclick = () => {
    const lightbox = document.querySelector('.lightbox');
    lightbox.querySelector('img').src = item.querySelector('img').src;
    lightbox.classList.add('open');
    lightbox.querySelector('button').focus();
  };
});
const galleryMore = document.querySelector('.gallery-load-more');
if (galleryMore) {
  galleryMore.hidden = galleryItems.length <= galleryBatchSize;
  galleryMore.onclick = () => {
    galleryItems.filter(item => item.hidden).slice(0, galleryBatchSize).forEach(item => { item.hidden = false; });
    const remaining = galleryItems.filter(item => item.hidden).length;
    galleryMore.hidden = remaining === 0;
    if (remaining) galleryMore.querySelector('span:last-child').textContent = `Show ${Math.min(galleryBatchSize, remaining)} more photos`;
  };
}
let lb=document.querySelector('.lightbox');lb.querySelector('button').onclick=()=>lb.classList.remove('open');lb.onclick=e=>{if(e.target===lb)lb.classList.remove('open')};document.onkeydown=e=>{if(e.key==='Escape')lb.classList.remove('open')};

document.querySelectorAll('form').forEach(f=>f.onsubmit=e=>{e.preventDefault();let ok=true;f.querySelectorAll('[required]').forEach(x=>{let msg='';if(!x.value.trim())msg='This field is required.';else if(x.type==='email'&&!/^\S+@\S+\.\S+$/.test(x.value))msg='Enter a valid email address.';const error=x.closest('.field').querySelector('.error');error.dataset.message=msg;error.textContent=localeText(msg);x.setAttribute('aria-invalid',!!msg);if(msg)ok=false});if(ok){f.querySelector('.success').classList.add('show');f.reset();f.querySelector('.success').scrollIntoView({behavior:'smooth',block:'center'})}});

}
const initialPageReady = initializePage().catch(error => {
  console.error('Page initialization failed:', error);
  document.querySelectorAll('[data-include]').forEach(placeholder => {
    placeholder.textContent = 'Unable to load shared layout. Please refresh or open this website through Live Server.';
  });
});

// Keep shared navigation mounted while changing only page-specific content.
let navigationRequest = 0;
function pageRoute(url) {
  if (url.origin !== siteBase.origin || !url.pathname.startsWith(siteBase.pathname)) return null;
  const path = url.pathname.slice(siteBase.pathname.length).replace(/\/index\.html$/, '').replace(/\/$/, '');
  if (!path || path === 'index.html') return 'home';
  return ['about','programs','activities','stories','event-details','teachers','news','events','gallery','rankings','contact'].includes(path) ? path : null;
}
async function navigatePage(url, pushHistory = true) {
  const request = ++navigationRequest;
  try {
    await initialPageReady;
    const route = pageRoute(url);
    if (!route || !document.querySelector('.header') || !setPageLanguage) throw new Error('Full navigation required');
    const fetchUrl = new URL(route === 'home' ? './' : route + '/', siteBase);
    fetchUrl.search = url.search;
    const response = await fetch(fetchUrl);
    if (!response.ok) throw new Error('Unable to load page: ' + response.status);
    const next = new DOMParser().parseFromString(await response.text(), 'text/html');
    if (!next.querySelector('main') || !next.querySelector('[data-include="footer.html"]')) throw new Error('Invalid page markup');
    if (request !== navigationRequest) return;
    // Restore original strings before collecting the next page's translations.
    setPageLanguage('en');
    const footer = document.querySelector('.footer');
    const persistent = new Set(document.querySelectorAll('body > .skip, body > .topbar, body > .header, body > .footer'));
    Array.from(document.body.children).forEach(node => {
      if (!persistent.has(node)) node.remove();
    });
    let afterFooter = false;
    for (const node of Array.from(next.body.children)) {
      if (node.dataset.include === 'header.html') continue;
      if (node.dataset.include === 'footer.html') { afterFooter = true; continue; }
      if (node.tagName === 'SCRIPT') continue;
      node.querySelectorAll('script').forEach(script => script.remove());
      if (afterFooter) document.body.append(node);
      else footer.before(node);
    }
    document.title = next.title;
    const description = next.querySelector('meta[name="description"]');
    if (description) document.querySelector('meta[name="description"]').content = description.content;
    key = route;
    const canonical = new URL(route === 'home' ? './' : route, siteBase);
    canonical.search = url.search;
    canonical.hash = url.hash;
    if (pushHistory) history.pushState(null, '', canonical);
    document.querySelector('.links').classList.remove('open');
    document.querySelector('.menu').setAttribute('aria-expanded', 'false');
    await initializePage();
    const target = url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
    if (target) target.scrollIntoView({behavior: 'instant'});
    else window.scrollTo({top: 0, behavior: 'instant'});
    const main = document.querySelector('main');
    main.setAttribute('tabindex', '-1');
    main.focus({preventScroll: true});
  } catch (error) {
    if (request === navigationRequest) location.assign(url.href);
  }
}
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href]');
  if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
  const rawHref = link.getAttribute('href');
  if (rawHref && rawHref.startsWith('#')) {
    const target = document.getElementById(decodeURIComponent(rawHref.slice(1)));
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', location.pathname + location.search + rawHref);
    target.scrollIntoView({behavior: 'smooth'});
    return;
  }
  const url = new URL(link.href);
  if (!pageRoute(url)) return;
  const current = new URL(location.href);
  if (url.hash && pageRoute(url) === pageRoute(current) && url.search === current.search) {
    event.preventDefault();
    const route = pageRoute(url);
    const canonical = new URL(route === 'home' ? './' : route, siteBase);
    canonical.search = url.search;
    canonical.hash = url.hash;
    history.pushState(null, '', canonical);
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (target) target.scrollIntoView({behavior: 'smooth'});
    return;
  }
  event.preventDefault();
  navigatePage(url);
});
window.addEventListener('popstate', () => navigatePage(new URL(location.href), false));
