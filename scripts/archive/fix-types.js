const fs = require('fs');
const path = require('path');

// Fix lib/auth.ts
const authPath = 'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\lib\\auth.ts';
let authContent = fs.readFileSync(authPath, 'utf8');
authContent = authContent.replace(
  'const valid = await verifyPassword(password, user.passwordHash)',
  'if (!user.passwordHash) return null;\n    const valid = await verifyPassword(password, user.passwordHash)'
);
fs.writeFileSync(authPath, authContent, 'utf8');

// Fix app/api/admin/change-password/route.ts
const changePath = 'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\app\\api\\admin\\change-password\\route.ts';
let changeContent = fs.readFileSync(changePath, 'utf8');
changeContent = changeContent.replace(
  'const valid = await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash)',
  'if (!dbUser.passwordHash) return NextResponse.json({ error: "Google account has no password" }, { status: 400 });\n    const valid = await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash)'
);
fs.writeFileSync(changePath, changeContent, 'utf8');

// Fix app/api/user/profile/password/route.ts
const profilePath = 'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\app\\api\\user\\profile\\password\\route.ts';
let profileContent = fs.readFileSync(profilePath, 'utf8');
profileContent = profileContent.replace(
  'const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)',
  'if (!user.passwordHash) return NextResponse.json({ error: "Google account has no password" }, { status: 400 });\n    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)'
);
fs.writeFileSync(profilePath, profileContent, 'utf8');

console.log('Fixed all typing errors');
