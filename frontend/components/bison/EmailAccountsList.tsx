import React, { useState } from 'react';
import { useEmailAccounts } from '../../lib/hooks/useBison';
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
  Card
} from '@chakra-ui/react';
import { BisonEmailAccount } from '../../lib/services/bison-service';

interface EmailAccountsListProps {
  workspaceId: string;
}

export const EmailAccountsList: React.FC<EmailAccountsListProps> = ({ workspaceId }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    smtp_host: '',
    smtp_port: '',
    smtp_username: '',
    smtp_password: '',
    imap_host: '',
    imap_port: '',
    imap_username: '',
    imap_password: ''
  });

  const { 
    loading, 
    emailAccounts, 
    error, 
    refetch 
  } = useEmailAccounts(workspaceId);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/bison/email-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect email account');
      }
      
      // Reset form and refresh list
      setFormData({
        email: '',
        name: '',
        smtp_host: '',
        smtp_port: '',
        smtp_username: '',
        smtp_password: '',
        imap_host: '',
        imap_port: '',
        imap_username: '',
        imap_password: ''
      });
      
      onClose();
      refetch();
    } catch (err: any) {
      console.error('Error connecting email account:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this email account?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/bison/email-accounts?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove email account');
      }
      
      refetch();
    } catch (err: any) {
      console.error('Error removing email account:', err);
    }
  };

  return (
    <Card p={5} shadow="md" borderRadius="md" width="100%" mt={5}>
      <Heading size="md" mb={4}>Email Accounts</Heading>
      
      <Button colorScheme="blue" onClick={onOpen} mb={4}>
        Connect New Email Account
      </Button>
      
      {loading ? (
        <Box textAlign="center" py={4}>
          <Spinner />
        </Box>
      ) : error ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      ) : emailAccounts.length === 0 ? (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          No email accounts connected. Click the button above to connect one.
        </Alert>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Email</Th>
                <Th>Name</Th>
                <Th>Status</Th>
                <Th>Stats</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {emailAccounts.map((account: BisonEmailAccount) => (
                <Tr key={account.id}>
                  <Td>{account.email}</Td>
                  <Td>{account.name}</Td>
                  <Td>
                    <Badge colorScheme={account.status === 'active' ? 'green' : 'orange'}>
                      {account.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm">Sent: {account.emails_sent}</Text>
                    <Text fontSize="sm">Replies: {account.replied}</Text>
                    <Text fontSize="sm">Opens: {account.opened}</Text>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(account.id)}
                    >
                      Remove
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Modal for adding a new email account */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect Email Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box as="form" id="email-account-form" onSubmit={handleSubmit}>
              <FormControl mb={3} isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />
              </FormControl>
              
              <FormControl mb={3} isRequired>
                <FormLabel>Display Name</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </FormControl>
              
              <Heading size="sm" mt={4} mb={2}>SMTP Settings</Heading>
              
              <FormControl mb={3} isRequired>
                <FormLabel>SMTP Host</FormLabel>
                <Input
                  name="smtp_host"
                  value={formData.smtp_host}
                  onChange={handleChange}
                  placeholder="smtp.gmail.com"
                />
              </FormControl>
              
              <FormControl mb={3} isRequired>
                <FormLabel>SMTP Port</FormLabel>
                <Input
                  name="smtp_port"
                  value={formData.smtp_port}
                  onChange={handleChange}
                  placeholder="587"
                  type="number"
                />
              </FormControl>
              
              <FormControl mb={3} isRequired>
                <FormLabel>SMTP Username</FormLabel>
                <Input
                  name="smtp_username"
                  value={formData.smtp_username}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />
              </FormControl>
              
              <FormControl mb={3} isRequired>
                <FormLabel>SMTP Password</FormLabel>
                <Input
                  name="smtp_password"
                  value={formData.smtp_password}
                  onChange={handleChange}
                  type="password"
                  placeholder="Your password or app password"
                />
              </FormControl>
              
              <Heading size="sm" mt={4} mb={2}>IMAP Settings (Optional for receiving emails)</Heading>
              
              <FormControl mb={3}>
                <FormLabel>IMAP Host</FormLabel>
                <Input
                  name="imap_host"
                  value={formData.imap_host}
                  onChange={handleChange}
                  placeholder="imap.gmail.com"
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>IMAP Port</FormLabel>
                <Input
                  name="imap_port"
                  value={formData.imap_port}
                  onChange={handleChange}
                  placeholder="993"
                  type="number"
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>IMAP Username</FormLabel>
                <Input
                  name="imap_username"
                  value={formData.imap_username}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />
              </FormControl>
              
              <FormControl mb={3}>
                <FormLabel>IMAP Password</FormLabel>
                <Input
                  name="imap_password"
                  value={formData.imap_password}
                  onChange={handleChange}
                  type="password"
                  placeholder="Your password or app password"
                />
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
              form="email-account-form"
              isLoading={isSubmitting}
              loadingText="Connecting"
            >
              Connect Email Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default EmailAccountsList;
