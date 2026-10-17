const sharp = require('sharp');

async function padIcon() {
  try {
    // Android Adaptive Icon guidelines:
    // Full size is 1024x1024
    // Safe zone is 66% of that (which is 676x676)
    
    await sharp({
      create: {
        width: 1024,
        height: 1024,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      {
        input: await sharp('./assets/images/icon.png').resize(676, 676, { fit: 'contain' }).toBuffer(),
        gravity: 'center'
      }
    ])
    .toFile('./assets/images/adaptive-icon.png');
    
    console.log('Successfully created properly padded adaptive-icon.png');
  } catch (error) {
    console.error('Error generating padded icon:', error);
  }
}

padIcon();
