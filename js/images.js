/**
 * SWAY — Image URL resolver
 * Turns a stored image path into a real URL. Priority:
 *   1. If it's already a full URL (http...), use it as-is.
 *   2. If Supabase is connected, build a Supabase Storage public URL.
 *   3. Otherwise fall back to the local /images path (GitHub).
 * This lets the store work whether images live in Supabase or GitHub.
 */

// Set to true once you've uploaded product images to the Supabase bucket.
// When true, product images load from Supabase Storage instead of /images.
const USE_SUPABASE_IMAGES = true;

const PRODUCT_BUCKET = 'product-images';
const SITE_BUCKET = 'store-images';

// Build a Supabase public storage URL for a file in a bucket.
function supaImg(bucket, filename) {
  if (typeof SUPABASE_URL === 'undefined') return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`;
}

// Resolve a product image path to a usable URL.
// Accepts either a bare filename, a "images/products/x.jpg" path, or a full URL.
function resolveProductImg(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;           // already a full URL
  const filename = path.split('/').pop();                // just the file name
  if (USE_SUPABASE_IMAGES) {
    const url = supaImg(PRODUCT_BUCKET, filename);
    if (url) return url;
  }
  return path.startsWith('images/') ? path : ('images/products/' + filename);
}

// Resolve a hero/site image (wide, model, series, about) similarly.
function resolveSiteImg(filename) {
  if (!filename) return '';
  if (/^https?:\/\//i.test(filename)) return filename;
  const name = filename.split('/').pop();
  if (USE_SUPABASE_IMAGES) {
    const url = supaImg(SITE_BUCKET, name);
    if (url) return url;
  }
  return filename.startsWith('images/') ? filename : ('images/' + name);
}
