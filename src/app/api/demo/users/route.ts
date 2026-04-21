import { NextResponse } from 'next/server'
import { getDemoUsers } from './_service'
import { DemoUsersResponseSchema } from './schema'

export async function GET() {
  try {
    const users = await getDemoUsers()
    const payload = DemoUsersResponseSchema.parse(users)
    return NextResponse.json(payload)
  } catch (err) {
    console.error('[api/demo/users] GET failed', err)
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 })
  }
}
