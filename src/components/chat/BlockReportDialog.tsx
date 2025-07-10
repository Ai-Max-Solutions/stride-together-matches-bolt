import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MoreVertical, Shield, Ban, Flag } from 'lucide-react';

interface BlockReportDialogProps {
  otherUserId: string;
  otherUserName: string;
  onBlock?: () => void;
}

export const BlockReportDialog = ({ otherUserId, otherUserName, onBlock }: BlockReportDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBlock = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: user.id,
          blocked_id: otherUserId,
          reason: blockReason.trim() || 'No reason provided'
        });

      if (error) throw error;

      toast({
        title: "User blocked",
        description: `You have blocked ${otherUserName}. They will no longer be able to contact you.`,
      });

      onBlock?.();
      setShowBlockDialog(false);
    } catch (err: any) {
      toast({
        title: "Failed to block user",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!user || !reportReason.trim()) return;
    
    setLoading(true);
    try {
      // Store report in feedback table for admin review
      const { error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          feedback_type: 'report',
          message: `REPORT: User ${otherUserName} (ID: ${otherUserId})\nReason: ${reportReason}`,
          page_context: 'chat'
        });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for reporting. Our team will review this issue.",
      });

      setShowReportDialog(false);
      setReportReason('');
    } catch (err: any) {
      toast({
        title: "Failed to submit report",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size="sm"
            className="h-7 px-3 text-xs bg-red-700 hover:bg-red-800 text-white border-red-600 shadow-md hover:shadow-lg transition-shadow"
          >
            <MoreVertical className="h-3 w-3 mr-1" />
            Block/Report
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => setShowReportDialog(true)}
            className="text-orange-600 focus:text-orange-600"
          >
            <Flag className="h-4 w-4 mr-2" />
            Report User
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowBlockDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Ban className="h-4 w-4 mr-2" />
            Block User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Block Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-destructive" />
              Block {otherUserName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will prevent {otherUserName} from sending you messages or seeing your profile. 
              You can unblock them later in Settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="block-reason">Reason (optional)</Label>
              <Textarea
                id="block-reason"
                placeholder="Why are you blocking this user?"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBlock}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? 'Blocking...' : 'Block User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-600" />
              Report {otherUserName}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Help us keep Stride Together safe. Please describe the issue you're experiencing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-reason">What happened? *</Label>
              <Textarea
                id="report-reason"
                placeholder="Please describe the issue (inappropriate messages, harassment, fake profile, etc.)"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReport}
              disabled={loading || !reportReason.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};