import { useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Textarea } from './textarea';
import { Label } from './label';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  requireReason?: boolean;
  reasonLabel?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  requireReason = false,
  reasonLabel = 'Reason',
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      return;
    }
    onConfirm(requireReason ? reason : undefined);
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  const Icon = variant === 'destructive' ? AlertTriangle : CheckCircle;
  const iconColor = variant === 'destructive' ? 'text-destructive' : 'text-success';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <Icon className={`h-6 w-6 mt-0.5 ${iconColor}`} />
            <div className="flex-1">
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {requireReason && (
            <div>
              <Label htmlFor="reason">{reasonLabel} *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={`Enter ${reasonLabel.toLowerCase()}...`}
                rows={3}
                className="mt-1"
              />
              {requireReason && !reason.trim() && (
                <p className="text-xs text-destructive mt-1">This field is required</p>
              )}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              {cancelText}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={handleConfirm}
              disabled={requireReason && !reason.trim()}
            >
              {confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
