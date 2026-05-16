import { supabase } from '../supabase.js'

// 1. SIGN UP FUNCTION
export async function signUpUser(email, password, username, fullName) {
  // First, create the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error

  // If auth is successful, create their record in our custom public profiles table
  if (data?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          username: username.toLowerCase().trim(),
          full_name: fullName,
          is_artist: false
        }
      ])

    if (profileError) throw profileError
  }
  return data
}

// 2. LOG IN FUNCTION
export async function logInUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

// 3. LOG OUT FUNCTION
export async function logOutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}