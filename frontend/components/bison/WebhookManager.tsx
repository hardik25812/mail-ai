import React, { useState } from 'react';
import { useWebhooks } from '../../lib/hooks/useBison';
import { 
  Box, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Button, 
  Spinner, 
  Alert, 
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  Badge,
  Text,
  Heading,
  Card,
  Flex,
  Stack,
  Checkbox,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton
} from '@chakra-ui/react';
import { BisonWebhook } from '../../lib/services/bison-service';

interface WebhookManagerProps {
  workspaceId: string;
}

const WEBHOOK_EVENTS = [
  { id: 'CAMPAIGN_SENT', label: 'Campaign Sent' },
  { id: 'EMAIL_SENT', label: 'Email Sent' },
  { id: 'EMAIL_OPENED', label: 'Email Opened' },
  { id: 'EMAIL_CLICKED', label: 'Email Clicked' },
  { id: 'LEAD_REPLIED', label: 'Lead Replied' },
  { id: 'EMAIL_BOUNCED', label: 'Email Bounced' },
  { id: 'UNSUBSCRIBED', label: 'Unsubscribed' }
];

export const WebhookManager: React.FC<WebhookManagerProps> = ({ workspaceId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const toast = useToast();
  
  // Form state
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const { 
    loading, 
    webhooks, 
    error, 
    createWebhook,
    deleteWebhook,
    testWebhook,
    refetch 
  } = useWebhooks(workspaceId);

  const handleEventToggle = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({
        title: 'Webhook URL required',
        description: 'Please enter a valid webhook URL',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (selectedEvents.length === 0) {
      toast({
        title: 'Events required',
        description: 'Please select at least one event to listen for',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createWebhook(url, selectedEvents);
      
      // Reset form
      setUrl('');
      setSelectedEvents([]);
      onClose();
      
    } catch (err: any) {
      console.error('Error creating webhook:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }
    
    try {
      await deleteWebhook(webhookId);
    } catch (err: any) {
      console.error('Error deleting webhook:', err);
    }
  };

  const handleTest = async (webhookId: string, eventType: string) => {
    setIsTesting(true);
    
    try {
      await testWebhook(webhookId, eventType);
      toast({
        title: 'Test webhook sent',
        description: `Successfully sent a test ${eventType} event to webhook`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: 'Test failed',
        description: 'Failed to send test webhook event',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error testing webhook:', err);
    } finally {
      setIsTesting(false);
    }
  };

  const getWebhookUrl = () => {
    // Get the current hostname (e.g., localhost:3000 in development)
    const host = window.location.host;
    const protocol = window.location.protocol;
    
    // Return the webhook URL
    return `${protocol}//${host}/api/webhooks/email-bison`;
  };

  return (
    <Card p={5} shadow="md" borderRadius="md" width="100%" mt={5}>
      <Heading size="md" mb={4}>Webhook Management</Heading>
      
      <Box mb={4}>
        <Alert status="info" borderRadius="md" mb={3}>
          <AlertIcon />
          <Stack>
            <Text>Your webhook URL should be:</Text>
            <Text fontWeight="bold">{getWebhookUrl()}</Text>
            <Text>
              Use this URL in Email Bison to receive events in your application.
              Make sure your server is publicly accessible or use a service like ngrok for testing.
            </Text>
          </Stack>
        </Alert>
        
        <Button colorScheme="blue" onClick={onOpen}>
          Create New Webhook in Email Bison
        </Button>
      </Box>
      
      {loading ? (
        <Box textAlign="center" py={4}>
          <Spinner />
        </Box>
      ) : error ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      ) : webhooks.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          No webhooks configured. Create one to receive events from Email Bison.
        </Alert>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>URL</Th>
                <Th>Events</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {webhooks.map((webhook: BisonWebhook) => (
                <Tr key={webhook.id}>
                  <Td maxWidth="300px" isTruncated title={webhook.url}>
                    {webhook.url}
                  </Td>
                  <Td>
                    <Flex wrap="wrap" gap={1}>
                      {webhook.events.map(event => (
                        <Badge key={event} colorScheme="blue" mr={1} mb={1}>
                          {event}
                        </Badge>
                      ))}
                    </Flex>
                  </Td>
                  <Td>
                    <Badge colorScheme={webhook.active ? 'green' : 'orange'}>
                      {webhook.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </Td>
                  <Td>
                    <Flex gap={2}>
                      <Menu>
                        <MenuButton
                          as={Button}
                          size="sm"
                          colorScheme="blue"
                          isLoading={isTesting}
                        >
                          Test
                        </MenuButton>
                        <MenuList>
                          {WEBHOOK_EVENTS.map(event => (
                            <MenuItem 
                              key={event.id}
                              onClick={() => handleTest(webhook.id, event.id)}
                            >
                              {event.label}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </Menu>
                      
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(webhook.id)}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Modal for creating a new webhook */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Webhook</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box as="form" id="webhook-form" onSubmit={handleSubmit}>
              <FormControl mb={4} isRequired>
                <FormLabel>Webhook URL</FormLabel>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={getWebhookUrl()}
                />
              </FormControl>
              
              <FormControl mb={4} isRequired>
                <FormLabel>Events to Subscribe</FormLabel>
                <Stack spacing={2}>
                  {WEBHOOK_EVENTS.map(event => (
                    <Checkbox
                      key={event.id}
                      isChecked={selectedEvents.includes(event.id)}
                      onChange={() => handleEventToggle(event.id)}
                    >
                      {event.label}
                    </Checkbox>
                  ))}
                </Stack>
              </FormControl>
            </Box>
          </ModalBody>
          
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              form="webhook-form"
              isLoading={isSubmitting}
              loadingText="Creating"
            >
              Create Webhook
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default WebhookManager;
