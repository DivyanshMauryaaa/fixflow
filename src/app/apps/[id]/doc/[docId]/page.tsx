'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import supabase from "@/lib/db/supabase"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, SaveIcon, Edit2, Eye, FileIcon } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface DocumentPageParams {
    id: string
    docId: string
}

export default function DocumentPage() {
    const params = useParams() as unknown as DocumentPageParams
    const docId = params.docId as string
    const appId = params.id as string

    const { user } = useUser();
    const [doc, setDoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState("");
    const [mode, setMode] = useState("render");

    const fetchDocument = async () => {
        const { data, error } = await supabase
            .from('app_documents')
            .select('*')
            .eq('id', docId)
            .single()

        if (error) throw error
        setDoc(data)
        setContent(data.content)
        setLoading(false)
    }

    const saveDocument = async () => {
        setLoading(true)
        const { error } = await supabase
            .from('app_documents')
            .update({ content })
            .eq('id', docId)

        if (error) throw error
        setLoading(false)
    }

    useEffect(() => {
        if (user && docId) {
            fetchDocument();
        }
    }, [user, docId])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
            </div>
        )
    }

    if (!doc) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-xl">Document not found</p>
                <Link href={`/apps/${appId}`}>
                    <Button>Back to App</Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 space-y-4">

            <div className="flex items-center justify-between p-4 border-b">
                {/* <FileIcon size={48} /> */}
                <h1 className="text-5xl"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={async (e) => {
                        await supabase.from('app_documents')
                            .update({
                                title: e.target.textContent
                            }).eq('id', docId);
                    }}
                >{doc.title}</h1>
                <div className="space-x-2 flex gap-3">
                    <Link href={`/apps/${appId}`}>
                        <Button variant="outline"><ArrowLeft /></Button>
                    </Link>
                    <Button
                        variant="outline"
                        onClick={() => setMode(mode === 'edit' ? 'render' : 'edit')}
                    >
                        {mode === 'edit' ? <Eye className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                        {mode === 'edit' ? 'Preview' : 'Edit'}
                    </Button>
                    <Button
                        onClick={saveDocument}
                        disabled={loading}
                        className="flex gap-2 cursor-pointer"
                    >
                        <SaveIcon />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="min-h-[500px] px-8 py-4 border border-gray-300 dark:border-gray-700 rounded-lg">
                {mode === 'edit' ? (
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[500px] max-h-[700px] font-mono"
                        placeholder="Enter your document content..."
                    />
                ) : (
                    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto dark:prose-invert whitespace-pre-wrap max-h-[700px] overflow-y-scroll">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-4xl font-bold my-4" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-2xl font-bold my-3" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-xl font-bold my-2" {...props} />,
                                h4: ({node, ...props}) => <h4 className="text-xl font-bold my-2" {...props} />,
                                h5: ({node, ...props}) => <h5 className="text-lg font-bold my-1" {...props} />,
                                h6: ({node, ...props}) => <h6 className="text-base font-bold my-1" {...props} />,
                                p: ({node, ...props}) => <p className="mb-4" {...props} />,
                                br: ({node, ...props}) => <br className="mb-2" {...props} />,
                                code: ({node, ...props}) => <code className="py-1 px-2 rounded-md bg-gray-400 text-black dark:bg-gray-800 dark:text-red-400" {...props} />,
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    )
}