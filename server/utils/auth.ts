import { createClient } from '@supabase/supabase-js'
import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient()

export async function requireAuthUser(event): Promise<User> {
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing Authorization Bearer token' })
  }

  const { public: { supabaseUrl, supabaseKey } } = useRuntimeConfig()
  const supabase = createClient(supabaseUrl as string, supabaseKey as string)
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid Supabase token' })
  }

  const sUser = data.user
  const email = sUser.email ?? ''
  const name = (sUser.user_metadata as any)?.name ?? null
  const authId = sUser.id

  // 1) Prefer match by authId
  const byAuth = await prisma.user.findUnique({ where: { authId } })
  if (byAuth) {
    return prisma.user.update({
      where: { id: byAuth.id },
      data: { email, name },
    })
  }

  // 2) Fallback match by email (backfill authId)
  const byEmail = await prisma.user.findUnique({ where: { email } })
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { authId, name },
    })
  }

  // 3) Create new
  return prisma.user.create({
    data: { authId, email, name },
  })
}