import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import CategoryManager from '../components/settings/CategoryManager';
import VendorManager from '../components/settings/VendorManager';
import RecurringBillsManager from '../components/settings/RecurringBillsManager';
import ApplicationSettings from '../components/settings/ApplicationSettings';
import SavingsManager from '../components/settings/SavingsManager';
import PlannedIncomeManager from '../components/settings/PlannedIncomeManager';
import BudgetUploadTool from '../components/settings/BudgetUploadTool';

function SettingsPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-7">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="bills">Recurring Bills</TabsTrigger>
          <TabsTrigger value="income">Planned Income</TabsTrigger>
          <TabsTrigger value="savings_accounts">Savings Accounts</TabsTrigger>
          <TabsTrigger value="budget_tools">Budget Tools</TabsTrigger>
          <TabsTrigger value="app">Application</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader><CardTitle>Manage Categories</CardTitle><CardDescription>Add, edit, or delete your spending categories and link them to savings accounts.</CardDescription></CardHeader>
            <CardContent className="space-y-2"><CategoryManager /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader><CardTitle>Manage Vendors</CardTitle><CardDescription>Clean up and manage vendor names.</CardDescription></CardHeader>
            <CardContent className="space-y-2"><VendorManager /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills">
          <Card>
            <CardHeader><CardTitle>Manage Recurring Bills</CardTitle><CardDescription>Set up scheduled payments for the cashflow forecast.</CardDescription></CardHeader>
            <CardContent className="space-y-2"><RecurringBillsManager /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
           <Card>
            <CardHeader><CardTitle>Manage Planned Income</CardTitle><CardDescription>Set up recurring income sources like salaries.</CardDescription></CardHeader>
            <CardContent className="space-y-2"><PlannedIncomeManager /></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings_accounts">
           <Card>
            <CardHeader><CardTitle>Manage Savings Accounts</CardTitle><CardDescription>Define your savings accounts. Goals are managed on the Savings page.</CardDescription></CardHeader>
            <CardContent className="space-y-2"><SavingsManager /></CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="budget_tools">
            <BudgetUploadTool />
        </TabsContent>

        <TabsContent value="app">
          <ApplicationSettings />
        </TabsContent>

      </Tabs>
    </div>
  );
}

export default SettingsPage;