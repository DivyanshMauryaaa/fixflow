import { Button } from "@/components/ui/button";
import { ArrowRight, Blocks, CheckCircle2, FolderOpen } from "lucide-react";

export default function Page() {
  return (
    <div>
      <p className="text-5xl font-bold">AI App Planner</p>

      <hr className="mt-3" />

      <div className="flex gap-7 mt-[40px] flex-wrap">

        <div className="w-[400px] rounded-lg flex items-center p-4 h-[630px] border light:border-gray-500 dark:border-gray-700">
          <div className="flex flex-col space-y-2">
            <CheckCircle2 size={70} />

            <p className="text-4xl mt-4 ">Plan a new Feature</p>
            <p className="text-gray-500 text-md">
              Efficiently plan a new feature for your app using AI
            </p>
            <Button className="flex gap-2 w-[160px] hover:w-[200px] cursor-pointer mt-3">Plan new Feature <ArrowRight /></Button>
          </div>
        </div>

        <div className="w-[400px] rounded-lg flex items-center p-4 h-[630px] border light:border-gray-500 dark:border-gray-700">
          <div className="flex flex-col space-y-2">
            <FolderOpen size={70} />

            <p className="text-4xl mt-4 ">Plan a new App</p>
            <p className="text-gray-500 text-md">
              Plan a new App, find the best tech stack, algorithms etc. using AI.
            </p>

            <Button className="flex gap-2 w-[160px] hover:w-[200px] cursor-pointer mt-3">Plan new App <ArrowRight /></Button>
          </div>
        </div>

        <div className="w-[400px] rounded-lg flex items-center p-4 h-[630px] border light:border-gray-500 dark:border-gray-700">
          <div className="flex flex-col space-y-2">
            <Blocks size={70} />

            <p className="text-4xl mt-4 ">Plan a new Project</p>
            <p className="text-gray-500 text-md">
              Plan a new Project, organize tasks, set milestones.
            </p>
            <Button className="flex gap-2 w-[160px] hover:w-[200px] cursor-pointer mt-3">Plan new Project <ArrowRight /></Button>
          </div>
        </div>


      </div>
    </div>
  );
}