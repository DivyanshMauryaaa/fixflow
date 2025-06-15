"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import styles from "./editor.module.css";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";
import { Play } from "lucide-react";

export default function SandboxPage() {
    const [lang, setLang] = useState("python");
    const [code, setCode] = useState(SUPPORTED_LANGUAGES[0].defaultCode);
    const [output, setOutput] = useState<string | null>(null);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const runCode = async () => {
        setIsLoading(true);
        setOutput(null);

        const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.key === lang);

        if (!selectedLang) {
            setOutput("⚠️ Selected language not supported.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-RapidAPI-Key": "c1d8e46523msh2312ae3c879887fp186dd4jsn8eb05c7ae426",
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: selectedLang.id,
                    stdin: input,
                }),
            });

            const data = await response.json();

            const result = data.stdout || data.stderr || data.compile_output || "⚠️ No output returned.";
            setOutput(result);
        } catch (error) {
            setOutput("❌ Error executing code. Try again.");
            console.error("[FixFlow Sandbox Error]", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl space-y-5">
            <h1 className="text-5xl font-bold">Sandbox</h1>

            <div className="flex items-center gap-4">
                <Select defaultValue={lang} onValueChange={(val) => {
                    const selected = SUPPORTED_LANGUAGES.find(l => l.key === val);
                    if (selected) {
                        setLang(val);
                        setCode(selected.defaultCode);
                    }
                }}>
                    <SelectTrigger className="w-[180px] cursor-pointer">
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <SelectItem key={lang.key} value={lang.key}>{lang.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={runCode} disabled={isLoading} className="cursor-pointer">
                    <Play className="mr-1 h-4 w-4" /> {isLoading ? "Running..." : "Run Code"}
                </Button>
            </div>

            {/* CODE EDITOR */}
            <div className="">
                <div className={styles.editorWrapper}>
                    <Editor
                        height="600px"
                        width="100%"
                        theme="vs-dark"
                        defaultLanguage={lang}
                        language={lang}
                        value={code}
                        onChange={(val: any) => val && setCode(val)}
                    />
                </div>

                {/* INPUT SECTION */}
                <Card className="p-5 mt-5">
                    <p className="font-mono font-bold">Input (stdin)</p>
                    <hr />
                    <CardContent className="p-4">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your input here..."
                            className="w-full min-h-[100px] resize-y font-mono text-sm bg-zinc-900 text-white p-3 rounded-lg outline-none"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            This input gets passed as <code>stdin</code> to your program.
                        </p>
                    </CardContent>
                </Card>

                {/* OUTPUT SECTION */}
                <Card className="p-5 mt-5">
                    <p className="font-mono font-bold">Terminal</p>
                    <hr />
                    <CardContent className="font-mono text-sm p-4 min-h-[150px] min-w-[450px]">
                        {output ?? "Output appears here..."}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
