'use client'

import { FolderOpen, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import supabase from "@/lib/db/supabase";
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Page() {

  const { user } = useUser();
  const [apps, setApps] = useState<any>([]);
  const [appsLoading, setLoading] = useState(true);

  const pullApps = async () => {
    const { data, error } = await supabase.from('apps')
      .select('*')
      .eq('user_id', user?.id)
      .order("created_at", { ascending: false })

    if (error) throw error;
    setApps(data)

    setLoading(false)
  }

  const addApp = async (object: any) => {
    setLoading(true)

    //Request Insert
    const { error } = await supabase.from('apps').insert(object);
    if (error) console.error(error);

    pullApps();

    setLoading(false)
  }

  const deleteApp = async (id: string) => {
    setLoading(true)

    //Request Delete
    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', id);

    if (error) throw error;

    pullApps();

    setLoading(false)
  }

  const editApp = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('apps')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await pullApps(); // Refresh the apps list
    } catch (error) {
      console.error('Error updating app:', error);
    }
  };

  useEffect(() => {
    if (user) {
      pullApps();
    }
  }, [user])

  return (
    <div>
      <p className="font-bold text-5xl flex gap-3 border-b py-4"><FolderOpen /> Apps</p>
      <br />

      <Button onClick={() => addApp({
        name: "Untitled",
        description: "Untitled",
        user_id: user?.id,
      })} className="cursor-pointer">Add</Button>

      <br /><br />

      <div className="space-y-4">
        {appsLoading && (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
          </div>
        )}

        {apps.map((app: any) => (
          <Card key={app.id}>
            <CardHeader>
              <div className="flex gap-3">
                <FolderOpen />
                <p
                  className="text-3xl font-semibold focus:outline-none"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={async (e) => {
                    await editApp(app.id, {
                      name: e.target.textContent?.trim() || "Untitled"
                    });
                  }}
                >
                  {app.name}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <p
                className="text-md focus:outline-none"
                contentEditable
                suppressContentEditableWarning
                onBlur={async (e) => {
                  await editApp(app.id, {
                    description: e.target.textContent?.trim() || "Untitled"
                  });
                }}
              >
                {app.description}
              </p>
            </CardContent>
            <CardAction className="px-5">
              <div className="flex gap-3">
                <Button variant={'destructive'} className="cursor-pointer" onClick={() => deleteApp(app.id)}><Trash2 /></Button>

                <Link href={`/apps/${app.id}`}>
                  <Button variant={'secondary'} className="cursor-pointer">Open App</Button>
                </Link>
              </div>
            </CardAction>
          </Card>
        ))}
      </div>

    </div>
  );
}