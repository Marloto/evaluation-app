import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
  
  interface ResetConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }
  
  const ResetConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm
  }: ResetConfirmDialogProps) => {
    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Evaluation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all evaluations? This will clear all selected criteria and custom texts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
              Reset All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  
  export default ResetConfirmDialog;