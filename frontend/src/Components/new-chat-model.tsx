import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function NewChatModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (participants: string, chatName: string) => void;
}) {
  const [participants, setParticipants] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [chatName, setChatName] = useState("");

  const handleAddParticipant = () => {
    if (email && !participants.includes(email)) {
      setParticipants([...participants, email]);
      setEmail("");
    }
  };

  const handleRemoveParticipant = (emailToRemove: any) => {
    setParticipants(participants.filter((email) => email !== emailToRemove));
  };

  const handleSubmit = () => {
    console.log("PARTICIPANTS", participants);
    onSubmit(participants.join(","), chatName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Start New Chat
          </DialogTitle>
          <DialogDescription>
            Create a new chat by adding participants and setting a name.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email of users"
              className="col-span-3 bg-gray-700 border-gray-600"
            />
          </div>
          <Button
            onClick={handleAddParticipant}
            className="ml-auto"
            variant="secondary"
          >
            Add Participant
          </Button>
          {participants.length > 0 && (
            <div className="border border-gray-700 rounded-md p-2">
              <Label className="mb-2 block">Participants:</Label>
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => (
                  <div
                    key={p}
                    className="flex items-center bg-gray-700 rounded-full pl-2 pr-1 py-1"
                  >
                    <Avatar className="h-6 w-6 mr-1">
                      <AvatarFallback>{p[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm mr-1">{p}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 rounded-full p-0"
                      onClick={() => handleRemoveParticipant(p)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chatName" className="text-right">
              Chat Name
            </Label>
            <Input
              id="chatName"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              placeholder="Enter chat name"
              className="col-span-3 bg-gray-700 border-gray-600"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={participants.length === 0 || !chatName}
          >
            Start Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
