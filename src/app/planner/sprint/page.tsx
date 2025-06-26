'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, SaveIcon } from "lucide-react"
import supabase from "@/lib/db/supabase"

interface SprintTask {
    id: number
    title: string
    description: string
    estimate: string
    status: "pending" | "inProgress" | "completed"
}

export default function SprintPlanner() {
    const [sprint, setSprint] = useState({
        name: "",
        startDate: "",
        endDate: "",
        goals: [""],
    })
    const [tasks, setTasks] = useState<SprintTask[]>([])
    const [saving, setSaving] = useState(false)
    const [showAIDialog, setShowAIDialog] = useState(false)
    const [aiForm, setAIForm] = useState({
        name: "",
        duration: 7,
        mainGoal: "",
        teamSize: "",
        notes: "",
    })
    const [aiLoading, setAILoading] = useState(false)
    const [userApps, setUserApps] = useState<any[]>([])
    const [showAppDialog, setShowAppDialog] = useState(false)
    const [selectedApp, setSelectedApp] = useState("")

    const fetchUserApps = async () => {
        const { data } = await supabase.from("apps").select("*")
        setUserApps(data || [])
    }

    // Add/remove/edit goals
    const addGoal = () => setSprint(s => ({ ...s, goals: [...s.goals, ""] }))
    const removeGoal = (idx: number) =>
        setSprint(s => ({ ...s, goals: s.goals.filter((_, i) => i !== idx) }))
    const updateGoal = (idx: number, value: string) =>
        setSprint(s => ({
            ...s,
            goals: s.goals.map((g, i) => (i === idx ? value : g)),
        }))

    // Add/remove/edit tasks
    const addTask = () =>
        setTasks(ts => [
            ...ts,
            {
                id: Date.now(),
                title: "",
                description: "",
                estimate: "",
                status: "pending",
            },
        ])
    const removeTask = (id: number) =>
        setTasks(ts => ts.filter(t => t.id !== id))
    const updateTask = (idx: number, field: keyof SprintTask, value: string) =>
        setTasks(ts =>
            ts.map((t, i) =>
                i === idx ? { ...t, [field]: value } : t
            )
        )

    // Save sprint to Supabase (adjust table/columns as needed)
    const saveSprint = async () => {
        setSaving(true)
        try {
            const { data, error } = await supabase.from("sprints").insert({
                name: sprint.name,
                start_date: sprint.startDate,
                end_date: sprint.endDate,
                goals: sprint.goals,
                // You might want to relate this to an app_id or user_id
            }).select().single()
            if (error) throw error

            // Save tasks (optional: relate to sprint_id)
            if (data?.id) {
                await supabase.from("sprint_tasks").insert(
                    tasks.map(t => ({
                        sprint_id: data.id,
                        title: t.title,
                        description: t.description,
                        estimate: t.estimate,
                        status: t.status,
                    }))
                )
            }
            // Optionally, redirect or show a toast
        } catch (e) {
            // Handle error (toast, etc)
            console.error(e)
        }
        setSaving(false)
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <div>
                <h1 className="text-5xl font-bold">Sprint Planning</h1>
                <p className="text-gray-500 mt-2">
                    Plan your sprint, set goals, and break down tasks
                </p>
            </div>

            <Card className="p-6 space-y-4">
                <div className="flex gap-4">
                    <Input
                        placeholder="Sprint Name"
                        value={sprint.name}
                        onChange={e => setSprint(s => ({ ...s, name: e.target.value }))}
                        className="w-1/2"
                    />
                    <Input
                        type="date"
                        value={sprint.startDate}
                        onChange={e => setSprint(s => ({ ...s, startDate: e.target.value }))}
                        className="w-1/4"
                    />
                    <Input
                        type="date"
                        value={sprint.endDate}
                        onChange={e => setSprint(s => ({ ...s, endDate: e.target.value }))}
                        className="w-1/4"
                    />
                </div>

                <div>
                    <label className="font-semibold">Sprint Goals</label>
                    <div className="space-y-2 mt-2">
                        {sprint.goals.map((goal, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                                <Input
                                    placeholder={`Goal #${idx + 1}`}
                                    value={goal}
                                    onChange={e => updateGoal(idx, e.target.value)}
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeGoal(idx)}
                                    disabled={sprint.goals.length === 1}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={addGoal}
                        >
                            <Plus size={16} className="mr-1" /> Add Goal
                        </Button>
                    </div>
                </div>

                <div>
                    <label className="font-semibold">Sprint Tasks</label>
                    <div className="space-y-4 mt-2">
                        {tasks.map((task, idx) => (
                            <div
                                key={task.id}
                                className="border rounded-lg p-4 flex flex-col gap-2"
                            >
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Task Title"
                                        value={task.title}
                                        onChange={e => updateTask(idx, "title", e.target.value)}
                                    />
                                    <Input
                                        placeholder="Estimate (hrs)"
                                        type="number"
                                        value={task.estimate}
                                        onChange={e => updateTask(idx, "estimate", e.target.value)}
                                        className="w-32"
                                    />
                                    <select
                                        className="border rounded p-2"
                                        value={task.status}
                                        onChange={e =>
                                            updateTask(
                                                idx,
                                                "status",
                                                e.target.value as SprintTask["status"]
                                            )
                                        }
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="inProgress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeTask(task.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                                <Textarea
                                    placeholder="Task Description"
                                    value={task.description}
                                    onChange={e => updateTask(idx, "description", e.target.value)}
                                    className="h-20 max-h-[200px] overflow-y-auto resize-y"
                                />
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            className=""
                            onClick={addTask}
                        >
                            <Plus size={16} className="mr-1" /> Add Task
                        </Button>
                    </div>
                </div>

                <Button
                    className="w-full"
                    onClick={saveSprint}
                    disabled={saving || !sprint.name || tasks.length === 0}
                >
                    {saving ? "Saving..." : <><SaveIcon className="mr-2" /> Save Sprint</>}
                </Button>
                <Button variant="secondary" onClick={() => setShowAIDialog(true)}>
                    Generate Sprint with AI
                </Button>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                        fetchUserApps()
                        setShowAppDialog(true)
                    }}
                    disabled={!sprint.name || tasks.length === 0}
                >
                    Add Sprint to App
                </Button>
            </Card>

            <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate Sprint with AI</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Input
                            placeholder="Sprint Name"
                            value={aiForm.name}
                            onChange={e => setAIForm(f => ({ ...f, name: e.target.value }))}
                        />
                        <Input
                            type="number"
                            placeholder="Duration (days)"
                            value={aiForm.duration}
                            onChange={e => setAIForm(f => ({ ...f, duration: Number(e.target.value) }))}
                        />
                        <Textarea
                            placeholder="Main Feature or Goal"
                            value={aiForm.mainGoal}
                            onChange={e => setAIForm(f => ({ ...f, mainGoal: e.target.value }))}
                        />
                        <Input
                            type="number"
                            placeholder="Team Size (optional)"
                            value={aiForm.teamSize}
                            onChange={e => setAIForm(f => ({ ...f, teamSize: e.target.value }))}
                        />
                        <Textarea
                            placeholder="Special Notes (optional)"
                            value={aiForm.notes}
                            onChange={e => setAIForm(f => ({ ...f, notes: e.target.value }))}
                        />
                        <Button
                            className="w-full"
                            disabled={aiLoading || !aiForm.name || !aiForm.duration || !aiForm.mainGoal}
                            onClick={async () => {
                                setAILoading(true)
                                const res = await fetch("/api/create-sprint", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(aiForm),
                                })
                                const data = await res.json()
                                if (data.success) {
                                    setSprint({
                                        name: aiForm.name,
                                        startDate: data.sprint.startDate,
                                        endDate: data.sprint.endDate,
                                        goals: data.sprint.goals,
                                    })
                                    setTasks(data.tasks)
                                    setShowAIDialog(false)
                                }
                                setAILoading(false)
                            }}
                        >
                            {aiLoading ? "Generating..." : "Generate Sprint"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showAppDialog} onOpenChange={setShowAppDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Select App to Add Sprint</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <select
                            className="w-full border rounded p-2"
                            value={selectedApp}
                            onChange={e => setSelectedApp(e.target.value)}
                        >
                            <option value="">-- Select App --</option>
                            {userApps.map(app => (
                                <option key={app.id} value={app.id}>{app.name}</option>
                            ))}
                        </select>
                        <Button
                            className="w-full"
                            disabled={!selectedApp}
                            onClick={async () => {
                                setSaving(true)
                                try {
                                    // Save sprint to app_sprints table
                                    const { error } = await supabase
                                      .from("app_sprints")
                                      .insert({
                                        app_id: selectedApp,
                                        name: sprint.name,
                                        start_date: sprint.startDate,
                                        end_date: sprint.endDate,
                                        goals: sprint.goals,
                                      })
                                    if (error) throw error
                                    setShowAppDialog(false)
                                    // Optionally: show toast or redirect
                                } catch (e) {
                                    // Handle error
                                    console.error(e)
                                }
                                setSaving(false)
                            }}
                        >
                            {saving ? "Saving..." : "Add Sprint to App"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}