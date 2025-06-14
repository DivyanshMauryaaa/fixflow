'use client';

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "../ui/button";

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "c#",
  "ruby",
  "go",
  "rust",
  "php",
  "html",
  "css",
  "sql",
  "shell",
  "markdown"
] as const;

interface SnippetDialogProps {
  trigger: React.ReactNode;
  mode: 'create' | 'edit';
  defaultValues?: {  // Changed from initialData to defaultValues
    title: string;
    code: string;
    language: string;
    color: string;
    pinned: boolean;
    category: string;
  };
  onSubmit: (title: string, code: string, language: string, pinned: boolean) => Promise<void>;
}

// Rename component to reflect it handles both new and edit modes
export function SnippetDialog({
  trigger,
  mode = 'create',
  defaultValues,  // Changed from initialData
  onSubmit
}: SnippetDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState(defaultValues?.title ?? "");
  const [snippetCode, setSnippetCode] = useState(defaultValues?.code ?? "");
  const [snippetlang, setSnippetlang] = useState(defaultValues?.language ?? "");
  const [snippetColor, setSnippetColor] = useState(defaultValues?.color);
  const [snippetPinned, setSnippetPinned] = useState(defaultValues?.pinned);
  const [snippetCategory, setSnippetCategory] = useState(defaultValues?.category)

  // Update form when dialog opens or defaultValues change
  useEffect(() => {
    if (defaultValues) {
      setSnippetTitle(defaultValues.title);
      setSnippetCode(defaultValues.code);
      setSnippetlang(defaultValues.language);
    }
  }, [defaultValues]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isDialogOpen && mode === 'create') {
      setSnippetTitle("");
      setSnippetCode("");
      setSnippetlang("");
    }
  }, [isDialogOpen, mode]);

  const handleSubmit = async () => {
    try {
      await onSubmit(snippetTitle, snippetCode, snippetlang, snippetPinned ?? false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting snippet:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault(); // Prevent default browser save
      handleSubmit();
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[90vh] max-w-[90vh] overflow-y-scroll">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {mode === 'create' ? 'Create New Snippet' : 'Edit Snippet'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {mode === 'create'
              ? 'Add a new code snippet to your collection'
              : 'Update your code snippet'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={snippetTitle}
              onChange={(e) => setSnippetTitle(e.target.value)}
              placeholder="Enter snippet title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={snippetlang}
              onValueChange={setSnippetlang}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="code">Code</Label>
            <Textarea
              id="code"
              value={snippetCode}
              onChange={(e) => setSnippetCode(e.target.value)}
              placeholder="Paste your code here"
              className="font-mono max-h-[400px] overflow-y-scroll"
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="">
            <div className="flex justify between gap-4">
              <Label htmlFor="color">Color: </Label>
              <Input type="color"
                value={snippetColor}
                onChange={(e) => setSnippetColor(e.target.value || '')}
                placeholder="Color Coding (optional)"
                className="cursor-pointer rounded-full h-[40px] w-[60px]"
                id="color"
              />
              <br />
              <Button
                variant={"ghost"}
                className="cursor-pointer"
                onClick={() => setSnippetColor('')}
              >Set default color</Button>
            </div>
            {snippetColor === '' && (
              <p className="text-gray-500">No color selected</p>
            )}
            <br />

          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="pin"
              checked={snippetPinned}
              onCheckedChange={(checked) => setSnippetPinned(checked === true)}
            />
            <Label
              htmlFor="pin"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Pin this snippet
            </Label>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>
            {mode === 'create' ? 'Create' : 'Save'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}