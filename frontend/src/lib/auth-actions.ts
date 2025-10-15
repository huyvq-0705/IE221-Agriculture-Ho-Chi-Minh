'use server'

import { cookies } from 'next/headers'

export async function getServerAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value
  return token
}
