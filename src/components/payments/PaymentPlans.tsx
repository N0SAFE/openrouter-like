// src/components/payments/PaymentPlans.tsx
import { useState } from "react";
import { Check, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { models } from "@/lib/models";
import { Badge } from "../ui/badge";
import { Tooltip } from "../ui/tooltip";

export function PaymentPlans() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  // Calculate representative usage tiers
  const smallUsageExample = {
    tokens: 1000000, // 1M tokens
    breakdown: {
      gpt35: ((1000000 / 1000000) * 0.5) + ((1000000 / 1000000) * 1.5),
      gpt4: ((1000000 / 1000000) * 10) + ((1000000 / 1000000) * 30),
      claude: ((1000000 / 1000000) * 3) + ((1000000 / 1000000) * 15),
    }
  };

  const mediumUsageExample = {
    tokens: 10000000, // 10M tokens
    breakdown: {
      gpt35: ((10000000 / 1000000) * 0.5) + ((10000000 / 1000000) * 1.5),
      gpt4: ((10000000 / 1000000) * 10) + ((10000000 / 1000000) * 30),
      claude: ((10000000 / 1000000) * 3) + ((10000000 / 1000000) * 15),
    }
  };

  const largeUsageExample = {
    tokens: 50000000, // 50M tokens
    breakdown: {
      gpt35: ((50000000 / 1000000) * 0.5) + ((50000000 / 1000000) * 1.5),
      gpt4: ((50000000 / 1000000) * 10) + ((50000000 / 1000000) * 30),
      claude: ((50000000 / 1000000) * 3) + ((50000000 / 1000000) * 15),
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4">Transparent Pricing</h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Pay only what the LLM providers charge - no markup. We're simply a routing and optimization layer.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <Tabs defaultValue="usage" className="w-full max-w-3xl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usage">Usage-Based</TabsTrigger>
            <TabsTrigger value="models">Model Pricing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="usage" className="space-y-8 mt-4">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    Starter
                    <Badge className="ml-2" variant="outline">Popular</Badge>
                  </CardTitle>
                  <CardDescription>For individuals and small projects</CardDescription>
                  <div className="text-3xl font-bold">Pay as you go</div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-6">Example costs with 1M tokens:</p>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>GPT-3.5:</span>
                      <span className="font-medium">${smallUsageExample.breakdown.gpt35.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>GPT-4:</span>
                      <span className="font-medium">${smallUsageExample.breakdown.gpt4.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Claude-3 Sonnet:</span>
                      <span className="font-medium">${smallUsageExample.breakdown.claude.toFixed(2)}</span>
                    </li>
                  </ul>
                  <div className="border-t my-6"></div>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Access to all models
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Intelligent routing & fallbacks
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Basic analytics
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Get Started</Button>
                </CardFooter>
              </Card>

              <Card className="relative border-blue-200 shadow-lg">
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST FLEXIBLE
                  </span>
                </div>
                <CardHeader>
                  <CardTitle>Professional</CardTitle>
                  <CardDescription>For growing businesses and teams</CardDescription>
                  <div className="text-3xl font-bold">Pay as you go</div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-6">Example costs with 10M tokens:</p>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>GPT-3.5:</span>
                      <span className="font-medium">${mediumUsageExample.breakdown.gpt35.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>GPT-4:</span>
                      <span className="font-medium">${mediumUsageExample.breakdown.gpt4.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Claude-3 Sonnet:</span>
                      <span className="font-medium">${mediumUsageExample.breakdown.claude.toFixed(2)}</span>
                    </li>
                  </ul>
                  <div className="border-t my-6"></div>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Everything in Starter
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Custom endpoints
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Webhooks
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Advanced analytics
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Response caching
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="default">Get Started</Button>
                </CardFooter>
              </Card>

              <Card className="relative">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <CardDescription>For large organizations with high volume</CardDescription>
                  <div className="text-3xl font-bold">Pay as you go</div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 mb-6">Example costs with 50M tokens:</p>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>GPT-3.5:</span>
                      <span className="font-medium">${largeUsageExample.breakdown.gpt35.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>GPT-4:</span>
                      <span className="font-medium">${largeUsageExample.breakdown.gpt4.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Claude-3 Sonnet:</span>
                      <span className="font-medium">${largeUsageExample.breakdown.claude.toFixed(2)}</span>
                    </li>
                  </ul>
                  <div className="border-t my-6"></div>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Everything in Professional
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Batch processing
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Enterprise SSO
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Dedicated account manager
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Volume optimization
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline">Contact Sales</Button>
                </CardFooter>
              </Card>
            </div>
            <div className="text-center text-gray-500 text-sm">
              All pricing is based on direct provider costs. We don't add any markup.
            </div>
          </TabsContent>
          
          <TabsContent value="models" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Model Pricing Reference</CardTitle>
                <CardDescription>
                  Costs shown per 1M tokens, direct from providers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Input (per 1M tokens)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Output (per 1M tokens)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Context Window</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.values(models).map((model) => (
                        <tr key={model.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{model.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{model.provider}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">${model.inputPricing.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">${model.outputPricing.toFixed(2)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">{model.contextWindow.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="mt-16 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>How is pricing calculated?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>We charge exactly what the model providers charge. There's no markup or hidden fees. You're simply paying for the tokens processed by each model provider.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Do you offer volume discounts?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>For high-volume users on Enterprise plans, we can help negotiate volume discounts directly with providers. Contact our sales team to learn more.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>What about features like routing and fallbacks?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Our core routing, fallback, and caching features are included for free. We believe these optimizations should be standard for everyone using AI models.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>How do you make money?</CardTitle>
            </CardHeader>
            <CardContent>
              <p>We charge for advanced features like Enterprise SSO, dedicated support, and custom integration services. Our basic service passes through provider costs without markup.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}