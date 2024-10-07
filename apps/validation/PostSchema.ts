import {z} from 'zod'

export const PostBody = z.string().min(3).max(40000).trim()
export const PostTitle = z.string().min(3).max(500).trim()

export const PostSchema = z.object({
    title: PostTitle,
    body: PostBody
})

