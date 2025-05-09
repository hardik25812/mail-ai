import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Skeleton className="h-8 w-32" />
              <div className="hidden md:flex items-center space-x-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-9 w-32 rounded-md hidden md:block" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center mb-8">
          <Skeleton className="h-10 w-64 mr-2" />
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>

        <Skeleton className="h-2 w-full mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Skeleton className="h-12 w-12 rounded-full mb-3" />
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </CardContent>
              </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div>
            <Card className="mb-8">
              <CardContent className="p-6">
                <Skeleton className="h-7 w-48 mb-4" />
                <div className="space-y-6">
                  <div>
                    <Skeleton className="h-5 w-64 mb-2" />
                    <Skeleton className="h-10 w-full max-w-md" />
                  </div>

                  <div>
                    <Skeleton className="h-6 w-40 mb-3" />
                    <div className="space-y-3">
                      {Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                  </div>

                  <div>
                    <Skeleton className="h-6 w-40 mb-3" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Skeleton className="h-10 w-32 mr-3" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-7 w-36 mb-4" />
                <div className="border rounded-md p-4">
                  <Skeleton className="h-5 w-32 mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-px w-full my-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
