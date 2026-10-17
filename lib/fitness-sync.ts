import { prisma } from './prisma'

const FITNESS_API_URL = 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate'

export interface FitnessData {
  steps: number
  calories: number
  heartRate: number
}

async function refreshGoogleToken(userId: string, refreshToken: string): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || !clientSecret) return null

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error_description || 'Failed to refresh token')

    const newAccessToken = data.access_token

    await prisma.user.update({
      where: { id: userId },
      data: { googleAccessToken: newAccessToken }
    })

    return newAccessToken
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}

export async function fetchFitnessData(userId: string): Promise<FitnessData | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.googleAccessToken) return null

  let accessToken = user.googleAccessToken

  const endTime = new Date().getTime()
  const startTime = endTime - (24 * 60 * 60 * 1000)

  const body = {
    aggregateBy: [
      { dataTypeName: 'com.google.step_count.delta' },
      { dataTypeName: 'com.google.calories.expended' },
      { dataTypeName: 'com.google.heart_rate.bpm' }
    ],
    bucketByTime: { durationMillis: 86400000 },
    startTimeMillis: startTime,
    endTimeMillis: endTime
  }

  const makeRequest = async (token: string) => {
    return fetch(FITNESS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
  }

  let res = await makeRequest(accessToken)

  if (res.status === 401 && user.googleRefreshToken) {
    const newToken = await refreshGoogleToken(userId, user.googleRefreshToken)
    if (newToken) {
      accessToken = newToken
      res = await makeRequest(accessToken)
    } else {
      return null
    }
  }

  if (!res.ok) {
    console.error('Failed to fetch fitness data', await res.text())
    return null
  }

  const data = await res.json()

  let steps = 0
  let calories = 0
  let heartRate = 0

  if (data.bucket && data.bucket.length > 0) {
    const bucket = data.bucket[0]
    for (const dataset of bucket.dataset) {
      if (dataset.point && dataset.point.length > 0) {
        const val = dataset.point[0].value[0]
        if (dataset.dataSourceId.includes('step_count')) {
          steps = val.intVal || 0
        } else if (dataset.dataSourceId.includes('calories')) {
          calories = Math.round(val.fpVal || 0)
        } else if (dataset.dataSourceId.includes('heart_rate')) {
          heartRate = Math.round(val.fpVal || 0)
        }
      }
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { fitnessDataSyncedAt: new Date() }
  })

  return { steps, calories, heartRate }
}