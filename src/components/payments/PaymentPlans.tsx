import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Mock pricing plans
const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    description: "For individuals and small projects",
    price: 10,
    tokens: "1M",
    features: [
      "Access to all models",
      "1,000,000 tokens",
      "Lowest priority",
      "Basic support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For professional developers",
    price: 50,
    tokens: "5M",
    features: [
      "Access to all models",
      "5,000,000 tokens",
      "Higher priority",
      "Priority support",
      "Access to beta features",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations with large needs",
    price: 250,
    tokens: "30M",
    features: [
      "Access to all models",
      "30,000,000 tokens",
      "Highest priority",
      "Dedicated support",
      "Custom rate limits",
      "SLA guarantees",
    ],
  },
];

const payAsYouGoOptions = [
  { id: "pay10", name: "Pay as you go", price: 10, tokens: "1M" },
  { id: "pay50", name: "Pay as you go", price: 50, tokens: "5.5M" },
  { id: "pay100", name: "Pay as you go", price: 100, tokens: "12M" },
];

export function PaymentPlans() {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = (planId: string, price: number) => {
    setIsLoading(true);
    
    // In a real implementation, this would redirect to a Stripe checkout page
    console.log(`Purchasing plan ${planId} for $${price}`);
    
    // Mock purchase process
    setTimeout(() => {
      setIsLoading(false);
      console.log("Purchase successful!");
    }, 1000);
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Simple, transparent pricing</h1>
        <p className="text-xl text-muted-foreground">
          Purchase tokens for OpenRouter Clone access
        </p>
      </div>
      
      <Tabs defaultValue="subscription" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="subscription">Subscription Plans</TabsTrigger>
          <TabsTrigger value="payg">Pay As You Go</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription" className="mt-0">
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg' : ''}`}
              >
                <CardHeader>
                  {plan.popular && (
                    <div className="py-1 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-full w-fit mb-2">
                      Most Popular
                    </div>
                  )}
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-6">
                    {plan.tokens} tokens per month
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <svg
                          className="h-4 w-4 mr-2 text-primary"
                          fill="none"
                          height="24"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          width="24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handlePurchase(plan.id, plan.price)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Subscribe Now"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="payg" className="mt-0">
          <div className="grid md:grid-cols-3 gap-6">
            {payAsYouGoOptions.map((option) => (
              <Card key={option.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{option.name}</CardTitle>
                  <CardDescription>One-time purchase</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">${option.price}</span>
                    <span className="text-muted-foreground">one time</span>
                  </div>
                  <div className="text-sm text-muted-foreground mb-6">
                    {option.tokens} tokens
                  </div>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-2 text-primary"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Access to all models
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-2 text-primary"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      No expiration
                    </li>
                    <li className="flex items-center">
                      <svg
                        className="h-4 w-4 mr-2 text-primary"
                        fill="none"
                        height="24"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        width="24"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Standard support
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => handlePurchase(option.id, option.price)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Purchase Now"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
