// Page markup lives in each HTML file. This script adds interactive behavior.
// Anchor relative links and assets before normalizing the address bar.
const siteBase=new URL('.',document.currentScript.src);
let base=document.querySelector('base');
if(!base){base=document.createElement('base');document.head.prepend(base)}
base.href=siteBase.href;
const relativePath=location.pathname.slice(siteBase.pathname.length);
const route=relativePath.split('/').filter(Boolean)[0]?.replace(/\.html$/, '')||'';
const key=['about','programs','teachers','news','events','gallery','contact','apply'].includes(route)?route:'home';
if(location.protocol!=='file:'){
  const canonicalPath=siteBase.pathname+(key==='home'?'':key);
  if(location.pathname!==canonicalPath){
    history.replaceState(null,'',canonicalPath+location.search+location.hash);
  }
}

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
updateLanguage(localStorage.getItem('ssi-lang') || 'en');

document.querySelector('.menu').onclick=e=>{let n=document.querySelector('.links');n.classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',n.classList.contains('open'))};document.querySelector('.lang').onchange=e=>{localStorage.setItem('ssi-lang',e.target.value);updateLanguage(e.target.value)};
document.documentElement.classList.add('js');
const obs=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('visible')),{threshold:.12});document.querySelectorAll('.reveal').forEach(x=>obs.observe(x));
document.querySelectorAll('.gallery button').forEach(b=>b.onclick=()=>{let l=document.querySelector('.lightbox');l.querySelector('img').src=b.querySelector('img').src;l.classList.add('open');l.querySelector('button').focus()});let lb=document.querySelector('.lightbox');lb.querySelector('button').onclick=()=>lb.classList.remove('open');lb.onclick=e=>{if(e.target===lb)lb.classList.remove('open')};document.onkeydown=e=>{if(e.key==='Escape')lb.classList.remove('open')};

document.querySelectorAll('form').forEach(f=>f.onsubmit=e=>{e.preventDefault();let ok=true;f.querySelectorAll('[required]').forEach(x=>{let msg='';if(!x.value.trim())msg='This field is required.';else if(x.type==='email'&&!/^\S+@\S+\.\S+$/.test(x.value))msg='Enter a valid email address.';const error=x.closest('.field').querySelector('.error');error.dataset.message=msg;error.textContent=localeText(msg);x.setAttribute('aria-invalid',!!msg);if(msg)ok=false});if(ok){f.querySelector('.success').classList.add('show');f.reset();f.querySelector('.success').scrollIntoView({behavior:'smooth',block:'center'})}});
