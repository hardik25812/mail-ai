"use client"

import { useState } from "react"
import { AnimatedButton } from "@/components/ui/animated-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Mail, Send } from "lucide-react"

export default function ButtonShowcase() {
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const simulateLoading = (id: string) => {
    setLoading((prev) => ({ ...prev, [id]: true }))
    setTimeout(() => {
      setLoading((prev) => ({ ...prev, [id]: false }))
    }, 2000)
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Button Animation Showcase</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Default Animation</CardTitle>
            <CardDescription>Simple scale effect on hover and tap</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <AnimatedButton onClick={() => simulateLoading("default")} isLoading={loading["default"]}>
              Default Button
            </AnimatedButton>

            <AnimatedButton
              gradient
              onClick={() => simulateLoading("defaultGradient")}
              isLoading={loading["defaultGradient"]}
            >
              Gradient Button
            </AnimatedButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bounce Animation</CardTitle>
            <CardDescription>Button bounces on hover</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <AnimatedButton
              animationVariant="bounce"
              onClick={() => simulateLoading("bounce")}
              isLoading={loading["bounce"]}
            >
              Bounce Effect
            </AnimatedButton>

            <AnimatedButton
              animationVariant="bounce"
              gradient
              onClick={() => simulateLoading("bounceGradient")}
              isLoading={loading["bounceGradient"]}
            >
              Bounce Gradient
            </AnimatedButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pulse Animation</CardTitle>
            <CardDescription>Button pulses on hover</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <AnimatedButton
              animationVariant="pulse"
              onClick={() => simulateLoading("pulse")}
              isLoading={loading["pulse"]}
            >
              Pulse Effect
            </AnimatedButton>

            <AnimatedButton
              animationVariant="pulse"
              gradient
              onClick={() => simulateLoading("pulseGradient")}
              isLoading={loading["pulseGradient"]}
            >
              Pulse Gradient
            </AnimatedButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expand Animation</CardTitle>
            <CardDescription>Button expands more on hover</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <AnimatedButton
              animationVariant="expand"
              onClick={() => simulateLoading("expand")}
              isLoading={loading["expand"]}
            >
              Expand Effect
            </AnimatedButton>

            <AnimatedButton
              animationVariant="expand"
              gradient
              onClick={() => simulateLoading("expandGradient")}
              isLoading={loading["expandGradient"]}
            >
              Expand Gradient
            </AnimatedButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Glow Animation</CardTitle>
            <CardDescription>Button glows on hover</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <AnimatedButton animationVariant="glow" onClick={() => simulateLoading("glow")} isLoading={loading["glow"]}>
              Glow Effect
            </AnimatedButton>

            <AnimatedButton
              animationVariant="glow"
              gradient
              onClick={() => simulateLoading("glowGradient")}
              isLoading={loading["glowGradient"]}
            >
              Glow Gradient
            </AnimatedButton>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>With Icons</CardTitle>
            <CardDescription>Buttons with animated icons</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <AnimatedButton
              iconLeft={<Mail />}
              onClick={() => simulateLoading("iconLeft")}
              isLoading={loading["iconLeft"]}
            >
              Email
            </AnimatedButton>

            <AnimatedButton
              gradient
              iconRight={<ArrowRight />}
              onClick={() => simulateLoading("iconRight")}
              isLoading={loading["iconRight"]}
            >
              Next
            </AnimatedButton>

            <AnimatedButton
              animationVariant="bounce"
              iconLeft={<Send />}
              onClick={() => simulateLoading("iconBounce")}
              isLoading={loading["iconBounce"]}
            >
              Send
            </AnimatedButton>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
