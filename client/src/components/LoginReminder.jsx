import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"

function LoginReminder({ status, onAcknowledge }) {

  if (!status || !status.isNeeded) {
    return null;
  }

  return (
    <AlertDialog open={true} onOpenChange={onAcknowledge}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>End of Month Reminder</AlertDialogTitle>
          <AlertDialogDescription>
            The financial month for {status.eomDateInfo.monthName} {status.eomDateInfo.year} is ready to be closed. Please run the End of Month process soon.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onAcknowledge}>Dismiss</AlertDialogCancel>
          {/* A button to navigate to settings could be added here in the future */}
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LoginReminder;