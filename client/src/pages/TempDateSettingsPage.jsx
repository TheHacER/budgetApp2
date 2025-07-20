import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

function TempDateSettingsPage() {
    const [currentDate, setCurrentDate] = useState('');
    const [newDate, setNewDate] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        api.getSystemDate().then(data => {
            setCurrentDate(data.currentDate);
            setNewDate(data.currentDate);
        });
    }, []);

    const handleSetDate = async () => {
        try {
            const response = await api.setSystemDate(newDate);
            setMessage(response.message + ". The app will now reload.");
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setMessage(`Error: ${err.message}`);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-3xl font-bold mb-6">Temporary Date Override</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Set System Date</CardTitle>
                    <CardDescription>
                        This is a temporary tool for testing the End-of-Month process. Set a date here to make the application believe it is that day.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p><strong>Current Effective Date:</strong> {new Date(currentDate).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="flex items-center gap-4">
                        <div className="grid gap-1.5">
                            <Label htmlFor="date-override">New Date</Label>
                            <Input id="date-override" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                        </div>
                        <Button onClick={handleSetDate} className="self-end">Set Date & Reload</Button>
                    </div>
                </CardContent>
                {message && (
                    <CardFooter>
                        <p className="text-sm text-primary">{message}</p>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}

export default TempDateSettingsPage;