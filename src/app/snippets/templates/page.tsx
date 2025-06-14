'use client'

import { useState, useEffect } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import supabase from "@/lib/db/supabase";
import { useUser } from "@clerk/nextjs";
import { TemplateDialog } from "@/components/templates/new-template-dialog";
import { Textarea } from "@/components/ui/textarea";

interface Snippet {
    id: string;
    title: string;
    code: string;
    language: string;
    created_at: string;
    user_id: string;  // Added this
    template_id: string | null;  // Made nullable
    pinned: boolean;
    color: string;
    category: string;
}
interface Template {
    id: string;
    name: string;
    description: string;
    user_id: string;
    created_at: string;
}

interface TemplateGroup {
    color: any;
    description: string;
    pinned: any;
    id: string;
    name: string;
    created_at: string;
    template_id: string;
}

// Add this interface to track snippets per group
interface GroupSnippets {
    [groupId: string]: Snippet[];
}

const TemplatesPage = () => {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [groups, setGroups] = useState<TemplateGroup[]>([]);
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [isAddingSnippets, setIsAddingSnippets] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [userSnippets, setUserSnippets] = useState<Snippet[]>([]);
    const [groupSnippets, setGroupSnippets] = useState<GroupSnippets>({});

    // Fetch all templates
    const fetchTemplates = async () => {
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('user_id', user?.id);

        if (error) throw error;
        setTemplates(data || []);
        setLoading(false);
    };

    // Fetch groups for selected template
    const fetchTemplateGroups = async (templateId: string) => {
        const { data: groupsData, error: groupsError } = await supabase
            .from('template_group')
            .select('*')
            .eq('template_id', templateId)
            .order('created_at', { ascending: false });

        if (groupsError) throw groupsError;
        setGroups(groupsData || []);

        // Fetch snippets for each group
        const snippetsObj: GroupSnippets = {};
        for (const group of groupsData || []) {
            const { data: snippetsData } = await supabase
                .from('snippets')
                .select('*')
                .eq('template_id', group.id);

            snippetsObj[group.id] = snippetsData || [];
        }
        setGroupSnippets(snippetsObj);
    };

    const fetchGroupSnippets = async (groupId: string) => {
        const { data, error } = await supabase
            .from('snippets')
            .select('*')
            .eq('template_id', groupId);

        if (error) throw error;
        setSnippets(data || []);
    };

    // Update the fetchUserSnippets function
    const fetchUserSnippets = async () => {
        try {
            const { data, error } = await supabase
                .from('snippets')
                .select('*')
                .eq('user_id', user?.id)
                .is('user_id', user?.id);  // Get snippets not already in a group

            if (error) {
                console.error('Error fetching snippets:', error);
                throw error;
            }

            console.log('Fetched snippets:', data); // Debug log
            setUserSnippets(data || []);
        } catch (error) {
            console.error('Error in fetchUserSnippets:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchTemplates();
        }
    }, [user]);

    // Load groups when template is selected
    useEffect(() => {
        if (selectedTemplate) {
            fetchTemplateGroups(selectedTemplate);
        }
    }, [selectedTemplate]);

    const addSnippetToGroup = async (snippetId: string, groupId: string) => {
        const { error } = await supabase
            .from('snippets')
            .update({ template_id: groupId })
            .eq('id', snippetId);

        if (error) throw error;
        await fetchGroupSnippets(groupId);
        await fetchUserSnippets();
    };

    // Update the group click handler to ensure snippets are loaded
    const handleGroupClick = async (groupId: string) => {
        setSelectedGroup(groupId);
        await fetchUserSnippets(); // Make sure to await the fetch
    };

    return (
        <div className="container mx-auto p-4">
            {selectedTemplate ? (
                // Full Template View with its Groups
                <div className="min-h-screen">
                    <div className="flex items-center gap-4 mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setSelectedTemplate(null);
                                setSelectedGroup(null);
                                setGroups([]);
                            }}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <h1 className="text-4xl font-bold">
                            {templates.find(t => t.id === selectedTemplate)?.name}
                        </h1>
                    </div>

                    <div className="mb-8">
                        <TemplateDialog
                            type="group"
                            mode="create"
                            templateId={selectedTemplate}
                            trigger={
                                <Button variant="secondary" className="flex gap-2">
                                    <Plus size={16} /> New Group
                                </Button>
                            }
                            onSubmit={async (name, description, pinned, color, templateId) => {
                                await supabase.from('template_group').insert({
                                    name,
                                    description,
                                    template_id: templateId,
                                    pinned,
                                    color
                                });
                                fetchTemplateGroups(selectedTemplate);
                            }}
                        />
                    </div>

                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {groups.map(group => (
                            <Card
                                key={group.id}
                                className={`transition-all duration-200 ${group.pinned ? 'border-2 border-primary' : ''
                                    }`}
                                style={{
                                    backgroundColor: group.color ? `${group.color}10` : undefined,
                                    borderColor: group.color || undefined
                                }}
                                onClick={() => handleGroupClick(group.id)}
                            >
                                <CardHeader>
                                    <CardTitle>{group.name}</CardTitle>
                                    <CardDescription>{group.description}</CardDescription>
                                    <Button variant={'ghost'} className="cursor-pointer" onClick={() => setIsAddingSnippets(true)}>
                                        Add Snippet
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {groupSnippets[group.id]?.map(snippet => (
                                            <div
                                                key={snippet.id}
                                                className="p-4 bg-muted rounded-md"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">{snippet.title}</span>
                                                    <Badge>{snippet.language}</Badge>
                                                </div>
                                                <br />
                                                <Textarea 
                                                    className="min-h-[200px] overflow-y-scroll max-h-[50vh] cursor-pointer"
                                                    readOnly
                                                    value={snippet.code}
                                                />
                                            </div>
                                        ))}
                                        {groupSnippets[group.id]?.length === 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                No snippets in this group yet
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Existing Add Snippets Dialog */}
                    <Dialog open={isAddingSnippets} onOpenChange={setIsAddingSnippets}>
                        <DialogContent className="max-w-3xl max-h-[80vh]">
                            <DialogHeader>
                                <DialogTitle>Add Snippets</DialogTitle>
                                <DialogDescription>
                                    Select snippets to add to this group
                                </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh]">
                                <div className="grid gap-4 py-4">
                                    {userSnippets.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">
                                                No available snippets found. Create some snippets first or they might all be already in groups.
                                            </p>
                                        </div>
                                    ) : (
                                        userSnippets.map(snippet => (
                                            <Card
                                                key={snippet.id}
                                                className="cursor-pointer hover:shadow-lg transition-all"
                                                onClick={() => {
                                                    if (selectedGroup) {
                                                        addSnippetToGroup(snippet.id, selectedGroup);
                                                        setIsAddingSnippets(false);
                                                    }
                                                }}
                                            >
                                                <CardHeader>
                                                    <CardTitle className="flex items-center justify-between">
                                                        {snippet.title}
                                                        <Badge>{snippet.language}</Badge>
                                                    </CardTitle>
                                                    <pre className="mt-2 bg-muted p-2 rounded-md overflow-x-auto">
                                                        <code>{snippet.code}</code>
                                                    </pre>
                                                </CardHeader>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>
            ) : (
                // Templates List View
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold">Templates</h1>
                        <TemplateDialog
                            type="template"
                            mode="create"
                            trigger={
                                <Button variant="secondary" className="flex gap-2">
                                    <Plus size={16} /> New Template
                                </Button>
                            }
                            onSubmit={async (name, description) => {
                                await supabase.from('templates').insert({
                                    name,
                                    description,
                                    user_id: user?.id
                                });
                                fetchTemplates();
                            }}
                        />
                    </div>

                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map(template => (
                            <Card
                                key={template.id}
                                className="cursor-pointer hover:shadow-lg transition-all"
                                onClick={() => setSelectedTemplate(template.id)}
                            >
                                <CardHeader>
                                    <CardTitle>{template.name}</CardTitle>
                                    <CardDescription>{template.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TemplatesPage;