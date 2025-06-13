'use client'

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Folder, TerminalSquare } from "lucide-react";
import Link from "next/link";

export default function Home() {

  const { user } = useUser();

  const name = user?.firstName;
  const profileImage = user?.imageUrl;

  const quickLinks = [
    {
      label: "Cloud Sandbox",
      path: '/',
      icon: TerminalSquare
    },
    {
      label: "Projects",
      path: '/',
      icon: Folder
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
          className="rounded-full"
        />

        <br />

        <p className="text-7xl">Hi, <span className="font-bold">{name}</span></p>
      
        {quickLinks.map((link: any) => (
          <Link href={link.path} key={link.label}>
            <div className=""></div>
          </Link>
        ))}

      </div>

    </main>
  );
}
