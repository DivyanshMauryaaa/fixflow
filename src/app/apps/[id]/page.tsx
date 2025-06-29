'use client'

import { Button } from "@/components/ui/button"
import supabase from "@/lib/db/supabase"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Edit, FileIcon, Link2, Plus, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function AppPage() {
    const { id } = useParams() // Modern Next.js way to get params
    const [appData, setData] = useState<any>([])
    const [templates, setTemplates] = useState<any[]>([])
    const [availableTemplates, setAvailableTemplates] = useState<any[]>([])
    const [availableIdeas, setAvailableIdeas] = useState<any>([])
    const [milestones, setMilestones] = useState<any[]>([])
    const [showTemplateDialog, setShowTemplateDialog] = useState(false)
    const { user } = useUser()
    const [loading, setLoading] = useState(true);
    const [availableDocuments, setDocuments] = useState<any>([]);
    const [showAddIdeaDialog, setShowAddIdeaDialog] = useState(false)
    const [showEditIdeaDialog, setShowEditIdeaDialog] = useState(false)
    const [editIdea, setEditIdea] = useState<any>(null)
    const [ideaForm, setIdeaForm] = useState({ title: "", description: "", priority: 3, stage: "idea" })
    const [savingIdea, setSavingIdea] = useState(false)

    const getData = async () => {
        const { data, error } = await supabase.from('apps')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        setData(data)
        setLoading(false)
    }

    const fetchLinkedTemplates = async () => {
        setLoading(true)
        // Note: Based on schema, there's no app_templates table
        // You may need to create this table or use a different approach
        // For now, I'll comment this out
        // /*
        // const { data, error } = await supabase
        //     .from('app_templates')
        //     .select(`
        //         template_id,
        //         templates (*)
        //     `)
        //     .eq('app_id', id)

        // if (error) throw error
        // setTemplates(data?.map(d => d.templates) || [])
        // */
        setTemplates([]) // Placeholder until app_templates table is created
        setLoading(false)
    }

    const fetchAvailableTemplates = async () => {
        setLoading(true)
        // Get all user templates
        const { data: allTemplates, error: templatesError } = await supabase
            .from('templates')
            .select('*')
            .eq('user_id', user?.id)

        if (templatesError) throw templatesError

        // Since app_templates doesn't exist in schema, show all templates for now
        setAvailableTemplates(allTemplates || [])
        setLoading(false)
    }

    const linkTemplate = async (templateId: string) => {
        // This function needs the app_templates table to be created
        setLoading(true)
        // Placeholder - you'll need to create app_templates table
        setShowTemplateDialog(false)
        setLoading(false)
    }

    useEffect(() => {
        if (id && user) {
            getData()
            fetchLinkedTemplates()
            fetchDocuments()
            getAppIdeas()
            getMilestones()
        }
    }, [user, id])

    const getAppIdeas = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('app_ideas')
            .select('*')
            .eq('app_id', id)
            .order('created_at', { ascending: false })

        if (error) throw error;
        setAvailableIdeas(data);
        setLoading(false);
    }

    const getMilestones = async () => {
        setLoading(true)
        const { data, error } = await supabase.from('app_milestones')
            .select('*')
            .eq('app_id', id)
            .order('date', { ascending: true })

        if (error) throw error;
        setMilestones(data || []);
        setLoading(false);
    }

    const removeTemplateFromApp = async (templateId: string) => {
        // This function needs the app_templates table to be created
        setLoading(true)
        // Placeholder - you'll need to create app_templates table
        await fetchLinkedTemplates()
        setLoading(false)
    }

    const fetchDocuments = async () => {
        setLoading(true);

        const { data, error } = await supabase.from('app_docs')
            .select('*')
            .eq('app_id', id)

        if (error) throw error;

        setDocuments(data);
        setLoading(false);
    }

    const addDocument = async () => {
        setLoading(true)

        const { error } = await supabase.from('app_docs')
            .insert({
                title: "Untitled",
                content: "**Add your markdown content here...**",
                app_id: id,
            })

        if (error) alert(error);
        setLoading(false);

        fetchDocuments();
    }

    const removeDoc = async (docId: string) => {
        setLoading(true)

        const { error } = await supabase.from('app_docs')
            .delete()
            .eq('id', docId)

        if (error) alert(error);
        fetchDocuments();

        setLoading(false)
    }

    // Add Idea Handler
    const handleAddIdea = async () => {
        setSavingIdea(true)
        await supabase.from('app_ideas').insert({
            title: ideaForm.title,
            description: ideaForm.description,
            priority: ideaForm.priority,
            stage: ideaForm.stage,
            app_id: id,
        })
        setShowAddIdeaDialog(false)
        setIdeaForm({ title: "", description: "", priority: 3, stage: "idea" })
        setSavingIdea(false)
        getAppIdeas()
    }

    // Edit Idea Handler
    const handleEditIdea = async () => {
        if (!editIdea) return
        setSavingIdea(true)
        await supabase.from('app_ideas')
            .update({
                title: ideaForm.title,
                description: ideaForm.description,
                priority: ideaForm.priority,
                stage: ideaForm.stage,
            })
            .eq('id', editIdea.id)
        setShowEditIdeaDialog(false)
        setEditIdea(null)
        setIdeaForm({ title: "", description: "", priority: 3, stage: "idea" })
        setSavingIdea(false)
        getAppIdeas()
    }

    // Open Edit Dialog
    const openEditDialog = (idea: any) => {
        setEditIdea(idea)
        setIdeaForm({
            title: idea.title,
            description: idea.description,
            priority: idea.priority,
            stage: idea.stage,
        })
        setShowEditIdeaDialog(true)
    }

    // Delete Idea
    const deleteIdea = async (ideaId: string) => {
        setLoading(true)
        const { error } = await supabase.from('app_ideas')
            .delete()
            .eq('id', ideaId)

        if (error) alert(error);
        getAppIdeas()
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 dark:border-blue-400" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center">
                <div>
                    <p className="text-7xl">😔</p>
                    <br />
                    <p className="text-5xl max-w-[700px]">Sorry, we could not find an authenticated user, Please log in... </p>
                    <br />
                    <Link href="/sign-in">
                        <Button variant="default">Login</Button>
                    </Link>
                </div>
            </div>
        )
    }

    if (user?.id !== appData.user_id) {
        return (
            <div className="flex items-center justify-center">
                <div>
                    <p className="text-7xl">😔</p>
                    <br />
                    <p className="text-5xl max-w-[700px]">Sorry, we couldn&apos;t find the app from your account... </p>
                    <br />
                    <Link href="/apps">
                        <Button variant="default">Back to Apps</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <span
                className="text-7xl mb-3"
                contentEditable
                suppressContentEditableWarning
                onBlur={async (e) => {
                    const newName = e.currentTarget.textContent?.trim() || "";
                    if (newName && newName !== appData.name) {
                        await supabase.from('apps')
                            .update({ name: newName })
                            .eq('id', id);
                        setData((prev: any) => ({ ...prev, name: newName }));
                    }
                }}
            >
                {appData.name}
            </span>
            <br />
            <hr />

            <section id="ideas">
                {/* <p className="text-4xl">Ideas & Features</p> */}
                <br />
                <Card className="w-[100%]">
                    <CardHeader>
                        <Button variant={'ghost'} className="mb-4 border dark:border-gray-700 border-gray-300 hover:border-none cursor-pointer" onClick={() => setShowAddIdeaDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Milestone
                        </Button>
                        <CardTitle className="flex gap-2">
                            Milestones
                        </CardTitle>
                        <CardDescription>Milestone and features for this app</CardDescription>
                    </CardHeader>

                    <CardContent className="p-3 space-y-4 max-h-[500px] overflow-y-scroll">
                        {availableIdeas.map((idea: any) => (
                            <Card key={idea.id} className="flex justify-between p-6 border border-gray-300 rounded-lg dark:border-gray-700">
                                <CardHeader>
                                    <CardTitle className="font-bold flex gap-2 items-center">
                                        <div className="h-2 w-2 rounded-full mt-1" style={{
                                            backgroundColor:
                                                idea.stage === "done" ? 'green' :
                                                    idea.stage === "in-progress" ? 'blue' :
                                                        idea.stage === "spec-ready" ? 'orange' :
                                                            idea.stage === "idea" ? 'gray' : 'none'
                                        }} />
                                        <p className="text-5xl">{idea.title}</p>
                                        <span className={`px-2 py-1 text-xs rounded-full ${idea.priority === 1 ? 'bg-red-100 text-red-800' :
                                            idea.priority === 2 ? 'bg-orange-100 text-orange-800' :
                                                idea.priority === 3 ? 'bg-yellow-100 text-yellow-800' :
                                                    idea.priority === 4 ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            P{idea.priority}
                                        </span>
                                    </CardTitle>

                                    <CardDescription>
                                        <p className="dark:text-white text-black text-md">{idea.description}</p>
                                    </CardDescription>

                                    <div className="flex flex-col gap-1 items-start">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild className="cursor-pointer">
                                                <Button variant="outline" size="sm">
                                                    {idea.stage === "idea" && "Idea"}
                                                    {idea.stage === "spec-ready" && "Spec Ready"}
                                                    {idea.stage === "in-progress" && "In Progress"}
                                                    {idea.stage === "done" && "Done"}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem
                                                    onClick={async () => {
                                                        await supabase
                                                            .from('app_ideas')
                                                            .update({ stage: 'idea' })
                                                            .eq('id', idea.id);
                                                        getAppIdeas();
                                                    }}
                                                >
                                                    Idea
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={async () => {
                                                        await supabase
                                                            .from('app_ideas')
                                                            .update({ stage: 'spec-ready' })
                                                            .eq('id', idea.id);
                                                        getAppIdeas();
                                                    }}
                                                >
                                                    Spec Ready
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={async () => {
                                                        await supabase
                                                            .from('app_ideas')
                                                            .update({ stage: 'in-progress' })
                                                            .eq('id', idea.id);
                                                        getAppIdeas();
                                                    }}
                                                >
                                                    In Progress
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={async () => {
                                                        await supabase
                                                            .from('app_ideas')
                                                            .update({ stage: 'done' })
                                                            .eq('id', idea.id);
                                                        getAppIdeas();
                                                    }}
                                                >
                                                    Done
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(idea)}
                                                className="cursor-pointer"
                                            >
                                                <Edit className="h-4 w-4 text-blue-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteIdea(idea.id)}
                                                className="cursor-pointer"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>

                                </CardHeader>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </section>
            <br /><br />

            <section id="Templates">
                <div className="flex items-center justify-between">
                    <p className="text-4xl">Code Templates</p>
                    <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                        <DialogTrigger asChild>
                            <Button onClick={fetchAvailableTemplates}>
                                <Plus className="mr-2 h-4 w-4" /> Link Template
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Link Template</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4">
                                {availableTemplates.map(template => (
                                    <div
                                        key={template.id}
                                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted"
                                        onClick={() => linkTemplate(template.id)}
                                    >
                                        <h3 className="font-semibold flex gap-3">{template.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {template.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b py-4">
                    {templates.map(template => (
                        <Card key={template.id}>
                            <CardHeader>
                                <CardTitle>{template.name}</CardTitle>
                                <CardDescription>{template.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex w-full gap-2">
                                <Button variant={'destructive'} size={"icon"} className="cursor-pointer">
                                    <Trash2 onClick={() => removeTemplateFromApp(template.id)} />
                                </Button>

                                <Link href={`/templates/${template.id}`}>
                                    <Button variant="secondary" className="w-full cursor-pointer">
                                        Open Template
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section className="">
                <div className="text-4xl flex justify-between w-full">
                    Documents
                    <Button className="flex gap-2" onClick={addDocument}>
                        <Plus /> Add Document
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b py-4">
                    {availableDocuments.map((doc: any) => (
                        <Card key={doc.id}>
                            <CardHeader>
                                {doc.title?.toLowerCase().includes("setup") ? <Badge>Setup</Badge> : ""}
                                {doc.title?.toLowerCase().includes("changelog") ? <Badge>Changelog</Badge> : ""}
                                {doc.title?.toLowerCase().includes("update") ? <Badge>Update</Badge> : ""}
                                
                                <CardTitle className="text-3xl font-normal">{doc.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex w-full gap-2">
                                <Button
                                    variant={'ghost'}
                                    size={"icon"}
                                    className="cursor-pointer"
                                    onClick={() => removeDoc(doc.id)}
                                >
                                    <Trash2 className="text-red-600" />
                                </Button>

                                <Link href={`/apps/${id}/doc/${doc.id}`}>
                                    <Button variant="secondary" className="w-full cursor-pointer flex gap-3">
                                        <FileIcon /> Open Document
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Add Idea Dialog */}
            <Dialog open={showAddIdeaDialog} onOpenChange={setShowAddIdeaDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Idea</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Input
                            placeholder="Title"
                            value={ideaForm.title}
                            onChange={e => setIdeaForm(f => ({ ...f, title: e.target.value }))}
                        />
                        <Textarea
                            placeholder="Description (optional)"
                            className="h-24 max-h-[200px] overflow-y-auto resize-y"
                            value={ideaForm.description}
                            onChange={e => setIdeaForm(f => ({ ...f, description: e.target.value }))}
                        />
                        <select
                            className="w-full border rounded p-2"
                            value={ideaForm.priority}
                            onChange={e => setIdeaForm(f => ({ ...f, priority: parseInt(e.target.value) }))}
                        >
                            <option value={1}>Priority 1 (Highest)</option>
                            <option value={2}>Priority 2 (High)</option>
                            <option value={3}>Priority 3 (Medium)</option>
                            <option value={4}>Priority 4 (Low)</option>
                            <option value={5}>Priority 5 (Lowest)</option>
                        </select>
                        <select
                            className="w-full border rounded p-2"
                            value={ideaForm.stage}
                            onChange={e => setIdeaForm(f => ({ ...f, stage: e.target.value }))}
                        >
                            <option value="idea">Idea</option>
                            <option value="spec-ready">Spec Ready</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                        <Button
                            className="w-full"
                            onClick={handleAddIdea}
                            disabled={savingIdea || !ideaForm.title}
                        >
                            {savingIdea ? "Saving..." : "Add Idea"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Idea Dialog */}
            <Dialog open={showEditIdeaDialog} onOpenChange={setShowEditIdeaDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Idea</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Input
                            placeholder="Title"
                            value={ideaForm.title}
                            onChange={e => setIdeaForm(f => ({ ...f, title: e.target.value }))}
                        />
                        <Textarea
                            placeholder="Description"
                            className="h-24 max-h-[200px] overflow-y-auto resize-y"
                            value={ideaForm.description}
                            onChange={e => setIdeaForm(f => ({ ...f, description: e.target.value }))}
                        />
                        <select
                            className="w-full border rounded p-2"
                            value={ideaForm.priority}
                            onChange={e => setIdeaForm(f => ({ ...f, priority: parseInt(e.target.value) }))}
                        >
                            <option value={1}>Priority 1 (Highest)</option>
                            <option value={2}>Priority 2 (High)</option>
                            <option value={3}>Priority 3 (Medium)</option>
                            <option value={4}>Priority 4 (Low)</option>
                            <option value={5}>Priority 5 (Lowest)</option>
                        </select>
                        <select
                            className="w-full border rounded p-2"
                            value={ideaForm.stage}
                            onChange={e => setIdeaForm(f => ({ ...f, stage: e.target.value }))}
                        >
                            <option value="idea">Idea</option>
                            <option value="spec-ready">Spec Ready</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                        <Button
                            className="w-full"
                            onClick={handleEditIdea}
                            disabled={savingIdea || !ideaForm.title}
                        >
                            {savingIdea ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}