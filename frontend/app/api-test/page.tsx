"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { testApiConnection } from "@/lib/api-debug";

export default function ApiTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runApiTest() {
    try {
      setLoading(true);
      setError(null);
      
      const result = await testApiConnection();
      setTestResult(result);
      
      // Force disable mock data
      if (typeof window !== 'undefined') {
        window.process = window.process || {};
        window.process.env = window.process.env || {};
        window.process.env.NEXT_PUBLIC_USE_MOCK_DATA = 'false';
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error testing API:", err);
    } finally {
      setLoading(false);
    }
  }

  // Run the test automatically when the page loads
  useEffect(() => {
    runApiTest();
  }, []);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Email Bison API Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Connection Test</CardTitle>
          <CardDescription>
            Tests direct connection to the Email Bison API through the backend
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p>Testing API connection...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
              <h3 className="font-bold flex items-center">
                <XCircle className="mr-2 h-5 w-5" />
                Connection Failed
              </h3>
              <p className="mt-2">{error}</p>
            </div>
          ) : testResult ? (
            <div>
              <div className={`p-4 rounded-md mb-4 ${testResult.success ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                <h3 className="font-bold flex items-center">
                  {testResult.success ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Connection Successful
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-5 w-5" />
                      Connection Failed
                    </>
                  )}
                </h3>
                <p className="mt-2">{testResult.success ? 'Successfully connected to the Email Bison API' : testResult.error}</p>
              </div>

              {testResult.success && (
                <>
                  <h3 className="font-medium text-lg mt-4 mb-2">Inboxes Data</h3>
                  <pre className="bg-slate-800 p-4 rounded-md overflow-auto text-sm max-h-60">
                    {JSON.stringify(testResult.inboxes, null, 2)}
                  </pre>
                  
                  <h3 className="font-medium text-lg mt-4 mb-2">Workspaces Data</h3>
                  <pre className="bg-slate-800 p-4 rounded-md overflow-auto text-sm max-h-60">
                    {JSON.stringify(testResult.workspaces, null, 2)}
                  </pre>
                </>
              )}
            </div>
          ) : null}
        </CardContent>
        
        <CardFooter>
          <Button onClick={runApiTest} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Run API Test Again"
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>
            Use this information to troubleshoot your application
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="font-medium mb-1">Frontend Environment:</h3>
              <p className="text-sm text-muted-foreground">
                {process.env.NODE_ENV === 'development' ? 'Development' : 'Production'}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Mock Data Status:</h3>
              <p className="text-sm text-muted-foreground">
                {typeof window !== 'undefined' && window.process?.env?.NEXT_PUBLIC_USE_MOCK_DATA === 'false'
                  ? 'Disabled (using real API data)'
                  : 'Enabled (using mock data)'}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-1">Backend API URL:</h3>
              <p className="text-sm text-muted-foreground">http://localhost:4001/api</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
