import { Button } from "@/components/ui/button";
import { ArrowRight, GitPullRequest, Timer, TagIcon, Bot } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div>
      <p className="text-5xl font-bold">Development Planner</p>
      <p className="text-gray-500 mt-2">
        Plan your development cycles, features, and releases
      </p>

      <hr className="mt-3" />

      <div className="flex gap-7 mt-[40px] flex-wrap">
        <div className="w-[400px] rounded-lg flex items-center p-4 h-[630px] border light:border-gray-500 dark:border-gray-700">
          <div className="flex flex-col space-y-2">
            <Timer size={70} />
            <p className="text-4xl mt-4">Sprint Planning</p>
            <p className="text-gray-500 text-md">
              Plan sprints, set goals, and manage team capacity
            </p>
            <Link href={'/planner/sprint'}>
              <Button className="flex gap-2 w-[160px] hover:w-[200px] cursor-pointer mt-3">
                Plan Sprint <ArrowRight />
              </Button>
            </Link>

          </div>
        </div>

        <div className="w-[400px] rounded-lg flex items-center p-4 h-[630px] border light:border-gray-500 dark:border-gray-700">
          <div className="flex flex-col space-y-2">
            <GitPullRequest size={70} />
            <p className="text-4xl mt-4">Feature Breakdown</p>
            <p className="text-gray-500 text-md">
              Break down features into manageable tasks and specs
            </p>
            <Link href={'/planner/feature'}>
              <Button className="flex gap-2 w-[160px] hover:w-[200px] cursor-pointer mt-3">
                Plan Feature <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>

        <div className="w-[400px] rounded-lg flex items-center p-4 h-[630px] border light:border-gray-500 dark:border-gray-700">
          <div className="flex flex-col space-y-2">
            <TagIcon size={70} />
            <p className="text-4xl mt-4">Release Planning</p>
            <p className="text-gray-500 text-md">
              Plan releases, set milestones, and manage versions
            </p>
            <Button className="flex gap-2 w-[160px] hover:w-[200px] cursor-pointer mt-3">
              Plan Release <ArrowRight />
            </Button>
          </div>
        </div>

        <div className="w-[1259px] rounded-lg flex items-center py-4 px-8 h-[350px] border light:border-gray-500 dark:border-gray-700">
          <div className="flex flex-col space-y-2">
            <Bot size={70} />
            <p className="text-4xl mt-4">Ask FixFlow AI</p>
            <p className="text-gray-500 text-md">
              Ask AI to do tasks automatically. CRUD different items accross the app.
            </p>
            <Link href={'/ai'}>
              <Button className="flex gap-2 w-[160px] hover:w-[200px] cursor-pointer mt-3">
                Ask AI <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}