'use client';

import supabase from "@/lib/db/supabase";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SnippetDialog } from "@/components/snippets/new-snippet-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardIcon, Plus, Trash2, Pencil } from "lucide-react";

// Add TypeScript interface for snippets
interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  created_at: string;
}

export default function Page() {

  const { user } = useUser();

  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [snippetsLoading, setInitialLoading] = useState(false);

  const pullSnippetsFromDb = async () => {
    setInitialLoading(true);

    const { data: recievedSnippets, error } = await supabase.from('snippets')
      .select('*')
      .eq('user_id', user?.id)

    if (error) throw error;

    setSnippets(recievedSnippets);

    setInitialLoading(false);
  }

  useEffect(() => {
    if (user) {
      pullSnippetsFromDb()
    }
  }, [user])

  const handleCreateSnippet = async (title: string, code: string, language: string) => {
    const { error } = await supabase.from('snippets').insert({
      user_id: user?.id,
      title,
      code,
      language,
    });

    if (error) throw error;
    pullSnippetsFromDb();
  };

  const deleteSnippet = async (id: string) => {
    await supabase.from('snippets')
      .delete()
      .eq('id', id);

    pullSnippetsFromDb();
  }

  const handleEditSnippet = async (id: string, title: string, code: string, language: string) => {
    const { error } = await supabase.from('snippets')
      .update({
        title: title,
        code: code,
        language: language,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
    pullSnippetsFromDb();
  };

  return (
    <div>
      <p className="text-4xl font-bold">Snippets</p>

      <br /><br />

      {/* Conditional Content */}

      {snippetsLoading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
        </div>
      )}

      {snippetsLoading == false && snippets.length === 0 && (
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-7xl">😔</p>
            <br />
            <p className="text-2xl">Sorry, we couldn't find any snippets, please create a new snippet... </p>
            <br />
            <SnippetDialog
              mode="create"
              trigger={<Button variant="default" className="cursor-pointer">New Snippet</Button>}
              onSubmit={handleCreateSnippet}
            />
          </div>
        </div>
      )}

      {snippets.length != 0 && (
        <div>

          <SnippetDialog
            mode="create"
            trigger={<Button variant="secondary" className="cursor-pointer flex gap-3"><Plus /> New Snippet</Button>}
            onSubmit={handleCreateSnippet}
          />

          <br />

          {/* Snippets */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {snippets.map((snippet: Snippet) => (
              <Card key={snippet.id} className="transition-all duration-200 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Trash2
                      size={16}
                      color="red"
                      className="cursor-pointer"
                      onClick={() => deleteSnippet(snippet.id)}
                    />
                    <SnippetDialog
                      trigger={
                        <Pencil
                          size={16}
                          className="cursor-pointer text-muted-foreground hover:text-primary"
                        />
                      }
                      onSubmit={(title, code, language) =>
                        handleEditSnippet(snippet.id, title, code, language)
                      }
                      mode="edit"
                      defaultValues={{
                        title: snippet.title,
                        code: snippet.code,
                        language: snippet.language
                      }}
                    />
                    <p>{snippet.title}</p>
                  </CardTitle>
                  <Badge variant="secondary">{snippet.language}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Textarea
                      value={snippet.code}
                      readOnly
                      className="min-h-[200px] cursor-pointer font-mono text-sm resize-none bg-muted"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        navigator.clipboard.writeText(snippet.code);

                      }}
                    >
                      <ClipboardIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Created {new Date(snippet.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>

            ))}
          </div>

        </div>
      )}

    </div>
  );
}