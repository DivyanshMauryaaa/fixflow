'use client'

import { Button } from "@/components/ui/button"
import supabase from "@/lib/db/supabase"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function AppPage() {
    const { id } = useParams() // Modern Next.js way to get params
    const [appData, setData] = useState<any>([])
    const [templates, setTemplates] = useState<any[]>([])
    const [availableTemplates, setAvailableTemplates] = useState<any[]>([])
    const [showTemplateDialog, setShowTemplateDialog] = useState(false)
    const { user } = useUser()
    const [loading, setLoading] = useState(true);
    const [availableDocuments, setDocuments] = useState<any>([]);

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
        const { data, error } = await supabase
            .from('app_templates')
            .select(`
                template_id,
                templates (*)
            `)
            .eq('app_id', id)

        if (error) throw error
        setTemplates(data?.map(d => d.templates) || [])
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

        // Get currently linked templates
        const { data: linkedTemplates, error: linkedError } = await supabase
            .from('app_templates')
            .select('template_id')
            .eq('app_id', id)

        if (linkedError) throw linkedError

        // Create a set of linked template IDs for efficient lookup
        const linkedTemplateIds = new Set(linkedTemplates.map(lt => lt.template_id))

        // Filter out templates that are already linked
        const availableTemplates = allTemplates.filter(template =>
            !linkedTemplateIds.has(template.id)
        )

        setAvailableTemplates(availableTemplates || [])
        setLoading(false)
    }

    const linkTemplate = async (templateId: string) => {
        setLoading(true)
        const { error } = await supabase
            .from('app_templates')
            .insert({
                app_id: id,
                template_id: templateId
            })

        if (error) throw error
        await fetchLinkedTemplates()
        setShowTemplateDialog(false)
        setLoading(false)
    }

    useEffect(() => {
        if (id && user) {
            getData()
            fetchLinkedTemplates()
            fetchDocuments()
        }
    }, [user, id])

    const removeTemplateFromApp = async (templateId: string) => {
        setLoading(true)
        const { error } = await supabase
            .from('app_templates')
            .delete()
            .match({
                app_id: id,
                template_id: templateId
            })

        if (error) {
            throw error
        }

        // Refresh the templates list
        await fetchLinkedTemplates()
        setLoading(false)
    }

    const fetchDocuments = async () => {
        setLoading(true);

        const { data, error } = await supabase.from('app_documents')
            .select('*')
            .eq('app_id', id)
        // .eq('user_id', user?.id) // Extra auth security check

        if (error) throw error;

        setDocuments(data);
        setLoading(false);
    }

    const addDocument = async () => {
        setLoading(true)

        const { error } = await supabase.from('app_documents')
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

        const { error } = await supabase.from('app_documents')
        .delete()
        .eq('id', docId)

        if (error) alert(error);
        fetchDocuments();
    
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
            <span className="text-7xl">{appData.name}</span>

            <br /><br /><br />

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
                    <Button className="flex gap-2"
                        onClick={addDocument}
                    ><Plus /> Add Document</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b py-4">

                    {availableDocuments.map((doc: any) => (
                        <Card key={doc.id}>
                            <CardHeader>
                                <CardTitle className="text-3xl font-normal">{doc.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex w-full gap-2">
                                <Button 
                                    variant={'destructive'} 
                                    size={"icon"} 
                                    className="cursor-pointer"
                                    onClick={() => removeDoc(doc.id)}
                                >
                                    <Trash2 />
                                </Button>

                                <Link href={`/apps/${id}/doc/${doc.id}`}>
                                    <Button variant="secondary" className="w-full cursor-pointer">
                                        Open Document
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}

                </div>
            </section>
        </div>
    )
}