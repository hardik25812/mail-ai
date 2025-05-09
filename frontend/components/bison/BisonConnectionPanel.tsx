import React, { useState } from 'react';
import { useWorkspaceConnection } from '../../lib/hooks/useBison';
import { Button, Card, Input, Spinner, Alert, Box, Flex, Text, Heading } from '@chakra-ui/react';

interface BisonConnectionPanelProps {
  workspaceId: string;
}

export const BisonConnectionPanel: React.FC<BisonConnectionPanelProps> = ({ workspaceId }) => {
  const [apiKey, setApiKey] = useState('');
  const [bisonWorkspaceId, setBisonWorkspaceId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    loading, 
    connected, 
    error, 
    connectWorkspace, 
    disconnectWorkspace 
  } = useWorkspaceConnection(workspaceId);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await connectWorkspace(apiKey);
      setApiKey('');
      setBisonWorkspaceId('');
    } catch (err) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsSubmitting(true);
    
    try {
      await disconnectWorkspace();
    } catch (err) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card p={5} shadow="md" borderRadius="md" width="100%">
      <Heading size="md" mb={4}>Email Bison Integration</Heading>
      
      {loading && !isSubmitting && (
        <Flex justify="center" py={4}>
          <Spinner />
        </Flex>
      )}
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          {error}
        </Alert>
      )}
      
      {connected ? (
        <Box>
          <Alert status="success" mb={4} borderRadius="md">
            Successfully connected to Email Bison
          </Alert>
          <Button 
            colorScheme="red" 
            onClick={handleDisconnect} 
            isLoading={isSubmitting}
            loadingText="Disconnecting"
            width="full"
          >
            Disconnect from Email Bison
          </Button>
        </Box>
      ) : (
        <Box as="form" onSubmit={handleConnect}>
          <Text mb={2}>Connect your Email Bison account to sync inbox data and manage campaigns</Text>
          
          <Input
            mb={3}
            placeholder="Email Bison API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            type="password"
            isRequired
          />
          
          <Input
            mb={4}
            placeholder="Email Bison Workspace ID"
            value={bisonWorkspaceId}
            onChange={(e) => setBisonWorkspaceId(e.target.value)}
            isRequired
          />
          
          <Button 
            colorScheme="blue" 
            type="submit" 
            width="full"
            isLoading={isSubmitting}
            loadingText="Connecting"
            disabled={!apiKey || !bisonWorkspaceId}
          >
            Connect to Email Bison
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default BisonConnectionPanel;
