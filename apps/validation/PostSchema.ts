import {z} from 'zod'

export const PostBodySchema = z.string().min(3).max(40000).trim()
export const PostTitleSchema = z.string().min(3).max(500).trim()

export const NewPostSchema = z.object({
    title: PostTitleSchema,
    body: PostBodySchema
})

export const UpdatePostSchema = z.object({
    title: PostTitleSchema.optional(),
    body: PostBodySchema.optional()
}).refine(data => data.title || data.body, {
    message: "At least one of 'title' or 'body' must be provided",
})

export type NewPost = z.infer<typeof NewPostSchema>
export type UpdatePost = z.infer<typeof UpdatePostSchema>
export type PostTitle = z.infer<typeof PostTitleSchema>
export type PostBody = z.infer<typeof PostBodySchema>