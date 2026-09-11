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
      img: (typeof resolveProductImg === 'function') ? resolveProductImg(row.img) : row.img,
      // build imgs from img base if the DB doesn't store the array
      imgs: ((row.imgs && row.imgs.length) ? row.imgs : buildImgsFromMain(row.img))
              .map(u => (typeof resolveProductImg === 'function') ? resolveProductImg(u) : u),
      desc: row.description,
      details: ['Cropped fit','Full-back graphic','SWAY wordmark chest hit','Ribbed crewneck collar']
    }));
    return true;
  } catch (e) {
    console.warn('Product load failed:', e);
    return false;
  }
}

// Given a main image path like images/products/spark-women-white-orange.jpg
// produce [main, -2, -3] so back/model images resolve the same way.
function buildImgsFromMain(img) {
  if (!img) return [];
  const base = img.replace(/\.jpg$/i, '');
  return [img, base + '-2.jpg', base + '-3.jpg'];
}
