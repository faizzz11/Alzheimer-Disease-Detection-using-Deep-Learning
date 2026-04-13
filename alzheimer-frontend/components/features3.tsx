"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Message = { role: "assistant" | "user"; content: string };
type Card = { id: number; name: string; designation: string; content: string; gradient: string };

const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-[#F9FAFB] rounded-[18px] p-4 border border-[#E1E1E1] shadow-[0px_37px_10px_0px_rgba(0,0,0,0.00),_0px_24px_10px_0px_rgba(0,0,0,0.01),_0px_13px_8px_0px_rgba(0,0,0,0.02),_0px_6px_6px_0px_rgba(0,0,0,0.03),_0px_1px_3px_0px_rgba(0,0,0,0.04)]">
    {children}
  </div>
);

const ContentBox = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("space-y-4 rounded-xl p-4 border border-[#E1E1E1] bg-white h-[320px]", className)}>{children}</div>
);

const SectionTitle = ({ title, description }: { title: string; description: string }) => (
  <>
    <motion.h3 whileHover={{ scale: 1.05 }} className="text-xl font-bold mt-6 mb-2">{title}</motion.h3>
    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-gray-500 text-sm leading-relaxed">{description}</motion.p>
  </>
);

const ChatSection = () => {
  const messages: Message[] = [
    { role: "assistant", content: "Hello! I am NeuroScan AI." },
    { role: "assistant", content: "I can help analyze MRI scans and provide insights on Alzheimer's stages. Would you like to upload a scan?" },
    { role: "user", content: "Yes, I have a T1-weighted MRI." },
  ];

  return (
    <SectionWrapper>
      <ContentBox>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`max-w-[80%] text-sm p-2 ${message.role === "user" ? "rounded-[10px_0px_10px_10px] border border-[#E3E3E3] bg-gradient-to-br from-[#FFA756] to-[#EE602C] text-white" : "rounded-[0px_10px_10px_10px] border border-[#E3E3E3] bg-white"}`}
              >
                {message.content}
              </motion.div>
            </motion.div>
          ))}
        </div>
        <motion.div whileHover={{ scale: 1.02 }} className="border border-gray-200 rounded-full p-3.5 flex items-center gap-3">
          <input type="text" placeholder="Ask about MRI analysis..." className="flex-1 outline-none text-sm bg-white placeholder-gray-400" />
          <motion.button whileHover={{ scale: 1.2, x: 5 }} className="hover:text-gray-600 transition-colors text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          </motion.button>
        </motion.div>
      </ContentBox>
      <SectionTitle title="Instant Consultation" description="Get immediate guidance on how to interpret classification stages from your MRI scans." />
    </SectionWrapper>
  );
};

const PaymentSection = () => {
  const [cards, setCards] = useState<Card[]>([
    { id: 1, name: "Fast Processing", designation: "< 1s", content: "Instant Results", gradient: "from-[#FF7757] to-[#FF5C38]" },
    { id: 2, name: "Secure Storage", designation: "Private", content: "Zero Data Logging", gradient: "from-[#FFA756] to-[#EE602C]" },
    { id: 3, name: "High Accuracy", designation: "97.4%", content: "Clinically Validated", gradient: "from-[#000000] to-[#262626]" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prev) => { const arr = [...prev]; arr.unshift(arr.pop()!); return arr; });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper>
      <ContentBox>
        <div className="mb-8 text-center">
          <h2 className="text-[32px] font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#333333] via-[#5E5E5E] to-[#000000]">97.4%</h2>
          <p className="text-gray-500 text-sm">Diagnostic Accuracy</p>
        </div>
        <div className="relative h-48">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className={`absolute w-full h-[180px] rounded-[20px] p-6 text-white bg-gradient-to-br ${card.gradient}`}
              style={{ transformOrigin: "top center" }}
              animate={{ top: index * -10, scale: 1 - index * 0.06, zIndex: cards.length - index }}
            >
              <div className="flex justify-between items-center relative z-10">
                <div className="w-12 h-8 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-md" />
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full" />
                  <div className="w-8 h-8 bg-white/20 rounded-full" />
                </div>
              </div>
              <div className="mt-6 relative z-10">
                <p className="tracking-[0.2em] text-lg font-medium">{card.content}</p>
                <div className="flex items-center gap-2 mt-3">
                  <p className="text-sm opacity-90">{card.name}</p>
                  <span className="text-sm opacity-75">•</span>
                  <p className="text-sm opacity-90">{card.designation}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ContentBox>
      <SectionTitle title="Enterprise Reliability" description="Built with medical-grade infrastructure to securely handle private patient records." />
    </SectionWrapper>
  );
};

const TeamSection = () => (
  <SectionWrapper>
    <ContentBox>
      <div className="flex items-center justify-between mb-6">
        <button className="text-[#FF7757] hover:text-[#ff6640] transition-colors font-medium">+ Share</button>
        <div className="flex -space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 border-2 border-white ring-2 ring-gray-50" />
          ))}
          <div className="w-10 h-10 rounded-full bg-gray-50 border-2 border-white ring-2 ring-gray-50 flex items-center justify-center text-sm font-medium text-gray-500">+2</div>
        </div>
      </div>
      <div className="h-52 relative">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="rounded-[10px] absolute inset-0 border border-dashed border-[rgba(252,152,78,0.59)] bg-[rgba(252,152,78,0.06)] p-5" />
        <motion.div whileHover={{ rotate: 9 }} transition={{ type: "spring", stiffness: 300 }} className="rounded-[16px] absolute inset-0 border-[0.7px] border-[#E0E0E0] bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.10)] p-5">
          <div>
            <span className="bg-gradient-to-b from-[#FFA756] to-[#EE602C] text-white px-3 py-1 rounded text-sm font-medium">Critical</span>
            <h4 className="text-sm font-semibold mt-3 mb-1">Radiology Review</h4>
            <p className="text-gray-500 text-xs">Share your findings securely with your clinical neurology team.</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-5">
            <div className="flex -space-x-2">
              {[5, 6].map((i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white ring-2 ring-gray-50 bg-gradient-to-br from-orange-300 to-orange-500" />
              ))}
            </div>
            <div className="flex items-center gap-4 text-gray-400 text-sm mt-2">
              <span className="flex items-center gap-1.5 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                10 notes
              </span>
              <span className="flex items-center gap-1.5 text-xs">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10M18 20V4M6 20v-4" /></svg>
                3 scans
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </ContentBox>
    <SectionTitle title="Clinical Collaboration" description="Export reports instantly and collaborate seamlessly with other medical professionals." />
  </SectionWrapper>
);

const Features3 = () => (
  <section className="py-16 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">
          Advanced <span className="text-[#FF7757]">AI Architecture</span>
        </h2>
        <p className="text-gray-600">
          NeuroScan AI utilizes robust predictive models to provide clinically relevant and scalable diagnostic solutions.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <ChatSection />
        <PaymentSection />
        <TeamSection />
      </div>
    </div>
  </section>
);

export default Features3;
