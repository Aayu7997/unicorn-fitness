import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function GET() {
  const content = `# Unicorn Fitness Club - Security Vulnerability Disclosure Policy
# Compliant with RFC 9116 (https://www.rfc-editor.org/rfc/rfc9116)

Contact: mailto:security@unicornfitness.com
Contact: https://unicornfitnessclub.com/contact
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://unicornfitnessclub.com/.well-known/security.txt
Policy: https://unicornfitnessclub.com/privacy-policy
Acknowledgments: https://unicornfitnessclub.com/about
`

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
