
import React, { useState } from 'react';
import { useTimeEntries } from '@/context/TimeEntriesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Settings = () => {
  const { workSchedule, updateWorkSchedule } = useTimeEntries();
  const [formValues, setFormValues] = useState({
    regularHoursPerWeek: workSchedule.regularHoursPerWeek.toString(),
    defaultStartTime: workSchedule.defaultStartTime,
    defaultEndTime: workSchedule.defaultEndTime,
  });
  const [isDirty, setIsDirty] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
    setIsDirty(true);
  };
  
  const handleResetToDefaults = () => {
    setFormValues({
      regularHoursPerWeek: '39',
      defaultStartTime: '07:00',
      defaultEndTime: '17:00',
    });
    setIsDirty(true);
  };
  
  const handleSaveChanges = () => {
    updateWorkSchedule({
      regularHoursPerWeek: parseInt(formValues.regularHoursPerWeek, 10),
      defaultStartTime: formValues.defaultStartTime,
      defaultEndTime: formValues.defaultEndTime,
    });
    setIsDirty(false);
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Customize your time tracking preferences</p>
      
      <div className="section-container max-w-2xl mx-auto">
        <h2 className="section-title">Work Schedule</h2>
        <p className="text-muted-foreground mb-6">Configure your regular work hours</p>
        
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="regularHoursPerWeek">Regular Hours Per Week</Label>
            <Input
              id="regularHoursPerWeek"
              name="regularHoursPerWeek"
              type="number"
              value={formValues.regularHoursPerWeek}
              onChange={handleChange}
              min="1"
              max="168"
            />
            <p className="text-sm text-muted-foreground">
              Hours beyond this will count as overtime
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="defaultStartTime">Default Start Time</Label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <Input
                  id="defaultStartTime"
                  name="defaultStartTime"
                  type="time"
                  value={formValues.defaultStartTime}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Your typical workday start time
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="defaultEndTime">Default End Time</Label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <Input
                  id="defaultEndTime"
                  name="defaultEndTime"
                  type="time"
                  value={formValues.defaultEndTime}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Your typical workday end time
              </p>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleResetToDefaults}
            >
              Reset to Defaults
            </Button>
            <Button 
              type="button"
              onClick={handleSaveChanges}
              disabled={!isDirty}
              className="bg-black text-white hover:bg-black/90"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
      
      {/* Future settings sections can be added here */}
      {/* 
      <div className="section-container mt-8 max-w-2xl mx-auto">
        <h2 className="section-title">Appearance</h2>
        <p className="text-muted-foreground mb-6">Customize the look and feel of the application</p>
        
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Dark Mode</h3>
              <p className="text-sm text-muted-foreground">
                Toggle between light and dark mode
              </p>
            </div>
            <div>
              Switch component would go here
            </div>
          </div>
        </div>
      </div>
      */}
    </div>
  );
};

export default Settings;
