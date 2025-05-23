// components/TopContactsTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils"; // Assuming getInitials exists

export type ContactData = {
  name: string;
  email: string;
  count: number;
  avatarUrl?: string; // Optional avatar image URL
};

interface TopContactsTableProps {
  contacts: ContactData[];
}

export function TopContactsTable({ contacts }: TopContactsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[280px]">Contact</TableHead>
          <TableHead className="text-right">Interactions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {contacts.length === 0 && (
          <TableRow>
            <TableCell colSpan={2} className="text-center text-muted-foreground">
              No contact data available.
            </TableCell>
          </TableRow>
        )}
        {contacts.map((contact, index) => (
          <TableRow key={contact.email + index}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  {contact.avatarUrl && <AvatarImage src={contact.avatarUrl} alt={contact.name} />}
                  <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium truncate max-w-[180px]" title={contact.name}>{contact.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[180px]" title={contact.email}>{contact.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right">{contact.count.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
