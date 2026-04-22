import React, { useState, useEffect } from "react";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { type ProductConfig } from "../constants/products";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Edit2, LogOut, Save, X, AlertTriangle, ArrowLeft, Settings as SettingsIcon, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";

export default function Admin() {
  const [activeTab, setActiveTab] = useState<"products" | "seo">("products");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<ProductConfig[]>([]);
  const [seoSettings, setSeoSettings] = useState({ id: "", siteTitle: "", metaDescription: "", metaKeywords: "" });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProductConfig>>({});
  const [isAdding, setIsAdding] = useState(false);
  
  // Confirmation states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmUpdateId, setConfirmUpdateId] = useState<string | null>(null);
  const [confirmSeoUpdate, setConfirmSeoUpdate] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("admin_logged_in") === "true";
    if (loggedIn) {
      setIsLoggedIn(true);
      fetchInitialData(true); // Force seeding since we are logged in
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null); // Clear previous status
    const envUser = import.meta.env.VITE_ADMIN_USERNAME || "admin";
    const envPass = import.meta.env.VITE_ADMIN_PASSWORD || "1234qwre";

    if (username === envUser && password === envPass) {
      setIsLoggedIn(true);
      localStorage.setItem("admin_logged_in", "true");
      fetchInitialData(true); // Force seeding upon login
    } else {
      setStatusMsg({ type: "error", text: "用户名或密码错误" });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("admin_logged_in");
  };

  const fetchInitialData = async (forceSeed = false) => {
    setLoading(true);
    await Promise.all([fetchProducts(forceSeed), fetchSeoSettings(forceSeed)]);
    setLoading(false);
  };

  const fetchProducts = async (forceSeed = false) => {
    try {
      const q = query(collection(db, "products"), orderBy("sortOrder", "asc"));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Seed if forced or already logged in
        if (forceSeed || isLoggedIn) {
          console.log("Seeding database with initial products from Admin...");
          try {
            const { PRODUCTS_CONFIG } = await import("../constants/products");
            for (const item of PRODUCTS_CONFIG) {
              const { id, ...rest } = item;
              await addDoc(collection(db, "products"), {
                ...rest,
                updatedAt: serverTimestamp()
              });
            }
            console.log("Seeding successful!");
            // Fetch again after seeding
            const secondarySnapshot = await getDocs(q);
            const data = secondarySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductConfig));
            setProducts(data);
            return;
          } catch (seedError) {
            console.error("Critical Seeding Error:", seedError);
            setStatusMsg({ type: "error", text: "数据初始化失败，请检查控制台或安全规则。" });
          }
        }
      }

      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductConfig));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchSeoSettings = async (forceSeed = false) => {
    try {
      const q = collection(db, "settings");
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setSeoSettings({ id: docSnap.id, ...docSnap.data() } as any);
      } else {
        // Seed if forced or already logged in
        if (forceSeed || isLoggedIn) {
          console.log("Seeding SEO settings from Admin...");
          const initialSeo = { 
            siteTitle: "AI Token 资源 · 服务链接器", 
            metaDescription: "TokenPlus.io 专业 AI 资源与服务链接器。提供 AI 算力调度、New API 模型中转、AI 行业 B2B 贸易撮合、API TOKEN 货源批发及闲置额度二级交易。",
            metaKeywords: "AI Token, AI 资源链接器, New API, API 中转, AI 算力, 模型批发, TokenPlus, AI 二级交易, ChatGPT 镜像, 算力中转",
            updatedAt: serverTimestamp()
          };
          const newDoc = await addDoc(collection(db, "settings"), initialSeo);
          setSeoSettings({ id: newDoc.id, ...initialSeo } as any);
          return;
        }

        // Default local state
        setSeoSettings({ 
          id: "", 
          siteTitle: "AI Token 资源 · 服务链接器", 
          metaDescription: "TokenPlus.io 专业 AI 资源与服务链接器",
          metaKeywords: "AI Token, AI 资源, New API"
        });
      }
    } catch (error) {
      console.error("Error fetching SEO:", error);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  const handleUpdateSeo = async () => {
    setIsProcessing(true);
    setStatusMsg(null);
    try {
      const { id, ...data } = seoSettings;
      
      if (!data.siteTitle || !data.metaDescription) {
        setStatusMsg({ type: "error", text: "标题和描述不能为空" });
        return;
      }

      if (id && id !== "") {
        await updateDoc(doc(db, "settings", id), { 
          ...data, 
          updatedAt: serverTimestamp() 
        });
      } else {
        await addDoc(collection(db, "settings"), { 
          ...data, 
          updatedAt: serverTimestamp() 
        });
      }
      
      setStatusMsg({ type: "success", text: "SEO 设置保存成功" });
      setConfirmSeoUpdate(false);
      await fetchSeoSettings();
    } catch (error) {
      console.error("Save SEO Error:", error);
      setStatusMsg({ type: "error", text: "保存失败: " + (error instanceof Error ? error.message : "未知错误") });
    } finally {
      setIsProcessing(false);
      setConfirmSeoUpdate(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, "products", id));
      await fetchProducts();
      setStatusMsg({ type: "success", text: "删除成功" });
    } catch (error) {
      console.error("Error deleting product:", error);
      setStatusMsg({ type: "error", text: "删除失败" });
    } finally {
      setIsProcessing(false);
      setConfirmDeleteId(null);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    
    if ((editForm.title?.length || 0) >= 200) {
      setStatusMsg({ type: "error", text: "标题不能超过200字" });
      return;
    }
    if ((editForm.description?.length || 0) >= 1000) {
      setStatusMsg({ type: "error", text: "描述不能超过1000字" });
      return;
    }

    setIsProcessing(true);
    try {
      const { id, ...dataToUpdate } = editForm as any;
      await updateDoc(doc(db, "products", editingId), {
        ...dataToUpdate,
        updatedAt: serverTimestamp()
      });
      setEditingId(null);
      await fetchProducts();
      setStatusMsg({ type: "success", text: "修改成功" });
    } catch (error) {
      console.error("Error updating product:", error);
      setStatusMsg({ type: "error", text: "修改失败" });
    } finally {
      setIsProcessing(false);
      setConfirmUpdateId(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((editForm.title?.length || 0) >= 200 || (editForm.description?.length || 0) >= 1000) {
      setStatusMsg({ type: "error", text: "内容长度超过限制" });
      return;
    }

    setIsProcessing(true);
    try {
      const { id, ...dataToAdd } = editForm as any;
      await addDoc(collection(db, "products"), {
        ...dataToAdd,
        updatedAt: serverTimestamp()
      });
      setIsAdding(false);
      setEditForm({});
      await fetchProducts();
      setStatusMsg({ type: "success", text: "添加成功" });
    } catch (error) {
      console.error("Error adding product:", error);
      setStatusMsg({ type: "error", text: "添加失败" });
    } finally {
      setIsProcessing(false);
    }
  };

  const startEdit = (product: ProductConfig) => {
    setEditingId(product.id);
    setEditForm(product);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl"
        >
          <h1 className="text-2xl font-display font-bold text-white mb-8 text-center bg-gradient-to-r from-gold-bright to-gold-muted bg-clip-text text-transparent">
            管理后台登录
          </h1>

          {statusMsg && statusMsg.type === "error" && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-red-500 text-sm text-center mb-6 font-bold"
            >
              × {statusMsg.text}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-widest mb-2">用户名</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#111] border border-white/5 rounded-lg px-4 py-3 text-white focus:border-gold-muted transition-colors outline-none"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs uppercase tracking-widest mb-2">密码</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-white/5 rounded-lg px-4 py-3 text-white focus:border-gold-muted transition-colors outline-none"
                placeholder="••••••••"
              />
            </div>
            <div className="flex flex-col gap-4">
              <button 
                type="submit"
                className="w-full bg-gold-muted hover:bg-gold-bright text-black font-bold py-3 rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(197,160,89,0.3)] cursor-pointer"
              >
                登 录
              </button>
              <Link 
                to="/"
                className="w-full text-center py-3 bg-white/5 border border-white/10 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm cursor-pointer"
              >
                返回首页
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto relative">
        {/* Toast Notification */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-12 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${statusMsg.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}
            >
              {statusMsg.type === 'success' ? <Save size={18} /> : <AlertTriangle size={18} />}
              <span className="text-sm font-bold">{statusMsg.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient-gold">后台管理系统</h1>
            <p className="text-slate-400 text-sm mt-2 font-mono">WORKSPACE / {activeTab.toUpperCase()}</p>

            <div className="flex gap-4 mt-8">
              <button 
                onClick={() => setActiveTab("products")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-sm font-bold border cursor-pointer ${activeTab === "products" ? "bg-gold-muted text-black border-gold-bright shadow-[0_0_20px_rgba(197,160,89,0.4)]" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
              >
                产品管理
              </button>
              <button 
                onClick={() => setActiveTab("seo")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all text-sm font-bold border cursor-pointer ${activeTab === "seo" ? "bg-gold-muted text-black border-gold-bright shadow-[0_0_20px_rgba(197,160,89,0.4)]" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
              >
                站点 SEO
              </button>
            </div>
          </div>
          <div className="flex gap-4 self-start">
            <Link 
              to="/"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-sm cursor-pointer"
            >
              <ArrowLeft size={16} /> 返回首页
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/10 hover:border-red-500/30 transition-all text-sm cursor-pointer"
            >
              <LogOut size={16} /> 退出登录
            </button>
          </div>
        </header>

        {activeTab === "products" ? (
          <>
            <div className="flex justify-end mb-8">
              <button 
                onClick={() => { setIsAdding(true); setEditingId(null); setEditForm({}); }}
                className="flex items-center gap-2 px-6 py-3 bg-gold-muted hover:bg-gold-bright text-black font-bold rounded-lg transition-all shadow-lg cursor-pointer"
              >
                <Plus size={18} /> 添加新产品
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center py-20 text-slate-500">加载中...</div>
              ) : products.length === 0 ? (
                <div className="col-span-full text-center py-20 text-slate-500 border border-dashed border-white/10 rounded-xl flex flex-col items-center gap-4">
                  <p>公有数据库目前没有任何产品数据</p>
                  <button 
                    onClick={() => fetchInitialData(true)}
                    className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-sm cursor-pointer"
                  >
                    同步初始演示数据
                  </button>
                </div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden hover:border-gold-muted/30 transition-all group shadow-xl">
                    <div className="h-40 relative">
                      <img src={product.image} className="w-full h-full object-cover" alt={product.title} />
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="absolute top-4 left-4">
                        <h3 className="text-xl font-bold">{product.title}</h3>
                        <p className="text-xs text-white/70 uppercase tracking-tighter">{product.tagline}</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-6 h-12">
                        {product.description}
                      </p>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => startEdit(product)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-gold-muted/10 hover:border-gold-muted/30 transition-all text-sm cursor-pointer"
                        >
                          修改
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(product.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/10 hover:border-red-500/30 transition-all text-sm text-red-400/80 hover:text-red-400 cursor-pointer"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl bg-[#0a0a0a] border border-white/10 rounded-2xl p-10 shadow-2xl space-y-10"
          >
            <div>
              <h2 className="text-2xl font-bold mb-2">站点 SEO 配置</h2>
              <p className="text-slate-500 text-sm">这些配置将决定网站在搜索引擎和社交平台上的展示效果。</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] uppercase tracking-[0.2em] text-gold-muted font-bold">网站标题 (Browser Tab Title)</label>
                <input 
                  type="text" value={seoSettings.siteTitle} 
                  onChange={(e) => setSeoSettings({...seoSettings, siteTitle: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-gold-muted outline-none transition-all"
                  placeholder="例如：AI Token 资源 · 服务链接器"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] uppercase tracking-[0.2em] text-gold-muted font-bold">元描述 (Meta Description)</label>
                <textarea 
                  rows={5} value={seoSettings.metaDescription} 
                  onChange={(e) => setSeoSettings({...seoSettings, metaDescription: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-gold-muted outline-none transition-all resize-none leading-relaxed"
                  placeholder="简短描述您的网站..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] uppercase tracking-[0.2em] text-gold-muted font-bold">关键词 (Keywords - 英文逗号分隔)</label>
                <input 
                  type="text" value={seoSettings.metaKeywords} 
                  onChange={(e) => setSeoSettings({...seoSettings, metaKeywords: e.target.value})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-white focus:border-gold-muted outline-none transition-all"
                  placeholder="AI, Token, Proxy, API"
                />
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setConfirmSeoUpdate(true)}
                  className="w-full bg-gold-muted hover:bg-gold-bright text-black font-black py-4 rounded-xl transition-all shadow-xl cursor-pointer uppercase tracking-widest text-sm disabled:opacity-50"
                  disabled={isProcessing}
                >
                  {isProcessing ? "保存中..." : "保存站点配置"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {(editingId || isAdding) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => { setEditingId(null); setIsAdding(false); }}
            />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#0d0d0d] border border-white/15 rounded-2xl shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold">{isAdding ? '添加新产品' : '修改产品信息'}</h2>
                <button onClick={() => { setEditingId(null); setIsAdding(false); }} className="text-slate-500 hover:text-white"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500">产品标题</label>
                      <span className={`text-[10px] ${(editForm.title?.length || 0) >= 200 ? 'text-red-500' : 'text-slate-500'}`}>
                        {(editForm.title?.length || 0)} / 200
                      </span>
                    </div>
                    <input 
                      type="text" value={editForm.title || ""} 
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 outline-none transition-colors ${(editForm.title?.length || 0) >= 200 ? 'border-red-500' : 'border-white/10 focus:border-gold-muted'}`}
                      placeholder="输入产品名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500">排序（数字越小越靠前）</label>
                    <input 
                      type="number" value={editForm.sortOrder || 0} 
                      onChange={(e) => setEditForm({...editForm, sortOrder: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-gold-muted outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500">SEO Tagline (简短摘要)</label>
                  <input 
                    type="text" value={editForm.tagline || ""} 
                    onChange={(e) => setEditForm({...editForm, tagline: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-gold-muted outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500">服务详细描述</label>
                    <span className={`text-[10px] ${(editForm.description?.length || 0) >= 1000 ? 'text-red-500' : 'text-slate-500'}`}>
                      {(editForm.description?.length || 0)} / 1000
                    </span>
                  </div>
                  <textarea 
                    rows={4} value={editForm.description || ""} 
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 outline-none transition-colors resize-none ${(editForm.description?.length || 0) >= 1000 ? 'border-red-500' : 'border-white/10 focus:border-gold-muted'}`}
                    placeholder="输入详细的服务内容描述"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500">图标名称</label>
                    <select 
                      value={editForm.iconName || "Cloud"} 
                      onChange={(e) => setEditForm({...editForm, iconName: e.target.value as any})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-gold-muted outline-none transition-colors"
                    >
                      <option value="NewApi">NewApi</option>
                      <option value="Cloud">Cloud</option>
                      <option value="BarChart3">BarChart3</option>
                      <option value="Monitor">Monitor</option>
                      <option value="Zap">Zap</option>
                      <option value="ShieldCheck">ShieldCheck</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500">主题颜色 (HEX)</label>
                    <input 
                      type="text" value={editForm.color || "#3b82f6"} 
                      onChange={(e) => setEditForm({...editForm, color: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-gold-muted outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500">主图片 URL</label>
                  <input 
                    type="text" value={editForm.image || ""} 
                    onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-gold-muted outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500">跳转链接 URL</label>
                  <input 
                    type="text" value={editForm.link || ""} 
                    onChange={(e) => setEditForm({...editForm, link: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 focus:border-gold-muted outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex gap-4">
                <button 
                  onClick={() => { setEditingId(null); setIsAdding(false); setStatusMsg(null); }}
                  className="flex-1 py-3 bg-white/5 rounded-lg font-medium hover:bg-white/10 transition-all cursor-pointer"
                  disabled={isProcessing}
                >
                  取消
                </button>
                <button 
                  onClick={() => isAdding ? handleAdd({ preventDefault: () => {} } as any) : setConfirmUpdateId(editingId)}
                  className="flex-1 py-3 bg-gold-muted text-black rounded-lg font-bold hover:bg-gold-bright transition-all cursor-pointer disabled:opacity-50"
                  disabled={isProcessing}
                >
                  {isProcessing ? "处理中..." : (isAdding ? '添加产品' : '保存修改')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modals */}
      <AnimatePresence>
        {(confirmDeleteId || confirmUpdateId || confirmSeoUpdate) && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#111] border border-white/20 rounded-2xl p-8 text-center shadow-3xl"
            >
              <div className="w-16 h-16 bg-gold-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className={confirmDeleteId ? "text-red-500" : "text-gold-muted"} size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {confirmDeleteId ? '确定要删除吗？' : (confirmSeoUpdate ? '确定保存站点配置？' : '确定要保存修改吗？')}
              </h3>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                {confirmDeleteId 
                  ? '此操作将永久删除该产品卡片，无法撤销。' 
                  : (confirmSeoUpdate ? '修改站点配置将影响网站在全球范围内的展示和搜索引擎索引。' : '您所做的修改将立即应用到前台展示页面。')}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setConfirmDeleteId(null); setConfirmUpdateId(null); setConfirmSeoUpdate(false); setStatusMsg(null); }}
                  className="flex-1 py-2.5 bg-white/5 rounded-lg text-sm transition-all cursor-pointer"
                  disabled={isProcessing}
                >
                  取消
                </button>
                <button 
                  onClick={() => {
                    if (confirmDeleteId) handleDelete(confirmDeleteId);
                    else if (confirmSeoUpdate) handleUpdateSeo();
                    else handleUpdate();
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer disabled:opacity-50 ${confirmDeleteId ? 'bg-red-600 hover:bg-red-500' : 'bg-gold-muted hover:bg-gold-bright text-black'}`}
                  disabled={isProcessing}
                >
                  {isProcessing ? "处理中..." : (confirmDeleteId ? '确定删除' : '确定保存')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
