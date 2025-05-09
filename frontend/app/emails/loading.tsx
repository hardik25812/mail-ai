import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function EmailsLoading() {
  return (
    <div className="space-y-6">
      <div className="p-6">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[350px] mt-2" />
      </div>

      <div className="px-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>
      </div>

      <div className="px-6">
        <Skeleton className="h-10 w-[400px] mb-4" />
        <Card>
          <CardHeader className="p-4 border-b">
            <Skeleton className="h-6 w-full" />
          </CardHeader>
          <CardContent className="p-0">
            {Array(5)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="p-4 border-b">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-[200px] mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                    <Skeleton className="h-6 w-[80px]" />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
