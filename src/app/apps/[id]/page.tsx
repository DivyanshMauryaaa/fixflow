'use client'

import { Button } from "@/components/ui/button";
import supabase from "@/lib/db/supabase";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { FC, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface PageProps {
    params: { id: string };
}

const Page: FC<PageProps> = ({ params }) => {
    const [appData, setData] = useState<any>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
    const [showTemplateDialog, setShowTemplateDialog] = useState(false);
    const { user } = useUser();
    const [loading, setLoading] = useState(true)

    const getData = async () => {
        const { data, error } = await supabase.from('apps')
            .select('*')
            .eq('id', params.id)
            .single()

        setData(data);

        if (error) throw error;

        setLoading(false)

    }

    const fetchLinkedTemplates = async () => {
        setLoading(true)

        // Fetch templates linked to this app
        const { data, error } = await supabase
            .from('app_templates')
            .select(`
                template_id,
                templates (*)
            `)
            .eq('app_id', params.id);

        if (error) throw error;
        setTemplates(data?.map(d => d.templates) || []);
        setLoading(false)

    };

    const fetchAvailableTemplates = async () => {
        setLoading(true)

        // Fetch all templates by the user
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('user_id', user?.id);

        if (error) throw error;
        setAvailableTemplates(data || []);

        setLoading(false)
    };

    const linkTemplate = async (templateId: string) => {
        setLoading(true)

        const { error } = await supabase
            .from('app_templates')
            .insert({
                app_id: params.id,
                template_id: templateId
            });

        if (error) throw error;
        await fetchLinkedTemplates();
        setShowTemplateDialog(false);

        setLoading(false);
    };

    useEffect(() => {
        if (params && user) {
            getData();
        }
    }, [user, params])

    useEffect(() => {
        if (user && params.id) {
            fetchLinkedTemplates();
        }
    }, [user, params.id]);

    if (loading === true) {
        return (
            <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center">
                <div className="">
                    <p className="text-7xl">😔</p>
                    <br />
                    <p className="text-5xl max-w-[700px]">Sorry, we could not find an authenticated user, Please log in... </p>
                    <br />
                    <Link href={'/apps'}>
                        <Button variant="default" className="cursor-pointer">Back to Apps</Button>
                    </Link>
                </div>
            </div>
        )
    }

    else if (user?.id != appData.user_id) {
        return (
            <div className="flex items-center justify-center">
                <div>
                    <p className="text-7xl">😔</p>
                    <br />
                    <p className="text-5xl max-w-[700px]">Sorry, we couldn't find the app from your account... </p>
                    <br />
                    <Link href={'/apps'}>
                        <Button variant="default" className="cursor-pointer">Back to Apps</Button>
                    </Link>
                </div>
            </div>
        )
    }

    else {
        return (
            <div className="px-8 space-y-4">
                <span className="text-7xl">{appData.name}</span>

                <br /><br /><br />

                <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold">Templates</p>
                    <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                        <DialogTrigger asChild>
                            <Button onClick={() => fetchAvailableTemplates()}>
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
                                        <h3 className="font-semibold">{template.name}</h3>
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
                            <CardContent>
                                <Link href={`/templates/${template.id}`}>
                                    <Button variant="secondary" className="w-full cursor-pointer">
                                        Open Template
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

};

export default Page;