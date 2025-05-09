import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function AIConfigLoading() {
  return (
    <div className="space-y-6">
      <div className="p-6">
        <Skeleton className="h-4 w-[100px] mb-2" />
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[350px] mt-2" />
      </div>

      <div className="px-6">
        <Skeleton className="h-10 w-[300px] mb-6" />

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px] mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array(3)
              .fill(null)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
