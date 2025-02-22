'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Post, {type PostProps} from '@/components/Post'
import FollowButton from '@/components/FollowButton'
import ErrorDisplay from '@/components/ErrorDisplay'
import LoadingSkeleton from '@/components/LoadingSkeleton'

interface UserProps {
  user_id: number
  name: string
  registration_date: string
  followed: boolean
}

interface UserPageProps {
  user_info: UserProps
  posts_info: PostProps[]
}

export default function UserDetailContent() {
  const { id } = useParams()
  const [userPageData, setUserPageData] = useState<UserPageProps | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserPageData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/users/${id}/`)
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }
        const data: UserPageProps = await response.json()
        setUserPageData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserPageData()
  }, [id])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorDisplay message={error} />
  }

  if (!userPageData) {
    return <ErrorDisplay message="No user data found" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <UserInfoCard 
      user_id={userPageData.user_info.user_id} 
      name={userPageData.user_info.name}
      registration_date={userPageData.user_info.registration_date}
      followed={userPageData.user_info.followed}
      />
        <div>
          {userPageData.posts_info.map((post) => (
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
        ))}
      </div>
    </div>
  )
}

function UserInfoCard({ 
  user_id, 
  name, 
  registration_date, 
  followed 
}: UserProps) {
  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <div>User ID: {user_id}</div>
          <CardTitle>{name}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Joined {new Date(registration_date).toLocaleDateString()}
          </p>
        </div>
        <div>
          <FollowButton 
            userId={user_id} 
            initialFollowed={followed}
          />
        </div>
      </CardHeader>
    </Card>
  )
}
