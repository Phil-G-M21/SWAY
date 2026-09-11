/**
 * SWAY — Load products from Supabase
 * Replaces the hardcoded SWAY_PRODUCTS with live data from the database.
 * If the database is unreachable, the site keeps the hardcoded fallback so
 * it never shows an empty store.
 */
async function loadProductsFromDB() {
  if (typeof sway_db === 'undefined') return false;   // supabase not loaded
  try {
    const { data, error } = await sway_db
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) { console.warn('Product load error:', error.message); return false; }
    if (!data || !data.length) { console.warn('No products in DB, using fallback'); return false; }

    // Map DB rows to the shape the site expects
    SWAY_PRODUCTS = data.map(row => ({
      id: row.id,
      gender: row.gender,
      series: row.series,
      design: row.design,
      name: row.name,
      subtitle: row.subtitle,
      shirt: row.shirt,
      spark: row.spark,
      color: row.color,
      colorHex: row.color_hex,
      price: Number(row.price),
      sizes: (typeof SWAY_SIZES !== 'undefined') ? SWAY_SIZES : ['S','M','L','XL','XXL'],
      stock: row.stock ?? 10,
      isNew: row.is_new,
      isBest: row.is_best,
img: row.img ? ((typeof resolveProductImg === 'function') ? resolveProductImg(row.img) : row.img) : '',
      // Always produce 3 image slots (front/back/model). Use stored imgs, else
      // the stored main img, else the expected filename from the variant fields.
      imgs: resolveImgList(row),
      desc: row.description,
      details: ['Cropped fit','Full-back graphic','SWAY wordmark chest hit','Ribbed crewneck collar']
    }));
    return true;
  } catch (e) {
    console.warn('Product load failed:', e);
    return false;
  }
}

// Build the expected image filename base from a product row's fields.
// e.g. spark-women-white-pink   or   marionette-men-black
function expectedSlug(row) {
  let base = row.design + '-' + row.gender + '-' + (row.shirt || 'white').toLowerCase();
  if (row.spark) base += '-' + row.spark.toLowerCase();
  return base;
}

// Always return 3 resolved image URLs (front, back, model). Falls back to the
// expected filename so a product with no stored image still shows 3 slots
// (which display the uploaded photo if it exists, or the placeholder if not).
function resolveImgList(row) {
  // Only use images the DB actually stores. No deriving — a removed image
  // must stay removed, not reappear from a guessed filename.
  let list = [];
  if (row.imgs && row.imgs.length) list = row.imgs.slice(0, 3).filter(Boolean);
  else if (row.img) list = [row.img];
  return list.map(u => (typeof resolveProductImg === 'function') ? resolveProductImg(u) : u);
}
