
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Plus, Users, UserPlus, Clock, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import TeamDetails from '@/components/team/TeamDetails';

const Teams = () => {
  const { user, groups, createGroup, joinGroup } = useAuth();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  // Create group form state
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDepartment, setNewGroupDepartment] = useState('');
  const [newGroupPasscode, setNewGroupPasscode] = useState('');
  
  // Join group form state
  const [joinGroupId, setJoinGroupId] = useState('');
  const [joinPasscode, setJoinPasscode] = useState('');
  
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    await createGroup(newGroupName, newGroupDepartment, newGroupPasscode);
    setIsCreateDialogOpen(false);
    resetCreateForm();
  };
  
  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    await joinGroup(joinGroupId, joinPasscode);
    setIsJoinDialogOpen(false);
    resetJoinForm();
  };
  
  const resetCreateForm = () => {
    setNewGroupName('');
    setNewGroupDepartment('');
    setNewGroupPasscode('');
  };
  
  const resetJoinForm = () => {
    setJoinGroupId('');
    setJoinPasscode('');
  };
  
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  
  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">Manage your teams and view team stats</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Join Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Join a Team</DialogTitle>
                <DialogDescription>
                  Enter the team ID and passcode to join.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleJoinGroup} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="team-id">Team ID</Label>
                  <Input 
                    id="team-id" 
                    value={joinGroupId}
                    onChange={(e) => setJoinGroupId(e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="passcode">Passcode</Label>
                  <Input 
                    id="passcode" 
                    type="password"
                    value={joinPasscode}
                    onChange={(e) => setJoinPasscode(e.target.value)}
                    required
                  />
                </div>
                
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsJoinDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Join Team</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create a New Team</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new team.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateGroup} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input 
                    id="team-name" 
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Cardiology Team 1"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input 
                    id="department" 
                    value={newGroupDepartment}
                    onChange={(e) => setNewGroupDepartment(e.target.value)}
                    placeholder="e.g. Cardiology"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="team-passcode">Team Passcode</Label>
                  <Input 
                    id="team-passcode" 
                    type="password"
                    value={newGroupPasscode}
                    onChange={(e) => setNewGroupPasscode(e.target.value)}
                    placeholder="Create a passcode for your team"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Share this passcode with team members to let them join.
                  </p>
                </div>
                
                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Team</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {groups.length > 0 ? (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="stats">Team Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <Card key={group.id}>
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>{group.department}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{group.members.length} members</span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        Team ID: {group.id}
                      </div>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedGroupId(group.id)}
                          >
                            View Details
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-lg">
                          {selectedGroup && (
                            <TeamDetails 
                              group={selectedGroup}
                              onClose={() => setSelectedGroupId(null)}
                            />
                          )}
                        </SheetContent>
                      </Sheet>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="space-y-6">
            {groups.map((group) => (
              <Card key={`members-${group.id}`} className="mb-6">
                <CardHeader>
                  <CardTitle>{group.name} - Members</CardTitle>
                  <CardDescription>{group.members.length} total members</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {group.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">{member.role}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.id === group.createdBy ? 'Team Creator' : 'Member'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Working Hours</CardTitle>
                <CardDescription>Weekly hours worked by team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Team statistics coming soon</p>
                    <p className="text-sm mt-2">Track your team's working hours and view reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Users className="w-12 h-12 mb-4 opacity-20" />
          <h3 className="text-2xl font-medium mb-2">No Teams Yet</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Create a team to collaborate with your colleagues or join an existing team using a team ID and passcode.
          </p>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setIsJoinDialogOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              Join Team
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Create Team
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
