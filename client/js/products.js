window.renderProducts = async function renderProducts(){
  const container = document.getElementById('products');
  container.innerHTML = '<div>Loading...</div>';
  try {
    const data = await window.request('/products');
    const cards = (data.items||[]).map(p => (
      `<div class="card">
        <img src="${p.imageUrl || 'https://picsum.photos/seed/'+p.id+'/400/300'}" alt="${p.name}"/>
        <h3>${p.name}</h3>
        <p>${p.description || ''}</p>
        <strong>$${p.price}</strong>
        <div style="margin-top:8px"><button class="btn">Add to cart</button></div>
      </div>`
    )).join('');
    container.innerHTML = `<div class="grid">${cards}</div>`;
  } catch(e){
    container.innerHTML = '<div>Failed to load products.</div>';
  }
}

