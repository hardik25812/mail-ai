# Mail AI API Documentation

This document outlines the REST API endpoints for the Mail AI backend.

## Authentication

All API requests require authentication using a JWT token. Include the token in the `Authorization` header as follows:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

All responses follow a consistent format:

```json
{
  "success": true|false,
  "data": {...},  // Only present if success is true
  "error": "Error message",  // Only present if success is false
  "pagination": {  // Only present for list endpoints
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

## Endpoints

### Emails

#### GET /emails

List emails with optional filters.

**Query Parameters:**

- `inbox_id` (optional): Filter by inbox ID
- `intent` (optional): Filter by intent (inquiry, lead, support, spam, other)
- `status` (optional): Filter by status (unread, read, replied, archived, deleted)
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `sort_by` (optional): Field to sort by (default: created_at)
- `sort_direction` (optional): Sort direction, 'asc' or 'desc' (default: desc)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "inbox_id": "uuid",
      "message_id": "string",
      "thread_id": "string",
      "subject": "string",
      "body": "string",
      "body_html": "string",
      "sender": "string",
      "recipient": "string",
      "status": "string",
      "intent": "string",
      "lead_score": 5,
      "created_at": "timestamp",
      "inbox": {
        "id": "uuid",
        "email_address": "string",
        "name": "string"
      },
      "ai_responses": [
        {
          "id": "uuid",
          "content": "string",
          "approved_by_user": true,
          "sent_at": "timestamp"
        }
      ]
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

#### GET /emails/:id

Get a single email with its thread.

**Response:**

```json
{
  "success": true,
  "data": {
    "email": {
      "id": "uuid",
      "inbox_id": "uuid",
      "message_id": "string",
      "thread_id": "string",
      "subject": "string",
      "body": "string",
      "body_html": "string",
      "sender": "string",
      "recipient": "string",
      "status": "string",
      "intent": "string",
      "lead_score": 5,
      "created_at": "timestamp",
      "inbox": {
        "id": "uuid",
        "email_address": "string",
        "name": "string"
      },
      "ai_responses": [
        {
          "id": "uuid",
          "content": "string",
          "approved_by_user": true,
          "sent_at": "timestamp"
        }
      ]
    },
    "thread": [
      {
        "id": "uuid",
        "message_id": "string",
        "thread_id": "string",
        "subject": "string",
        "body": "string",
        "body_html": "string",
        "sender": "string",
        "recipient": "string",
        "status": "string",
        "created_at": "timestamp",
        "ai_responses": []
      }
    ]
  }
}
```

#### POST /emails/:id/reply

Send or save a reply to an email.

**Request Body:**

```json
{
  "content": "string",  // Optional, if not provided, AI will generate content
  "approve": true,      // Mark the response as approved
  "send": true          // Send the email immediately
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "ai_response": {
      "id": "uuid",
      "email_id": "uuid",
      "content": "string",
      "approved_by_user": true,
      "sent_at": "timestamp",
      "created_at": "timestamp"
    },
    "sent_email": {  // Only present if send is true
      "id": "uuid",
      "inbox_id": "uuid",
      "message_id": "string",
      "thread_id": "string",
      "subject": "string",
      "body": "string",
      "sender": "string",
      "recipient": "string",
      "status": "sent",
      "created_at": "timestamp"
    }
  }
}
```

### Settings

#### GET /settings

Get user settings.

**Response:**

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "tone": "professional",
    "signature": "string",
    "auto_reply": false,
    "slack_url": "string",
    "calendly_url": "string",
    "timezone": "UTC",
    "example_replies": [],
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### PUT /settings

Update user settings.

**Request Body:**

```json
{
  "tone": "string",
  "signature": "string",
  "auto_reply": boolean,
  "slack_url": "string",
  "calendly_url": "string",
  "timezone": "string",
  "example_replies": []
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "tone": "professional",
    "signature": "string",
    "auto_reply": false,
    "slack_url": "string",
    "calendly_url": "string",
    "timezone": "UTC",
    "example_replies": [],
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### Campaigns

#### GET /campaigns

List campaigns.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "name": "string",
      "description": "string",
      "status": "string",
      "timezone": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

#### POST /campaigns

Create a new campaign.

**Request Body:**

```json
{
  "workspace_id": "uuid",
  "name": "string",
  "description": "string",
  "timezone": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "workspace_id": "uuid",
    "name": "string",
    "description": "string",
    "status": "draft",
    "timezone": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### GET /campaigns/:id

Get a single campaign with its steps.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "workspace_id": "uuid",
    "name": "string",
    "description": "string",
    "status": "string",
    "timezone": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp",
    "steps": [
      {
        "id": "uuid",
        "campaign_id": "uuid",
        "step_number": 1,
        "subject": "string",
        "body": "string",
        "delay_hours": 24,
        "created_at": "timestamp",
        "updated_at": "timestamp"
      }
    ]
  }
}
```

#### PUT /campaigns/:id

Update a campaign.

**Request Body:**

```json
{
  "name": "string",
  "description": "string",
  "status": "string",
  "timezone": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "workspace_id": "uuid",
    "name": "string",
    "description": "string",
    "status": "string",
    "timezone": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### GET /campaigns/:id/stats

Get campaign statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "campaign_id": "uuid",
    "name": "string",
    "status": "string",
    "overall": {
      "total_recipients": 100,
      "active": 50,
      "completed": 30,
      "unsubscribed": 10,
      "pending": 10
    },
    "steps": [
      {
        "step_number": 1,
        "subject": "string",
        "delay_hours": 24,
        "stats": {
          "sent": 100,
          "delivered": 95,
          "opened": 80,
          "clicked": 50,
          "replied": 30,
          "bounced": 5,
          "open_rate": 84.2,
          "click_rate": 62.5,
          "reply_rate": 31.6
        }
      }
    ]
  }
}
```

### Senders

#### GET /senders

List sender profiles.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "workspace_id": "uuid",
      "name": "string",
      "email": "string",
      "email_signature": "string",
      "timezone": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5
  }
}
```

#### POST /senders

Create a new sender profile.

**Request Body:**

```json
{
  "workspace_id": "uuid",
  "name": "string",
  "email": "string",
  "email_signature": "string",
  "timezone": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "workspace_id": "uuid",
    "name": "string",
    "email": "string",
    "email_signature": "string",
    "timezone": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### GET /senders/:id

Get a single sender profile.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "workspace_id": "uuid",
    "name": "string",
    "email": "string",
    "email_signature": "string",
    "timezone": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### PUT /senders/:id

Update a sender profile.

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "email_signature": "string",
  "timezone": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "workspace_id": "uuid",
    "name": "string",
    "email": "string",
    "email_signature": "string",
    "timezone": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### PUT /senders/bulk-signature

Update signatures for multiple senders.

**Request Body:**

```json
{
  "sender_ids": ["uuid1", "uuid2", "uuid3"],
  "email_signature": "string"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "updated_count": 3,
    "updated_sender_ids": ["uuid1", "uuid2", "uuid3"]
  }
}
```

### Timezones

#### GET /timezones

Get a list of available timezones.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "value": "UTC",
      "label": "UTC",
      "offset": "+00:00"
    },
    {
      "value": "America/New_York",
      "label": "Eastern Time (US & Canada)",
      "offset": "-05:00"
    }
  ]
}
```
