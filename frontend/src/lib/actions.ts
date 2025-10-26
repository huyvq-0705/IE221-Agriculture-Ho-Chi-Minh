'use server'

import { cookies } from 'next/headers'

export async function getServerAuthToken() {
  const cookieStore = cookies()
  return cookieStore.get('accessToken')?.value
}