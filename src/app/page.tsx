'use client'

import Image from "next/image";
import { useUser, useClerk } from "@clerk/nextjs";
import { FileCode2, FileText, Folder, FolderOpen, ListTodo, TerminalSquare } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();
  const { openUserProfile } = useClerk();

  const name = user?.firstName;
  const profileImage = user?.imageUrl;

  const quickLinks = [
    {
      label: "Sandbox",
      path: '/sandbox',
      icon: TerminalSquare
    },
    {
      label: "Apps",
      path: '/apps',
      icon: FolderOpen
    },
    {
      label: "Snippets",
      path: '/snippets',
      icon: FileCode2
    },
    {
      label: "Documentation",
      path: '/docs',
      icon: FileText
    },
    {
      label: "Planner",
      path: '/planner',
      icon: ListTodo
    }
  ]

  return (
    <main>

      <div className="">
        <Image
          src={profileImage || "https://via.placeholder.com/300"}
          width={45}
          height={45}
          alt="You"
          className="rounded-full cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => openUserProfile()}
        />

        <br />

        <p className="text-7xl">Hi, <span className="font-bold">{name}</span></p>

        <br /><br />
        <div className="flex gap-4 flex-wrap">
          {quickLinks.map((link: any) => (
            <Link href={link.path} key={link.label}>
              <div className="border p-4 border-gray-300 rounded-lg hover:ring-2 transition-all duration-100 hover:ring-black dark:hover:ring-1 dark:hover:ring-blue-500 dark:border-gray-700 w-[300px] h-[200px]">
                <link.icon size={45} />
                <div>
                  <p className="font-bold text-xl">{link.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

    </main>
  );
}
