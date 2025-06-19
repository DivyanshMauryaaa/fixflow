'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Plus, SaveIcon, ArrowRight, Trash2 } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import supabase from "@/lib/db/supabase"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"

interface Task {
    id: number
    title: string
    description: string
    estimate: string
    status: 'pending' | 'inProgress' | 'completed'
}

const FeaturePlanner = () => {
    const { user } = useUser()
    const router = useRouter()
    const [feature, setFeature] = useState({ name: '', description: '' })
    const [tasks, setTasks] = useState<Task[]>([])
    const [showAppSelector, setShowAppSelector] = useState(false)
    const [userApps, setUserApps] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [aiResponseLoading, setResLoading] = useState(false);

    // Add a new empty task manually
    const addTask = () => {
        setTasks([...tasks, {
            id: Date.now(),
            title: '',
            description: '',
            estimate: '',
            status: 'pending'
        }])
    }

    // Generate tasks using AI
    const generateTasksWithAI = async () => {
        setResLoading(true)

        if (!feature.name || !feature.description) return
        setLoading(true)

        try {
            const response = await fetch('/api/google/generate-tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    feature: feature.name,
                    description: feature.description
                })
            })

            const data = await response.json()

            if (!data.success) {
                console.error('AI Error:', data.error)
                // TODO: Add error toast or notification here
                return
            }

            setTasks(data.tasks.map((task: any) => ({
                id: Date.now() + Math.random(),
                title: task.title,
                description: task.description,
                estimate: task.estimate,
                status: 'pending'
            })))
        } catch (error) {
            console.error('Failed to generate tasks:', error)
            // TODO: Add error toast or notification here
        } finally {
            setLoading(false)
        }

        setResLoading(false)
    }

    // Fetch user's apps
    const fetchUserApps = async () => {
        const { data } = await supabase
            .from('apps')
            .select('*')
            .eq('user_id', user?.id)
        setUserApps(data || [])
    }

    // Add tasks to an app
    const addTasksToApp = async (appId: string) => {
        setLoading(true)
        try {
            // Create feature document
            const { data: doc } = await supabase
                .from('app_documents')
                .insert({
                    title: feature.name,
                    content: `# ${feature.name}\n\n${feature.description}\n\n## Tasks\n\n${tasks.map(task => (
                        `### ${task.title}\n${task.description}\nEstimate: ${task.estimate}\n\n`
                    )).join('')
                        }`,
                    app_id: appId
                })
                .select()
                .single()

            // Create tasks
            await supabase.from('app_tasks').insert(
                tasks.map(task => ({
                    title: task.title,
                    description: task.description,
                    estimate: task.estimate,
                    status: task.status,
                    app_id: appId,
                    doc_id: doc.id
                }))
            )

            router.push(`/apps/${appId}`)
        } catch (error) {
            console.error('Error adding tasks:', error)
        } finally {
            setLoading(false)
            setShowAppSelector(false)
        }
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-5xl font-bold">Feature Planning</h1>
                    <p className="text-gray-500 mt-2">Break down your feature into manageable tasks</p>
                </div>
                <Button
                    onClick={() => {
                        fetchUserApps()
                        setShowAppSelector(true)
                    }}
                    className="flex gap-2"
                    disabled={tasks.length === 0}
                >
                    <SaveIcon size={16} />
                    Add to App
                </Button>
            </div>

            <div className='flex justify-center gap-6'>

                {/* Feature Details */}
                <div className="space-y-4 border p-4 rounded-lg w-1/2 max-h-[400px] overflow-y-auto">
                    <div className="space-y-2">
                        <label className="text-lg font-medium">Feature Name</label>
                        <Input
                            placeholder="Enter feature name..."
                            value={feature.name}
                            onChange={(e) => setFeature({ ...feature, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-lg font-medium">Description</label>
                        <Textarea
                            placeholder="Describe the feature..."
                            className="h-24 max-h-[400px] overflow-y-auto resize-y"
                            value={feature.description}
                            onChange={(e) => setFeature({ ...feature, description: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={generateTasksWithAI}
                            variant="default"
                            className="flex gap-2 flex-1 cursor-pointer"
                            disabled={!feature.name || !feature.description || aiResponseLoading}
                        >
                            <Bot size={16} />
                            Generate Tasks with AI
                        </Button>
                        <Button
                            onClick={addTask}
                            variant="outline"
                            className="flex gap-2 cursor-pointer"
                        >
                            <Plus size={16} />
                            Add Task Manually
                        </Button>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="space-y-4 w-1/2">
                    {tasks.map((task, index) => (
                        <div key={task.id} className="p-4 border rounded-lg space-y-3">
                            <Input
                                placeholder="Task title"
                                value={task.title}
                                onChange={(e) => {
                                    const newTasks = [...tasks]
                                    newTasks[index].title = e.target.value
                                    setTasks(newTasks)
                                }}
                            />
                            <Textarea
                                placeholder="Task description"
                                className="h-24 max-h-[200px] overflow-y-auto resize-y"
                                value={task.description}
                                onChange={(e) => {
                                    const newTasks = [...tasks]
                                    newTasks[index].description = e.target.value
                                    setTasks(newTasks)
                                }}
                            />
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Time estimate (in hours)"
                                    type="number"
                                    value={task.estimate}
                                    onChange={(e) => {
                                        const newTasks = [...tasks]
                                        newTasks[index].estimate = e.target.value
                                        setTasks(newTasks)
                                    }}
                                />
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        setTasks(tasks.filter(t => t.id !== task.id))
                                    }}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* App Selection Dialog */}
            <Dialog open={showAppSelector} onOpenChange={setShowAppSelector}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select App</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {userApps.map((app) => (
                            <Card
                                key={app.id}
                                className="p-4 cursor-pointer hover:bg-accent"
                                onClick={() => addTasksToApp(app.id)}
                            >
                                <h3 className="font-semibold">{app.name}</h3>
                                <p className="text-sm text-muted-foreground">{app.description}</p>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default FeaturePlanner;