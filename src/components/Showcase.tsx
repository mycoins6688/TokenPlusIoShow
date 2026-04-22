import { motion } from "motion/react";
import { ProductCard } from "./ProductCard";
import { Navbar } from "./Navbar";
import { PRODUCTS_CONFIG } from "../constants/products";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { type ProductConfig } from "../constants/products";
import { Link } from "react-router-dom";

export function Showcase() {
  const [products, setProducts] = useState<ProductConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const snap = await getDocs(collection(db, "settings"));
        if (!snap.empty) {
          const seo = snap.docs[0].data();
          document.title = seo.siteTitle || document.title;
          
          // Update Meta Tags
          const updateMeta = (name: string, content: string) => {
            let el = document.querySelector(`meta[name="${name}"]`);
            if (!el) {
              el = document.createElement('meta');
              el.setAttribute('name', name);
              document.head.appendChild(el);
            }
            el.setAttribute('content', content);
          };

          if (seo.metaDescription) updateMeta('description', seo.metaDescription);
          if (seo.metaKeywords) updateMeta('keywords', seo.metaKeywords);
        }
      } catch (e) {
        console.error("SEO fetch error:", e);
      }
    };

    const fetchAndSeed = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "products"), orderBy("sortOrder", "asc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          // If Firestore is empty, show static config as fallback
          setProducts(PRODUCTS_CONFIG);
        } else {
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductConfig));
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to static config on error
        setProducts(PRODUCTS_CONFIG);
      } finally {
        setLoading(false);
      }
    };

    fetchSeo();
    fetchAndSeed();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="min-h-screen bg-[#050505] pt-24 pb-24 px-6 relative overflow-hidden"
    >
      <Navbar />
      
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none" aria-hidden="true">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-muted/5 blur-[120px] rounded-full" 
        />
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-muted/5 blur-[120px] rounded-full" 
        />
      </div>

      <main className="max-w-5xl mx-auto relative z-10">
        <header className="mb-16 space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -100, rotateY: -20 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tighter leading-[1.1] mb-2">
              AI Token <br />
              <span className="text-gradient-gold">资源 · 服务链接器</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm text-slate-400 max-w-xl font-sans font-light leading-relaxed"
          >
            TokenPlus.io 致力于为全球 AI 开发者、创作者与机构提供最先进的数字资源调度工具。我们连接 AI 算力与模型服务，以卓越的性能与极致的安全，构建下一代 AI 金融生态基础设施。
          </motion.p>
        </header>

        <section aria-label="产品与服务展示">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.5
                }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {loading ? (
              // Simple loading skeleton placeholders
              [...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-white/5 rounded-2xl animate-pulse" />
              ))
            ) : (
              products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))
            )}
          </motion.div>
        </section>

        {/* FOOTER SECTION */}
        <footer className="mt-32 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-white/50 text-xs font-sans tracking-wide"
          >
            AI Token 资源与服务链接器 © 2026 TokenPlus.io | <a href="mailto:admin@tokenplus.io" className="hover:text-white transition-colors">admin@tokenplus.io</a> | <Link to="/admin" className="opacity-30 hover:opacity-100 transition-opacity">管理</Link>
          </motion.div>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-xs font-medium text-white/50 tracking-normal">
            <a href="https://t.me/TokenPlusIONews" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Telegram 频道</a>
            <a href="https://t.me/+VKkSi-OPQN5lZmU9" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Telegram 交流群</a>
            <a href="https://tokenplus.io/p/2-TermsofService" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">服务条款</a>
            <a href="https://tokenplus.io/p/1-privacy" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">隐私条款</a>
          </nav>
        </footer>
      </main>
    </motion.div>
  );
}
