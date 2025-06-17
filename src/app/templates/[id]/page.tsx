'use client'

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { TemplateDialog } from "@/components/templates/new-template-dialog";
import supabase from "@/lib/db/supabase";
import { useUser } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

interface Snippet {
    id: string;
    title: string;
    code: string;
    language: string;
    created_at: string;
    user_id: string;
    template_id: string | null;
    pinned: boolean;
    color: string;
    category: string;
}

interface TemplateGroup {
    color: string;
    description: string;
    pinned: boolean;
    id: string;
    name: string;
    created_at: string;
    template_id: string;
}

interface GroupSnippets {
    [groupId: string]: Snippet[];
}

export default function TemplatePage() {
    const { id } = useParams() // Modern Next.js way to get params
    const { user } = useUser()
    const router = useRouter()
    const [template, setTemplate] = useState<any>(null)
    const [groups, setGroups] = useState<TemplateGroup[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddingSnippets, setIsAddingSnippets] = useState(false)
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
    const [userSnippets, setUserSnippets] = useState<Snippet[]>([])
    const [groupSnippets, setGroupSnippets] = useState<GroupSnippets>({})

    const fetchTemplate = async () => {
        const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        setTemplate(data)
        await fetchTemplateGroups()
    }

    const fetchTemplateGroups = async () => {
        const { data: groupsData, error: groupsError } = await supabase
            .from('template_group')
            .select('*')
            .eq('template_id', id)
            .order('created_at', { ascending: false })

        if (groupsError) throw groupsError;
        setGroups(groupsData || []);

        // Get snippets for each group
        const snippetsObj: GroupSnippets = {};
        for (const group of groupsData || []) {
            const { data: groupSnippetData } = await supabase
                .from('group_snippets')
                .select('snippet_id')
                .eq('group_id', group.id);

            if (groupSnippetData && groupSnippetData.length > 0) {
                const snippetIds = groupSnippetData.map(gs => gs.snippet_id);
                const { data: snippetsData } = await supabase
                    .from('snippets')
                    .select('*')
                    .in('id', snippetIds);

                snippetsObj[group.id] = snippetsData || [];
            } else {
                snippetsObj[group.id] = [];
            }
        }
        setGroupSnippets(snippetsObj);
        setLoading(false);
    };

    const fetchUserSnippets = async () => {
        try {
            if (!selectedGroup) return;

            const { data: groupSnippetData } = await supabase
                .from('group_snippets')
                .select('snippet_id')
                .eq('group_id', selectedGroup);

            const excludedIds = groupSnippetData?.map(gs => gs.snippet_id) || [];

            let query = supabase
                .from('snippets')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (excludedIds.length > 0) {
                query = query.not('id', 'in', `(${excludedIds.join(',')})`);
            }

            const { data, error } = await query;
            if (error) throw error;
            setUserSnippets(data || []);
        } catch (error) {
            console.error('Error in fetchUserSnippets:', error);
        }
    };

    const addSnippetToGroup = async (snippetId: string, groupId: string) => {
        try {
            const { error } = await supabase
                .from('group_snippets')
                .insert({
                    group_id: groupId,
                    snippet_id: snippetId
                });

            if (error) throw error;
            await fetchTemplateGroups();
            await fetchUserSnippets();
        } catch (error) {
            console.error('Error adding snippet to group:', error);
        }
    };

    const removeSnippetFromGroup = async (snippetId: string, groupId: string) => {
        try {
            const { error } = await supabase
                .from('group_snippets')
                .delete()
                .eq('group_id', groupId)
                .eq('snippet_id', snippetId);

            if (error) throw error;
            await fetchTemplateGroups();
            await fetchUserSnippets();
        } catch (error) {
            console.error('Error removing snippet from group:', error);
        }
    };

    useEffect(() => {
        if (user && id) {
            fetchTemplate()
        }
    }, [user, id])

    if (!user || !template || template.user_id !== user.id) {
        return (
            <div className="flex items-center justify-center h-[80vh]">
                <div className="text-center">
                    <p className="text-7xl">😔</p>
                    <p className="text-2xl mt-4">Template not found or access denied</p>
                    <Button
                        className="mt-4"
                        onClick={() => router.push('/templates')}
                    >
                        Back to Templates
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center gap-4 mb-8">
                {/* <Button
                    variant="ghost"
                    onClick={() => router.push('/templates')}
                >
                    <ArrowLeft size={20} />
                </Button> */}
                <h1 className="text-4xl font-bold">{template.name}</h1>
            </div>

            <div className="mb-8">
                <TemplateDialog
                    type="group"
                    mode="create"
                    templateId={id?.toString() || ""}
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
                        fetchTemplateGroups();
                    }}
                />
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {groups.map(group => (
                    <Card
                        key={group.id}
                        className={`transition-all duration-200 ${group.pinned ? 'border-2 border-primary' : ''}`}
                        style={{
                            backgroundColor: group.color ? `${group.color}10` : undefined,
                            borderColor: group.color || undefined
                        }}
                    >
                        <CardHeader>
                            <CardTitle>{group.name}</CardTitle>
                            <CardDescription>{group.description}</CardDescription>
                            <Button
                                variant={'ghost'}
                                className="cursor-pointer"
                                onClick={() => {
                                    setSelectedGroup(group.id);
                                    setIsAddingSnippets(true);
                                    fetchUserSnippets();
                                }}
                            >
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
                                            <div className="flex items-center gap-2">
                                                <Trash2
                                                    color="red"
                                                    size={16}
                                                    className="cursor-pointer hover:opacity-70"
                                                    onClick={() => removeSnippetFromGroup(snippet.id, group.id)}
                                                />
                                                <p className="font-medium">{snippet.title}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge>{snippet.language}</Badge>
                                                <Copy
                                                    size={16}
                                                    className="cursor-pointer hover:opacity-70"
                                                    onClick={async () => {
                                                        await navigator.clipboard.writeText(snippet.code);
                                                        toast.success("Copied to clipboard!");
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <br />
                                        <Textarea
                                            className="min-h-[200px] font-mono overflow-y-scroll max-h-[50vh] cursor-pointer"
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
                                        No available snippets. All snippets might already be in this group.
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
    );
}