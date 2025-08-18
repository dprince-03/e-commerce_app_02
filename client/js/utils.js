window.apiBase = 'http://localhost:4000/api';

window.renderHeaderFooter = function renderHeaderFooter(){
  const header = document.getElementById('header');
  const footer = document.getElementById('footer');
  header.innerHTML = '<h2>My Shop</h2>';
  footer.innerHTML = '<small>© '+new Date().getFullYear()+' My Shop</small>';
}

window.request = async function request(path, opts = {}){
  const res = await fetch(window.apiBase + path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
    ...opts
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

