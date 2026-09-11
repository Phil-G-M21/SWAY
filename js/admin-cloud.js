/**
 * SWAY Admin — Save to Cloud (Supabase)
 * Uploads the product's images to Supabase Storage, then inserts the
 * product row into the database so it appears on the live store instantly.
 */

async function saveProductToCloud() {
  if (typeof sway_db === 'undefined') { toast('Supabase not connected'); return; }

  const name = document.getElementById('f-name').value.trim();
  if (!name) { toast('Please enter a product name'); return; }
  const sizes = getSizes();
  if (!sizes.length) { toast('Select at least one size'); return; }

  const gender = document.getElementById('f-gender').value;
  const color  = document.getElementById('f-color').value.trim() || 'White';
  const slug   = slugify(name);
  const tags   = getTags();
  const series = document.getElementById('f-series').value;
  const details = document.getElementById('f-details').value
    .split('\n').map(s => s.trim()).filter(Boolean);

  const btn = document.getElementById('cloud-save-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Uploading images...'; }

  try {
    // 1. Upload the images (front, back, model) to product-images bucket
    const baseName = `${slug}-${gender}-${slugify(color)}`;
    const suffixes = ['', '-2', '-3'];
    const uploadedUrls = [];

    for (let i = 0; i < 3; i++) {
      const file = productFiles[i];
      if (!file) { uploadedUrls.push(null); continue; }
      const filename = baseName + suffixes[i] + '.jpg';
      const { error: upErr } = await sway_db.storage
        .from('product-images')
        .upload(filename, file, { upsert: true, contentType: file.type || 'image/jpeg' });
      if (upErr) throw new Error('Image upload failed: ' + upErr.message);
      // public URL
      const { data: pub } = sway_db.storage.from('product-images').getPublicUrl(filename);
      uploadedUrls.push(pub.publicUrl);
    }

    if (btn) btn.textContent = 'Saving product...';

    // 2. Work out the next id (max existing + 1)
    const { data: maxRows } = await sway_db
      .from('products').select('id').order('id', { ascending: false }).limit(1);
    const nextId = (maxRows && maxRows.length ? maxRows[0].id : 0) + 1;

    // 3. Insert the product row
    const mainImg = uploadedUrls[0] || '';
    const imgsArr = uploadedUrls.filter(Boolean);
    const { error: insErr } = await sway_db.from('products').insert({
      id: nextId,
      gender, series, design: slug, name,
      subtitle: document.getElementById('f-subtitle').value.trim() || 'Graphic Tee',
      shirt: color.split('/')[0].trim() || color,
      spark: null,
      color,
      color_hex: document.getElementById('f-colorhex').value,
      price: parseInt(document.getElementById('f-price').value) || 100,
      is_new: !!tags.isNew, is_best: !!tags.isBest,
      img: mainImg,
      imgs: imgsArr,
      description: document.getElementById('f-desc').value.trim(),
      stock: parseInt(document.getElementById('f-stock').value) || 0
    });
    if (insErr) throw new Error('Save failed: ' + insErr.message);

    toast(name + ' is live on the store');
    if (typeof resetForm === 'function') resetForm();
  } catch (e) {
    console.error(e);
    toast(e.message || 'Something went wrong');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save to Cloud (live)'; }
  }
}
