import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ConnectBisonModal } from './connect-bison-modal';
import { Settings, Link, RefreshCw } from 'lucide-react';
import { useWorkspaceStatus } from '../lib/hooks/useApi';
import { toast } from 'sonner';

interface WorkspaceSettingsProps {
  workspaceId: string;
  workspaceName: string;
}

interface WorkspaceStatus {
  connected: boolean;
  bisonWorkspaceId?: string;
  bisonWorkspaceName?: string;
}

export function WorkspaceSettings({ workspaceId, workspaceName }: WorkspaceSettingsProps) {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const { status: apiStatus, loading, error, refetch: fetchStatus } = useWorkspaceStatus(workspaceId);
  
  // Transform API status to component status
  const status: WorkspaceStatus = {
    connected: apiStatus?.is_connected || false,
    bisonWorkspaceId: apiStatus?.bison_workspace_id,
    bisonWorkspaceName: apiStatus?.bison_workspace_name || 'Email Bison Workspace'
  };
  
  // Show error toast if there was an error fetching status
  if (error) {
    toast.error('Failed to fetch workspace status');
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Email Bison Integration</span>
            {status.connected && (
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100">
                Connected
              </Badge>
            )}
            {!status.connected && !loading && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100">
                Not Connected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Connect this workspace to Email Bison to enable webhook-based email processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {status.connected && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Bison Workspace:</span>
                  <span className="font-medium">{status.bisonWorkspaceName || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Webhook Status:</span>
                  <span className="font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Email Processing:</span>
                  <span className="font-medium">Real-time (Webhook)</span>
                </div>
              </div>
            )}
            
            {!status.connected && !loading && (
              <div className="py-6 text-center">
                <Settings className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  This workspace is not connected to Email Bison. Connect it to enable real-time email processing.
                </p>
              </div>
            )}
            
            {loading && (
              <div className="py-6 text-center">
                <RefreshCw className="mx-auto h-8 w-8 text-muted-foreground/50 mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading connection status...</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={fetchStatus} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {status.connected ? (
            <Button variant="default" onClick={() => setIsConnectModalOpen(true)}>
              <Link className="mr-2 h-4 w-4" />
              Reconnect
            </Button>
          ) : (
            <Button variant="default" onClick={() => setIsConnectModalOpen(true)} disabled={loading}>
              <Link className="mr-2 h-4 w-4" />
              Connect to Email Bison
            </Button>
          )}
        </CardFooter>
      </Card>

      <ConnectBisonModal
        workspaceId={workspaceId}
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={fetchStatus}
      />
    </>
  );
}
