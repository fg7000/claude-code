"use client";

import { motion } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";

const plans = [
  {
    name: "Starter",
    price: "$30",
    period: "/month",
    credits: "3,000 credits",
    detail: "~100 voice minutes",
    description: "For individuals getting started.",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$75",
    period: "/month",
    credits: "7,500 credits",
    detail: "~250 voice minutes",
    description: "For professionals who live in Agencer.",
    highlighted: true,
    badge: "MOST POPULAR",
  },
  {
    name: "Power",
    price: "$200",
    period: "/month",
    credits: "20,000 credits",
    detail: "~667 voice minutes",
    description: "For power users and teams.",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative py-32 bg-bg-primary overflow-hidden"
    >
      <div className="max-w-[1100px] mx-auto px-6">
        <div className="text-center mb-16">
          <SectionLabel>Pricing</SectionLabel>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="font-serif font-medium text-text-headline mb-4"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            One credit. One cent. No surprises.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-sans text-text-secondary max-w-xl mx-auto"
            style={{ fontSize: "clamp(1rem, 1.2vw, 1.25rem)" }}
          >
            Every credit maps to exactly one cent. You always know what you&apos;re spending before you spend it.
          </motion.p>
        </div>

        {/* Pricing cards */}
        <div className="flex flex-col lg:flex-row gap-6 justify-center items-center lg:items-stretch mb-12">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`w-full max-w-[340px] ${plan.highlighted ? "lg:scale-105 lg:z-10" : ""}`}
            >
              <GlassPanel
                highlighted={plan.highlighted}
                hover
                className={`p-6 h-full flex flex-col ${plan.highlighted ? "border-accent-gold/50" : ""}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <span className="inline-block self-start px-3 py-1 mb-4 text-xs font-mono bg-accent-gold text-bg-primary rounded-full">
                    {plan.badge}
                  </span>
                )}

                {/* Plan name */}
                <h3 className="font-sans font-semibold text-text-headline text-xl mb-4">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-4">
                  <span className="font-serif text-4xl text-text-headline">{plan.price}</span>
                  <span className="text-text-secondary text-sm">{plan.period}</span>
                </div>

                {/* Credits */}
                <p className="font-sans text-text-headline mb-1">{plan.credits}</p>
                <p className="font-mono text-xs text-text-secondary mb-4">{plan.detail}</p>

                {/* Description */}
                <p className="font-sans text-text-secondary text-sm mb-6 flex-grow">
                  {plan.description}
                </p>

                {/* CTA */}
                <Button
                  variant={plan.highlighted ? "solid" : "outline"}
                  size="md"
                  href="#"
                  className="w-full"
                >
                  Get Started
                </Button>
              </GlassPanel>
            </motion.div>
          ))}
        </div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="font-sans text-text-secondary">
            Annual plans save 17%.
          </p>
          <p className="font-sans text-text-secondary">
            Start free with 100 credits. No credit card required.
          </p>

          <p className="font-mono text-xs text-text-secondary/70 mt-6">
            Voice: ~30 credits/minute | Light tasks: 2-5 credits | Standard: 5-15 credits | Heavy reasoning: 20-50+ credits
          </p>

          <p className="font-sans text-sm text-text-secondary mt-4">
            Already paying for AI APIs? Bring your own keys. Pay only for voice and orchestration.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
