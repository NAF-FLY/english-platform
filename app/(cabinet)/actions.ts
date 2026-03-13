'use server'

import { redirect } from 'next/navigation'

import { signOut } from '@/src/modules/auth/application'

export async function signOutAction() {
  await signOut()
  redirect('/sign-in?notice=signed-out')
}
