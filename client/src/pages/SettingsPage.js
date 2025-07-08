import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import CategoryManager from '../components/settings/CategoryManager';
import VendorManager from '../components/settings/VendorManager';
import RecurringBillsManager from '../components/settings/RecurringBillsManager';
import ApplicationSettings from '../components/settings/ApplicationSettings';

function SettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="bills">Recurring Bills</TabsTrigger>
          <TabsTrigger value="app">Application</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>Add, edit, or delete your spending categories and subcategories here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2"><CategoryManager /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Manage Vendors</CardTitle>
              <CardDescription>Clean up and manage vendor names that are automatically detected.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2"><VendorManager /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills">
          <Card>
            <CardHeader>
              <CardTitle>Manage Recurring Bills</CardTitle>
              <CardDescription>Set up and manage your scheduled recurring payments for the cashflow forecast.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2"><RecurringBillsManager /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app">
          <ApplicationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;
