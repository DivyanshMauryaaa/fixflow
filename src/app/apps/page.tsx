'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import supabase from '@/lib/db/supabase'
import Link from 'next/link'

import { FolderOpen, Plus, Trash2 } from 'lucide-react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function AppsPage() {
  const { user } = useUser()
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const pullApps = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching apps:', error)
    } else {
      setApps(data)
    }

    setLoading(false)
  }

  const deleteApp = async (id: string) => {
    setLoading(true)
    const { error } = await supabase.from('apps').delete().eq('id', id)
    if (error) console.error(error)
    await pullApps()
    setLoading(false)
  }

  const editApp = async (id: string, updates: any) => {
    const { error } = await supabase.from('apps').update(updates).eq('id', id)
    if (error) console.error('Error editing app:', error)
  }

  useEffect(() => {
    if (user) pullApps()
  }, [user])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderOpen className="w-7 h-7" />
          Your Apps
        </h1>
        <Link href="/apps/new">
          <Button className="flex gap-2">
            <Plus className="w-4 h-4" /> New App
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center mt-16">
          <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-blue-500 border-b-2" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <Card key={app.id} className="flex flex-col justify-between">
              <CardHeader>
                <Input
                  className="text-xl font-semibold"
                  defaultValue={app.name}
                  onBlur={(e) =>
                    editApp(app.id, {
                      name: e.target.value.trim() || 'Untitled',
                    })
                  }
                />
              </CardHeader>
              <CardContent>
                <Textarea
                  className="resize-none"
                  rows={3}
                  defaultValue={app.description}
                  onBlur={(e) =>
                    editApp(app.id, {
                      description: e.target.value.trim() || '',
                    })
                  }
                />
              </CardContent>
              <CardFooter className="flex justify-between mt-4">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteApp(app.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Link href={`/apps/${app.id}`}>
                  <Button size="sm" variant="secondary">
                    Open App
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
