import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { useConnectBison } from '../lib/hooks/useApi';
import { toast } from 'sonner';

interface ConnectBisonModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConnectBisonModal({ workspaceId, isOpen, onClose, onSuccess }: ConnectBisonModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { connectBison, connecting: loading } = useConnectBison();
  
  // Reset form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setApiKey('');
      setError(null);
      setSuccess(false);
      setValidationError(null);
    }
  }, [isOpen]);
  
  // Validate API key as user types
  useEffect(() => {
    if (apiKey.trim().length > 0 && apiKey.trim().length < 32) {
      setValidationError('API key should be at least 32 characters long');
    } else {
      setValidationError(null);
    }
  }, [apiKey]);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid Email Bison API key');
      return;
    }
    
    if (apiKey.trim().length < 32) {
      setError('API key should be at least 32 characters long');
      return;
    }

    setError(null);
    
    try {
      const result = await connectBison(workspaceId, apiKey.trim());
      
      if (result.success) {
        setSuccess(true);
        
        // Reset form after success
        setTimeout(() => {
          setApiKey('');
          setSuccess(false);
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError('Failed to connect to Email Bison');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to Email Bison</DialogTitle>
          <DialogDescription>
            Enter your Email Bison API key to connect this workspace. 
            This will enable webhook-based email processing for faster responses.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>Successfully connected to Email Bison!</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="apiKey">Email Bison API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Email Bison API key"
                disabled={loading || success}
                className="font-mono pr-10"
                aria-invalid={!!validationError}
                aria-describedby={validationError ? "api-key-error" : undefined}
              />
              <Button 
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
                disabled={loading || success}
                aria-label={showApiKey ? "Hide API key" : "Show API key"}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {validationError && (
              <p id="api-key-error" className="text-sm text-destructive">{validationError}</p>
            )}
            <p className="text-sm text-muted-foreground">
              You can find your API key in the Email Bison dashboard under Settings → API.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={loading || success}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {success ? 'Connected!' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
