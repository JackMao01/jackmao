(() => {
 const menu=document.getElementById('mobileWorkMenu'),bar=document.getElementById('mobileTabbar');
 if(!menu||!bar)return;
 const trigger=bar.querySelector('[data-mobile-menu]');if(!trigger)return;
 const names={'light-and-form.html':'Light & Form','special-editions.html':'Special Editions','so-good.html':'Zara Larsson','after-hours.html':'The Weeknd','toronto-in-bloom.html':'Toronto in Bloom','chronicles-of-elysium.html':'Chronicles of Elysium','tend-habit-tracker.html':'Tend','coffee-nearby.html':'Coffee Nearby'};
 const file=location.pathname.split('/').pop();
 const header=document.createElement('div');header.className='mpm-header';header.innerHTML='<strong id="mpm-title">Projects</strong><button type="button" class="mpm-close" aria-label="Close projects menu">Close ×</button>';menu.prepend(header);
 menu.setAttribute('role','region');menu.setAttribute('aria-labelledby','mpm-title');
 let current=[...menu.querySelectorAll('a')].find(a=>new URL(a.href).pathname===location.pathname);
 if(!current){current=document.createElement('a');current.href=file;current.textContent=names[file]||document.title.split('|')[0].trim();const groups=[...menu.children].filter(e=>e.tagName==='SPAN');const group=groups.find(g=>g.textContent.includes(['chronicles-of-elysium.html','tend-habit-tracker.html','coffee-nearby.html'].includes(file)?'Design Systems':'Editorial'));(group||header).after(current)}
 current.setAttribute('aria-current','page');const badge=document.createElement('span');badge.textContent='You are here';current.querySelector('span')?.remove();current.append(badge);
 let idleTimer;const mobile=matchMedia('(max-width:768px)');
 const reveal=()=>{clearTimeout(idleTimer);bar.classList.remove('is-hidden')};
 addEventListener('scroll',()=>{clearTimeout(idleTimer);if(!mobile.matches||menu.classList.contains('is-open')||bar.contains(document.activeElement)||menu.contains(document.activeElement)){reveal();return}bar.classList.add('is-hidden');idleTimer=setTimeout(reveal,300)},{passive:true});
 bar.addEventListener('focusin',reveal);menu.addEventListener('focusin',reveal);
 mobile.addEventListener('change',reveal);addEventListener('pageshow',reveal);
 const close=(restore=false)=>{menu.classList.remove('is-open');bar.classList.remove('is-open');menu.inert=true;menu.setAttribute('aria-hidden','true');trigger.setAttribute('aria-expanded','false');if(restore)trigger.focus({preventScroll:true})};
 const open=()=>{reveal();menu.inert=false;menu.removeAttribute('aria-hidden');menu.classList.add('is-open');bar.classList.add('is-open');trigger.setAttribute('aria-expanded','true');menu.querySelector('button').focus({preventScroll:true})};
 trigger.addEventListener('click',()=>menu.classList.contains('is-open')?close(true):open());
 header.querySelector('button').onclick=()=>close(true);
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('is-open')){e.preventDefault();close(true)}});
 document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!bar.contains(e.target))close()});
 document.addEventListener('focusin',e=>{if(!menu.contains(e.target)&&!bar.contains(e.target))close()});
 menu.addEventListener('click',e=>{if(e.target.closest('a'))close()});
 matchMedia('(min-width:769px)').addEventListener('change',e=>{if(e.matches)close()});
 addEventListener('pagehide',()=>{clearTimeout(idleTimer);close()});close();
})();
