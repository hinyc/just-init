import { z } from 'zod'

export const DemoUserRoleSchema = z.enum(['admin', 'member', 'guest'])

export const DemoUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  role: DemoUserRoleSchema,
})

export const DemoUsersResponseSchema = z.array(DemoUserSchema)

export type DemoUserRole = z.infer<typeof DemoUserRoleSchema>
export type DemoUser = z.infer<typeof DemoUserSchema>
export type DemoUsersResponse = z.infer<typeof DemoUsersResponseSchema>
