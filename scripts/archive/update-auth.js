const fs = require('fs');
const path = 'C:\\Users\\ayush\\Downloads\\Projects\\UFC GYM\\lib\\auth.ts';
let content = fs.readFileSync(path, 'utf8');

const newFunc = `
export async function authenticateGoogleUser(
  email: string,
  name: string,
  googleId: string
): Promise<AuthResult> {
  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        authProvider: 'google',
        googleId,
      },
    })
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, authProvider: 'google' },
    })
  }

  const sessionToken = await createSession(user.id)
  return {
    token: sessionToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  }
}
`;

if (!content.includes('authenticateGoogleUser')) {
  fs.writeFileSync(path, content + '\n' + newFunc, 'utf8');
  console.log('Appended successfully');
} else {
  console.log('Already exists');
}
