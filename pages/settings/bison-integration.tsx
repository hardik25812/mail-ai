import React, { useEffect, useState } from 'react';
import { Box, Container, Heading, Spinner, Text, VStack, Alert, AlertIcon } from '@chakra-ui/react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import BisonConnectionPanel from '../../frontend/components/bison/BisonConnectionPanel';
import EmailAccountsList from '../../frontend/components/bison/EmailAccountsList';
import WebhookManager from '../../frontend/components/bison/WebhookManager';
import Layout from '../../frontend/components/Layout';

export default function BisonIntegrationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  
  const supabase = useSupabaseClient();
  const user = useUser();

  useEffect(() => {
    async function fetchWorkspace() {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('workspaces')
          .select('id, name, bison_workspace_id, bison_connected')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        setWorkspace(data);
      } catch (err: any) {
        console.error('Error fetching workspace:', err);
        setError(err.message || 'Failed to fetch workspace details');
      } finally {
        setLoading(false);
      }
    }
    
    fetchWorkspace();
  }, [user, supabase]);

  if (loading) {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
            <Text mt={4}>Loading workspace information...</Text>
          </Box>
        </Container>
      </Layout>
    );
  }

  if (error || !workspace) {
    return (
      <Layout>
        <Container maxW="container.xl" py={10}>
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error || 'No workspace found. Please create a workspace first.'}
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading mb={2}>Email Bison Integration</Heading>
            <Text color="gray.600">
              Connect your Email Bison account to manage campaigns, track replies, and automate email responses with AI.
            </Text>
          </Box>
          
          <BisonConnectionPanel workspaceId={workspace.id} />
          
          {workspace.bison_connected && (
            <>
              <EmailAccountsList workspaceId={workspace.id} />
              <WebhookManager workspaceId={workspace.id} />
            </>
          )}
        </VStack>
      </Container>
    </Layout>
  );
}
