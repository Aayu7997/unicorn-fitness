const sharp = require('sharp');
async function run() {
  const m1 = await sharp('assets/images/icon.png').metadata();
  console.log('icon.png:', m1.width, 'x', m1.height);
  const m2 = await sharp('assets/images/adaptive-icon.png').metadata();
  console.log('adaptive-icon.png:', m2.width, 'x', m2.height);
}
run().catch(console.error);
