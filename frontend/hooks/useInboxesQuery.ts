// hooks/useInboxesQuery.ts
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/config";
import { InboxesApiResponseSchema, type Inbox } from "@/lib/schemas";
import { toast } from "sonner"; // Assuming you use sonner for toasts as per memory

const fetchInboxes = async (): Promise<Inbox[]> => {
  console.log('Fetching inboxes from:', `${API_URL}/inboxes`);
  
  const response = await fetch(`${API_URL}/inboxes`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "An unknown error occurred" }));
    throw new Error(errorData.message || `Failed to fetch inboxes: ${response.statusText}`);
  }
  
  const responseData = await response.json();
  
  // Simple debugging log
  console.log('API Response received, structure:', 
    Object.keys(responseData).join(', '));
  
  // Validate data with Zod
  try {
    // Parse using our updated schema that matches the backend
    const validatedResponse = InboxesApiResponseSchema.parse(responseData);
    
    // Extract the inboxes array from the data property
    const inboxes = validatedResponse.data;
    console.log(`Successfully validated ${inboxes.length} inboxes`);
    
    return inboxes;
  } catch (error) {
    console.error("Zod validation error for inboxes:", error);
    toast.error("Data validation error. Please try again later.");
    throw new Error("Invalid data format received from server.");
  }
};

export const useInboxesQuery = (options?: {
  refetchInterval?: number | false;
  onSuccess?: (data: Inbox[]) => void;
  onError?: (error: Error) => void;
}) => {
  return useQuery<Inbox[], Error>({
    queryKey: ["inboxes"],
    queryFn: fetchInboxes,
    refetchInterval: options?.refetchInterval, // e.g., 30000 for 30 seconds polling
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3, // Retry failed requests 3 times
    onSuccess: (data: Inbox[]) => {
      // console.log("Fetched inboxes successfully:", data);
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: Error) => {
      console.error("Error fetching inboxes:", error.message);
      toast.error(`Error fetching inboxes: ${error.message}`);
      if (options?.onError) {
        options.onError(error);
      }
    },
  });
};
