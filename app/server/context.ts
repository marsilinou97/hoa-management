import { auth } from '@clerk/nextjs/server'
import prisma from "@/lib/prisma";
export const createContext = async () => {
  const _auth = await auth()
  return { auth: _auth , orgId: _auth.orgId, userId: _auth.userId, prisma: prisma }
}
export type Context = Awaited<ReturnType<typeof createContext>>
