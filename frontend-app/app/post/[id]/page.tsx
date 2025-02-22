'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Post from '@/components/Post'
import { type PostProps } from '@/components/Post'
import CommentList from '@/components/CommentList'
import type {CommentListProps} from '@/components/CommentList'

export default function PostDetail() {
  const { id } = useParams()
  const [post, setPost] = useState<PostProps | undefined>(undefined)
  const [commentList, setCommentList] = useState<CommentListProps['comments']>([])

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/posts/${id}`, {
          method: 'GET',
          credentials: 'include', 
          headers: {
            'Content-Type': 'application/json',
          }
        })
        const data = await response.json()
        setPost(data.post)
        setCommentList(data.comments || [])
      } catch (error) {
        console.error('投稿の取得に失敗しました:', error)
        setPost(undefined)
      }        
    })()
  }, [id])

  if (!post) return <div>Loading...</div>

  return (
    <div>
      <Post
        key={post.id}
        id ={post.id}
        content={post.content}
        user_id={post.user_id}
        user_name={post.user_name}
        created_at={post.created_at}
        updated_at={post.updated_at}
        liked={post.liked}
      />
      <CommentList comments={commentList} />
    </div>
  )
}

