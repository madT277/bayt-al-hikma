'use client'

import { motion } from 'framer-motion'

interface DataPoint {
  label: string
  value: number // Percentage from 0 to 100
}

export function AnimatedChart({ title, data }: { title: string, data: DataPoint[] }) {
  return (
    <div className="my-16 bg-white border border-border p-8 md:p-10 rounded-2xl shadow-sm w-full mx-auto max-w-4xl">
      <h3 className="text-2xl font-serif text-teal mb-8 border-b-2 border-cream-2 pb-4 inline-block">
        {title}
      </h3>
      <div className="flex flex-col gap-8">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="flex justify-between text-base font-bold text-ink-2">
              <span>{item.label}</span>
              <span className="text-gold">{item.value}%</span>
            </div>
            {/* The Background Track */}
            <div className="w-full h-3 bg-cream-2 rounded-full overflow-hidden">
              {/* The Growing Bar */}
              <motion.div
                className="h-full bg-teal rounded-full"
                initial={{ width: "0%" }}
                whileInView={{ width: `${item.value}%` }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}