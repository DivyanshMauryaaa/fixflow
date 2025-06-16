'use client'

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import supabase from "@/lib/db/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TemplateDialog } from "@/components/templates/new-template-dialog";

interface Template {
    id: string;
    name: string;
    description: string;
    user_id: string;
    created_at: string;
}

export default function TemplatesPage() {
    const { user } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<Template[]>([]);

    const fetchTemplates = async () => {
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        setTemplates(data || []);
        setLoading(false);
    };

    useEffect(() => {
        if (user) {
            fetchTemplates();
        }
    }, [user]);

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">Templates</h1>
                <TemplateDialog
                    type="template"
                    mode="create"
                    trigger={
                        <Button className="cursor-pointer">
                            <Plus className="mr-2 h-4 w-4" /> New Template
                        </Button>
                    }
                    onSubmit={async (name, description) => {
                        await supabase.from('templates').insert({
                            name,
                            description,
                            user_id: user?.id,
                        });
                        fetchTemplates();
                    }}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map(template => (
                        <Card
                            key={template.id}
                            className="cursor-pointer hover:shadow-lg transition-all"
                            onClick={() => router.push(`/templates/${template.id}`)}
                        >
                            <CardHeader>
                                <CardTitle>{template.name}</CardTitle>
                                <CardDescription>{template.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-end">
                                    <Button variant="secondary">View Template</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {templates.length === 0 && (
                        <div className="col-span-3 text-center py-12">
                            <p className="text-muted-foreground">
                                No templates yet. Create one to get started!
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}