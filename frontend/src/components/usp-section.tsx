"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Sun, ShieldCheck, Users, Droplets } from "lucide-react";

const USP_TABS = [
  {
    key: "experience",
    title: "Trải nghiệm thực tế",
    desc: "Tham quan mô hình thực nghiệm của AgriHCM để tận mắt chứng kiến hiệu quả của các giải pháp nông nghiệp bền vững.",
    bg: "#059669", // emerald-600
    image: "https://images.unsplash.com/photo-1716404249295-3ac5f609d546?q=80&w=1173&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: Sprout,
  },
  {
    key: "consulting",
    title: "Tư vấn chuyên sâu",
    desc: "Đội ngũ kỹ sư nông nghiệp giàu kinh nghiệm luôn sẵn sàng phân tích mẫu đất và tư vấn quy trình canh tác phù hợp nhất.",
    bg: "#D97706", // amber-600
    image: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: Users,
  },
  {
    key: "technology",
    title: "Công nghệ tiên tiến",
    desc: "Áp dụng công nghệ tưới tiêu tự động và giám sát sức khỏe cây trồng bằng IoT giúp tối ưu chi phí và năng suất.",
    bg: "#0284c7", // sky-600
    image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=1000&auto=format&fit=crop",
    icon: Droplets,
  },
  {
    key: "warranty",
    title: "Bảo hành tận tâm",
    desc: "Cam kết chất lượng cây giống và vật tư. Chính sách đổi trả và hỗ trợ kỹ thuật nhanh chóng để bà con yên tâm sản xuất.",
    bg: "#65a30d", // lime-600
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1000&auto=format&fit=crop",
    icon: ShieldCheck,
  },
  {
    key: "community",
    title: "Cộng đồng AgriHCM",
    desc: "Thành viên của AgriHCM, deadline của Kỹ Thuật Python , cùng nhau chạy deadline qua ngày",
    bg: "#0f766e", // teal-700
    image: "https://images.unsplash.com/photo-1504457047772-27faf1c00561?q=80&w=1247&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    icon: Sun,
  },
];

export function USPSection() {
  const [activeKey, setActiveKey] = React.useState(USP_TABS[0].key);
  const active = React.useMemo(() => USP_TABS.find((t) => t.key === activeKey) ?? USP_TABS[0], [activeKey]);

  return (
    <section className="section-usp mt-16 md:mt-24">
      <div 
        className="rounded-3xl overflow-hidden shadow-2xl transition-colors duration-700 ease-in-out"
        style={{ backgroundColor: active.bg }}
      >
        <div className="flex flex-col xl:flex-row p-6 md:p-10 xl:p-12 min-h-[500px]">
          
          {/* NAVIGATION */}
          <div className="w-full xl:w-80 shrink-0 mb-8 xl:mb-0 xl:mr-12 z-10">
            {/* Mobile: Flex wrap with justify-center to fit all buttons visibly.
               Desktop: Vertical column.
            */}
            <ul className="flex flex-wrap justify-center xl:flex-col gap-3 xl:gap-5">
              {USP_TABS.map(({ key, title, icon: Icon }) => {
                const selected = key === activeKey;
                return (
                  <li key={key} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveKey(key)}
                      className={`
                        flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm md:text-base font-semibold transition-all duration-300 w-full xl:w-full xl:justify-start
                        ${selected 
                          ? "bg-white text-emerald-900 shadow-lg scale-105 ring-2 ring-white/50" 
                          : "bg-white/10 text-white hover:bg-white/20 hover:scale-[1.02]"
                        }
                      `}
                    >
                      <Icon className={`h-4 w-4 md:h-5 md:w-5 ${selected ? "text-emerald-700" : "text-white/90"}`} />
                      <span className="whitespace-nowrap">{title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center text-white">
            
            {/* Text Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active.key + "-text"}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="order-2 lg:order-1 flex flex-col justify-center text-center lg:text-left"
              >
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-sm">
                  {active.title}
                </h3>
                
                {/* Decorative line */}
                <div className="mt-5 mb-5 h-1.5 w-24 bg-white/40 rounded-full mx-auto lg:mx-0" />
                
                <p className="text-white/95 text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                  {active.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Image Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active.key + "-img"}
                initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotate: -1 }}
                transition={{ duration: 0.45, ease: "backOut" }}
                className="order-1 lg:order-2 w-full h-full flex justify-center lg:justify-end"
              >
                <div className="relative w-full h-[250px] sm:h-[320px] lg:h-[420px] overflow-hidden rounded-2xl shadow-2xl ring-4 ring-white/15 bg-black/10">
                   <img
                    src={active.image}
                    alt={active.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* Subtle vignette for better image blending */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </AnimatePresence>
            
          </div>
        </div>
      </div>
    </section>
  );
}