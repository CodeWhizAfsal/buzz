import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { IChat } from "@/types";
import { Users, X } from "lucide-react";


interface SidebarProps {
  currentChat: IChat | null;
  setShowSidebar: (show: any) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentChat, setShowSidebar }) => {
  return (
    <div className="w-80 border-l border-gray-800 flex flex-col">
      <Card className="flex-1 bg-[#0f1117] border-0 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Chat Details</CardTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowSidebar((prev: boolean) => !prev)}
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={currentChat?.participants[0]?.avatarUrl}
                alt={currentChat?.name}
              />
              <AvatarFallback>{currentChat?.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-2xl font-semibold">{currentChat?.name}</h3>
              <p className="text-sm text-gray-400">
                {currentChat?.participants.length} participants
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="bg-gray-800">
              <CardTitle className="text-lg font-semibold flex items-center text-gray-100">
                <Users className="h-5 w-5 mr-2" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-gray-900 p-0">
              <ScrollArea className="h-[300px]">
                {currentChat?.participants.map((participant: any) => (
                  <div
                    key={participant.id}
                    className="flex items-center py-3 px-4 hover:bg-gray-800 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={participant.avatarUrl}
                        alt={participant.displayName}
                      />
                      <AvatarFallback>
                        {participant.displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="font-medium text-gray-100">
                        {participant.displayName}
                      </div>
                      <div className="text-sm text-gray-400">Online</div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default Sidebar;
