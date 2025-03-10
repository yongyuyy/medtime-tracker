
import React from 'react';
import { format } from 'date-fns';
import { useAuth, Group } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash, UserMinus, Copy, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

interface TeamDetailsProps {
  group: Group;
  onClose: () => void;
}

const TeamDetails: React.FC<TeamDetailsProps> = ({ group, onClose }) => {
  const { user, leaveGroup, deleteGroup } = useAuth();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = React.useState(false);
  
  const isCreator = user?.id === group.createdBy;
  
  const copyTeamId = () => {
    navigator.clipboard.writeText(group.id);
    toast.success('Team ID copied to clipboard');
  };
  
  const copyPasscode = () => {
    navigator.clipboard.writeText(group.passcode);
    toast.success('Team passcode copied to clipboard');
  };
  
  const handleLeaveTeam = async () => {
    await leaveGroup(group.id);
    setIsLeaveDialogOpen(false);
    onClose();
  };
  
  const handleDeleteTeam = async () => {
    await deleteGroup(group.id);
    setIsDeleteDialogOpen(false);
    onClose();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{group.name}</span>
          <Badge variant="outline">{group.department}</Badge>
        </CardTitle>
        <CardDescription>
          Team details and management
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="details">
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="details" className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Team ID</h4>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm">{group.id}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyTeamId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Team Passcode</h4>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-mono text-sm">••••••</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyPasscode}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Created By</h4>
              <p className="mt-1">{group.members.find(m => m.id === group.createdBy)?.name || 'Unknown'}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Created On</h4>
              <p className="mt-1">{format(new Date(group.createdAt), 'MMMM d, yyyy')}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Total Members</h4>
              <p className="mt-1">{group.members.length} members</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4 p-6">
          {group.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.profileImage} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <div>
                {member.id === group.createdBy && (
                  <Badge variant="outline">Creator</Badge>
                )}
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      <CardFooter className="justify-between py-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        
        <div className="flex gap-2">
          {isCreator ? (
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="flex items-center gap-1">
                  <Trash className="h-4 w-4" />
                  Delete Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Team</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete the team "{group.name}"? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDeleteTeam}>Delete Team</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-500 border-red-200">
                  <UserMinus className="h-4 w-4" />
                  Leave Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Leave Team</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to leave the team "{group.name}"?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>Cancel</Button>
                  <Button variant="default" onClick={handleLeaveTeam}>Leave Team</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default TeamDetails;
