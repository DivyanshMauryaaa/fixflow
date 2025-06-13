import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";

const notFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div>
                <p className="text-7xl dark:text-white text-gray-950 font-bold">404</p>
                <p className="text-4xl dark:text-white text-gray-950 w-[600px]">Sorry, the page you were looking for was not found....</p>
                <br />
                <Link href={'/'}>
                    <Button variant={'secondary'} className="cursor-pointer "><Home />Home</Button>
                </Link>
            </div>
        </div>
    )
}

export default notFound;