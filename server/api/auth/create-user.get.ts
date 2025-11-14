import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const { public: { supabaseUrl, supabaseKey } } = useRuntimeConfig()
    const supabase = createClient(supabaseUrl as string, supabaseKey as string)
    
    // Get email and password from query parameters
    const query = getQuery(event)
    const email = query.email as string
    const password = query.password as string
    
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required'
      })
    }
    
    console.log('Creating user with email:', email)
    
    // Create user in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (authError) {
      console.error('Supabase auth error:', authError)
      throw createError({
        statusCode: 400,
        statusMessage: `Supabase auth error: ${authError.message}`
      })
    }
    
    if (!authData.user) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User creation failed - no user returned'
      })
    }
    
    console.log('Supabase user created:', authData.user.id)
    
    // Create or update user in our database
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    })
    
    let user
    if (existingUser) {
      // Update existing user with authId
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: { 
          authId: authData.user.id,
          email: authData.user.email ?? email,
          name: (authData.user.user_metadata as any)?.name ?? null
        }
      })
      console.log('Updated existing user with authId')
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          authId: authData.user.id,
          email: authData.user.email ?? email,
          name: (authData.user.user_metadata as any)?.name ?? null
        }
      })
      console.log('Created new user in database')
    }
    
    return {
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        authId: user.authId
      },
      supabaseUser: {
        id: authData.user.id,
        email: authData.user.email
      }
    }
    
  } catch (error) {
    console.error('Error creating user:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to create user'
    })
  } finally {
    await prisma.$disconnect()
  }
})