'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import supabase from "@/lib/db/supabase";
import { useUser } from "@clerk/nextjs";
import { FolderOpen, Loader2 } from "lucide-react";
import { useState } from "react"
import { useRouter } from "next/navigation";

const newPage = () => {
  const router = useRouter();
  const [appName, setAppname] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [appPurpose, setAppPurpose] = useState("");
  const [appTargetAudience, setTargetAudince] = useState("");
  const [appStatus, setAppStatus] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [error, setError] = useState("")

  const { user } = useUser();

  const createApp = async () => {
    setAddLoading(true)
    setError("")

    if (!appName || !appDescription || !appPurpose || !appTargetAudience || !appStatus) {
      setError("Please fill in all fields except Github Repository URL.");
      setAddLoading(false);
      return;
    }
    setError("");

    const { error } = await supabase.from('apps')
      .insert({
        name: appName,
        description: appDescription,
        problem_statement: appPurpose,
        target_audience: appTargetAudience,
        status: appStatus,
        repository_url: repoUrl,
        user_id: user?.id
      });

    if (error) setError(error.message);
    if (!error) {
      const { toast } = await import("sonner");
      toast.success("App created successfully!");
      setAppname("");
      setAppDescription("");
      setAppPurpose("");
      setTargetAudince("");
      setAppStatus("");
      setRepoUrl("");
      router.push('/apps')
    }
    setAddLoading(false)
  }

  if (!user) {
    <div className="text-center text-7xl flex flex-col items-center">Sorry, we couldn't find the user</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex gap-5 items-center border-gray-700 max-w-[930px] w-full">
        <p className="text-5xl text-center mb-4 min-w-[360px] text-start">
          <FolderOpen size={64} className="mb-3" />
          Create a <span className="text-blue-600">new App</span>
        </p>
        {/* Form */}
        <div className="w-full flex flex-col gap-3">
          <Input
            placeholder="App name"
            value={appName}
            onChange={(e) => setAppname(e.target.value)}
          />

          <Textarea
            placeholder="Description"
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            className="mt-1"
            maxLength={2000}
          />

          <Input
            placeholder="What is the purpose of the app?"
            value={appPurpose}
            onChange={(e) => setAppPurpose(e.target.value)}
          />

          <Input
            placeholder="Github Repository url"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />

          <Input
            placeholder="Whom are you targetting?"
            value={appTargetAudience}
            onChange={(e) => setTargetAudince(e.target.value)}
          />

          <div className="flex gap-2 flex-wrap py-2 justify-center">
            <div className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer" onClick={() => setTargetAudince("Students")}>Students</div>
            <div className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer" onClick={() => setTargetAudince("Working Professionals")}>Working Professionals</div>
            <div className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer" onClick={() => setTargetAudince("Developers")}>Developers</div>
            <div className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer" onClick={() => setTargetAudince("Companies")}>Companies</div>
            <div className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer" onClick={() => setTargetAudince("Other")}>Other</div>
          </div>

          <Input
            placeholder="What is the current status of the app?"
            value={appStatus}
            onChange={(e) => setAppStatus(e.target.value)}
          />

          <div className="flex gap-2 flex-wrap py-2 justify-center">
            <div className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer" onClick={() => setAppStatus("Idea")}>Idea</div>
            <div className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer" onClick={() => setAppStatus("Production")}>Production</div>
            <div className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer" onClick={() => setAppStatus("In Progress")}>In Progress</div>
            <div className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer" onClick={() => setAppStatus("Delayed")}>Delayed</div>
            <div className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full cursor-pointer" onClick={() => setAppStatus("Other")}>Other</div>
          </div>

          <Button className="cursor-pointer"
            onClick={createApp}
            disabled={addLoading}
          >{addLoading ? <p className="animate-spin"><Loader2 /></p> : <p>Create App</p>}</Button>

          <p className="text-red-600">{error}</p>

        </div>
      </div>
    </div>
  )
}

export default newPage;