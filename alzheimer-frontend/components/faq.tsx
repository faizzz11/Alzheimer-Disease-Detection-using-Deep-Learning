"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  {
    question: "What is NeuroScan AI?",
    answer: "NeuroScan AI is an automated machine learning tool designed to analyze structural MRI scans of the brain to assist in classifying stages of Alzheimer's disease.",
  },
  {
    question: "How accurate is the classification?",
    answer: "Our underlying deep learning model (ResNet-50) has been validated to achieve over 97% accuracy across four clinical stages: Non, Very Mild, Mild, and Moderate Demented.",
  },
  {
    question: "Is this a diagnostic tool?",
    answer: "No. NeuroScan AI provides automated clinical decision support. Analysis results must be reviewed by a qualified radiologist or neurologist before making any clinical diagnosis.",
  },
  {
    question: "Are my MRI scans saved on your servers?",
    answer: "No. Patient privacy is our top priority. The analysis is done anonymously in real-time, and uploaded MRI files are never stored or transmitted beyond the required inference session.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="w-full py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold mb-4">
            Frequently <span className="text-[#FF6B2B]">Asked</span> Questions
          </h2>
          <p className="text-neutral-600 max-w-3xl mx-auto">
            Everything you need to know about NeuroScan AI and how it integrates into clinical assessment workflows.
          </p>
        </div>

        <div className="space-y-4 rounded-[22px] bg-[#DCDCDC] p-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-[17px] border border-[#EBEBEB] bg-gradient-to-b from-[#F6F6F6] via-[#FDFDFD] to-[#F6F6F6] shadow-[0px_95px_27px_0px_rgba(0,0,0,0.00),_0px_61px_24px_0px_rgba(0,0,0,0.03),_0px_34px_21px_0px_rgba(0,0,0,0.11),_0px_15px_15px_0px_rgba(0,0,0,0.19),_0px_4px_8px_0px_rgba(0,0,0,0.22)] overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center gap-2 text-left"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: openIndex === index ? 45 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <Plus size={20} className="text-[#FF6B2B]" />
                </motion.div>
                <span className="text-lg text-neutral-800">{faq.question}</span>
              </button>
              <AnimatePresence mode="sync">
                {openIndex === index && (
                  <motion.div
                    key={`content-${index}`}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { height: "auto", opacity: 1, transition: { type: "spring", stiffness: 400, damping: 40 } },
                      collapsed: { height: 0, opacity: 0, transition: { type: "spring", stiffness: 400, damping: 40 } },
                    }}
                    className="px-6 overflow-hidden"
                  >
                    <div className="pb-5">
                      <p className="text-neutral-600">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
