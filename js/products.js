/**
 * SWAY — Product Data
 * ─────────────────────────────────────────────
 * THREE designs:
 *   Spark         — the match/spark graphic
 *   Time & Chaos  — hourglass / tide / coordinates
 *   Marionette    — skeleton hands / strings
 *
 * Every design comes on a White tee and a Black tee.
 * SPARK's graphic also has a spark color:
 *    Orange and Blue for everyone,
 *    Pink for WOMEN only.
 *
 * Image naming (in images/products/):
 *   Spark:      spark-{gender}-{shirt}-{spark}.jpg  (+ -2, -3)
 *               e.g. spark-women-black-pink.jpg
 *   Others:     {design}-{gender}-{shirt}.jpg       (+ -2, -3)
 *               e.g. marionette-men-white.jpg, time-chaos-women-black.jpg
 *
 * Hero images (in images/):
 *   wide1..5 / fwide1..5   and   model1..5 / fmodel1..5
 */

const SWAY_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
const BASE_GHS   = 100;

const WIDE_IMGS = ['wide1.jpg','wide2.jpg','wide3.jpg','wide4.jpg','wide5.jpg','fwide1.jpg','fwide2.jpg','fwide3.jpg','fwide4.jpg','fwide5.jpg'];
const PORT_IMGS = ['model1.jpg','model2.jpg','model3.jpg','model4.jpg','model5.jpg','fmodel1.jpg','fmodel2.jpg','fmodel3.jpg','fmodel4.jpg','fmodel5.jpg'];

function imgPath(slug, num = 1) {
  const suffix = num > 1 ? '-' + num : '';
  return `images/products/${slug}${suffix}.jpg`;
}
function imgs(slug, count = 3) {
  return Array.from({ length: count }, (_, i) => imgPath(slug, i + 1));
}

const SWAY_PRODUCTS = [
  {
    id: 1, gender: 'women', series: 'spark', design: 'spark',
    name: "Spark",
    subtitle: "Match Graphic Tee",
    shirt: 'White', spark: 'Orange',
    color: "White / Orange", colorHex: '#ff6b2b',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: true,
    img: imgPath('spark-women-white-orange'), imgs: imgs('spark-women-white-orange'),
    desc: "The signature SWAY match graphic across the full back. Chest wordmark hit. Comes in an orange, blue, or pink spark on a white or black tee.",
    details: ["Cropped fit","Full-back Spark match graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 2, gender: 'women', series: 'spark', design: 'spark',
    name: "Spark",
    subtitle: "Match Graphic Tee",
    shirt: 'White', spark: 'Blue',
    color: "White / Blue", colorHex: '#3b8fff',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: true,
    img: imgPath('spark-women-white-blue'), imgs: imgs('spark-women-white-blue'),
    desc: "The signature SWAY match graphic across the full back. Chest wordmark hit. Comes in an orange, blue, or pink spark on a white or black tee.",
    details: ["Cropped fit","Full-back Spark match graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 3, gender: 'women', series: 'spark', design: 'spark',
    name: "Spark",
    subtitle: "Match Graphic Tee",
    shirt: 'White', spark: 'Pink',
    color: "White / Pink", colorHex: '#e84a8a',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: true,
    img: imgPath('spark-women-white-pink'), imgs: imgs('spark-women-white-pink'),
    desc: "The signature SWAY match graphic across the full back. Chest wordmark hit. Comes in an orange, blue, or pink spark on a white or black tee.",
    details: ["Cropped fit","Full-back Spark match graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 4, gender: 'women', series: 'spark', design: 'spark',
    name: "Spark",
    subtitle: "Match Graphic Tee",
    shirt: 'Black', spark: 'Orange',
    color: "Black / Orange", colorHex: '#ff6b2b',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: true,
    img: imgPath('spark-women-black-orange'), imgs: imgs('spark-women-black-orange'),
    desc: "The signature SWAY match graphic across the full back. Chest wordmark hit. Comes in an orange, blue, or pink spark on a white or black tee.",
    details: ["Cropped fit","Full-back Spark match graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 5, gender: 'women', series: 'spark', design: 'spark',
    name: "Spark",
    subtitle: "Match Graphic Tee",
    shirt: 'Black', spark: 'Blue',
    color: "Black / Blue", colorHex: '#3b8fff',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: true,
    img: imgPath('spark-women-black-blue'), imgs: imgs('spark-women-black-blue'),
    desc: "The signature SWAY match graphic across the full back. Chest wordmark hit. Comes in an orange, blue, or pink spark on a white or black tee.",
    details: ["Cropped fit","Full-back Spark match graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 6, gender: 'women', series: 'spark', design: 'spark',
    name: "Spark",
    subtitle: "Match Graphic Tee",
    shirt: 'Black', spark: 'Pink',
    color: "Black / Pink", colorHex: '#e84a8a',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: true,
    img: imgPath('spark-women-black-pink'), imgs: imgs('spark-women-black-pink'),
    desc: "The signature SWAY match graphic across the full back. Chest wordmark hit. Comes in an orange, blue, or pink spark on a white or black tee.",
    details: ["Cropped fit","Full-back Spark match graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 7, gender: 'men', series: 'spark', design: 'spark',
    name: "Spark",
    subtitle: "Match Graphic Tee",
    shirt: 'White', spark: 'Orange',
    color: "White / Orange", colorHex: '#ff6b2b',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: true,
    img: imgPath('spark-men-white-orange'), imgs: imgs('spark-men-white-orange'),
    desc: "The signature SWAY match graphic across the full back. Chest wordmark hit. Comes in an orange, blue, or pink spark on a white or black tee.",
    details: ["Cropped fit","Full-back Spark match graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 8, gender: 'men', series: 'spark', design: 'spark',
    name: "Spark",
    subtitle: "Match Graphic Tee",
    shirt: 'White', spark: 'Blue',
    color: "White / Blue", colorHex: '#3b8fff',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: true,
    img: imgPath('spark-men-white-blue'), imgs: imgs('spark-men-white-blue'),
    desc: "The signature SWAY match graphic across the full back. Chest wordmark hit. Comes in an orange, blue, or pink spark on a white or black tee.",
    details: ["Cropped fit","Full-back Spark match graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 9, gender: 'men', series: 'spark', design: 'spark',
    name: "Spark",
    subtitle: "Match Graphic Tee",
    shirt: 'Black', spark: 'Orange',
    color: "Black / Orange", colorHex: '#ff6b2b',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: true,
    img: imgPath('spark-men-black-orange'), imgs: imgs('spark-men-black-orange'),
    desc: "The signature SWAY match graphic across the full back. Chest wordmark hit. Comes in an orange, blue, or pink spark on a white or black tee.",
    details: ["Cropped fit","Full-back Spark match graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 10, gender: 'men', series: 'spark', design: 'spark',
    name: "Spark",
    subtitle: "Match Graphic Tee",
    shirt: 'Black', spark: 'Blue',
    color: "Black / Blue", colorHex: '#3b8fff',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: true,
    img: imgPath('spark-men-black-blue'), imgs: imgs('spark-men-black-blue'),
    desc: "The signature SWAY match graphic across the full back. Chest wordmark hit. Comes in an orange, blue, or pink spark on a white or black tee.",
    details: ["Cropped fit","Full-back Spark match graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 11, gender: 'women', series: 'timechaos', design: 'time-chaos',
    name: "Time & Chaos",
    subtitle: "Graphic Tee",
    shirt: 'White', spark: null,
    color: "White", colorHex: '#f2f2f2',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: false,
    img: imgPath('time-chaos-women-white'), imgs: imgs('time-chaos-women-white'),
    desc: "Hourglass, tide, and coordinate graphics exploring time and controlled disorder. Full-back print, SWAY chest hit.",
    details: ["Cropped fit","Full-back Time & Chaos graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 12, gender: 'women', series: 'timechaos', design: 'time-chaos',
    name: "Time & Chaos",
    subtitle: "Graphic Tee",
    shirt: 'Black', spark: null,
    color: "Black", colorHex: '#0a0a0a',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: false,
    img: imgPath('time-chaos-women-black'), imgs: imgs('time-chaos-women-black'),
    desc: "Hourglass, tide, and coordinate graphics exploring time and controlled disorder. Full-back print, SWAY chest hit.",
    details: ["Cropped fit","Full-back Time & Chaos graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 13, gender: 'men', series: 'timechaos', design: 'time-chaos',
    name: "Time & Chaos",
    subtitle: "Graphic Tee",
    shirt: 'White', spark: null,
    color: "White", colorHex: '#f2f2f2',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: false,
    img: imgPath('time-chaos-men-white'), imgs: imgs('time-chaos-men-white'),
    desc: "Hourglass, tide, and coordinate graphics exploring time and controlled disorder. Full-back print, SWAY chest hit.",
    details: ["Cropped fit","Full-back Time & Chaos graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 14, gender: 'men', series: 'timechaos', design: 'time-chaos',
    name: "Time & Chaos",
    subtitle: "Graphic Tee",
    shirt: 'Black', spark: null,
    color: "Black", colorHex: '#0a0a0a',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: true, isBest: false,
    img: imgPath('time-chaos-men-black'), imgs: imgs('time-chaos-men-black'),
    desc: "Hourglass, tide, and coordinate graphics exploring time and controlled disorder. Full-back print, SWAY chest hit.",
    details: ["Cropped fit","Full-back Time & Chaos graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 15, gender: 'women', series: 'marionette', design: 'marionette',
    name: "Marionette",
    subtitle: "Skeleton Hands Graphic Tee",
    shirt: 'White', spark: null,
    color: "White", colorHex: '#f2f2f2',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: false, isBest: true,
    img: imgPath('marionette-women-white'), imgs: imgs('marionette-women-white'),
    desc: "Skeleton hands pulling structural strings across the full back. Dark fantasy, psychological depth. SWAY chest hit.",
    details: ["Cropped fit","Full-back Marionette skeleton graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 16, gender: 'women', series: 'marionette', design: 'marionette',
    name: "Marionette",
    subtitle: "Skeleton Hands Graphic Tee",
    shirt: 'Black', spark: null,
    color: "Black", colorHex: '#0a0a0a',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: false, isBest: true,
    img: imgPath('marionette-women-black'), imgs: imgs('marionette-women-black'),
    desc: "Skeleton hands pulling structural strings across the full back. Dark fantasy, psychological depth. SWAY chest hit.",
    details: ["Cropped fit","Full-back Marionette skeleton graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 17, gender: 'men', series: 'marionette', design: 'marionette',
    name: "Marionette",
    subtitle: "Skeleton Hands Graphic Tee",
    shirt: 'White', spark: null,
    color: "White", colorHex: '#f2f2f2',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: false, isBest: true,
    img: imgPath('marionette-men-white'), imgs: imgs('marionette-men-white'),
    desc: "Skeleton hands pulling structural strings across the full back. Dark fantasy, psychological depth. SWAY chest hit.",
    details: ["Cropped fit","Full-back Marionette skeleton graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
  {
    id: 18, gender: 'men', series: 'marionette', design: 'marionette',
    name: "Marionette",
    subtitle: "Skeleton Hands Graphic Tee",
    shirt: 'Black', spark: null,
    color: "Black", colorHex: '#0a0a0a',
    price: BASE_GHS, sizes: SWAY_SIZES, stock: 10, isNew: false, isBest: true,
    img: imgPath('marionette-men-black'), imgs: imgs('marionette-men-black'),
    desc: "Skeleton hands pulling structural strings across the full back. Dark fantasy, psychological depth. SWAY chest hit.",
    details: ["Cropped fit","Full-back Marionette skeleton graphic","SWAY wordmark chest hit","Ribbed crewneck collar"],
  },
];
