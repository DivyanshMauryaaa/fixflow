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
import { Checkbox } from "@/components/ui/checkbox"

interface BaseDialogProps {
  trigger: React.ReactNode;
  mode: 'create' | 'edit';
}

interface TemplateDialogProps extends BaseDialogProps {
  type: 'template';
  onSubmit: (name: string, description: string) => Promise<void>;
  defaultValues?: {
    name: string;
    description: string;
  };
}

interface GroupDialogProps extends BaseDialogProps {
  type: 'group';
  templateId: string;
  onSubmit: (name: string, description: string, pinned: boolean, color: string, templateId: string) => Promise<void>;
  defaultValues?: {
    name: string;
    description: string;
    pinned: boolean;
    color: string;
  };
}

type DialogProps = TemplateDialogProps | GroupDialogProps;

export function TemplateDialog(props: DialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState(props.defaultValues?.name ?? "");
  const [description, setDescription] = useState(props.defaultValues?.description ?? "");
  const [pinned, setPinned] = useState(props.type === 'group' ? props.defaultValues?.pinned ?? false : false);
  const [color, setColor] = useState(props.type === 'group' ? props.defaultValues?.color ?? "" : "");

  useEffect(() => {
    if (props.defaultValues) {
      setName(props.defaultValues.name);
      setDescription(props.defaultValues.description);
      if (props.type === 'group') {
        setPinned(props.defaultValues.pinned ?? false);
        setColor(props.defaultValues.color ?? "");
      }
    }
  }, [props.defaultValues, props.type]);

  const handleSubmit = async () => {
    try {
      if (props.type === 'template') {
        await props.onSubmit(name, description);
      } else {
        await props.onSubmit(name, description, pinned, color, props.templateId);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        {props.trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[90vh] max-w-[90vh] overflow-y-scroll">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {props.mode === 'create' 
              ? `Create New ${props.type === 'template' ? 'Template' : 'Group'}`
              : `Edit ${props.type === 'template' ? 'Template' : 'Group'}`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {props.mode === 'create'
              ? props.type === 'template' 
                ? 'Create a new template to organize your snippets'
                : 'Create a new group in this template'
              : `Update your ${props.type === 'template' ? 'template' : 'group'}`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Enter ${props.type} name`}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Enter ${props.type} description`}
            />
          </div>
          {props.type === 'group' && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pin"
                  checked={pinned}
                  onCheckedChange={(checked) => setPinned(checked === true)}
                />
                <Label htmlFor="pin">Pin this group</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="color"
                    id="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <button
                    onClick={() => setColor("")}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Reset color
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>
            {props.mode === 'create' ? 'Create' : 'Save'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}